import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  todayStr,
  formatDateHeader,
  weekStartStr,
  weekEndStr,
  isDateInRange,
} from '../../lib/dates';
import { formatCurrency } from '../../lib/format';
import { CATEGORY_EMOJI } from '../../lib/constants';
import { ProgressBar } from '../../components/ProgressBar';
import { WeekStrip } from '../../components/WeekStrip';
import { FAB } from '../../components/FAB';
import { QuickAddSheet } from '../../components/QuickAddSheet';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { AddTransactionSheet } from '../money/AddTransactionSheet';
import { Sheet } from '../../components/Sheet';

export function TodayPage() {
  const navigate = useNavigate();
  const [quickAdd, setQuickAdd] = useState(false);
  const [taskSheet, setTaskSheet] = useState(false);
  const [expenseSheet, setExpenseSheet] = useState(false);
  const [weightSheet, setWeightSheet] = useState(false);
  const [weight, setWeight] = useState('');

  const data = useLiveQuery(async () => {
    const today = todayStr();
    const weekStart = weekStartStr();
    const weekEnd = weekEndStr();

    const tasks = await db.tasks.toArray();
    const todayTasks = tasks
      .filter((t) => !t.done && (!t.dueDate || t.dueDate <= today))
      .slice(0, 5);

    const templates = await db.workoutTemplates.orderBy('order').toArray();
    const todaySessions = await db.workoutSessions.where('date').equals(today).toArray();
    const todaySession = todaySessions[0] ?? null;

    const weekSessions = await db.workoutSessions.toArray();
    const workoutDates = weekSessions
      .filter((s) => isDateInRange(s.date, weekStart, weekEnd))
      .map((s) => s.date);

    const txns = await db.transactions.toArray();
    const weekSpent = txns
      .filter((t) => t.type === 'expense' && isDateInRange(t.date, weekStart, weekEnd))
      .reduce((s, t) => s + t.amount, 0);
    const recentTxns = txns
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 2);

    const budgetSetting = await db.settings.get('weeklyBudget');
    const weeklyBudget = parseFloat(budgetSetting?.value ?? '250');

    const dayOfWeek = new Date().getDay();
    const suggestedTemplate = templates[dayOfWeek % templates.length] ?? null;

    return {
      todayTasks,
      todaySession,
      workoutDates,
      weekSpent,
      weeklyBudget,
      recentTxns,
      suggestedTemplate,
    };
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const logWeight = async () => {
    const kg = parseFloat(weight);
    if (!kg) return;
    await db.bodyMetrics.add({ date: todayStr(), weightKg: kg });
    setWeight('');
    setWeightSheet(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-sm">{greeting()}</p>
          <h1 className="text-xl font-semibold">{formatDateHeader()}</h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center active:scale-95"
        >
          ⚙
        </button>
      </div>

      {/* Training card */}
      <div className={`p-4 bg-surface rounded-xl mb-4 ${!data?.todaySession && !data?.suggestedTemplate ? 'opacity-50' : ''}`}>
        <p className="text-xs text-muted uppercase tracking-wide mb-2">Training</p>
        {data?.todaySession ? (
          <>
            <p className="font-semibold text-lg text-accent">✓ {data.todaySession.templateName}</p>
            <p className="text-sm text-muted mt-1">Workout logged today</p>
          </>
        ) : data?.suggestedTemplate ? (
          <>
            <p className="font-semibold text-lg">{data.suggestedTemplate.name}</p>
            <button
              onClick={() => navigate('/train')}
              className="mt-2 text-accent text-sm font-medium active:scale-95"
            >
              Start workout →
            </button>
          </>
        ) : (
          <p className="text-muted">Rest day</p>
        )}
      </div>

      {/* Tasks card */}
      <div className="p-4 bg-surface rounded-xl mb-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-muted uppercase tracking-wide">Tasks</p>
          <button onClick={() => navigate('/tasks')} className="text-xs text-accent active:scale-95">
            View all →
          </button>
        </div>
        {data?.todayTasks.length === 0 ? (
          <p className="text-sm text-muted">All clear</p>
        ) : (
          <div className="space-y-2">
            {data?.todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!task.id) return;
                    await db.tasks.update(task.id, {
                      done: true,
                      completedAt: new Date().toISOString(),
                    });
                  }}
                  className="w-5 h-5 rounded border-2 border-muted shrink-0 active:scale-95"
                />
                <span className="text-sm truncate">{task.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Money card */}
      <div className="p-4 bg-surface rounded-xl mb-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-2">This Week</p>
        <div className="flex justify-between mb-2">
          <span className="tabular-nums font-semibold">
            {formatCurrency(data?.weekSpent ?? 0)}
          </span>
          <span className="text-muted text-sm tabular-nums">
            / {formatCurrency(data?.weeklyBudget ?? 250)}
          </span>
        </div>
        <ProgressBar value={data?.weekSpent ?? 0} max={data?.weeklyBudget ?? 250} />
        {data?.recentTxns && data.recentTxns.length > 0 && (
          <div className="mt-3 space-y-1">
            {data.recentTxns.map((t) => (
              <div key={t.id} className="flex justify-between text-sm">
                <span className="text-muted">
                  {CATEGORY_EMOJI[t.category]} {t.note || t.category}
                </span>
                <span className="text-danger tabular-nums">-{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Streak strip */}
      <WeekStrip activeDates={data?.workoutDates ?? []} className="mb-4" />

      <FAB onClick={() => setQuickAdd(true)} />
      <QuickAddSheet
        open={quickAdd}
        onClose={() => setQuickAdd(false)}
        onAddTask={() => setTaskSheet(true)}
        onAddExpense={() => setExpenseSheet(true)}
        onAddWeight={() => setWeightSheet(true)}
      />
      <AddTaskSheet open={taskSheet} onClose={() => setTaskSheet(false)} />
      <AddTransactionSheet open={expenseSheet} onClose={() => setExpenseSheet(false)} />
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