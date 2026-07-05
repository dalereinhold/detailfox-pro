import { useDetailFlowStore } from '@/detailflow/store';
import RoutineSelection from '@/detailflow/RoutineSelection';
import StepEngine from '@/detailflow/StepEngine';
import SummaryView from '@/detailflow/SummaryView';

export default function DetailFlow() {
  const phase = useDetailFlowStore((s) => s.phase);
  if (phase === 'select') return <RoutineSelection />;
  if (phase === 'active') return <StepEngine />;
  return <SummaryView />;
}
