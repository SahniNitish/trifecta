import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { TodayPage } from './features/today/TodayPage';
import { TasksPage } from './features/tasks/TasksPage';
import { MoneyPage } from './features/money/MoneyPage';
import { TrainPage } from './features/train/TrainPage';
import { SessionPage } from './features/train/SessionPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { SettingsPage } from './features/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
        <TabBar />
      </div>
    </BrowserRouter>
  );
}