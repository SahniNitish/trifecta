import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../../db/db';
import { todayStr } from '../../lib/dates';
import { TaskItem } from './TaskItem';
import { AddTaskSheet } from './AddTaskSheet';
import { EmptyState } from '../../components/EmptyState';

type View = 'today' | 'upcoming' | 'all';

export function TasksPage() {
  const [view, setView] = useState<View>('today');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const tasks = useLiveQuery(async () => {
    const all = await db.tasks.orderBy('createdAt').reverse().toArray();
    const today = todayStr();

    const sorted = [...all].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return 0;
    });

    if (view === 'today') {
      return sorted.filter(
        (t) => !t.done && (!t.dueDate || t.dueDate <= today),
      );
    }
    if (view === 'upcoming') {
      return sorted.filter((t) => !t.done && t.dueDate && t.dueDate > today);
    }
    return sorted;
  }, [view]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setSheetOpen(true);
  };

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4">
        {(['today', 'upcoming', 'all'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm capitalize active:scale-95 ${
              view === v ? 'bg-surface2 text-text' : 'text-muted'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {tasks?.length === 0 && (
          <EmptyState
            message="No tasks here"
            action="Add a task →"
            onAction={() => { setEditTask(null); setSheetOpen(true); }}
          />
        )}
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} onEdit={handleEdit} />
        ))}
      </div>
      <button
        onClick={() => { setEditTask(null); setSheetOpen(true); }}
        className="fixed right-4 bottom-20 w-14 h-14 rounded-full bg-accent text-bg font-bold text-2xl shadow-lg flex items-center justify-center active:scale-95 z-30"
      >
        +
      </button>
      <AddTaskSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditTask(null); }}
        editTask={editTask}
      />
    </div>
  );
}