import { useEffect, useState } from 'react';
import {
  BarChart3,
  Car,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
} from 'lucide-react';
import { useStats } from '@/lib/use-stats';
import { SERVICE_TYPES } from '@/lib/service-types';
import { type VehicleType, type VehicleServiceType } from '@/lib/supabase';

interface PaceStatsProps {
  refreshTrigger: number;
}

const TYPE_CONFIG: Record<VehicleType, { valueClass: string; barClass: string; badgeClass: string }> = {
  New: {
    valueClass: 'text-emerald-600 dark:text-emerald-400',
    barClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
  },
  Used: {
    valueClass: 'text-muted-foreground',
    barClass: 'bg-muted-foreground/40',
    badgeClass: 'bg-muted border-border text-muted-foreground',
  },
  Demo: {
    valueClass: 'text-sky-600 dark:text-sky-400',
    barClass: 'bg-sky-500',
    badgeClass: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-400',
  },
};

const TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const SERVICE_TYPE_COLORS: Record<VehicleServiceType, string> = {
  'Full Detail': 'bg-emerald-500',
  'Ceramic Coating': 'bg-sky-500',
  'Quick Detail': 'bg-amber-500',
  'Delivery Prep': 'bg-rose-500',
};

function formatSecondsToClock(sec?: number | null) {
  if (sec == null || isNaN(sec)) return '--';
  const s = Math.round(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function PaceStats({ refreshTrigger }: PaceStatsProps) {
  const { stats, loading, error, refetch } = useStats(refreshTrigger);
  const [editableGoals, setEditableGoals] = useState<Record<string, number>>({});

  // load saved goals from localStorage so they can be edited by the user
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pace:goals');
      if (raw) setEditableGoals(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pace:goals', JSON.stringify(editableGoals));
    } catch (e) {
      // ignore
    }
  }, [editableGoals]);

  const maxAvg = stats ? Math.max(...TYPES.map((t) => stats.byType[t].avgSeconds || 1), 1) : 1;

  const lastUpdatedLabel = stats
    ? new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Helper: compute estimated time to process N more vehicles for a given type
  function estimateFor(type: VehicleType, count = 10) {
    const t = stats?.byType[type];
    if (!t || !t.avgSeconds) return null;
    return t.avgSeconds * count;
  }

  function onGoalChange(type: VehicleType, minutesStr: string) {
    const val = parseInt(minutesStr || '0', 10);
    setEditableGoals((s) => ({ ...s, [type]: Number.isNaN(val) ? 0 : val }));
  }

  return (
    <aside className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Statistics</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 rounded-sm"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2 rounded-sm mb-4">
            Failed to load stats.
          </div>
        )}

        {/* Grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total processed */}
          <div className="border border-border bg-background p-4 rounded-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Total Processed</p>
              </div>
              {loading && !stats ? (
                <div className="w-12 h-10 bg-muted animate-pulse rounded-sm" />
              ) : (
                <p className="text-4xl font-extrabold text-foreground tabular-nums">{stats?.totalProcessed ?? 0}</p>
              )}
            </div>
            <p className="text-muted-foreground text-xs mt-3 uppercase tracking-widest">Completed vehicles</p>
          </div>

          {/* Goals & Estimates */}
          <div className="border border-border bg-background p-4 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Goals & Estimates</p>
            </div>

            <div className="space-y-3">
              {TYPES.map((type) => {
                const t = stats?.byType[type];
                const est10 = estimateFor(type, 10);
                const goalMinutes = editableGoals[type] ?? Math.max(1, Math.round((t?.avgSeconds ?? 60) / 60));
                const cfg = TYPE_CONFIG[type];

                return (
                  <div key={type} className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${cfg.badgeClass}`}>{type}</span>
                        <span className="text-muted-foreground text-xs">{t?.count ?? 0} processed</span>
                      </div>
                      <div className="text-sm font-medium">
                        Est. 10: {est10 ? formatSecondsToClock(est10) : '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg: {t ? formatSecondsToClock(t.avgSeconds) : '--'}</div>
                    </div>
                    <div className="w-36 flex-none text-right">
                      <label className="text-xs text-muted-foreground block mb-1">Goal (min)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full text-right rounded-sm border px-2 py-1 text-sm"
                        value={String(goalMinutes)}
                        onChange={(e) => onGoalChange(type, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avg time by type - split into separate mini-charts */}
          <div className="col-span-1 md:col-span-2 border border-border bg-background p-4 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Average Time by Type</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TYPES.map((type) => {
                const cfg = TYPE_CONFIG[type];
                const typeStats = stats?.byType[type];
                const barWidth = typeStats && typeStats.avgSeconds > 0 ? Math.round((typeStats.avgSeconds / maxAvg) * 100) : 0;
                const prev = typeStats?.avgSeconds ?? null;
                const trendUp = prev == null ? null : typeStats!.avgSeconds < prev;

                return (
                  <div key={type} className="border border-border p-3 rounded-md bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-sm ${cfg.badgeClass}`}>{type}</div>
                        <div className="text-xs text-muted-foreground">{typeStats?.count ?? 0} vehicles</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {trendUp === null ? null : trendUp ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <div className={`text-sm font-extrabold tabular-nums ${cfg.valueClass}`}>{typeStats ? formatSecondsToClock(typeStats.avgSeconds) : '--'}</div>
                      </div>
                    </div>

                    <div className="h-2 bg-muted rounded-sm overflow-hidden mb-2">
                      <div className={`${cfg.barClass} h-full`} style={{ width: `${barWidth}%` }} />
                    </div>

                    <div className="text-xs text-muted-foreground">Relative: {barWidth}% of slowest</div>
                  </div>
                );
              })}
            </div>
            </div>

            <div className="mt-4 border border-border bg-background p-4 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Service Type Performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {SERVICE_TYPES.map((service) => {
                const serviceStats = stats?.byService?.[service.name];
                const maxServiceAvg = stats
                  ? Math.max(...Object.values(stats.byService ?? {}).map((entry) => entry.avgSeconds || 0), 1)
                  : 1;
                const barWidth = serviceStats && serviceStats.avgSeconds > 0 ? Math.round((serviceStats.avgSeconds / maxServiceAvg) * 100) : 0;

                return (
                  <div key={service.name} className="border border-border p-3 rounded-md bg-card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${service.tag}`}>
                          {service.name}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{serviceStats?.count ?? 0} vehicles</div>
                      </div>
                      <div className="text-sm font-extrabold tabular-nums text-foreground">
                        {serviceStats ? formatSecondsToClock(serviceStats.avgSeconds) : '--'}
                      </div>
                    </div>

                    <div className="h-2 bg-muted rounded-sm overflow-hidden mb-2">
                      <div className={`${SERVICE_TYPE_COLORS[service.name]} h-full`} style={{ width: `${barWidth}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                      {TYPES.map((type) => {
                        const typeShare = serviceStats?.byVehicleType?.[type];
                        if (!typeShare || typeShare.count === 0) return null;

                        return (
                          <span key={`${service.name}-${type}`} className="rounded-sm border border-border bg-background px-1.5 py-0.5">
                            {type}: {typeShare.count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

        {/* Last updated */}
        {lastUpdatedLabel && (
          <p className="text-muted-foreground text-xs text-center border-t border-border pt-4 uppercase tracking-widest">
            Updated {lastUpdatedLabel}
          </p>
        )}
      </div>
    </aside>
  );
}
