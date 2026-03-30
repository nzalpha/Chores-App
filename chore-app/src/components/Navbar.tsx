import { NavLink } from 'react-router-dom';
import { CalendarDays, ListTodo, Users, History } from 'lucide-react';

const links = [
  { to: '/', label: 'Calendar', icon: CalendarDays },
  { to: '/chores', label: 'Chores', icon: ListTodo },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <span className="font-bold text-lg mr-6">Office Chores</span>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
