import { BarChart3, Check, SkipForward, Clock, TrendingUp, Gauge } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { useDetailFlowStore, ROUTINES } from '@/components/flow/store';
import { getServiceType } from '@/lib/serviceTypes';
import { formatDuration } from '@/components/flow/format';

export default function PerformancePanel() {
  const { steps, activeRoutineId } = useDetailFlowStore();
  const routine = ROUTINES.find((r) => r.id === activeRoutineId);
  const service = routine ? getServiceType(routine.id) : undefined;

  const completed = steps.filter((s) => s.status === 'completed');
  const skipped = steps.filter((s) => s.status === 'skipped');
  const totalTime = steps.reduce((sum, s) => sum + s.elapsedMs, 0);
  const totalEstimate = steps.reduce((sum, s) => sum + s.estimateSeconds * 1000, 0);
  const completionRate = steps.length > 0 ? Math.round((completed.length / steps.length) * 100) : 0;
  const efficiency = totalEstimate > 0 && totalTime > 0 ? Math.round((totalEstimate / totalTime) * 100) : 0;
  const hasSession = steps.length > 0;

  return (
    <aside className="border border-zinc-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">Performance</h2>
        </div>
        {routine && service && (
          <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${service.tag}`}>
            {routine.name}
          </span>
        )}
      </div>

      <div className="p-5 space-y-6">
        {!hasSession && (
          <p className="text-zinc-400 text-xs uppercase tracking-widest text-center py-4">
            No active session
          </p>
        )}

        {hasSession && (
          <>
            {/* Total time */}
            <div className="border border-zinc-200 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Total Time</p>
              </div>
              <p className="text-5xl font-black text-black tabular-nums">{formatDuration(totalTime)}</p>
              <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">
                vs {formatDuration(totalEstimate)} estimate
              </p>
            </div>

            {/* Completion rate */}
            <div className="border border-zinc-200 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Completion</p>
              </div>
              <p className="text-5xl font-black text-emerald-600 tabular-nums">{completionRate}%</p>
              <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">
                {completed.length} done · {skipped.length} skipped
              </p>
            </div>

            {/* Efficiency */}
            <div className="border border-zinc-200 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-3.5 h-3.5 text-sky-500" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Efficiency</p>
              </div>
              <p className="text-5xl font-black text-sky-600 tabular-nums">{efficiency}%</p>
              <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">
                {efficiency >= 100 ? 'Under estimate' : 'Over estimate'}
              </p>
            </div>

            {/* Time vs estimate */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Time vs Estimate</p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Actual</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatDuration(totalTime)}</span>
                  </div>
                  <ProgressBar
                    value={totalTime}
                    max={Math.max(totalTime, totalEstimate, 1)}
                    barClassName="bg-zinc-900"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Estimated</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-500">{formatDuration(totalEstimate)}</span>
                  </div>
                  <ProgressBar
                    value={totalEstimate}
                    max={Math.max(totalTime, totalEstimate, 1)}
                    barClassName="bg-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* Step breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SkipForward className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Step Breakdown</p>
              </div>
              <div className="space-y-3">
                {steps.map((step) => {
                  const over = step.elapsedMs > step.estimateSeconds * 1000;
                  return (
                    <div key={step.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {step.status === 'completed' ? (
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <SkipForward className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs font-semibold truncate ${
                              step.status === 'skipped' ? 'text-zinc-400 line-through' : 'text-zinc-700'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-zinc-500 flex-shrink-0 ml-2">
                          {formatDuration(step.elapsedMs)}
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
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
