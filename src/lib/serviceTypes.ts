import { VehicleServiceType } from './supabase';

export interface RoutineStep {
  id: string;
  label: string;
  estimateSeconds: number;
}

export interface ServiceTypeDefinition {
  id: string;
  name: VehicleServiceType;
  description: string;
  accent: string;
  tag: string;
  steps: RoutineStep[];
}

export const SERVICE_TYPES: ServiceTypeDefinition[] = [
  {
    id: 'full-detail',
    name: 'Full Detail',
    description: 'Complete exterior and interior detail',
    accent: 'border-l-sky-500',
    tag: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950 dark:border-sky-800',
    steps: [
      { id: 'fd1', label: 'Pre-rinse', estimateSeconds: 180 },
      { id: 'fd2', label: 'Snow foam contact wash', estimateSeconds: 420 },
      { id: 'fd3', label: 'Wheel & tire cleaning', estimateSeconds: 600 },
      { id: 'fd4', label: 'Decontamination (clay)', estimateSeconds: 900 },
      { id: 'fd5', label: 'Final rinse & dry', estimateSeconds: 360 },
      { id: 'fd6', label: 'Vacuum carpets & seats', estimateSeconds: 900 },
      { id: 'fd7', label: 'Dashboard & console wipe-down', estimateSeconds: 600 },
      { id: 'fd8', label: 'Glass cleaning', estimateSeconds: 360 },
      { id: 'fd9', label: 'Final inspection', estimateSeconds: 240 },
    ],
  },
  {
    id: 'ceramic-coating',
    name: 'Ceramic Coating',
    description: 'Paint prep and coating application',
    accent: 'border-l-emerald-500',
    tag: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
    steps: [
      { id: 'cc1', label: 'Paint correction', estimateSeconds: 3600 },
      { id: 'cc2', label: 'Panel wipe down', estimateSeconds: 900 },
      { id: 'cc3', label: 'Coating application (layer 1)', estimateSeconds: 1800 },
      { id: 'cc4', label: 'Flash time', estimateSeconds: 600 },
      { id: 'cc5', label: 'Coating application (layer 2)', estimateSeconds: 1800 },
      { id: 'cc6', label: 'Cure period', estimateSeconds: 1200 },
    ],
  },
  {
    id: 'quick-detail',
    name: 'Quick Detail',
    description: 'Express refresh for show-floor delivery',
    accent: 'border-l-amber-400',
    tag: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800',
    steps: [
      { id: 'qd1', label: 'Exterior waterless wash', estimateSeconds: 480 },
      { id: 'qd2', label: 'Tire shine', estimateSeconds: 180 },
      { id: 'qd3', label: 'Interior wipe & vacuum', estimateSeconds: 420 },
    ],
  },
  {
    id: 'delivery-prep',
    name: 'Delivery Prep',
    description: 'Final preparation before customer delivery',
    accent: 'border-l-rose-500',
    tag: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950 dark:border-rose-800',
    steps: [
      { id: 'dp1', label: 'Exterior rinse & dry', estimateSeconds: 300 },
      { id: 'dp2', label: 'Tire & wheel dressing', estimateSeconds: 240 },
      { id: 'dp3', label: 'Interior vacuum', estimateSeconds: 480 },
      { id: 'dp4', label: 'Glass cleaning', estimateSeconds: 360 },
      { id: 'dp5', label: 'Final walk-around inspection', estimateSeconds: 300 },
    ],
  },
];

export const SERVICE_TYPE_COLORS: Record<string, string> = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.name, s.tag]),
);

export function getServiceType(id: string): ServiceTypeDefinition | undefined {
  return SERVICE_TYPES.find((s) => s.id === id);
}
