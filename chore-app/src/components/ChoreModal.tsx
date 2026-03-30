import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Chore, Member, RecurrenceType } from '../lib/types';

interface Props {
  chore?: Chore | null;
  members: Member[];
  onSave: (data: Omit<Chore, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const defaultForm = (): Omit<Chore, 'id' | 'createdAt'> => ({
  title: '',
  description: '',
  assigneeId: null,
  startDate: new Date().toISOString().split('T')[0],
  startTime: null,
  endTime: null,
  endDate: null,
  isRecurring: false,
  recurrenceType: null,
  recurrenceInterval: 1,
  recurrenceDays: [],
});

export default function ChoreModal({ chore, members, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Chore, 'id' | 'createdAt'>>(
    chore
      ? {
          ...defaultForm(),
          ...chore,
          startTime: chore.startTime ?? null,
          endTime: chore.endTime ?? null,
        }
      : defaultForm()
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleDay = (day: number) => {
    const days = form.recurrenceDays.includes(day)
      ? form.recurrenceDays.filter(d => d !== day)
      : [...form.recurrenceDays, day];
    set('recurrenceDays', days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      recurrenceType: form.isRecurring ? form.recurrenceType : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{chore ? 'Edit Chore' : 'Add Chore'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Clean the kitchen"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.assigneeId || ''}
                onChange={e => set('assigneeId', e.target.value || null)}
              >
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.startTime || ''}
                onChange={e => set('startTime', e.target.value || null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time (optional)</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.endTime || ''}
                onChange={e => set('endTime', e.target.value || null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={form.isRecurring}
              onChange={e => {
                set('isRecurring', e.target.checked);
                if (e.target.checked && !form.recurrenceType) set('recurrenceType', 'daily');
              }}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Recurring chore</label>
          </div>

          {form.isRecurring && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.recurrenceType || 'daily'}
                    onChange={e => set('recurrenceType', e.target.value as RecurrenceType)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Every</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="w-16 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.recurrenceInterval}
                      onChange={e => set('recurrenceInterval', parseInt(e.target.value) || 1)}
                    />
                    <span className="text-sm text-gray-500">
                      {form.recurrenceType === 'daily' ? 'day(s)' : form.recurrenceType === 'weekly' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>
              </div>

              {form.recurrenceType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">On days</label>
                  <div className="flex gap-1">
                    {DAY_NAMES.map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`w-9 h-9 text-xs rounded-full border font-medium transition-colors ${
                          form.recurrenceDays.includes(i)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.endDate || ''}
                  onChange={e => set('endDate', e.target.value || null)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium">
              {chore ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
