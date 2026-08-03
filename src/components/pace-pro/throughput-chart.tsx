import { useState, useMemo } from 'react';
import { ChartBar as BarChart3 } from 'lucide-react';
import type { Vehicle } from '@/lib/supabase';
import { getTimeSeries, type TimeSeriesGranularity } from '@/lib/use-stats';

interface ThroughputChartProps {
  vehicles: Vehicle[];
  loading: boolean;
}

const GRANULARITIES: { label: string; value: TimeSeriesGranularity; buckets: number }[] = [
  { label: 'Day', value: 'day', buckets: 180 },
  { label: 'Week', value: 'week', buckets: 26 },
  { label: 'Month', value: 'month', buckets: 6 },
];

export default function ThroughputChart({ vehicles, loading }: ThroughputChartProps) {
  const [granularity, setGranularity] = useState<TimeSeriesGranularity>('month');

  const config = GRANULARITIES.find((g) => g.value === granularity)!;

  const buckets = useMemo(
    () => getTimeSeries(vehicles, granularity, config.buckets),
    [vehicles, granularity, config.buckets],
  );

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Throughput</h2>
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            Last {config.buckets} {granularity}s
          </span>
        </div>
        <div className="flex items-center gap-1">
          {GRANULARITIES.map((g) => (
            <button
              key={g.value}
              onClick={() => setGranularity(g.value)}
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm transition-colors ${
                granularity === g.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="p-5">
        {loading && vehicles.length === 0 ? (
          <div className="flex items-end gap-1 h-40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 h-full bg-muted animate-pulse rounded-sm" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : buckets.every((b) => b.count === 0) ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-xs uppercase tracking-widest">
            No completed vehicles in this period
          </div>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {buckets.map((bucket, i) => {
              const heightPct = Math.round((bucket.count / maxCount) * 100);
              const isLast = i === buckets.length - 1;
              return (
                <div key={bucket.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap">
                      {bucket.label}: {bucket.count}
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${
                        isLast ? 'bg-primary' : 'bg-primary/60'
                      } hover:bg-primary`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
