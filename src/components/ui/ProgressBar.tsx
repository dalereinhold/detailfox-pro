interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max,
  className = '',
  barClassName = 'bg-zinc-900',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-1 bg-zinc-100 overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-700 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
