import { addDays, addMonths, parseISO, isAfter, isBefore, getDay } from 'date-fns';
import type { Chore } from './types';

/**
 * Expands a chore's recurrence into individual occurrence dates
 * within [rangeStart, rangeEnd] inclusive.
 * Returns ISO date strings (YYYY-MM-DD).
 */
export function expandRecurrence(chore: Chore, rangeStart: Date, rangeEnd: Date): string[] {
  const dates: string[] = [];
  const start = parseISO(chore.startDate);
  const end = chore.endDate ? parseISO(chore.endDate) : null;

  if (!chore.isRecurring || !chore.recurrenceType) {
    // One-time chore — just check if it falls in range
    if (!isBefore(start, rangeStart) && !isAfter(start, rangeEnd)) {
      dates.push(chore.startDate);
    }
    return dates;
  }

  const interval = chore.recurrenceInterval || 1;
  let current = start;

  // Cap iteration at 1000 to avoid infinite loop
  let iterations = 0;
  while (!isAfter(current, rangeEnd) && iterations < 1000) {
    iterations++;
    // Stop if chore has ended
    if (end && isAfter(current, end)) break;

    if (!isBefore(current, rangeStart)) {
      if (chore.recurrenceType === 'weekly') {
        // Only include days matching recurrenceDays
        if (chore.recurrenceDays.includes(getDay(current))) {
          dates.push(toDateStr(current));
        }
      } else {
        dates.push(toDateStr(current));
      }
    }

    switch (chore.recurrenceType) {
      case 'daily':
        current = addDays(current, interval);
        break;
      case 'weekly':
        current = addDays(current, 1); // walk day by day for weekly with specific days
        break;
      case 'monthly':
        current = addMonths(current, interval);
        break;
    }
  }

  return dates;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}
