import { useEffect, useState } from "react";
import {
  supabase,
  type Vehicle,
  type VehicleType,
  type VehicleServiceType,
} from "@/lib/supabase";
import { formatDuration } from "@/lib/pace-pro/vehicle";
import { VEHICLE_TYPES } from "@/lib/pace-pro/intake";
import { SERVICE_TYPES } from "@/lib/pace-pro/services";

/** Actual vs. estimated timing stats for a group of completed vehicles. */
export interface TypeStats {
  count: number;
  avgSeconds: number;
  avgFormatted: string;
  /** Average estimated seconds for the group, based on each vehicle's
   * assigned service type. */
  estimatedSeconds: number;
}

export interface Stats {
  /** Total vehicles ever recorded, regardless of status. */
  totalInDb: number;
  /** Vehicles with status "Completed". */
  totalProcessed: number;
  /** Vehicle counts by type, regardless of status. */
  totalByType: Record<VehicleType, number>;
  byType: Record<VehicleType, TypeStats>;
  byService: Record<VehicleServiceType, TypeStats>;
  /** Average time stats broken down by vehicle type, then service type. */
  byTypeAndService: Record<VehicleType, Record<VehicleServiceType, TypeStats>>;
  lastUpdated: number;
}

const STORAGE_KEY = "detailtrack_stats_cache";
/** Bump whenever the `Stats` shape changes, to invalidate stale caches. */
const CACHE_VERSION = 3;

interface CacheEnvelope {
  version: number;
  stats: Stats;
}
const SERVICE_TYPE_NAMES: VehicleServiceType[] = SERVICE_TYPES.map(
  (s) => s.name,
);
const ESTIMATED_SECONDS_BY_SERVICE: Record<VehicleServiceType, number> =
  Object.fromEntries(
    SERVICE_TYPES.map((s) => [s.name, s.estimatedSeconds]),
  ) as Record<VehicleServiceType, number>;

function average(seconds: number[]): number {
  if (seconds.length === 0) return 0;
  return Math.round(seconds.reduce((sum, s) => sum + s, 0) / seconds.length);
}

function toTypeStats(group: Vehicle[]): TypeStats {
  const avgSeconds = average(group.map((v) => v.net_work_seconds));
  const estimatedSeconds = average(
    group.map((v) => ESTIMATED_SECONDS_BY_SERVICE[v.service_type] ?? 0),
  );
  return {
    count: group.length,
    avgSeconds,
    avgFormatted: group.length > 0 ? formatDuration(avgSeconds) : "--",
    estimatedSeconds,
  };
}

function computeStats(allVehicles: Vehicle[]): Stats {
  const completed = allVehicles.filter((v) => v.status === "Completed");

  const totalByType = {} as Record<VehicleType, number>;
  const byType = {} as Record<VehicleType, TypeStats>;
  for (const type of VEHICLE_TYPES) {
    totalByType[type] = allVehicles.filter((v) => v.type === type).length;
    byType[type] = toTypeStats(completed.filter((v) => v.type === type));
  }

  const byService = {} as Record<VehicleServiceType, TypeStats>;
  for (const serviceType of SERVICE_TYPE_NAMES) {
    byService[serviceType] = toTypeStats(
      completed.filter((v) => v.service_type === serviceType),
    );
  }

  const byTypeAndService = {} as Record<
    VehicleType,
    Record<VehicleServiceType, TypeStats>
  >;
  for (const type of VEHICLE_TYPES) {
    const typeGroup = completed.filter((v) => v.type === type);
    const perService = {} as Record<VehicleServiceType, TypeStats>;
    for (const serviceType of SERVICE_TYPE_NAMES) {
      perService[serviceType] = toTypeStats(
        typeGroup.filter((v) => v.service_type === serviceType),
      );
    }
    byTypeAndService[type] = perService;
  }

  return {
    totalInDb: allVehicles.length,
    totalProcessed: completed.length,
    totalByType,
    byType,
    byService,
    byTypeAndService,
    lastUpdated: Date.now(),
  };
}

function isValidStats(value: unknown): value is Stats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Partial<Stats>;
  return (
    typeof stats.totalInDb === "number" &&
    typeof stats.totalProcessed === "number" &&
    typeof stats.totalByType === "object" &&
    stats.totalByType !== null &&
    VEHICLE_TYPES.every((t) => typeof stats.totalByType![t] === "number") &&
    typeof stats.byTypeAndService === "object" &&
    stats.byTypeAndService !== null &&
    VEHICLE_TYPES.every((t) => typeof stats.byTypeAndService![t] === "object")
  );
}

function loadCache(): Stats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheEnvelope>;
    if (parsed.version !== CACHE_VERSION || !isValidStats(parsed.stats)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.stats;
  } catch {
    return null;
  }
}

function saveCache(stats: Stats) {
  try {
    const envelope: CacheEnvelope = { version: CACHE_VERSION, stats };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
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
      .from("vehicles")
      .select("status, type, net_work_seconds, service_type");

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
