import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db } from '../../db/db';

import { formatCurrency } from '../../lib/format';
import { CATEGORY_EMOJI } from '../../lib/constants';
import { AddTransactionSheet } from './AddTransactionSheet';
import { BudgetsTab } from './BudgetsTab';
import { CategoryDonut } from './CategoryDonut';
import { DailyBarChart } from './DailyBarChart';
import { EmptyState } from '../../components/EmptyState';

type Tab = 'transactions' | 'budgets' | 'charts';

export function MoneyPage() {
  const [tab, setTab] = useState<Tab>('transactions');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));

  const data = useLiveQuery(async () => {
    const start = dayjs(month).startOf('month').format('YYYY-MM-DD');
    const end = dayjs(month).endOf('month').format('YYYY-MM-DD');
    const txns = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('date');

    const expenses = txns.filter((t) => t.type === 'expense');
    const monthTotal = expenses.reduce((s, t) => s + t.amount, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    const donutData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    const daysInMonth = dayjs(month).daysInMonth();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = dayjs(month).date(i + 1).format('YYYY-MM-DD');
      const amount = expenses
        .filter((t) => t.date === day)
        .reduce((s, t) => s + t.amount, 0);
      return { day: String(i + 1), amount };
    });

    const grouped: Record<string, typeof txns> = {};
    txns.forEach((t) => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });

    return { txns, monthTotal, donutData, dailyData, grouped };
  }, [month]);

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <h1 className="text-2xl font-semibold mb-4">Money</h1>
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4">
        {(['transactions', 'budgets', 'charts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm capitalize active:scale-95 ${
              tab === t ? 'bg-surface2 text-text' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-surface rounded-lg px-3 py-2 text-sm outline-none"
            />
            <span className="text-lg font-semibold tabular-nums text-danger">
              -{formatCurrency(data?.monthTotal ?? 0)}
            </span>
          </div>
          {Object.keys(data?.grouped ?? {}).length === 0 ? (
            <EmptyState message="No transactions" action="Add expense →" onAction={() => setSheetOpen(true)} />
          ) : (
            Object.entries(data?.grouped ?? {}).sort((a, b) => b[0].localeCompare(a[0])).map(([date, txns]) => (
              <div key={date} className="mb-4">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">
                  {dayjs(date).format('ddd, MMM D')}
                </p>
                <div className="space-y-2">
                  {txns.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                      <span className="text-lg">{CATEGORY_EMOJI[t.category] ?? '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{t.note || t.category}</p>
                        <p className="text-xs text-muted">{t.category}</p>
                      </div>
                      <span className={`tabular-nums font-medium ${
                        t.type === 'expense' ? 'text-danger' : 'text-accent'
                      }`}>
                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'budgets' && <BudgetsTab />}

      {tab === 'charts' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-2">By Category</p>
            <CategoryDonut data={data?.donutData ?? []} />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-2">Daily Spend</p>
            <DailyBarChart data={data?.dailyData ?? []} />
          </div>
        </div>
      )}

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed right-4 bottom-20 w-14 h-14 rounded-full bg-accent text-bg font-bold text-2xl shadow-lg flex items-center justify-center active:scale-95 z-30"
      >
        +
      </button>
      <AddTransactionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}