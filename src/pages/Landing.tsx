import { ArrowRight, Clock, ListTodo } from 'lucide-react';

interface LandingProps {
  onOpenDetailPace: () => void;
  onOpenDetailFlow: () => void;
}

export default function Landing({ onOpenDetailPace, onOpenDetailFlow }: LandingProps) {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
      {/* Hero — flat, blends into body */}
      <section className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-[1.1]">
          Welcome to DetailFox Pro
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          A collection of lightweight, precision tools for the hobby detailer.
        </p>

      </section>

      {/* My tools */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            My tools
          </h2>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>


        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
          {/* DetailPace */}
          <div className="relative bg-zinc-900 border border-zinc-800 border-l-4 border-l-orange-500 overflow-hidden transition-colors hover:border-zinc-700">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                    Tool
                  </p>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                    DetailPace Pro
                  </h3>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-zinc-800 text-white">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-emerald-400 bg-emerald-900/30 border-emerald-800/50">
                  Available
                </span>
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-zinc-400 bg-zinc-800 border-zinc-700">
                  Time tracking
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-5">
                Time-tracking and intake for the detailing bay. Log vehicles,
                run live timers, and watch your stats update in real time.
              </p>
              <button
                onClick={onOpenDetailPace}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-sm uppercase tracking-widest py-3 transition-colors"
              >
                Open app
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* DetailFlow */}
          <div className="relative bg-zinc-900 border border-zinc-800 border-l-4 border-l-orange-500 overflow-hidden transition-colors hover:border-zinc-700">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                    Tool
                  </p>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                    DetailFlow Pro
                  </h3>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-zinc-800 text-white">
                  <ListTodo className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-emerald-400 bg-emerald-900/30 border-emerald-800/50">
                  Available
                </span>
                <span className="text-xs font-bold px-2 py-0.5 border uppercase tracking-wider text-zinc-400 bg-zinc-800 border-zinc-700">
                  Workflows
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-5">
                Guided, timed routine workflows. Pick a service, run a
                step-by-step checklist with a high-precision timer, and review
                your performance at the end.
              </p>
              <button
                onClick={onOpenDetailFlow}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-sm uppercase tracking-widest py-3 transition-colors"
              >
                Open app
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>        </div>
      </section>
    </div>
  );
}
