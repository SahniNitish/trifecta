import { useNavigate } from 'react-router-dom';
import { Sheet } from './Sheet';

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onAddExpense: () => void;
  onAddWeight: () => void;
}

export function QuickAddSheet({
  open,
  onClose,
  onAddTask,
  onAddExpense,
  onAddWeight,
}: QuickAddSheetProps) {
  const navigate = useNavigate();

  const options = [
    { label: 'Task', icon: '☑', action: () => { onClose(); onAddTask(); } },
    { label: 'Expense', icon: '₹', action: () => { onClose(); onAddExpense(); } },
    { label: 'Workout', icon: '🏋', action: () => { onClose(); navigate('/train'); } },
    { label: 'Weight', icon: '⚖', action: () => { onClose(); onAddWeight(); } },
  ];

  return (
    <Sheet open={open} onClose={onClose} title="Quick Add">
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.action}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface active:scale-95 min-h-[80px]"
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}