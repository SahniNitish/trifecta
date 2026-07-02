import { useState } from 'react';
import { db, type Task } from '../../db/db';
import { todayStr, tomorrowStr } from '../../lib/dates';
import { Sheet } from '../../components/Sheet';

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export function AddTaskSheet({ open, onClose, editTask }: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [priority, setPriority] = useState<Task['priority']>('med');

  const reset = () => {
    setTitle('');
    setDueDate(undefined);
    setPriority('med');
  };

  const handleOpen = () => {
    if (editTask) {
      setTitle(editTask.title);
      setDueDate(editTask.dueDate);
      setPriority(editTask.priority);
    } else {
      reset();
    }
  };

  const save = async () => {
    if (!title.trim()) return;
    if (editTask?.id) {
      await db.tasks.update(editTask.id, { title: title.trim(), dueDate, priority });
    } else {
      await db.tasks.add({
        title: title.trim(),
        done: false,
        dueDate,
        priority,
        createdAt: new Date().toISOString(),
      });
    }
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={editTask ? 'Edit Task' : 'Add Task'}>
      <div onFocus={handleOpen} className="space-y-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          className="w-full bg-surface rounded-xl px-4 py-3 text-text outline-none"
        />
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Due</p>
          <div className="flex gap-2">
            {[
              { label: 'Today', value: todayStr() },
              { label: 'Tomorrow', value: tomorrowStr() },
              { label: 'None', value: undefined },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setDueDate(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm active:scale-95 ${
                  dueDate === opt.value ? 'bg-accent text-bg' : 'bg-surface text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Priority</p>
          <div className="flex gap-2">
            {(['low', 'med', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-2 rounded-lg text-sm capitalize active:scale-95 ${
                  priority === p ? 'bg-accent text-bg' : 'bg-surface text-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={save}
          className="w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95"
        >
          Save
        </button>
      </div>
    </Sheet>
  );
}