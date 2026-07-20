import { useState } from 'react';
import Landing from './pages/Landing';
import Pace from './pages/Pace';
import Flow from './pages/Flow';
import Header, { View } from './components/Header';

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
    <div className="min-h-screen bg-background text-foreground">
      <Header view={view} menuOpen={menuOpen} navigate={navigate} setMenuOpen={setMenuOpen} />

      {/* Body */}
      {view === 'landing' && <Landing onOpenDetailPace={() => navigate('detailpace')} onOpenDetailFlow={() => navigate('detailflow')} />}

      {view === 'detailflow' && <Flow />}

      {view === 'detailpace' && <Pace />}
    </div>
  );

}