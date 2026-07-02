import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { TodayPage } from './features/today/TodayPage';
import { TasksPage } from './features/tasks/TasksPage';
import { MoneyPage } from './features/money/MoneyPage';
import { TrainPage } from './features/train/TrainPage';
import { SessionPage } from './features/train/SessionPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { SettingsPage } from './features/settings/SettingsPage';

function AppShell() {
  const { pathname } = useLocation();
  const hideTabBar = pathname.includes('/train/session/') || pathname.startsWith('/settings');

  return (
    <div className="min-h-full bg-bg text-text max-w-lg mx-auto relative">
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/money" element={<MoneyPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route path="/train/session/:id" element={<SessionPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      {!hideTabBar && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}