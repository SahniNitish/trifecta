import { useState } from 'react';
import { db } from '../../db/db';
import { todayStr } from '../../lib/dates';
import { CATEGORIES } from '../../lib/constants';
import { Sheet } from '../../components/Sheet';

interface AddTransactionSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionSheet({ open, onClose }: AddTransactionSheetProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const reset = () => {
    setAmount('');
    setType('expense');
    setCategory('Food');
    setNote('');
  };

  const save = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    await db.transactions.add({
      amount: num,
      type,
      category,
      note: note.trim() || undefined,
      date: todayStr(),
    });
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add Transaction">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm capitalize active:scale-95 ${
                type === t
                  ? t === 'expense' ? 'bg-danger text-white' : 'bg-accent text-bg'
                  : 'bg-surface text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          autoFocus
          inputMode="decimal"
          enterKeyHint="done"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-surface rounded-xl px-4 py-4 text-3xl font-semibold tabular-nums text-center outline-none"
        />
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-2 px-1 rounded-lg text-xs active:scale-95 ${
                category === cat ? 'bg-accent text-bg' : 'bg-surface text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full bg-surface rounded-xl px-4 py-3 outline-none"
        />
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