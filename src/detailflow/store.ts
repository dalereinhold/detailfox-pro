import { create } from 'zustand';
import { SERVICE_TYPES, RoutineStep } from '@/lib/serviceTypes';

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';

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

export const ROUTINES: Routine[] = SERVICE_TYPES.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  steps: s.steps,
}));

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
