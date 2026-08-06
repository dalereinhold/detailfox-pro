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
} from '@/components/ui/card'; // Fixed casing
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

// 1. Added unique IDs for selection and mapping
const RANGES: { id: string; label: string; value: TimeSeriesGranularity; buckets: number }[] = [
  { id: '7d', label: 'Last 7 days', value: 'day', buckets: 7 },
  { id: '30d', label: 'Last 30 days', value: 'day', buckets: 30 },
  { id: '90d', label: 'Last 3 months', value: 'day', buckets: 90 },
];

const chartConfig = {
  count: {
    label: 'Vehicles',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export default function ThroughputChart({ vehicles, loading }: ThroughputChartProps) {
  // Track selected range ID instead of granularity directly
  const [rangeId, setRangeId] = useState<string>('7d');

  const config = useMemo(
    () => RANGES.find((r) => r.id === rangeId) ?? RANGES[0],
    [rangeId]
  );

  const chartData = useMemo(
    () => getTimeSeries(vehicles, config.value, config.buckets),
    [vehicles, config.value, config.buckets],
  );

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 border-b py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle>Throughput</CardTitle>
          <CardDescription>
            Completed vehicles over {config.label.toLowerCase()}
          </CardDescription>
        </div>
        {/* 3. Removed 'hidden' so the dropdown remains accessible on mobile */}
        <Select value={rangeId} onValueChange={setRangeId}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {RANGES.map((r) => (
              <SelectItem key={r.id} value={r.id} className="rounded-lg">
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