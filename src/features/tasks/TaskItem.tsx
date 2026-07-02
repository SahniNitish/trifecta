import { db, type Task } from '../../db/db';
import { formatDayLabel } from '../../lib/dates';
import { PRIORITY_COLORS } from '../../lib/constants';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const toggle = async () => {
    if (!task.id) return;
    const done = !task.done;
    await db.tasks.update(task.id, {
      done,
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  const remove = async () => {
    if (!task.id) return;
    await db.tasks.delete(task.id);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-xl group">
      <button
        onClick={toggle}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 active:scale-95 ${
          task.done ? 'bg-accent border-accent' : 'border-muted'
        }`}
      >
        {task.done && <span className="text-bg text-xs">✓</span>}
      </button>
      <button onClick={() => onEdit(task)} className="flex-1 text-left min-w-0">
        <p className={`truncate ${task.done ? 'line-through text-muted' : ''}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <span className="text-xs text-muted">{formatDayLabel(task.dueDate)}</span>
        )}
      </button>
      <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`} />
      <button
        onClick={remove}
        className="text-muted text-xs px-2 py-1 active:scale-95 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}