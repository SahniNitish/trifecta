import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  type Task,
  type Transaction,
  type Budget,
  type WorkoutTemplate,
  type WorkoutSession,
  type CardioLog,
  type BodyMetric,
  type Setting,
} from '../../db/db';

interface BackupData {
  tasks?: Task[];
  transactions?: Transaction[];
  budgets?: Budget[];
  workoutTemplates?: WorkoutTemplate[];
  workoutSessions?: WorkoutSession[];
  cardioLogs?: CardioLog[];
  bodyMetrics?: BodyMetric[];
  settings?: Setting[];
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);

  const settings = useLiveQuery(async () => {
    const workoutGoal = await db.settings.get('weeklyWorkoutGoal');
    const weeklyBudget = await db.settings.get('weeklyBudget');
    const currency = await db.settings.get('currency');
    return {
      workoutGoal: workoutGoal?.value ?? '4',
      weeklyBudget: weeklyBudget?.value ?? '250',
      currency: currency?.value ?? 'CAD',
    };
  });

  const updateSetting = async (key: string, value: string) => {
    await db.settings.put({ key, value });
  };

  const exportData = async () => {
    const data = {
      tasks: await db.tasks.toArray(),
      transactions: await db.transactions.toArray(),
      budgets: await db.budgets.toArray(),
      workoutTemplates: await db.workoutTemplates.toArray(),
      workoutSessions: await db.workoutSessions.toArray(),
      cardioLogs: await db.cardioLogs.toArray(),
      bodyMetrics: await db.bodyMetrics.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trifecta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      await db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
          await table.clear();
        }
        if (data.tasks?.length) {
          await db.tasks.bulkAdd(data.tasks.map(({ id: _, ...t }) => t));
        }
        if (data.transactions?.length) {
          await db.transactions.bulkAdd(data.transactions.map(({ id: _, ...t }) => t));
        }
        if (data.budgets?.length) {
          await db.budgets.bulkAdd(data.budgets.map(({ id: _, ...t }) => t));
        }
        if (data.workoutTemplates?.length) {
          await db.workoutTemplates.bulkAdd(data.workoutTemplates.map(({ id: _, ...t }) => t));
        }
        if (data.workoutSessions?.length) {
          await db.workoutSessions.bulkAdd(data.workoutSessions.map(({ id: _, ...t }) => t));
        }
        if (data.cardioLogs?.length) {
          await db.cardioLogs.bulkAdd(data.cardioLogs.map(({ id: _, ...t }) => t));
        }
        if (data.bodyMetrics?.length) {
          await db.bodyMetrics.bulkAdd(data.bodyMetrics.map(({ id: _, ...t }) => t));
        }
        if (data.settings?.length) await db.settings.bulkPut(data.settings);
        await db.settings.put({ key: 'seeded', value: 'true' });
      });
      alert('Data restored successfully');
    } catch {
      alert('Import failed — check file format');
    }
    setImporting(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <button onClick={() => navigate('/')} className="text-muted mb-4 active:scale-95">← Back</button>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <section className="mb-6">
        <h2 className="text-xs text-muted uppercase tracking-wide mb-3">Goals</h2>
        <div className="space-y-3">
          <SettingRow
            label="Weekly workout goal"
            value={settings?.workoutGoal ?? '4'}
            onChange={(v) => updateSetting('weeklyWorkoutGoal', v)}
          />
          <SettingRow
            label="Weekly budget"
            value={settings?.weeklyBudget ?? '250'}
            onChange={(v) => updateSetting('weeklyBudget', v)}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs text-muted uppercase tracking-wide mb-3">Data</h2>
        <div className="space-y-2">
          <button
            onClick={exportData}
            className="w-full py-3 rounded-xl bg-surface font-medium active:scale-95"
          >
            Export JSON backup
          </button>
          <label className="block w-full py-3 rounded-xl bg-surface font-medium text-center active:scale-95 cursor-pointer">
            {importing ? 'Importing...' : 'Import JSON backup'}
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importData(file);
              }}
            />
          </label>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs text-muted uppercase tracking-wide mb-3">Install on iPhone</h2>
        <p className="text-sm text-muted bg-surface rounded-xl p-4">
          Tap Share → Add to Home Screen. Use as an installed app for best data persistence.
        </p>
      </section>

      <p className="text-center text-xs text-muted">Trifecta v1.0 — local-first PWA</p>
    </div>
  );
}

function SettingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
      <span className="text-sm">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 bg-surface2 rounded-lg px-3 py-2 text-sm text-right tabular-nums outline-none"
      />
    </div>
  );
}