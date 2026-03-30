export interface Member {
  id: string;
  name: string;
  email: string;
  color: string;
  createdAt: string;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | null;

export interface Chore {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string | null;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  recurrenceDays: number[]; // 0=Sun..6=Sat, used for weekly
  createdAt: string;
}

export interface Completion {
  id: string;
  choreId: string;
  dueDate: string; // ISO date YYYY-MM-DD — identifies which instance
  completedAt: string;
  notes: string;
}
