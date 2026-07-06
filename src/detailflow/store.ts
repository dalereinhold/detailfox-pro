import { create } from 'zustand';

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface RoutineStep {
  id: string;
  label: string;
  estimateSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: RoutineStep[];
}

export interface SessionStep {
  id: string;
  label: string;
  estimateSeconds: number;
  status: StepStatus;
  elapsedMs: number;
  startedAt: number | null;
}

export type SessionPhase = 'select' | 'active';

interface DetailFlowState {
  phase: SessionPhase;
  activeRoutineId: string | null;
  steps: SessionStep[];
  cursor: number;

  selectRoutine: (routine: Routine) => void;
  startStep: (index: number) => void;
  pauseStep: (index: number) => void;
  resumeStep: (index: number) => void;
  finishStep: (index: number) => void;
  skipStep: (index: number) => void;
  tick: (index: number, deltaMs: number) => void;
  reset: () => void;
}

export const ROUTINES: Routine[] = [
  {
    id: 'full-wash',
    name: 'Full Wash',
    description: 'Exterior wash, decontaminate, and dry',
    steps: [
      { id: 'fw1', label: 'Pre-rinse', estimateSeconds: 180 },
      { id: 'fw2', label: 'Snow foam contact wash', estimateSeconds: 420 },
      { id: 'fw3', label: 'Wheel & tire cleaning', estimateSeconds: 600 },
      { id: 'fw4', label: 'Decontamination (clay)', estimateSeconds: 900 },
      { id: 'fw5', label: 'Final rinse & dry', estimateSeconds: 360 },
    ],
  },
  {
    id: 'interior-detail',
    name: 'Interior Detail',
    description: 'Vacuum, surfaces, and leather care',
    steps: [
      { id: 'id1', label: 'Vacuum carpets & seats', estimateSeconds: 900 },
      { id: 'id2', label: 'Dashboard & console wipe-down', estimateSeconds: 600 },
      { id: 'id3', label: 'Leather conditioning', estimateSeconds: 720 },
      { id: 'id4', label: 'Glass cleaning', estimateSeconds: 360 },
      { id: 'id5', label: 'Final inspection', estimateSeconds: 240 },
    ],
  },
  {
    id: 'ceramic-coating',
    name: 'Ceramic Coating',
    description: 'Paint prep and coating application',
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
    steps: [
      { id: 'qd1', label: 'Exterior waterless wash', estimateSeconds: 480 },
      { id: 'qd2', label: 'Tire shine', estimateSeconds: 180 },
      { id: 'qd3', label: 'Interior wipe & vacuum', estimateSeconds: 420 },
    ],
  },
];

function buildSteps(routine: Routine): SessionStep[] {
  return routine.steps.map((s) => ({
    id: s.id,
    label: s.label,
    estimateSeconds: s.estimateSeconds,
    status: 'pending',
    elapsedMs: 0,
    startedAt: null,
  }));
}

export const useDetailFlowStore = create<DetailFlowState>((set) => ({
  phase: 'select',
  activeRoutineId: null,
  steps: [],
  cursor: 0,

  selectRoutine: (routine) =>
    set({
      phase: 'active',
      activeRoutineId: routine.id,
      steps: buildSteps(routine),
      cursor: 0,
    }),

  startStep: (index) =>
    set((state) => {
      const steps = state.steps.map((s, i) =>
        i === index ? { ...s, status: 'active' as StepStatus, startedAt: Date.now() } : s,
      );
      return { steps, cursor: index };
    }),

  pauseStep: (index) =>
    set((state) => ({
      steps: state.steps.map((s, i) => {
        if (i !== index || s.startedAt === null) return s;
        const delta = Date.now() - s.startedAt;
        return { ...s, status: 'pending' as StepStatus, elapsedMs: s.elapsedMs + delta, startedAt: null };
      }),
    })),

  resumeStep: (index) =>
    set((state) => ({
      steps: state.steps.map((s, i) =>
        i === index ? { ...s, status: 'active' as StepStatus, startedAt: Date.now() } : s,
      ),
    })),

  finishStep: (index) =>
    set((state) => {
      const steps = state.steps.map((s, i) => {
        if (i !== index) return s;
        let elapsed = s.elapsedMs;
        if (s.startedAt !== null) elapsed += Date.now() - s.startedAt;
        return { ...s, status: 'completed' as StepStatus, elapsedMs: elapsed, startedAt: null };
      });
      const nextPending = steps.findIndex((s) => s.status === 'pending');
      return { steps, cursor: nextPending === -1 ? index : nextPending };
    }),

  skipStep: (index) =>
    set((state) => {
      const steps = state.steps.map((s, i) =>
        i === index ? { ...s, status: 'skipped' as StepStatus, startedAt: null } : s,
      );
      const nextPending = steps.findIndex((s) => s.status === 'pending');
      return { steps, cursor: nextPending === -1 ? index : nextPending };
    }),

  tick: (index, deltaMs) =>
    set((state) => ({
      steps: state.steps.map((s, i) =>
        i === index && s.startedAt !== null ? { ...s, elapsedMs: s.elapsedMs + deltaMs } : s,
      ),
    })),

  reset: () => set({ phase: 'select', activeRoutineId: null, steps: [], cursor: 0 }),
}));
