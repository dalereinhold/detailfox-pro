import { createFileRoute } from "@tanstack/react-router"

// Import components but don't export them from this file
import { useDetailFlowStore } from '@/lib/store';
import RoutineSelection from '@/components/flow-pro/routine-selection';
import StepEngine from '@/components/flow-pro/step-engine';
import PerformancePanel from '@/components/flow-pro/performance-panel';

export const Route = createFileRoute("/flow-pro")({
  component: FlowProPage, // This is the key - pass the component as prop
})

// Don't export from this file - just define it here
function FlowProPage() {
  const phase = useDetailFlowStore((s) => s.phase);

  return (
    <div className="flex-1 space-y-8">
      {/* Sidebar — performance, mirrors Pace Statistics */}
      <div>
        <PerformancePanel />
      </div>

      {/* Main */}
      <div>
        {phase === 'active' ? <StepEngine /> : <RoutineSelection />}
      </div>
    </div>
  );
}
