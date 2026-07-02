import { formatCurrency } from '../../lib/format';

interface WeekSummaryCardProps {
  workouts: number;
  workoutGoal: number;
  tasksCompleted: number;
  spent: number;
  budget: number;
  cardioMin: number;
}

export function WeekSummaryCard({
  workouts,
  workoutGoal,
  tasksCompleted,
  spent,
  budget,
  cardioMin,
}: WeekSummaryCardProps) {
  const underBudget = budget - spent;

  return (
    <div className="p-4 bg-surface rounded-xl space-y-4">
      <h3 className="text-xs text-muted uppercase tracking-wide">This Week</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Workouts" value={`${workouts}/${workoutGoal}`} highlight={workouts >= workoutGoal} />
        <Stat label="Cardio" value={`${cardioMin} min`} />
        <Stat label="Tasks done" value={String(tasksCompleted)} />
        <Stat label="Spent" value={formatCurrency(spent)} />
      </div>
      {workouts >= workoutGoal && underBudget > 0 && (
        <p className="text-sm text-accent bg-accent/10 rounded-lg p-3">
          {workouts}/{workoutGoal} this week — you're {formatCurrency(underBudget)} under budget
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 bg-surface2 rounded-lg">
      <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-semibold tabular-nums mt-1 ${highlight ? 'text-accent' : ''}`}>
        {value}
      </p>
    </div>
  );
}