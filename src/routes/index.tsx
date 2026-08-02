import { createFileRoute } from "@tanstack/react-router"
import { useState } from 'react';

// Import components but don't export them from this file
import PaceStats from '@/components/pace-pro/pace-stats';

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

// Don't export from this file - just define it here
function DashboardPage() {
  const [refreshTrigger] = useState(0);

  return (
    <div>
      <PaceStats refreshTrigger={refreshTrigger} />
    </div>
  );
}
