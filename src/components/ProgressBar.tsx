interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const ratio = max > 0 ? value / max : 0;
  const color = ratio > 1 ? 'bg-danger' : ratio > 0.8 ? 'bg-amber' : 'bg-accent';

  return (
    <div className={`h-2 rounded-full bg-surface2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}