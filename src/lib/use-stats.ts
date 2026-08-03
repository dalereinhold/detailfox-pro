import { useEffect, useState } from 'react';
import { supabase, type Vehicle, type VehicleType, type VehicleServiceType, formatDuration } from './supabase';

export interface ServiceTypeStat {
  count: number;
  avgSeconds: number;
  avgFormatted: string;
}

export interface TypeStats {
  count: number;
  avgSeconds: number;
  avgFormatted: string;
  byServiceType: Record<VehicleServiceType, ServiceTypeStat>;
}

export interface Stats {
  totalProcessed: number;
  byType: Record<VehicleType, TypeStats>;
  timeseries: TimeSeriesBucket[];
  lastUpdated: number;
}

export type TimeSeriesGranularity = 'day' | 'week' | 'month';

export interface TimeSeriesBucket {
  label: string;
  date: string;
  count: number;
}

const STORAGE_KEY = 'detailtrack_stats_cache';
const VEHICLE_TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const SERVICE_TYPES: VehicleServiceType[] = ['Full Detail', 'Ceramic Coating', 'Quick Detail', 'Delivery Prep'];

function computeStats(vehicles: Vehicle[]): Stats {
  const completed = vehicles.filter((v) => v.status === 'Completed');

  const byType = {} as Record<VehicleType, TypeStats>;
  for (const type of VEHICLE_TYPES) {
    const typeGroup = completed.filter((v) => v.type === type);

    const byServiceType = {} as Record<VehicleServiceType, ServiceTypeStat>;
    for (const st of SERVICE_TYPES) {
      const stGroup = typeGroup.filter((v) => v.service_type === st);
      const totalSecs = stGroup.reduce((sum, v) => sum + v.net_work_seconds, 0);
      const avgSeconds = stGroup.length > 0 ? Math.round(totalSecs / stGroup.length) : 0;
      byServiceType[st] = {
        count: stGroup.length,
        avgSeconds,
        avgFormatted: stGroup.length > 0 ? formatDuration(avgSeconds) : '--',
      };
    }

    const totalSecs = typeGroup.reduce((sum, v) => sum + v.net_work_seconds, 0);
    const avgSeconds = typeGroup.length > 0 ? Math.round(totalSecs / typeGroup.length) : 0;
    byType[type] = {
      count: typeGroup.length,
      avgSeconds,
      avgFormatted: typeGroup.length > 0 ? formatDuration(avgSeconds) : '--',
      byServiceType,
    };
  }

  const timeseries = buildTimeSeries(completed, 'month', 6);

  return {
    totalProcessed: completed.length,
    byType,
    timeseries,
    lastUpdated: Date.now(),
  };
}

function buildTimeSeries(
  completed: Vehicle[],
  granularity: TimeSeriesGranularity,
  buckets: number,
): TimeSeriesBucket[] {
  const now = new Date();
  const result: TimeSeriesBucket[] = [];

  for (let i = buckets - 1; i >= 0; i--) {
    let start: Date;
    let end: Date;
    let label: string;
    let date: string;

    if (granularity === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      label = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
      date = start.toISOString();
    } else if (granularity === 'week') {
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - i * 7);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      label = `Week of ${start.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      date = start.toISOString();
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      label = start.toLocaleDateString([], { month: 'short', year: 'numeric' });
      date = start.toISOString();
    }

    const count = completed.filter((v) => {
      const completedAt = new Date(v.updated_at);
      return completedAt >= start && completedAt < end;
    }).length;

    result.push({ label, date, count });
  }

  return result;
}

export function getTimeSeries(
  vehicles: Vehicle[],
  granularity: TimeSeriesGranularity,
  buckets: number,
): TimeSeriesBucket[] {
  const completed = vehicles.filter((v) => v.status === 'Completed');
  return buildTimeSeries(completed, granularity, buckets);
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
  const [allCompleted, setAllCompleted] = useState<Vehicle[]>([]);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from('vehicles')
      .select('status, type, net_work_seconds, service_type, updated_at')
      .eq('status', 'Completed');

    if (dbError) {
      setError(dbError.message);
    } else {
      const vehicles = (data ?? []) as Vehicle[];
      setAllCompleted(vehicles);
      const computed = computeStats(vehicles);
      saveCache(computed);
      setStats(computed);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  return { stats, loading, error, refetch: fetchStats, allCompleted };
}
