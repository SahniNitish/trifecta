import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SessionExercise } from '../../db/db';


export function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = parseInt(id ?? '0');
  const [startTime] = useState(Date.now());

  const session = useLiveQuery(() => db.workoutSessions.get(sessionId), [sessionId]);

  const lastSession = useLiveQuery(async () => {
    if (!session) return null;
    const prev = await db.workoutSessions
      .where('templateName')
      .equals(session.templateName)
      .and((s) => s.id !== sessionId)
      .reverse()
      .sortBy('date');
    return prev[0] ?? null;
  }, [session, sessionId]);

  const updateExercise = async (exercises: SessionExercise[]) => {
    if (!sessionId) return;
    await db.workoutSessions.update(sessionId, { exercises });
  };

  const logSet = async (exIdx: number) => {
    if (!session) return;
    const exercises = [...session.exercises];
    const ex = exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    const lastEx = lastSession?.exercises.find((e) => e.name === ex.name);
    const lastFromPrev = lastEx?.sets[lastEx.sets.length - 1];

    const weight = lastSet?.weight ?? lastFromPrev?.weight ?? 0;
    const reps = lastSet?.reps ?? lastFromPrev?.reps ?? 0;

    ex.sets = [...ex.sets, { weight, reps }];
    exercises[exIdx] = ex;
    await updateExercise(exercises);
  };

  const adjustSet = async (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps',
    delta: number,
  ) => {
    if (!session) return;
    const exercises = [...session.exercises];
    const set = { ...exercises[exIdx].sets[setIdx] };
    set[field] = Math.max(0, set[field] + delta);
    exercises[exIdx].sets[setIdx] = set;
    await updateExercise(exercises);
  };

  const finish = async () => {
    const durationMin = Math.round((Date.now() - startTime) / 60000);
    await db.workoutSessions.update(sessionId, { durationMin });
    navigate('/train');
  };

  if (!session) {
    return <div className="p-4 text-muted">Loading...</div>;
  }

  return (
    <div className="px-4 pt-4 pb-8 safe-top">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/train')} className="text-muted active:scale-95">← Back</button>
        <h1 className="text-lg font-semibold">{session.templateName}</h1>
        <div className="w-12" />
      </div>

      <div className="space-y-4">
        {session.exercises.map((ex, exIdx) => {
          const lastEx = lastSession?.exercises.find((e) => e.name === ex.name);
          const lastSet = lastEx?.sets[lastEx.sets.length - 1];

          return (
            <div key={exIdx} className="p-4 bg-surface rounded-xl">
              <h3 className="font-medium mb-1">{ex.name}</h3>
              {lastSet && (
                <p className="text-xs text-muted mb-3">
                  last: {lastSet.weight}kg × {lastSet.reps}
                </p>
              )}
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted w-6">#{setIdx + 1}</span>
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => adjustSet(exIdx, setIdx, 'weight', -2.5)}
                      className="w-12 h-12 rounded-lg bg-surface2 text-lg active:scale-95 no-select"
                    >−</button>
                    <span className="flex-1 text-center tabular-nums text-lg font-semibold">
                      {set.weight} kg
                    </span>
                    <button
                      onClick={() => adjustSet(exIdx, setIdx, 'weight', 2.5)}
                      className="w-12 h-12 rounded-lg bg-surface2 text-lg active:scale-95 no-select"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => adjustSet(exIdx, setIdx, 'reps', -1)}
                      className="w-12 h-12 rounded-lg bg-surface2 text-lg active:scale-95 no-select"
                    >−</button>
                    <span className="flex-1 text-center tabular-nums text-lg font-semibold">
                      {set.reps} reps
                    </span>
                    <button
                      onClick={() => adjustSet(exIdx, setIdx, 'reps', 1)}
                      className="w-12 h-12 rounded-lg bg-surface2 text-lg active:scale-95 no-select"
                    >+</button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => logSet(exIdx)}
                className="w-full py-3 mt-2 rounded-lg bg-surface2 text-accent font-medium active:scale-95 min-h-[48px]"
              >
                ✓ Log set
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={finish}
        className="w-full mt-6 py-4 rounded-xl bg-accent text-bg font-semibold text-lg active:scale-95"
      >
        Finish workout
      </button>
    </div>
  );
}