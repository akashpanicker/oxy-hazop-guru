import { AppLayout } from '@/components/layout/AppLayout';
import { useHazopStore } from '@/store/useHazopStore';
import { LoginStep } from '@/features/auth/LoginStep';
import { DashboardStep } from '@/features/dashboard/DashboardStep';
import { FacilityStep } from '@/features/facility/FacilityStep';
import { EquipmentStep } from '@/features/equipment/EquipmentStep';
import { DeviationsStep } from '@/features/deviations/DeviationsStep';
import { ReportStep } from '@/features/report/ReportStep';

export default function App() {
  const { step } = useHazopStore();

  return (
    <AppLayout hideNav={step === 'login'}>
      {step === 'login' && <LoginStep />}
      {step === 'dashboard' && <DashboardStep />}
      {step === 'facility' && <FacilityStep />}
      {step === 'equipment' && <EquipmentStep />}
      {step === 'deviations' && <DeviationsStep />}
      {step === 'report' && <ReportStep />}
    </AppLayout>
  );
}
