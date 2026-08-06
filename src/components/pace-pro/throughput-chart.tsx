import { useState, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import type { Vehicle } from '@/lib/supabase';
import { getTimeSeries, type TimeSeriesGranularity } from '@/lib/use-stats';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ThroughputChartProps {
  vehicles: Vehicle[];
  loading: boolean;
}

const RANGES: { label: string; value: TimeSeriesGranularity; buckets: number }[] = [
  { label: 'Last 6 months', value: 'month', buckets: 6 },
  { label: 'Last 26 weeks', value: 'week', buckets: 26 },
  { label: 'Last 180 days', value: 'day', buckets: 180 },
];

const chartConfig = {
  count: {
    label: 'Vehicles',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export default function ThroughputChart({ vehicles, loading }: ThroughputChartProps) {
  const [granularity, setGranularity] = useState<TimeSeriesGranularity>('month');

  const config = RANGES.find((r) => r.value === granularity)!;

  const chartData = useMemo(
    () => getTimeSeries(vehicles, granularity, config.buckets),
    [vehicles, granularity, config.buckets],
  );

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Throughput</CardTitle>
          <CardDescription>
            Completed vehicles over {config.label.toLowerCase()}
          </CardDescription>
        </div>
        <Select value={granularity} onValueChange={(v) => setGranularity(v as TimeSeriesGranularity)}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 6 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value} className="rounded-lg">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading && vehicles.length === 0 ? (
          <div className="flex items-end gap-1 h-[250px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full bg-muted animate-pulse rounded-sm"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        ) : chartData.every((b) => b.count === 0) ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            No completed vehicles in this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" labelKey="label" />}
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillCount)"
                stroke="var(--color-count)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
