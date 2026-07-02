import { daysInWeek } from '../lib/dates';

interface WeekStripProps {
  activeDates: string[];
  className?: string;
}

export function WeekStrip({ activeDates, className = '' }: WeekStripProps) {
  const days = daysInWeek();
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const active = new Set(activeDates);

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {days.map((date, i) => (
        <div key={date} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted uppercase tracking-wide">{labels[i]}</span>
          <div
            className={`w-3 h-3 rounded-full ${
              active.has(date) ? 'bg-accent' : 'bg-surface2'
            }`}
          />
        </div>
      ))}
    </div>
  );
}