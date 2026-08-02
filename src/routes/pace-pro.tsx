import { createFileRoute } from "@tanstack/react-router"
import { useState } from 'react';

// Import components but don't export them from this file
import IntakeForm from '@/components/pace-pro/intake-form';
import IntakeRecords from '@/components/pace-pro/intake-records';

export const Route = createFileRoute("/pace-pro")({
  component: PaceProPage, // This is the key - pass the component as prop
})

// Don't export from this file - just define it here
function PaceProPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  return (
    <div className="flex-1 space-y-8">
      <IntakeForm onVehicleAdded={triggerRefresh} />
      <IntakeRecords refreshTrigger={refreshTrigger} onVehiclesUpdated={triggerRefresh} />
    </div>
  );
}
