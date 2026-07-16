import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import IntakeForm from './components/IntakeForm';
import Dashboard from './components/Dashboard';
import StatsDashboard from './components/StatsDashboard';
import Landing from './pages/Landing';
import DetailFlow from './detailflow/DetailFlow';

type View = 'landing' | 'detailpace' | 'detailflow';

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'landing', label: 'Fox Pro' },
  { id: 'detailpace', label: 'Pace Pro' },
  { id: 'detailflow', label: 'Flow Pro' },
];

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [view, setView] = useState<View>('landing');
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect OS preference and set dark class on mount
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  function navigate(v: View) {
    setView(v);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-20 dark:border-slate-700 dark:bg-slate-900">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="text-zinc-900 text-sm font-bold tracking-[0.2em] uppercase dark:text-slate-100"
          >
            DetailFox Pro
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-3 py-1.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                  view === item.id
                    ? 'text-zinc-900 border-b-2 border-zinc-900 dark:text-slate-100 dark:border-slate-100'
                    : 'text-zinc-400 hover:text-zinc-900 border-b-2 border-transparent dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden text-zinc-700 p-1 dark:text-slate-300"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide-down */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`block w-full text-left px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase border-b border-zinc-100 transition-colors dark:border-slate-800 ${
                  view === item.id ? 'text-zinc-900 bg-zinc-50 dark:text-slate-100 dark:bg-slate-800' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Body */}
      {view === 'landing' && <Landing onOpenDetailPace={() => navigate('detailpace')} onOpenDetailFlow={() => navigate('detailflow')} />}

      {view === 'detailflow' && <DetailFlow />}

      {view === 'detailpace' && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-12">
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
