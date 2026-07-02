import { useState } from 'react';
import { db } from '../../db/db';
import { todayStr } from '../../lib/dates';

export function CardioForm() {
  const [duration, setDuration] = useState('');
  const [speed, setSpeed] = useState('');
  const [incline, setIncline] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');

  const save = async () => {
    const dur = parseInt(duration);
    if (!dur) return;
    await db.cardioLogs.add({
      date: todayStr(),
      type: 'treadmill',
      durationMin: dur,
      speedKmh: speed ? parseFloat(speed) : undefined,
      inclinePct: incline ? parseFloat(incline) : undefined,
      distanceKm: distance ? parseFloat(distance) : undefined,
      calories: calories ? parseInt(calories) : undefined,
    });
    setDuration('');
    setSpeed('');
    setIncline('');
    setDistance('');
    setCalories('');
  };

  const fields = [
    { label: 'Duration (min)', value: duration, set: setDuration, required: true },
    { label: 'Speed (km/h)', value: speed, set: setSpeed },
    { label: 'Incline (%)', value: incline, set: setIncline },
    { label: 'Distance (km)', value: distance, set: setDistance },
    { label: 'Calories', value: calories, set: setCalories },
  ];

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.label}>
          <label className="text-xs text-muted uppercase tracking-wide">{f.label}</label>
          <input
            inputMode="decimal"
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            className="w-full bg-surface rounded-xl px-4 py-3 mt-1 tabular-nums outline-none"
          />
        </div>
      ))}
      <button
        onClick={save}
        className="w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95"
      >
        Log Cardio
      </button>
    </div>
  );
}