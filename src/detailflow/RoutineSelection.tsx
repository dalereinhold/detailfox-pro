import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card, CardBody } from '@/components/ui';
import { ROUTINES, useDetailFlowStore } from '@/detailflow/store';
import { formatDuration } from '@/detailflow/format';

export default function RoutineSelection() {
  const selectRoutine = useDetailFlowStore((s) => s.selectRoutine);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-10">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-600">
          DetailFlow
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
        Choose a detailing routine
      </h1>
      <p className="mt-2 text-zinc-500 max-w-2xl">
        Each routine is a guided, timed checklist. Pick one to start a session —
        you can pause, skip, and finish steps as you go.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROUTINES.map((r) => {
          const totalEstimate = r.steps.reduce((sum, s) => sum + s.estimateSeconds, 0) * 1000;
          return (
            <Card
              key={r.id}
              className="flex flex-col hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <CardBody className="flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 text-white">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{r.name}</h3>
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
                      {r.steps.length} steps
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                  {r.description}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Est. {formatDuration(totalEstimate)}
                  </span>
                  <Button size="sm" onClick={() => selectRoutine(r)}>
                    Start
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
