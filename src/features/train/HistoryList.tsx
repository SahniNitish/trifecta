import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db } from '../../db/db';
import { calcVolume } from '../../lib/format';
import { EmptyState } from '../../components/EmptyState';

export function HistoryList() {
  const sessions = useLiveQuery(() =>
    db.workoutSessions.orderBy('date').reverse().toArray()
  );

  if (!sessions?.length) {
    return <EmptyState message="No workouts logged yet" />;
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => {
        const volume = s.exercises.reduce(
          (sum, ex) => sum + calcVolume(ex.sets),
          0,
        );
        return (
          <div key={s.id} className="p-3 bg-surface rounded-xl">
            <div className="flex justify-between">
              <p className="font-medium">{s.templateName}</p>
              <span className="text-xs text-muted">
                {dayjs(s.date).format('MMM D')}
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {s.exercises.length} exercises · {volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume} kg vol
              {s.durationMin ? ` · ${s.durationMin} min` : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}