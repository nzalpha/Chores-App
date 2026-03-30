import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CalendarPage from './pages/CalendarPage';
import ChoresPage from './pages/ChoresPage';
import MembersPage from './pages/MembersPage';
import HistoryPage from './pages/HistoryPage';
import { useStore } from './hooks/useStore';
import { Download } from 'lucide-react';

export default function App() {
  const store = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <CalendarPage
                chores={store.chores}
                members={store.members}
                isComplete={store.isComplete}
                markComplete={store.markComplete}
                markIncomplete={store.markIncomplete}
              />
            }
          />
          <Route
            path="/chores"
            element={
              <ChoresPage
                chores={store.chores}
                members={store.members}
                addChore={store.addChore}
                updateChore={store.updateChore}
                removeChore={store.removeChore}
              />
            }
          />
          <Route
            path="/members"
            element={
              <MembersPage
                members={store.members}
                addMember={store.addMember}
                removeMember={store.removeMember}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryPage
                completions={store.completions}
                chores={store.chores}
                members={store.members}
              />
            }
          />
        </Routes>
      </div>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={store.exportData}
          title="Export data for email notifications"
          className="flex items-center gap-2 bg-white border shadow-md text-gray-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50"
        >
          <Download size={14} /> Export for Notifications
        </button>
      </div>
    </div>
  );
}
