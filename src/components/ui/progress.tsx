import * as React from "react";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  barClassName?: string;
}

export function ProgressBar({
  value = 0,
  max = 100,
  barClassName = "",
  className = "",
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={`h-2 bg-muted rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className={`h-full bg-primary transition-all duration-300 ${barClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
