import { Clock, ArrowRight, Sparkles, CheckSquare } from 'lucide-react';
import { ROUTINES, useDetailFlowStore } from '@/detailflow/store';
import { getServiceType } from '@/lib/serviceTypes';
import { formatDuration } from '@/detailflow/format';

export default function RoutineSelection() {
  const selectRoutine = useDetailFlowStore((s) => s.selectRoutine);

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ROUTINES.map((r) => {
          const totalEstimate = r.steps.reduce((sum, s) => sum + s.estimateSeconds, 0) * 1000;
          const service = getServiceType(r.id);
          return (
            <div
              key={r.id}
              className={`relative bg-white border border-zinc-200 border-l-4 ${service?.accent ?? 'border-l-slate-300'} overflow-hidden transition-colors hover:border-zinc-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1 dark:text-slate-500">
                      Routine
                    </p>
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-slate-100 tracking-tight leading-none">
                      {r.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 text-white dark:bg-indigo-600">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {service && (
                    <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider flex items-center gap-1 ${service.tag}`}>
                      <Sparkles className="w-3 h-3" />
                      {service.name}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-slate-600 bg-zinc-100 border-zinc-300 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600">
                    {r.steps.length} steps
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-slate-600 bg-zinc-100 border-zinc-300 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600">
                    Est. {formatDuration(totalEstimate)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">{r.description}</p>

                {/* Action */}
                <button
                  onClick={() => selectRoutine(r)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Start
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
