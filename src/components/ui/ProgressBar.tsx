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
  barClassName = 'bg-indigo-600 dark:bg-indigo-500',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-1 bg-zinc-100 overflow-hidden dark:bg-slate-700 ${className}`}>
      <div
        className={`h-full transition-all duration-700 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
