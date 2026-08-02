import { useState } from 'react';
import { BarChart3, Car, RefreshCw, TrendingUp, Clock, Database } from 'lucide-react';
import { useStats } from '@/lib/use-stats';
import { supabase, type VehicleType, type VehicleCondition, type VehicleStatus, type VehicleServiceType } from '@/lib/supabase';
import { generateSeedData, seedData } from '@/lib/seed-generator';

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

export default function PaceStats({ refreshTrigger }: PaceStatsProps) {
  const { stats, loading, error, refetch } = useStats(refreshTrigger);
  const [seeding, setSeeding] = useState(false);

  const maxAvg = stats
    ? Math.max(...TYPES.map((t) => stats.byType[t].avgSeconds), 1)
    : 1;

  const lastUpdatedLabel = stats
    ? new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  async function handleSeedData() {
    setSeeding(true);
    await seedData(refetch);
    setSeeding(false);
  }

  return (
    <aside className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Statistics</h2>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 rounded-sm"
          aria-label="Refresh stats"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {error && (
          <div className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2 rounded-sm">
            Failed to load stats.
          </div>
        )}

        {/* Total processed */}
        <div className="border border-border bg-background p-4 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Total Processed</p>
          </div>
          {loading && !stats ? (
            <div className="w-12 h-10 bg-muted animate-pulse rounded-sm" />
          ) : (
            <p className="text-5xl font-black text-foreground tabular-nums">{stats?.totalProcessed ?? 0}</p>
          )}
          <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest">Completed vehicles</p>
        </div>

        {/* Avg time by type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Avg Time by Type</p>
          </div>

          <div className="space-y-5">
            {TYPES.map((type) => {
              const cfg = TYPE_CONFIG[type];
              const typeStats = stats?.byType[type];
              const barWidth =
                typeStats && typeStats.avgSeconds > 0
                  ? Math.round((typeStats.avgSeconds / maxAvg) * 100)
                  : 0;

              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider rounded-sm ${cfg.badgeClass}`}>
                        {type}
                      </span>
                      {typeStats && typeStats.count > 0 && (
                        <span className="text-muted-foreground text-xs">{typeStats.count} car{typeStats.count !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3 h-3 ${cfg.valueClass} opacity-60`} />
                      {loading && !stats ? (
                        <span className="inline-block w-14 h-4 bg-muted animate-pulse rounded-sm" />
                      ) : (
                        <span className={`text-sm font-black tabular-nums ${cfg.valueClass}`}>
                          {typeStats?.avgFormatted ?? '--'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1 bg-muted overflow-hidden rounded-sm">
                    <div
                      className={`h-full transition-all duration-700 ${cfg.barClass}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seed Data Button */}
        <div className="border-t border-border pt-4">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-foreground text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest py-3 transition-colors rounded-md"
          >
            <Database className="w-3.5 h-3.5" />
            {seeding ? 'Seeding...' : 'Seed 20 Demo Cars'}
          </button>
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
