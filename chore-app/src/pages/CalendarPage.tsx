import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import { expandRecurrence } from '../lib/recurrence';
import type { Member, Chore } from '../lib/types';
import { subMonths, addMonths } from 'date-fns';

interface Props {
  chores: Chore[];
  members: Member[];
  isComplete: (choreId: string, dueDate: string) => boolean;
  markComplete: (choreId: string, dueDate: string) => void;
  markIncomplete: (choreId: string, dueDate: string) => void;
}

export default function CalendarPage({ chores, members, isComplete, markComplete, markIncomplete }: Props) {
  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    return { start: subMonths(now, 1), end: addMonths(now, 2) };
  });

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

  const events = useMemo(() => {
    const result: object[] = [];
    for (const chore of chores) {
      const dates = expandRecurrence(chore, range.start, range.end);
      for (const date of dates) {
        const done = isComplete(chore.id, date);
        const member = chore.assigneeId ? memberMap.get(chore.assigneeId) : null;
        const timeLabel = formatTimeLabel(chore.startTime);
        const start = chore.startTime ? `${date}T${chore.startTime}` : date;
        const end = chore.startTime && chore.endTime ? `${date}T${chore.endTime}` : undefined;
        result.push({
          id: `${chore.id}::${date}`,
          title: chore.title,
          date,
          start,
          end,
          allDay: !chore.startTime,
          backgroundColor: done ? '#86efac' : (member?.color ?? '#94a3b8'),
          borderColor: done ? '#22c55e' : (member?.color ?? '#94a3b8'),
          textColor: done ? '#166534' : '#fff',
          extendedProps: {
            choreId: chore.id,
            dueDate: date,
            done,
            memberName: member?.name ?? 'Unassigned',
            timeLabel,
          },
        });
      }
    }
    return result;
  }, [chores, isComplete, memberMap, range]);

  const handleDatesSet = (info: DatesSetArg) => {
    setRange({ start: info.start, end: info.end });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const { choreId, dueDate, done } = arg.event.extendedProps as {
      choreId: string;
      dueDate: string;
      done: boolean;
    };
    if (done) {
      markIncomplete(choreId, dueDate);
    } else {
      markComplete(choreId, dueDate);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Chore Calendar</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ month: 'Month', week: 'Week', day: 'Day' }}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEvent}
          datesSet={handleDatesSet}
          height="auto"
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">Click an event to toggle completion. Green = done.</p>
    </div>
  );
}

function formatTimeLabel(time?: string | null): string {
  if (!time) return 'All day';
  const [hoursRaw, minutes = '00'] = time.split(':');
  const hours = Number.parseInt(hoursRaw, 10);
  if (Number.isNaN(hours)) return 'All day';
  const normalizedHour = ((hours + 11) % 12) + 1;
  const amPm = hours >= 12 ? 'PM' : 'AM';
  return `${normalizedHour.toString().padStart(2, '0')}:${minutes} ${amPm}`;
}

function renderEvent(arg: { event: { title: string; extendedProps: Record<string, unknown> } }) {
  const done = arg.event.extendedProps.done as boolean;
  const memberName = arg.event.extendedProps.memberName as string;
  const timeLabel = arg.event.extendedProps.timeLabel as string;
  return (
    <div className="px-1 py-0.5 text-xs leading-tight overflow-hidden">
      <div className="flex items-start gap-2 min-w-0">
        <div className="text-[10px] sm:text-[11px] text-gray-200/90 whitespace-nowrap pt-0.5">
          {timeLabel}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {done ? '✓ ' : ''}{arg.event.title}
          </div>
          {memberName && <div className="opacity-80 truncate">{memberName}</div>}
        </div>
      </div>
    </div>
  );
}
