import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db } from '../../db/db';
import { todayStr } from '../../lib/dates';
import { TemplateEditor } from './TemplateEditor';
import { CardioForm } from './CardioForm';
import { HistoryList } from './HistoryList';
import { EmptyState } from '../../components/EmptyState';

type Tab = 'log' | 'templates' | 'cardio' | 'history';

export function TrainPage() {
  const [tab, setTab] = useState<Tab>('log');
  const navigate = useNavigate();

  const templates = useLiveQuery(() => db.workoutTemplates.orderBy('order').toArray());
  const todaySession = useLiveQuery(async () => {
    const sessions = await db.workoutSessions.where('date').equals(todayStr()).toArray();
    return sessions[0] ?? null;
  });
  const recentSessions = useLiveQuery(() =>
    db.workoutSessions.orderBy('date').reverse().limit(3).toArray()
  );
  const recentCardio = useLiveQuery(() =>
    db.cardioLogs.orderBy('date').reverse().limit(5).toArray()
  );

  const startWorkout = async (templateId: number) => {
    const template = await db.workoutTemplates.get(templateId);
    if (!template) return;
    const exercises = template.exercises.map((ex) => ({
      name: ex.name,
      sets: [] as { weight: number; reps: number }[],
    }));
    const id = await db.workoutSessions.add({
      templateId: template.id,
      templateName: template.name,
      date: todayStr(),
      exercises,
    });
    navigate(`/train/session/${id}`);
  };

  const suggestedTemplate = templates?.[
    (dayjs().day() % (templates?.length || 1))
  ];

  return (
    <div className="px-4 pt-4 pb-24 safe-top">
      <h1 className="text-2xl font-semibold mb-4">Training</h1>
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4 overflow-x-auto">
        {(['log', 'templates', 'cardio', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm capitalize whitespace-nowrap active:scale-95 ${
              tab === t ? 'bg-surface2 text-text' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'log' && (
        <div className="space-y-4">
          {todaySession ? (
            <div className="p-4 bg-surface rounded-xl border border-accent/30">
              <p className="text-accent text-sm mb-1">Today's workout</p>
              <p className="font-semibold text-lg">{todaySession.templateName}</p>
              <button
                onClick={() => navigate(`/train/session/${todaySession.id}`)}
                className="mt-3 w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95"
              >
                Continue →
              </button>
            </div>
          ) : suggestedTemplate ? (
            <div className="p-4 bg-surface rounded-xl">
              <p className="text-muted text-sm mb-1">Suggested today</p>
              <p className="font-semibold text-lg">{suggestedTemplate.name}</p>
              <button
                onClick={() => startWorkout(suggestedTemplate.id!)}
                className="mt-3 w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95"
              >
                Start workout →
              </button>
            </div>
          ) : (
            <EmptyState message="No templates" action="Create split →" onAction={() => setTab('templates')} />
          )}

          {templates && templates.length > 1 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Or pick</p>
              <div className="flex gap-2 flex-wrap">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => startWorkout(t.id!)}
                    className="px-4 py-2 rounded-xl bg-surface2 text-sm active:scale-95"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentSessions && recentSessions.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Recent</p>
              <HistoryList />
            </div>
          )}
        </div>
      )}

      {tab === 'templates' && <TemplateEditor />}
      {tab === 'cardio' && (
        <div>
          <CardioForm />
          {recentCardio && recentCardio.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Recent</p>
              <div className="space-y-2">
                {recentCardio.map((c) => (
                  <div key={c.id} className="p-3 bg-surface rounded-xl flex justify-between">
                    <span>{c.durationMin} min treadmill</span>
                    <span className="text-xs text-muted">{dayjs(c.date).format('MMM D')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === 'history' && <HistoryList />}
    </div>
  );
}