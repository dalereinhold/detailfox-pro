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
import { useDetailFlowStore, SessionStep } from '@/detailflow/store';
import { formatTimer, formatDuration } from '@/detailflow/format';

type StepState = 'pending' | 'active' | 'paused' | 'completed' | 'skipped';

const STATUS_BADGE: Record<StepState, string> = {
  pending: 'text-zinc-500 bg-zinc-100 border-zinc-300',
  active: 'text-sky-700 bg-sky-50 border-sky-200',
  paused: 'text-amber-700 bg-amber-50 border-amber-200',
  completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  skipped: 'text-zinc-400 bg-zinc-50 border-zinc-200 line-through',
};

const STATUS_BORDER: Record<StepState, string> = {
  pending: 'border-l-zinc-300',
  active: 'border-l-sky-500',
  paused: 'border-l-amber-400',
  completed: 'border-l-emerald-500',
  skipped: 'border-l-zinc-200',
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">Active Session</h2>
          <p className="text-zinc-400 text-xs mt-1">
            {steps.length} step{steps.length !== 1 ? 's' : ''} in routine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-widest border border-zinc-200 hover:border-red-300 px-4 py-2.5 transition-colors bg-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>
      </div>

      {/* Summary stats — gap-px grid like Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-zinc-200 border border-zinc-200 mb-6">
        <StatPill label="Total" count={counts.Total} valueClass="text-black" icon={<Timer className="w-3 h-3 text-zinc-400" />} />
        <StatPill label="Pending" count={counts.Pending} valueClass="text-zinc-500" icon={<Hourglass className="w-3 h-3 text-zinc-400" />} />
        <StatPill label="In Progress" count={counts['In Progress']} valueClass="text-sky-600" icon={<Clock className="w-3 h-3 text-zinc-400" />} />
        <StatPill label="On Break" count={counts['On Break']} valueClass="text-amber-500" icon={<Coffee className="w-3 h-3 text-zinc-400" />} />
        <StatPill label="Done" count={counts.Done} valueClass="text-emerald-600" icon={<CheckCircle2 className="w-3 h-3 text-zinc-400" />} />
      </div>

      {/* Progress overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Progress
          </span>
          <span className="text-xs font-bold tabular-nums text-zinc-600">
            {completedCount} / {steps.length} done
          </span>
        </div>
        <ProgressBar value={completedCount} max={steps.length} barClassName="bg-emerald-500" />
      </div>

      {/* Active step card — VehicleCard structure */}
      {current && !allDone && (() => {
        const state = stepState(current);
        return (
          <div className={`relative bg-white border border-zinc-200 border-l-4 ${STATUS_BORDER[state]} overflow-hidden mb-6`}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    Current step
                  </p>
                  <h3 className="text-3xl font-black text-black tracking-tight leading-none">
                    {current.label}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[state]}`}>
                  {STATUS_LABEL[state]}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-zinc-600 bg-zinc-100 border-zinc-300">
                  Est. {formatDuration(current.estimateSeconds * 1000)}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-zinc-600 bg-zinc-100 border-zinc-300">
                  {Math.round((currentElapsed / (current.estimateSeconds * 1000)) * 100)}% of estimate
                </span>
              </div>

              {/* Timer block — color matches state */}
              <div className={`flex items-center gap-3 border px-4 py-3 mb-4 ${
                state === 'active' ? 'bg-sky-50 border-sky-200' :
                state === 'paused' ? 'bg-amber-50 border-amber-200' :
                'bg-zinc-50 border-zinc-200'
              }`}>
                <Timer className={`w-4 h-4 flex-shrink-0 ${
                  state === 'active' ? 'text-sky-500' :
                  state === 'paused' ? 'text-amber-500' :
                  'text-zinc-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest leading-none mb-0.5">
                    {state === 'active' ? 'Active' : state === 'paused' ? 'Paused' : 'Not Started'}
                  </p>
                  <p className={`text-xl font-black tabular-nums leading-none ${
                    state === 'active' ? 'text-sky-600' :
                    state === 'paused' ? 'text-amber-600' :
                    'text-zinc-400'
                  }`}>
                    {formatTimer(currentElapsed)}
                  </p>
                </div>
                {state === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
                )}
              </div>

              <div className="mb-4">
                <ProgressBar
                  value={currentElapsed}
                  max={current.estimateSeconds * 1000}
                  barClassName={
                    currentElapsed > current.estimateSeconds * 1000 ? 'bg-red-500' :
                    state === 'active' ? 'bg-sky-500' :
                    state === 'paused' ? 'bg-amber-500' : 'bg-zinc-400'
                  }
                />
              </div>

              {/* Actions — VehicleCard button styles */}
              <div className="flex flex-wrap gap-2">
                {state === 'pending' && current.elapsedMs === 0 && (
                  <button
                    onClick={() => startStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start
                  </button>
                )}
                {state === 'active' && (
                  <button
                    onClick={() => pauseStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Break
                  </button>
                )}
                {state === 'paused' && (
                  <button
                    onClick={() => resumeStep(cursor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button
                  onClick={() => finishStep(cursor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Done
                </button>
                <button
                  onClick={() => skipStep(cursor)}
                  className="flex items-center justify-center gap-2 border border-zinc-300 hover:border-black text-zinc-500 hover:text-black font-bold text-sm uppercase tracking-widest py-3 px-4 transition-colors"
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
              className={`relative bg-white border border-zinc-200 border-l-4 ${STATUS_BORDER[state]} overflow-hidden transition-colors`}
            >
              <div className="p-5 flex items-center gap-4">
                <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[state]}`}>
                  {STATUS_LABEL[state]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate">{step.label}</p>
                  <p className="text-xs text-zinc-400 tabular-nums mt-0.5">
                    {formatDuration(step.elapsedMs)} / {formatDuration(step.estimateSeconds * 1000)}
                  </p>
                </div>
                {state === 'active' && (
                  <Clock className="w-4 h-4 text-sky-500 animate-pulse flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion indicator */}
      {allDone && (
        <div className="mt-8 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-3">
          <Flag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 font-bold text-sm uppercase tracking-wide">All steps complete</p>
        </div>
      )}
    </section>
  );
}

function StatPill({ label, count, valueClass, icon }: { label: string; count: number; valueClass: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-black tabular-nums ${valueClass}`}>{count}</p>
    </div>
  );
}
