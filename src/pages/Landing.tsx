import { ArrowRight, Clock, Sparkles, Zap } from 'lucide-react';

interface LandingProps {
  onOpenDetailPace: () => void;
  onOpenDetailFlow: () => void;
}

export default function Landing({ onOpenDetailPace, onOpenDetailFlow }: LandingProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 60%, #fff 0, transparent 35%)',
          }}
        />
        <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">
              DetailFox Suite
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            One ecosystem for every detail of your detailing business.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
            DetailFox brings together focused tools that work the way detailers
            actually work. Track time on the bay, manage workflows, and grow —
            all from one place.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenDetailPace}
              className="inline-flex items-center gap-2 bg-white text-zinc-900 font-semibold px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Launch DetailPace
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-sm text-zinc-400">
              More apps coming to the suite
            </span>
          </div>
        </div>
      </section>

      {/* App grid */}
      <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The DetailFox apps
            </h2>
            <p className="mt-2 text-zinc-500">
              Pick a tool to get started. Each one is built for a specific part
              of your workflow.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
          {/* DetailPace — active */}
          <div className="group relative flex flex-col bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">DetailPace</h3>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600">
                  Available now
                </span>
              </div>
            </div>
            <p className="text-zinc-600 leading-relaxed flex-1">
              Time-tracking and intake for the detailing bay. Log vehicles,
              run live timers, and watch your stats update in real time.
            </p>
            <button
              onClick={onOpenDetailPace}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold px-5 py-3 rounded-lg hover:bg-zinc-800 transition-colors w-full sm:w-auto"
            >
              Open app
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* DetailFlow — active */}
          <div className="group relative flex flex-col bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">DetailFlow</h3>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600">
                  Available now
                </span>
              </div>
            </div>
            <p className="text-zinc-600 leading-relaxed flex-1">
              Guided, timed routine workflows. Pick a service, run a
              step-by-step checklist with a high-precision timer, and review
              your performance at the end.
            </p>
            <button
              onClick={onOpenDetailFlow}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold px-5 py-3 rounded-lg hover:bg-zinc-800 transition-colors w-full sm:w-auto"
            >
              Open app
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
