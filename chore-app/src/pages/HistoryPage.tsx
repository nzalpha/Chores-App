import { format, parseISO } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import type { Completion, Chore, Member } from '../lib/types';

interface Props {
  completions: Completion[];
  chores: Chore[];
  members: Member[];
}

export default function HistoryPage({ completions, chores, members }: Props) {
  const choreMap = new Map(chores.map(c => [c.id, c]));
  const memberMap = new Map(members.map(m => [m.id, m]));

  const sorted = [...completions].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Completion History</h1>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No completions yet.</p>
          <p className="text-sm mt-1">Mark chores as done on the calendar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Chore</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assignee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map(c => {
                const chore = choreMap.get(c.choreId);
                const member = chore?.assigneeId ? memberMap.get(chore.assigneeId) : null;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {chore?.title ?? <span className="text-gray-400 italic">Deleted chore</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.dueDate}</td>
                    <td className="px-4 py-3">
                      {member ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: member.color }}
                          />
                          {member.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {format(parseISO(c.completedAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
