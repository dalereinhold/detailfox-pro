import { useDetailFlowStore } from '@/detailflow/store';
import RoutineSelection from '@/detailflow/RoutineSelection';
import StepEngine from '@/detailflow/StepEngine';
import PerformancePanel from '@/detailflow/PerformancePanel';

export default function DetailFlow() {
  const phase = useDetailFlowStore((s) => s.phase);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
      {/* Sidebar — performance, mirrors Pace Statistics */}
      <div className="w-full xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-12">
        <PerformancePanel />
      </div>

      {/* Main */}
      <div className="flex-1 w-full min-w-0">
        {phase === 'active' ? <StepEngine /> : <RoutineSelection />}
      </div>
    </div>
  );
}
