import { useEffect, useState } from 'react';
import {
  supabase,
  type Vehicle,
  type VehicleType,
  type VehicleServiceType,
  formatDuration,
} from './supabase';

export interface TypeStats {
  count: number;
  avgSeconds: number;
  avgFormatted: string;
}

export interface ServiceTypeStats extends TypeStats {
  byVehicleType: Partial<Record<VehicleType, TypeStats>>;
}

export interface Stats {
  totalProcessed: number;
  byType: Record<VehicleType, TypeStats>;
  byService: Record<VehicleServiceType, ServiceTypeStats>;
  lastUpdated: number;
}

const STORAGE_KEY = 'detailtrack_stats_cache';
const VEHICLE_TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const SERVICE_TYPES: VehicleServiceType[] = [
  'Full Detail',
  'Ceramic Coating',
  'Quick Detail',
  'Delivery Prep',
];

function computeStats(vehicles: Vehicle[]): Stats {
  const completed = vehicles.filter((v) => v.status === 'Completed');

  const byType = {} as Record<VehicleType, TypeStats>;
  for (const type of VEHICLE_TYPES) {
    const group = completed.filter((v) => v.type === type);
    const totalSecs = group.reduce((sum, v) => sum + v.net_work_seconds, 0);
    const avgSeconds = group.length > 0 ? Math.round(totalSecs / group.length) : 0;
    byType[type] = {
      count: group.length,
      avgSeconds,
      avgFormatted: group.length > 0 ? formatDuration(avgSeconds) : '--',
    };
  }

  const byService = {} as Record<VehicleServiceType, ServiceTypeStats>;
  for (const serviceType of SERVICE_TYPES) {
    const group = completed.filter((v) => v.service_type === serviceType);
    const totalSecs = group.reduce((sum, v) => sum + v.net_work_seconds, 0);
    const avgSeconds = group.length > 0 ? Math.round(totalSecs / group.length) : 0;

    const byVehicleType = {} as Partial<Record<VehicleType, TypeStats>>;
    for (const type of VEHICLE_TYPES) {
      const typeGroup = group.filter((v) => v.type === type);
      const typeTotalSecs = typeGroup.reduce((sum, v) => sum + v.net_work_seconds, 0);
      const typeAvgSeconds = typeGroup.length > 0 ? Math.round(typeTotalSecs / typeGroup.length) : 0;
      byVehicleType[type] = {
        count: typeGroup.length,
        avgSeconds: typeAvgSeconds,
        avgFormatted: typeGroup.length > 0 ? formatDuration(typeAvgSeconds) : '--',
      };
    }

    byService[serviceType] = {
      count: group.length,
      avgSeconds,
      avgFormatted: group.length > 0 ? formatDuration(avgSeconds) : '--',
      byVehicleType,
    };
  }

  return {
    totalProcessed: completed.length,
    byType,
    byService,
    lastUpdated: Date.now(),
  };
}

function loadCache(): Stats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stats;
  } catch {
    return null;
  }
}

function saveCache(stats: Stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // storage quota — silently ignore
  }
}

export function useStats(refreshTrigger: number) {
  const [stats, setStats] = useState<Stats | null>(() => loadCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from('vehicles')
      .select('status, type, net_work_seconds, service_type')
      .eq('status', 'Completed');

    if (dbError) {
      setError(dbError.message);
    } else {
      const computed = computeStats((data ?? []) as Vehicle[]);
      saveCache(computed);
      setStats(computed);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  return { stats, loading, error, refetch: fetchStats };
}
