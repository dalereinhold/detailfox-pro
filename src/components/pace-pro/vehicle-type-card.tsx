import { Clock } from 'lucide-react';
import type { VehicleType, VehicleServiceType } from '@/lib/supabase';
import type { TypeStats, ServiceTypeStat } from '@/lib/use-stats';
import { SERVICE_TYPES } from '@/lib/service-types';

interface VehicleTypeCardProps {
  type: VehicleType;
  stats: TypeStats | undefined;
  loading: boolean;
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

export default function VehicleTypeCard({ type, stats, loading }: VehicleTypeCardProps) {
  const cfg = TYPE_CONFIG[type];

  const maxAvg = stats
    ? Math.max(
        ...SERVICE_TYPES.map((s) => stats.byServiceType[s.name as VehicleServiceType]?.avgSeconds ?? 0),
        1,
      )
    : 1;

  return (
    <div className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider rounded-sm ${cfg.badgeClass}`}>
            {type}
          </span>
          {stats && stats.count > 0 && (
            <span className="text-muted-foreground text-xs">
              {stats.count} car{stats.count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {stats && stats.count > 0 && (
          <div className="flex items-center gap-1">
            <Clock className={`w-3 h-3 ${cfg.valueClass} opacity-60`} />
            <span className={`text-sm font-black tabular-nums ${cfg.valueClass}`}>
              {stats.avgFormatted}
            </span>
          </div>
        )}
      </div>

      {/* Body — per service type */}
      <div className="p-5 space-y-4 flex-1">
        {SERVICE_TYPES.map((st) => {
          const serviceStat: ServiceTypeStat | undefined = stats?.byServiceType[st.name as VehicleServiceType];
          const hasData = serviceStat && serviceStat.count > 0;
          const barWidth =
            hasData && serviceStat.avgSeconds > 0
              ? Math.round((serviceStat.avgSeconds / maxAvg) * 100)
              : 0;

          return (
            <div key={st.id} className={hasData ? '' : 'opacity-40'}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">{st.name}</span>
                <div className="flex items-center gap-1.5">
                  {hasData && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {serviceStat.count}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className={`w-3 h-3 ${cfg.valueClass} opacity-60`} />
                    {loading && !stats ? (
                      <span className="inline-block w-14 h-4 bg-muted animate-pulse rounded-sm" />
                    ) : (
                      <span className={`text-sm font-black tabular-nums ${cfg.valueClass}`}>
                        {serviceStat?.avgFormatted ?? '--'}
                      </span>
                    )}
                  </div>
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
  );
}
