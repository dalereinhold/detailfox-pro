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
import { Button, Card, CardHeader, CardBody, ProgressBar } from '@/components/ui';
import { useDetailFlowStore, SessionStep } from '@/detailflow/store';
import { formatTimer, formatDuration } from '@/detailflow/format';

const STATUS_BADGE: Record<SessionStep['status'], string> = {
  pending: 'bg-zinc-100 border-zinc-300 text-zinc-500',
  active: 'bg-amber-50 border-amber-200 text-amber-700',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  skipped: 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through',
};

export default function StepEngine() {
  const { steps, cursor, pauseStep, resumeStep, startStep, finishStep, skipStep, goToSummary, reset } =
    useDetailFlowStore();
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const [liveMs, setLiveMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // High-precision timer loop for the active step.
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
        <div>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-600">
            Active session
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">
            Step-by-step
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5" />
          End session
        </Button>
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

      {/* Active step card */}
      {current && !allDone && (
        <Card className="mb-6 border-zinc-300 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                Current step
              </span>
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-600">
              {current.status === 'active' ? 'Running' : 'Paused'}
            </span>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-zinc-900">{current.label}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mt-1">
                  Estimated {formatDuration(current.estimateSeconds * 1000)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black tabular-nums text-zinc-900">
                  {formatTimer(currentElapsed)}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mt-1">
                  Elapsed
                </p>
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar
                value={currentElapsed}
                max={current.estimateSeconds * 1000}
                barClassName={
                  currentElapsed > current.estimateSeconds * 1000
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }
              />
              <p className="text-xs text-zinc-400 mt-1.5 tabular-nums">
                {Math.round((currentElapsed / (current.estimateSeconds * 1000)) * 100)}% of estimate
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {current.status === 'pending' && (
                <Button onClick={() => startStep(cursor)}>
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              )}
              {current.status === 'active' && (
                <Button variant="secondary" onClick={() => pauseStep(cursor)}>
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              {current.status === 'pending' && current.elapsedMs > 0 && (
                <Button variant="secondary" onClick={() => resumeStep(cursor)}>
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              )}
              <Button onClick={() => finishStep(cursor)}>
                <Check className="w-4 h-4" />
                Finish
              </Button>
              <Button variant="danger" onClick={() => skipStep(cursor)}>
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 px-4 py-3 border rounded-none bg-white transition-colors ${
              i === cursor ? 'border-zinc-300' : 'border-zinc-200'
            }`}
          >
            <span
              className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${STATUS_BADGE[step.status]}`}
            >
              {step.status}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{step.label}</p>
              <p className="text-xs text-zinc-400 tabular-nums">
                {formatDuration(step.elapsedMs)} / {formatDuration(step.estimateSeconds * 1000)}
              </p>
            </div>
            {step.status === 'active' && (
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Finish session */}
      {allDone && (
        <div className="mt-8 flex flex-col items-center gap-4 py-10 border-2 border-dashed border-zinc-300 rounded-none">
          <Flag className="w-8 h-8 text-emerald-600" />
          <p className="text-lg font-bold text-zinc-900">All steps complete</p>
          <Button size="lg" onClick={goToSummary}>
            View performance summary
          </Button>
        </div>
      )}
    </div>
  );
}
