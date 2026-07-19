import { Menu, X, Home, Timer, Zap } from 'lucide-react';
import React from 'react';

export type View = 'landing' | 'detailpace' | 'detailflow';

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'landing', label: 'Fox Pro', icon: <Home className="w-4 h-4" /> },
  { id: 'detailpace', label: 'Pace Pro', icon: <Timer className="w-4 h-4" /> },
  { id: 'detailflow', label: 'Flow Pro', icon: <Zap className="w-4 h-4" /> },
];

interface HeaderProps {
  view: View;
  menuOpen: boolean;
  navigate: (v: View) => void;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ view, menuOpen, navigate, setMenuOpen }: HeaderProps) {
  return (
    <header className="border-b border-border-default bg-background-base sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 h-12 flex items-center justify-between">
        <button
          onClick={() => navigate('landing')}
          className="text-foreground-primary text-sm font-bold tracking-[0.2em] uppercase"
        >
          DetailFox Pro
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
             <button
               key={item.id}
               onClick={() => navigate(item.id)}
               className={`flex items-center px-3 py-1.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                 view === item.id
                   ? 'text-foreground-primary border-foreground-primary'
                   : 'text-foreground-secondary hover:text-foreground-primary border-b-2 border-transparent'
               }`}
             >
               <span className="mr-1.5">{item.icon}</span>
               {item.label}
             </button>

          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="sm:hidden text-foreground-tertiary p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile slide-down */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-border-default bg-background-surface">
          {NAV_ITEMS.map((item) => (
             <button
               key={item.id}
               onClick={() => navigate(item.id)}
               className={`flex items-center w-full text-left px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase border-b border-border-default transition-colors ${
                 view === item.id ? 'text-foreground-primary bg-background-elevated' : 'text-foreground-secondary hover:text-foreground-primary'
               }`}
             >
               <span className="mr-1.5">{item.icon}</span>
               {item.label}
             </button>

          ))}
        </nav>
      )}
    </header>
  );
}
