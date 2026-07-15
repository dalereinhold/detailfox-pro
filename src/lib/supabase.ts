import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Provide a safe mock client when env vars are missing to avoid a hard crash in the browser
let _supabase: any;
if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Dev fallback: warn and return a minimal stub that won't crash imports.
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — using mock supabase client.');

  const makeBuilder = () => {
    const b: any = {
      // Methods used by the app — return harmless defaults or error objects where appropriate.
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      order: function () { return this; },
      eq: function () { return this; },
      neq: function () { return this; },
      limit: function () { return this; },
    };
    return b;
  };

  _supabase = {
    from: (_table: string) => makeBuilder(),
  };
}

export const supabase = _supabase as any;

export type VehicleStatus = 'In Progress' | 'On Break' | 'Completed';
export type VehicleType = 'New' | 'Used' | 'Demo';
export type VehicleCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type VehicleServiceType = 'Full Detail' | 'Ceramic Coating' | 'Quick Detail' | 'Delivery Prep';

export interface Vehicle {
  id: string;
  license_plate: string;
  type: VehicleType;
  condition: VehicleCondition;
  service_type: VehicleServiceType;
  status: VehicleStatus;
  notes: string | null;
  started_at: string | null;
  break_started_at: string | null;
  net_work_seconds: number;
  created_at: string;
  updated_at: string;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}