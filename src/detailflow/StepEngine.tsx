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
} from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { useDetailFlowStore, SessionStep } from '@/detailflow/store';
import { formatTimer, formatDuration } from '@/detailflow/format';

const STATUS_BADGE: Record<SessionStep['status'], string> = {
  pending: 'text-zinc-500 bg-zinc-100 border-zinc-300',
  active: 'text-amber-700 bg-amber-50 border-amber-200',
  completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  skipped: 'text-zinc-400 bg-zinc-50 border-zinc-200 line-through',
};

const STATUS_BORDER: Record<SessionStep['status'], string> = {
  pending: 'border-l-zinc-300',
  active: 'border-l-amber-400',
  completed: 'border-l-emerald-500',
  skipped: 'border-l-zinc-200',
};

export default function StepEngine() {
  const { steps, cursor, pauseStep, resumeStep, startStep, finishStep, skipStep, goToSummary, reset } =
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

  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
            Active session
          </span>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          End
        </button>
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
      {current && !allDone && (
        <div className="relative bg-white border border-zinc-200 border-l-4 border-l-amber-400 overflow-hidden mb-6">
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
              <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-amber-700 bg-amber-50 border-amber-200">
                {current.status === 'active' ? 'Running' : 'Paused'}
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

            {/* Timer block */}
            <div className="flex items-center gap-3 border px-4 py-3 mb-4 bg-amber-50 border-amber-200">
              <Timer className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest leading-none mb-0.5">
                  Elapsed
                </p>
                <p className="text-xl font-black tabular-nums leading-none text-amber-600">
                  {formatTimer(currentElapsed)}
                </p>
              </div>
              {current.status === 'active' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              )}
            </div>

            <div className="mb-4">
              <ProgressBar
                value={currentElapsed}
                max={current.estimateSeconds * 1000}
                barClassName={
                  currentElapsed > current.estimateSeconds * 1000 ? 'bg-red-500' : 'bg-amber-500'
                }
              />
            </div>

            {/* Actions — flat black buttons like VehicleCard */}
            <div className="flex flex-wrap gap-2">
              {current.status === 'pending' && current.elapsedMs === 0 && (
                <button
                  onClick={() => startStep(cursor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start
                </button>
              )}
              {current.status === 'active' && (
                <button
                  onClick={() => pauseStep(cursor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              {current.status === 'pending' && current.elapsedMs > 0 && (
                <button
                  onClick={() => resumeStep(cursor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
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
      )}

      {/* Step list — VehicleCard-style rows */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`relative bg-white border border-zinc-200 border-l-4 ${STATUS_BORDER[step.status]} overflow-hidden transition-colors`}
          >
            <div className="p-5 flex items-center gap-4">
              <span
                className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[step.status]}`}
              >
                {step.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black truncate">{step.label}</p>
                <p className="text-xs text-zinc-400 tabular-nums mt-0.5">
                  {formatDuration(step.elapsedMs)} / {formatDuration(step.estimateSeconds * 1000)}
                </p>
              </div>
              {step.status === 'active' && (
                <Clock className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Finish session */}
      {allDone && (
        <div className="mt-8 flex flex-col items-center gap-4 py-10 border-2 border-dashed border-zinc-300">
          <Flag className="w-8 h-8 text-emerald-600" />
          <p className="text-lg font-bold text-zinc-900">All steps complete</p>
          <button
            onClick={goToSummary}
            className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest py-3 px-6 transition-colors"
          >
            View performance summary
          </button>
        </div>
      )}
    </div>
  );
}
