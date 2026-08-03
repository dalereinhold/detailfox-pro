import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const config = GRANULARITIES.find((g) => g.value === granularity)!;

  const buckets = useMemo(
    () => getTimeSeries(vehicles, granularity, config.buckets),
    [vehicles, granularity, config.buckets],
  );

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = 16;

  // Compute normalized (x, y) coordinates for line path
  const points = useMemo(() => {
    if (buckets.length === 0) return [];
    const stepX = (svgWidth - padding * 2) / Math.max(buckets.length - 1, 1);

    return buckets.map((bucket, i) => {
      const x = padding + i * stepX;
      // Invert Y because SVG 0 is at the top
      const y = svgHeight - padding - (bucket.count / maxCount) * (svgHeight - padding * 2);
      return { x, y, bucket, index: i };
    });
  }, [buckets, maxCount]);

  // Construct SVG path strings
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    const line = points.reduce((acc, point, index) => {
      return `${acc} ${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`;
    }, '');

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = svgHeight - padding;

    const area = `${line} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    return { linePath: line, areaPath: area };
  }, [points]);

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
              onClick={() => {
                setGranularity(g.value);
                setHoveredIdx(null);
              }}
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
        ) : buckets.every((b) => b.count === 0) ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-xs uppercase tracking-widest">
            No completed vehicles in this period
          </div>
        ) : (
          <div className="relative h-40 w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path d={areaPath} fill="url(#line-gradient)" />

              {/* Line path */}
              <path
                d={linePath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & active hover target */}
              {points.map((pt) => {
                const isHovered = hoveredIdx === pt.index;
                return (
                  <g key={pt.bucket.date}>
                    {/* Hover indicator vertical line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={padding}
                        x2={pt.x}
                        y2={svgHeight - padding}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.5"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      className="fill-primary stroke-background transition-all duration-150"
                      strokeWidth={isHovered ? 2 : 1.5}
                    />

                    {/* Interactive hover region */}
                    <rect
                      x={pt.x - svgWidth / (points.length * 2)}
                      y={0}
                      width={svgWidth / points.length}
                      height={svgHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(pt.index)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <div
                className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full mb-2 transition-all duration-75"
                style={{
                  left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredIdx].y / svgHeight) * 100}%`,
                }}
              >
                <div className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap shadow-md">
                  {points[hoveredIdx].bucket.label}: {points[hoveredIdx].bucket.count}
                </div>
              </div>
            )}

            {/* X-Axis labels */}
            <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-muted-foreground tabular-nums">
              <span>{buckets[0]?.label}</span>
              {buckets.length > 2 && (
                <span>{buckets[Math.floor(buckets.length / 2)]?.label}</span>
              )}
              <span>{buckets[buckets.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}