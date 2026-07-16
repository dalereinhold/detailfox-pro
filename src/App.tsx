import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Landing from './pages/Landing';
import Pace from './pages/Pace';
import Flow from './pages/Flow';

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

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  function navigate(v: View) {
    setView(v);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="text-zinc-900 text-sm font-bold tracking-[0.2em] uppercase"
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
                    ? 'text-zinc-900 border-b-2 border-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-900 border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden text-zinc-700 p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide-down */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-zinc-200 bg-white">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`block w-full text-left px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase border-b border-zinc-100 transition-colors ${
                  view === item.id ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400 hover:text-zinc-900'
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

      {view === 'detailflow' && <Flow />}

      {view === 'detailpace' && <Pace />}
    </div>
  );
}