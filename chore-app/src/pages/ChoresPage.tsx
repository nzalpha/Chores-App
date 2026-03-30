import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import ChoreModal from '../components/ChoreModal';
import type { Chore, Member } from '../lib/types';

interface Props {
  chores: Chore[];
  members: Member[];
  addChore: (chore: Omit<Chore, 'id' | 'createdAt'>) => void;
  updateChore: (id: string, updates: Partial<Chore>) => void;
  removeChore: (id: string) => void;
}

export default function ChoresPage({ chores, members, addChore, updateChore, removeChore }: Props) {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Chore | null>(null);
  const memberMap = new Map(members.map(m => [m.id, m]));

  const openEdit = (chore: Chore) => { setEditing(chore); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = (data: Omit<Chore, 'id' | 'createdAt'>) => {
    if (modal === 'edit' && editing) {
      updateChore(editing.id, data);
    } else {
      addChore(data);
    }
    closeModal();
  };

  const recurrenceLabel = (chore: Chore) => {
    if (!chore.isRecurring || !chore.recurrenceType) return 'One-time';
    const interval = chore.recurrenceInterval > 1 ? `Every ${chore.recurrenceInterval} ` : '';
    const type = chore.recurrenceType.charAt(0).toUpperCase() + chore.recurrenceType.slice(1);
    return `${interval}${type}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chores</h1>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Add Chore
        </button>
      </div>

      {chores.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No chores yet.</p>
          <p className="text-sm mt-1">Click "Add Chore" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chores.map(chore => {
            const member = chore.assigneeId ? memberMap.get(chore.assigneeId) : null;
            return (
              <div key={chore.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: member?.color ?? '#cbd5e1' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{chore.title}</span>
                    {chore.isRecurring && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <RefreshCw size={10} /> {recurrenceLabel(chore)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 flex gap-3">
                    <span>{member ? member.name : 'Unassigned'}</span>
                    <span>Starts {chore.startDate}</span>
                    {chore.description && <span className="truncate">{chore.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(chore)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => removeChore(chore.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ChoreModal
          chore={modal === 'edit' ? editing : null}
          members={members}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
