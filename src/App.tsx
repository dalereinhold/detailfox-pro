import { useState } from 'react';
import IntakeForm from './components/IntakeForm';
import Dashboard from './components/Dashboard';
import StatsDashboard from './components/StatsDashboard';
import Landing from './pages/Landing';

type View = 'landing' | 'detailpace';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [view, setView] = useState<View>('landing');

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-3 group"
            >
              <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
                DetailFox
              </span>
              <span className="w-px h-4 bg-zinc-700" />
              <span className="text-white text-xs font-bold tracking-[0.25em] uppercase group-hover:text-zinc-300 transition-colors">
                Suite
              </span>
            </button>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => setView('detailpace')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase rounded transition-colors ${
                view === 'detailpace'
                  ? 'text-white bg-zinc-800'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              DetailPace
            </button>
            <button
              disabled
              className="px-3 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase rounded text-zinc-600 cursor-not-allowed"
              title="In development"
            >
              DetailFlow
            </button>
          </nav>
        </div>
      </header>

      {/* Body */}
      {view === 'landing' ? (
        <Landing onOpenDetailPace={() => setView('detailpace')} />
      ) : (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-[57px]">
            <StatsDashboard refreshTrigger={refreshTrigger} />
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0 space-y-8">
            <IntakeForm onVehicleAdded={triggerRefresh} />
            <Dashboard refreshTrigger={refreshTrigger} onVehiclesUpdated={triggerRefresh} />
          </div>
        </div>
      )}
    </div>
  );
}
