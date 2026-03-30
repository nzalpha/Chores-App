import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Member, Chore, Completion } from '../lib/types';

const KEYS = {
  members: 'chore-app:members',
  chores: 'chore-app:chores',
  completions: 'chore-app:completions',
};

const MEMBER_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [members, setMembersState] = useState<Member[]>(() => load(KEYS.members, []));
  const [chores, setChoresState] = useState<Chore[]>(() => load(KEYS.chores, []));
  const [completions, setCompletionsState] = useState<Completion[]>(() => load(KEYS.completions, []));

  const setMembers = useCallback((updater: Member[] | ((prev: Member[]) => Member[])) => {
    setMembersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(KEYS.members, next);
      return next;
    });
  }, []);

  const setChores = useCallback((updater: Chore[] | ((prev: Chore[]) => Chore[])) => {
    setChoresState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(KEYS.chores, next);
      return next;
    });
  }, []);

  const setCompletions = useCallback((updater: Completion[] | ((prev: Completion[]) => Completion[])) => {
    setCompletionsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(KEYS.completions, next);
      return next;
    });
  }, []);

  // Members CRUD
  const addMember = useCallback((name: string, email: string) => {
    const color = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
    setMembers(prev => [...prev, { id: uuidv4(), name, email, color, createdAt: new Date().toISOString() }]);
  }, [setMembers]);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    // Unassign chores belonging to this member
    setChores(prev => prev.map(c => c.assigneeId === id ? { ...c, assigneeId: null } : c));
  }, [setMembers, setChores]);

  // Chores CRUD
  const addChore = useCallback((chore: Omit<Chore, 'id' | 'createdAt'>) => {
    setChores(prev => [...prev, { ...chore, id: uuidv4(), createdAt: new Date().toISOString() }]);
  }, [setChores]);

  const updateChore = useCallback((id: string, updates: Partial<Chore>) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setChores]);

  const removeChore = useCallback((id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
    setCompletions(prev => prev.filter(c => c.choreId !== id));
  }, [setChores, setCompletions]);

  // Completions
  const markComplete = useCallback((choreId: string, dueDate: string, notes = '') => {
    setCompletions(prev => {
      const exists = prev.find(c => c.choreId === choreId && c.dueDate === dueDate);
      if (exists) return prev;
      return [...prev, { id: uuidv4(), choreId, dueDate, completedAt: new Date().toISOString(), notes }];
    });
  }, [setCompletions]);

  const markIncomplete = useCallback((choreId: string, dueDate: string) => {
    setCompletions(prev => prev.filter(c => !(c.choreId === choreId && c.dueDate === dueDate)));
  }, [setCompletions]);

  const isComplete = useCallback((choreId: string, dueDate: string) => {
    return completions.some(c => c.choreId === choreId && c.dueDate === dueDate);
  }, [completions]);

  // Export data as JSON download
  const exportData = useCallback(() => {
    const data = { members, chores, completions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chores-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [members, chores, completions]);

  return {
    members, chores, completions,
    addMember, removeMember,
    addChore, updateChore, removeChore,
    markComplete, markIncomplete, isComplete,
    exportData,
  };
}
