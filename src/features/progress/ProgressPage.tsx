import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  weekStartStr,
  weekEndStr,
  isDateInRange,
  daysInMonth,
  todayStr,
} from '../../lib/dates';
import { WeightChart } from './WeightChart';
import { WeekSummaryCard } from './WeekSummaryCard';
import { WeekStrip } from '../../components/WeekStrip';
import { Sheet } from '../../components/Sheet';

type Range = '30' | '90' | 'all';

export function ProgressPage() {
  const [range, setRange] = useState<Range>('30');
  const [weightSheet, setWeightSheet] = useState(false);
  const [weight, setWeight] = useState('');

  const data = useLiveQuery(async () => {
    const weekStart = weekStartStr();
    const weekEnd = weekEndStr();

    const sessions = await db.workoutSessions.toArray();
    const weekWorkouts = sessions.filter((s) =>
      isDateInRange(s.date, weekStart, weekEnd),
    ).length;

    const cardio = await db.cardioLogs.toArray();
    const weekCardio = cardio
      .filter((c) => isDateInRange(c.date, weekStart, weekEnd))
      .reduce((s, c) => s + c.durationMin, 0);

    const tasks = await db.tasks.toArray();
    const weekTasks = tasks.filter(
      (t) => t.done && t.completedAt && isDateInRange(t.completedAt.slice(0, 10), weekStart, weekEnd),
    ).length;

    const txns = await db.transactions.toArray();
    const weekSpent = txns
      .filter((t) => t.type === 'expense' && isDateInRange(t.date, weekStart, weekEnd))
      .reduce((s, t) => s + t.amount, 0);

    const goalSetting = await db.settings.get('weeklyWorkoutGoal');
    const budgetSetting = await db.settings.get('weeklyBudget');
    const workoutGoal = parseInt(goalSetting?.value ?? '4');
    const weeklyBudget = parseFloat(budgetSetting?.value ?? '250');

    const workoutDates = sessions.map((s) => s.date);
    const monthDays = daysInMonth();
    const monthWorkoutDates = new Set(workoutDates);

    const metrics = await db.bodyMetrics.orderBy('date').toArray();
    const weightData = metrics
      .filter((m) => m.weightKg)
      .map((m) => ({ date: m.date, weight: m.weightKg! }));

    return {
      weekWorkouts,
      workoutGoal,
      weekTasks,
      weekSpent,
      weeklyBudget,
      weekCardio,
      workoutDates,
      monthDays,
      monthWorkoutDates,
      weightData,
    };
  });

  const filteredWeight = data?.weightData.filter((w) => {
    if (range === 'all') return true;
    const days = range === '30' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(w.date) >= cutoff;
  }) ?? [];

  const logWeight = async () => {
    const kg = parseFloat(weight);
    if (!kg) return;
    await db.bodyMetrics.add({ date: todayStr(), weightKg: kg });
    setWeight('');
    setWeightSheet(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <h1 className="text-2xl font-semibold mb-4">Progress</h1>

      {data && (
        <WeekSummaryCard
          workouts={data.weekWorkouts}
          workoutGoal={data.workoutGoal}
          tasksCompleted={data.weekTasks}
          spent={data.weekSpent}
          budget={data.weeklyBudget}
          cardioMin={data.weekCardio}
        />
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-muted uppercase tracking-wide">Weight</h3>
          <button
            onClick={() => setWeightSheet(true)}
            className="text-sm text-accent active:scale-95"
          >
            + Log
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          {(['30', '90', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs active:scale-95 ${
                range === r ? 'bg-accent text-bg' : 'bg-surface text-muted'
              }`}
            >
              {r === 'all' ? 'All' : `${r}d`}
            </button>
          ))}
        </div>
        <WeightChart data={filteredWeight} />
      </div>

      <div className="mt-6">
        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Consistency</h3>
        <WeekStrip activeDates={data?.workoutDates ?? []} />
        <div className="grid grid-cols-7 gap-1 mt-4">
          {data?.monthDays.map((date) => (
            <div
              key={date}
              className={`aspect-square rounded-md ${
                data.monthWorkoutDates.has(date) ? 'bg-accent' : 'bg-surface2'
              }`}
            />
          ))}
        </div>
      </div>

      <Sheet open={weightSheet} onClose={() => setWeightSheet(false)} title="Log Weight">
        <input
          autoFocus
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          className="w-full bg-surface rounded-xl px-4 py-4 text-2xl tabular-nums text-center outline-none mb-4"
        />
        <button
          onClick={logWeight}
          className="w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95"
        >
          Save
        </button>
      </Sheet>
    </div>
  );
}