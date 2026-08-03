import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Vehicle } from '@/lib/supabase';
import { getTimeSeries, type TimeSeriesGranularity } from '@/lib/use-stats';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ThroughputChartProps {
  vehicles: Vehicle[];
  loading: boolean;
}

const GRANULARITIES: { label: string; value: TimeSeriesGranularity; buckets: number }[] = [
  { label: 'Day', value: 'day', buckets: 180 },
  { label: 'Week', value: 'week', buckets: 26 },
  { label: 'Month', value: 'month', buckets: 6 },
];

// Configuration for shadcn chart theming and labels
const chartConfig = {
  count: {
    label: 'Vehicles',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function ThroughputChart({ vehicles, loading }: ThroughputChartProps) {
  const [granularity, setGranularity] = useState<TimeSeriesGranularity>('month');

  const config = GRANULARITIES.find((g) => g.value === granularity)!;

  const chartData = useMemo(
    () => getTimeSeries(vehicles, granularity, config.buckets),
    [vehicles, granularity, config.buckets],
  );

  return (
    <div className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
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
              <div
                key={i}
                className="flex-1 h-full bg-muted animate-pulse rounded-sm"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        ) : chartData.every((b) => b.count === 0) ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-xs uppercase tracking-widest">
            No completed vehicles in this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-40 w-full">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px] fill-muted-foreground"
              />
              
              <YAxis hide domain={[0, 'auto']} />

              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="line" labelKey="label" />}
              />

              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillCount)"
                fillOpacity={0.4}
                stroke="var(--color-count)"
                strokeWidth={2}
                activeDot={{
                  r: 5,
                  className: 'fill-primary stroke-background stroke-2',
                }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}