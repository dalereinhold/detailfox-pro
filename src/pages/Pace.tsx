import { useState } from 'react';
import StatsDashboard from '../components/pace/StatsDashboard';
import IntakeForm from '../components/pace/IntakeForm';
import Dashboard from '../components/pace/Dashboard';

export default function Pace() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  return (
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
  );
}
