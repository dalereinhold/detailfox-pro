import { createFileRoute } from "@tanstack/react-router"
import { useState } from 'react';
import { Database } from 'lucide-react';

import TotalProcessedCard from '@/components/pace-pro/total-processed-card';
import VehicleTypeCard from '@/components/pace-pro/vehicle-type-card';
import ThroughputChart from '@/components/pace-pro/throughput-chart';
import { useStats } from '@/lib/use-stats';
import { type VehicleType } from '@/lib/supabase';
import { seedData } from '@/lib/seed-generator';

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

const TYPES: VehicleType[] = ['New', 'Used', 'Demo'];

function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { stats, loading, error, refetch, allCompleted } = useStats(refreshTrigger);
  const [seeding, setSeeding] = useState(false);

  async function handleSeedData() {
    setSeeding(true);
    await seedData(refetch);
    setSeeding(false);
  }

  function handleRefresh() {
    refetch();
    setRefreshTrigger((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2 rounded-sm">
          Failed to load stats.
        </div>
      )}

      {/* Top row: Total Processed + vehicle type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TotalProcessedCard
          total={stats?.totalProcessed ?? 0}
          loading={loading}
          lastUpdated={stats?.lastUpdated ?? null}
          onRefresh={handleRefresh}
        />

        {TYPES.map((type) => (
          <VehicleTypeCard
            key={type}
            type={type}
            stats={stats?.byType[type]}
            loading={loading}
          />
        ))}
      </div>

      {/* Full-width throughput chart */}
      <ThroughputChart vehicles={allCompleted} loading={loading} />

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
    </div>
  );
}
