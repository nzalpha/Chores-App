import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Member } from '../lib/types';

interface Props {
  members: Member[];
  addMember: (name: string, email: string) => void;
  removeMember: (id: string) => void;
}

export default function MembersPage({ members, addMember, removeMember }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required.'); return; }
    addMember(name.trim(), email.trim());
    setName('');
    setEmail('');
    setError('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Members</h1>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Add Member</h2>
        <form onSubmit={handleAdd} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-36">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Jane Smith"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="jane@company.com"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex-shrink-0"
          >
            <Plus size={16} /> Add
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No team members yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove ${member.name}? Their chores will be unassigned.`)) {
                    removeMember(member.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
