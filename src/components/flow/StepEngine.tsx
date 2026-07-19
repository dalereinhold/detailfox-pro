import { useEffect, useRef, useState } from 'react';
import {
  Check,
  SkipForward,
  Pause,
  Play,
  RotateCcw,
  Flag,
  Clock,
  Timer,
  Hourglass,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { useDetailFlowStore, SessionStep } from '@/components/flow/store';
import { formatTimer, formatDuration } from '@/components/flow/format';

type StepState = 'pending' | 'active' | 'paused' | 'completed' | 'skipped';

const STATUS_BADGE: Record<StepState, string> = {
  pending: 'text-foreground-tertiary bg-background-elevated border-border-default',
  active: 'text-brand-primary bg-background-elevated border-border-default',
  paused: 'text-brand-warning bg-background-elevated border-border-default',
  completed: 'text-brand-success bg-background-elevated border-border-default',
  skipped: 'text-foreground-tertiary bg-background-elevated border-border-default line-through',
};

const STATUS_BORDER: Record<StepState, string> = {
  pending: 'border-l-border-subtle',
  active: 'border-l-brand-primary',
  paused: 'border-l-brand-warning',
  completed: 'border-l-brand-success',
  skipped: 'border-l-border-default',
};

const STATUS_LABEL: Record<StepState, string> = {
  pending: 'Pending',
  active: 'In Progress',
  paused: 'On Break',
  completed: 'Done',
  skipped: 'Skipped',
};

function stepState(step: SessionStep): StepState {
  if (step.status === 'completed') return 'completed';
  if (step.status === 'skipped') return 'skipped';
  if (step.status === 'active') return 'active';
  if (step.elapsedMs > 0) return 'paused';
  return 'pending';
}

export default function StepEngine() {
  const { steps, cursor, pauseStep, resumeStep, startStep, finishStep, skipStep, reset } =
    useDetailFlowStore();
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const [liveMs, setLiveMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === -1) {
      setLiveMs(0);
      lastTickRef.current = null;
      return;
    }
    if (lastTickRef.current === null) lastTickRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const delta = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;
      setLiveMs((prev) => prev + delta);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, [activeIndex]);

  const current = steps[cursor];
  const currentElapsed =
    current?.status === 'active' ? current.elapsedMs + liveMs : current?.elapsedMs ?? 0;
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const allDone = steps.length > 0 && steps.every((s) => s.status === 'completed' || s.status === 'skipped');

  const counts = {
    Total: steps.length,
    Pending: steps.filter((s) => stepState(s) === 'pending').length,
    'In Progress': steps.filter((s) => stepState(s) === 'active').length,
    'On Break': steps.filter((s) => stepState(s) === 'paused').length,
    Done: steps.filter((s) => s.status === 'completed').length,
  };

  return (
    <section>
      {/* Header — matches "All Records" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground-primary">Active Session</h2>
          <p className="text-foreground-secondary text-xs mt-1">
            {steps.length} step{steps.length !== 1 ? 's' : ''} in routine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-brand-danger hover:text-red-600 text-xs font-semibold uppercase tracking-widest border border-border-default hover:border-brand-danger px-4 py-2.5 transition-colors bg-background-surface"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>
      </div>

      {/* Summary stats — gap-px grid like Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border-default border border-border-default mb-6">
        <StatPill label="Total" count={counts.Total} valueClass="text-foreground-primary" icon={<Timer className="w-3 h-3 text-foreground-tertiary" />} />
        <StatPill label="Pending" count={counts.Pending} valueClass="text-foreground-tertiary" icon={<Hourglass className="w-3 h-3 text-foreground-tertiary" />} />
        <StatPill label="In Progress" count={counts['In Progress']} valueClass="text-brand-primary" icon={<Clock className="w-3 h-3 text-foreground-tertiary" />} />
        <StatPill label="On Break" count={counts['On Break']} valueClass="text-brand-warning" icon={<Coffee className="w-3 h-3 text-foreground-tertiary" />} />
        <StatPill label="Done" count={counts.Done} valueClass="text-brand-success" icon={<CheckCircle2 className="w-3 h-3 text-foreground-tertiary" />} />
      </div>

      {/* Progress overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-foreground-secondary">
            Progress
          </span>
          <span className="text-xs font-bold tabular-nums text-foreground-tertiary">
            {completedCount} / {steps.length} done
          </span>
        </div>
        <ProgressBar value={completedCount} max={steps.length} barClassName="bg-brand-success" />
      </div>

      {/* Active step card — VehicleCard structure */}
      {current && !allDone && (() => {
        const state = stepState(current);
        return (
          <div className={`relative bg-background-surface border border-border-default border-l-4 ${STATUS_BORDER[state]} overflow-hidden mb-6`}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-foreground-secondary text-xs font-semibold uppercase tracking-widest mb-1">
                    Current step
                  </p>
                  <h3 className="text-3xl font-black text-foreground-primary tracking-tight leading-none">
                    {current.label}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[state]}`}>
                  {STATUS_LABEL[state]}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-foreground-secondary bg-background-elevated border-border-default">
                  Est. {formatDuration(current.estimateSeconds * 1000)}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-foreground-secondary bg-background-elevated border-border-default">
                  {Math.round((currentElapsed / (current.estimateSeconds * 1000)) * 100)}% of estimate
                </span>
              </div>

              {/* Timer block — color matches state */}
              <div className={`flex items-center gap-3 border px-4 py-3 mb-4 bg-background-elevated border-border-default`}>
                <Timer className={`w-4 h-4 flex-shrink-0 ${
                  state === 'active' ? 'text-brand-primary' :
                  state === 'paused' ? 'text-brand-warning' :
                  'text-foreground-tertiary'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground-secondary text-xs font-semibold uppercase tracking-widest leading-none mb-0.5">
                    {state === 'active' ? 'Active' : state === 'paused' ? 'Paused' : 'Not Started'}
                  </p>
                  <p className={`text-xl font-black tabular-nums leading-none ${
                    state === 'active' ? 'text-brand-primary' :
                    state === 'paused' ? 'text-brand-warning' :
                    'text-foreground-tertiary'
                  }`}>
                    {formatTimer(currentElapsed)}
                  </p>
                </div>
                {state === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse flex-shrink-0" />
                )}
              </div>

              <div className="mb-4">
                <ProgressBar
                  value={currentElapsed}
                  max={current.estimateSeconds * 1000}
                  barClassName={
                    currentElapsed > current.estimateSeconds * 1000 ? 'bg-brand-danger' :
                    state === 'active' ? 'bg-brand-primary' :
                    state === 'paused' ? 'bg-brand-warning' : 'bg-foreground-tertiary'
                  }
                />
              </div>

              {/* Actions — VehicleCard button styles */}
              <div className="flex flex-wrap gap-2">
                {state === 'pending' && current.elapsedMs === 0 && (
                  <button
                    onClick={() => startStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-background-elevated text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start
                  </button>
                )}
                {state === 'active' && (
                  <button
                    onClick={() => pauseStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-warning hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Break
                  </button>
                )}
                {state === 'paused' && (
                  <button
                    onClick={() => resumeStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-violet-600 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button
                  onClick={() => finishStep(cursor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-success hover:bg-green-600 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Done
                </button>
                <button
                  onClick={() => skipStep(cursor)}
                  className="flex items-center justify-center gap-2 border border-border-default hover:border-foreground-primary text-foreground-tertiary hover:text-foreground-primary font-bold text-sm uppercase tracking-widest py-3 px-4 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Step list — VehicleCard-style rows */}
      <div className="space-y-2">
        {steps.map((step) => {
          const state = stepState(step);
          return (
            <div
              key={step.id}
              className={`relative bg-background-surface border border-border-default border-l-4 ${STATUS_BORDER[state]} overflow-hidden transition-colors`}
            >
              <div className="p-5 flex items-center gap-4">
                <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[state]}`}>
                  {STATUS_LABEL[state]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground-primary truncate">{step.label}</p>
                  <p className="text-xs text-foreground-secondary tabular-nums mt-0.5">
                    {formatDuration(step.elapsedMs)} / {formatDuration(step.estimateSeconds * 1000)}
                  </p>
                </div>
                {state === 'active' && (
                  <Clock className="w-4 h-4 text-brand-primary animate-pulse flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion indicator */}
      {allDone && (
        <div className="mt-8 flex items-center gap-2 bg-background-elevated border border-border-default px-4 py-3">
          <Flag className="w-4 h-4 text-brand-success flex-shrink-0" />
          <p className="text-brand-success font-bold text-sm uppercase tracking-wide">All steps complete</p>
        </div>
      )}
    </section>
  );
}

function StatPill({ label, count, valueClass, icon }: { label: string; count: number; valueClass: string; icon: React.ReactNode }) {
  return (
    <div className="bg-background-surface px-4 py-3">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <p className="text-foreground-secondary text-xs font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-black tabular-nums ${valueClass}`}>{count}</p>
    </div>
  );
}
