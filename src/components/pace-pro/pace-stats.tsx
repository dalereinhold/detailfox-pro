import { Car, Database, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useStats, type TypeStats } from "@/lib/pace-pro/stats";
import { SERVICE_TYPES } from "@/lib/pace-pro/services";
import {
  TYPE_COLORS,
  SERVICE_TYPE_COLORS,
  VEHICLE_TYPE_BAR_COLORS,
} from "@/lib/pace-pro/colors";
import { formatSecondsToClock } from "@/lib/pace-pro/vehicle";
import { VEHICLE_TYPES } from "@/lib/pace-pro/intake";

interface PaceStatsProps {
  refreshTrigger: number;
}

const cardClass = "border border-border bg-background p-4 rounded-md";
const headerClass =
  "flex items-center gap-2 mb-3 text-muted-foreground text-xs font-semibold uppercase tracking-widest";

function EstimateRow({
  label,
  badgeClass,
  stats,
}: {
  label: string;
  badgeClass: string;
  stats?: TypeStats;
}) {
  const hasData = !!stats && stats.count > 0;
  const hasEstimate = hasData && stats!.estimatedSeconds > 0;
  const pct = hasEstimate
    ? Math.round((stats!.avgSeconds / stats!.estimatedSeconds) * 100)
    : 0;
  const over = pct > 100;
  const barWidth = Math.min(100, pct);

  return (
    <div className="border border-border p-3 rounded-md bg-card">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide border ${badgeClass}`}
        >
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {stats?.count ?? 0} vehicles
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-extrabold tabular-nums text-foreground">
          {hasData ? stats!.avgFormatted : "--"}
        </span>
        <span className="text-xs text-muted-foreground">
          est.{" "}
          {hasEstimate ? formatSecondsToClock(stats!.estimatedSeconds) : "--"}
        </span>
      </div>

      <div className="h-2 bg-muted rounded-sm overflow-hidden">
        <div
          className={`h-full ${over ? "bg-destructive" : "bg-emerald-500"}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {hasEstimate && (
        <p
          className={`flex items-center gap-1 text-[11px] mt-1.5 ${over ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {pct}% of estimate
          {over ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
        </p>
      )}
    </div>
  );
}

export default function PaceStats({ refreshTrigger }: PaceStatsProps) {
  const { stats, loading, error } = useStats(refreshTrigger);
  const lastUpdatedLabel = stats
    ? new Date(stats.lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const completionPct =
    stats && stats.totalInDb > 0
      ? Math.round((stats.totalProcessed / stats.totalInDb) * 100)
      : 0;

  const totalFleet = stats
    ? VEHICLE_TYPES.reduce((sum, t) => sum + stats.totalByType[t], 0)
    : 0;

  return (
    <div className="p-5">
      {error && (
        <div className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2 rounded-sm mb-4">
          Failed to load stats.
        </div>
      )}

      {/* Top row: Processed vs Total, Cars by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Vehicles Processed vs Total in DB */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest">
              <Car className="w-4 h-4" />
              Vehicles Processed
            </div>
            {lastUpdatedLabel && (
              <span className="text-muted-foreground text-[11px] uppercase tracking-widest">
                Updated {lastUpdatedLabel}
              </span>
            )}
          </div>
          {loading && !stats ? (
            <div className="w-24 h-10 bg-muted animate-pulse rounded-sm" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-foreground tabular-nums">
                {stats?.totalProcessed ?? 0}
              </p>
              <p className="text-muted-foreground text-sm">
                / {stats?.totalInDb ?? 0} total
              </p>
            </div>
          )}
          <div className="h-2 bg-muted rounded-sm overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest">
            {completionPct}% completed
          </p>
        </div>

        {/* Cars by Type */}
        <div className={cardClass}>
          <div className={headerClass}>
            <Database className="w-4 h-4" />
            Cars by Type
          </div>
          <div className="space-y-2.5">
            {VEHICLE_TYPES.map((type) => {
              const count = stats?.totalByType[type] ?? 0;
              const pct =
                totalFleet > 0 ? Math.round((count / totalFleet) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-bold px-2 py-0.5 border rounded-sm uppercase tracking-wider ${TYPE_COLORS[type]}`}
                    >
                      {type}
                    </span>
                    <span className="font-bold tabular-nums text-foreground">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-sm overflow-hidden">
                    <div
                      className={`${VEHICLE_TYPE_BAR_COLORS[type]} h-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-muted-foreground text-xs mt-3 uppercase tracking-widest">
            {totalFleet} vehicles total
          </p>
        </div>
      </div>

      {/* Average time vs estimated, by vehicle type (broken down by service) and by service type */}
      <div className="space-y-4">
        <div className={cardClass}>
          <div className={headerClass}>
            <TrendingUp className="w-4 h-4" />
            Average Time by Vehicle Type
          </div>
          <div className="space-y-4">
            {VEHICLE_TYPES.map((type) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 border rounded-sm uppercase tracking-wider ${TYPE_COLORS[type]}`}
                  >
                    {type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stats?.totalByType[type] ?? 0} in fleet
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SERVICE_TYPES.map((service) => (
                    <EstimateRow
                      key={`${type}-${service.name}`}
                      label={service.name}
                      badgeClass={SERVICE_TYPE_COLORS[service.name]}
                      stats={stats?.byTypeAndService[type]?.[service.name]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <div className={headerClass}>
            <Clock className="w-4 h-4" />
            Average Time by Service Type
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SERVICE_TYPES.map((service) => (
              <EstimateRow
                key={service.name}
                label={service.name}
                badgeClass={SERVICE_TYPE_COLORS[service.name]}
                stats={stats?.byService[service.name]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
