import { Car, RefreshCw } from 'lucide-react';
import { formatDuration } from '@/lib/supabase';

interface TotalProcessedCardProps {
  total: number;
  loading: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
}

export default function TotalProcessedCard({ total, loading, lastUpdated, onRefresh }: TotalProcessedCardProps) {
  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <Car className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Total Processed</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 rounded-sm"
          aria-label="Refresh stats"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5">
        {loading && total === 0 ? (
          <div className="w-12 h-10 bg-muted animate-pulse rounded-sm" />
        ) : (
          <p className="text-5xl font-black text-foreground tabular-nums">{total}</p>
        )}
        <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest">Completed vehicles</p>
        {lastUpdatedLabel && (
          <p className="text-muted-foreground text-xs mt-3 uppercase tracking-widest">
            Updated {lastUpdatedLabel}
          </p>
        )}
      </div>
    </div>
  );
}
