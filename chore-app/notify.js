/**
 * Office Chore Email Notifier
 *
 * Sends daily reminder emails to team members about their chores for today.
 *
 * Setup:
 *   1. Edit notify.config.json with your SMTP credentials
 *   2. Export data from the app using the "Export for Notifications" button
 *      and save it as chores-export.json in this directory
 *   3. Run: node notify.js
 *   4. (Optional) Schedule via crontab: 0 8 * * * node /path/to/notify.js
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const configPath = path.join(__dirname, 'notify.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const dataPath = path.resolve(__dirname, config.dataFile);

if (!fs.existsSync(dataPath)) {
  console.error(`Data file not found: ${dataPath}`);
  console.error('Export data from the app first using the "Export for Notifications" button.');
  process.exit(1);
}

const { members, chores, completions } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const today = new Date().toISOString().split('T')[0];

// Build a lookup for today's completed chore instances
const completedToday = new Set(
  completions
    .filter(c => c.dueDate === today)
    .map(c => c.choreId)
);

// Expand recurring chores to find ones due today
function isDueToday(chore) {
  if (!chore.isRecurring || !chore.recurrenceType) {
    return chore.startDate === today;
  }

  const start = new Date(chore.startDate);
  const end = chore.endDate ? new Date(chore.endDate) : null;
  const todayDate = new Date(today);

  if (start > todayDate) return false;
  if (end && end < todayDate) return false;

  const interval = chore.recurrenceInterval || 1;

  if (chore.recurrenceType === 'daily') {
    const diffDays = Math.round((todayDate - start) / 86400000);
    return diffDays % interval === 0;
  }

  if (chore.recurrenceType === 'weekly') {
    const todayDayOfWeek = todayDate.getDay();
    if (!(chore.recurrenceDays || []).includes(todayDayOfWeek)) return false;
    const diffWeeks = Math.floor((todayDate - start) / (7 * 86400000));
    return diffWeeks % interval === 0;
  }

  if (chore.recurrenceType === 'monthly') {
    const monthDiff =
      (todayDate.getFullYear() - start.getFullYear()) * 12 +
      (todayDate.getMonth() - start.getMonth());
    return monthDiff % interval === 0 && todayDate.getDate() === start.getDate();
  }

  return false;
}

const todayChores = chores.filter(isDueToday);

// Group chores by assignee
const byMember = {};
for (const chore of todayChores) {
  if (!chore.assigneeId) continue;
  if (!byMember[chore.assigneeId]) byMember[chore.assigneeId] = [];
  byMember[chore.assigneeId].push(chore);
}

const memberMap = Object.fromEntries(members.map(m => [m.id, m]));

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

async function sendReminders() {
  let sent = 0;
  for (const [memberId, memberChores] of Object.entries(byMember)) {
    const member = memberMap[memberId];
    if (!member?.email) continue;

    const pending = memberChores.filter(c => !completedToday.has(c.id));
    if (pending.length === 0) continue;

    const choreList = pending.map(c =>
      `  • ${c.title}${c.description ? ` — ${c.description}` : ''}`
    ).join('\n');

    const html = `
      <h2>Hi ${member.name},</h2>
      <p>You have <strong>${pending.length}</strong> chore${pending.length > 1 ? 's' : ''} scheduled for today (${today}):</p>
      <ul>
        ${pending.map(c => `<li><strong>${c.title}</strong>${c.description ? ` — ${c.description}` : ''}</li>`).join('')}
      </ul>
      <p>Please mark them complete in the <a href="http://localhost:5173">Office Chores app</a> once done.</p>
    `;

    try {
      await transporter.sendMail({
        from: config.from,
        to: member.email,
        subject: `Office Chores for ${today} (${pending.length} task${pending.length > 1 ? 's' : ''})`,
        text: `Hi ${member.name},\n\nYour chores for today (${today}):\n${choreList}\n\nPlease mark them complete in the app.`,
        html,
      });
      console.log(`Sent reminder to ${member.name} (${member.email}) — ${pending.length} chore(s)`);
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${member.email}:`, err.message);
    }
  }

  if (sent === 0) {
    console.log('No reminders to send today (all done or no assigned chores).');
  } else {
    console.log(`Done. Sent ${sent} reminder email(s).`);
  }
}

sendReminders();
