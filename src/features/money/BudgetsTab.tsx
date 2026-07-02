import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { monthStartStr, monthEndStr } from '../../lib/dates';
import { formatCurrency } from '../../lib/format';
import { ProgressBar } from '../../components/ProgressBar';

export function BudgetsTab() {
  const data = useLiveQuery(async () => {
    const budgets = await db.budgets.toArray();
    const start = monthStartStr();
    const end = monthEndStr();
    const txns = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .and((t) => t.type === 'expense')
      .toArray();

    return budgets
      .filter((b) => b.category !== 'ALL')
      .map((b) => {
        const spent = txns
          .filter((t) => t.category === b.category)
          .reduce((s, t) => s + t.amount, 0);
        return { ...b, spent };
      });
  });

  const updateLimit = async (id: number | undefined, limit: number) => {
    if (!id) return;
    await db.budgets.update(id, { monthlyLimit: limit });
  };

  return (
    <div className="space-y-3">
      {data?.map((b) => (
        <div key={b.id} className="p-3 bg-surface rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-medium">{b.category}</span>
            <span className="text-sm tabular-nums text-muted">
              {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)}
            </span>
          </div>
          <ProgressBar value={b.spent} max={b.monthlyLimit} />
          <button
            onClick={() => {
              const val = prompt('Monthly limit:', String(b.monthlyLimit));
              if (val) updateLimit(b.id, parseFloat(val));
            }}
            className="text-xs text-muted mt-2 active:scale-95"
          >
            Edit limit
          </button>
        </div>
      ))}
    </div>
  );
}