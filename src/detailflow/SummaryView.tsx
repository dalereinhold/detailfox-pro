import { Check, SkipForward, Clock, TrendingUp, RotateCcw, Gauge } from 'lucide-react';
import { Button, Card, CardHeader, CardBody, ProgressBar } from '@/components/ui';
import { useDetailFlowStore, ROUTINES } from '@/detailflow/store';
import { formatDuration } from '@/detailflow/format';

export default function SummaryView() {
  const { steps, activeRoutineId, reset } = useDetailFlowStore();
  const routine = ROUTINES.find((r) => r.id === activeRoutineId);

  const completed = steps.filter((s) => s.status === 'completed');
  const skipped = steps.filter((s) => s.status === 'skipped');
  const totalTime = steps.reduce((sum, s) => sum + s.elapsedMs, 0);
  const totalEstimate = steps.reduce((sum, s) => sum + s.estimateSeconds * 1000, 0);
  const completionRate = steps.length > 0 ? Math.round((completed.length / steps.length) * 100) : 0;
  const efficiency = totalEstimate > 0 ? Math.round((totalEstimate / totalTime) * 100) : 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-600">
            Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">
            Session summary
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5" />
          New session
        </Button>
      </div>

      {routine && (
        <p className="text-sm text-zinc-500 mb-6">
          Routine: <span className="font-semibold text-zinc-900">{routine.name}</span>
        </p>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                Total time
              </p>
            </div>
            <p className="text-3xl font-black tabular-nums text-zinc-900">
              {formatDuration(totalTime)}
            </p>
            <p className="text-xs text-zinc-400 mt-1 tabular-nums">
              vs {formatDuration(totalEstimate)} estimate
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                Completion rate
              </p>
            </div>
            <p className="text-3xl font-black tabular-nums text-emerald-600">
              {completionRate}%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {completed.length} completed · {skipped.length} skipped
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-3.5 h-3.5 text-sky-500" />
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                Efficiency
              </p>
            </div>
            <p className="text-3xl font-black tabular-nums text-sky-600">
              {efficiency}%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {efficiency >= 100 ? 'Under estimate' : 'Over estimate'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Time vs estimate bar */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">
              Time vs estimate
            </span>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Actual
              </span>
              <span className="text-sm font-bold tabular-nums text-zinc-900">
                {formatDuration(totalTime)}
              </span>
            </div>
            <ProgressBar
              value={totalTime}
              max={Math.max(totalTime, totalEstimate, 1)}
              barClassName="bg-zinc-900"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Estimated
              </span>
              <span className="text-sm font-bold tabular-nums text-zinc-500">
                {formatDuration(totalEstimate)}
              </span>
            </div>
            <ProgressBar
              value={totalEstimate}
              max={Math.max(totalTime, totalEstimate, 1)}
              barClassName="bg-zinc-300"
            />
          </div>
        </CardBody>
      </Card>

      {/* Per-step breakdown */}
      <Card>
        <CardHeader>
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">
            Step breakdown
          </span>
        </CardHeader>
        <CardBody className="space-y-3">
          {steps.map((step) => {
            const over = step.elapsedMs > step.estimateSeconds * 1000;
            return (
              <div key={step.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <SkipForward className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        step.status === 'skipped' ? 'text-zinc-400 line-through' : 'text-zinc-900'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-zinc-500">
                    {formatDuration(step.elapsedMs)} / {formatDuration(step.estimateSeconds * 1000)}
                  </span>
                </div>
                <ProgressBar
                  value={step.elapsedMs}
                  max={Math.max(step.estimateSeconds * 1000, step.elapsedMs, 1)}
                  barClassName={over ? 'bg-red-500' : 'bg-emerald-500'}
                />
              </div>
            );
          })}
        </CardBody>
      </Card>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
          Start a new session
        </Button>
      </div>
    </div>
  );
}
