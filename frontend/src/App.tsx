import { AppLayout } from '@/components/layout/AppLayout';
import { useHazopStore } from '@/store/useHazopStore';
import { UploadStep } from '@/features/upload/UploadStep';
import { DeviationsStep } from '@/features/deviations/DeviationsStep';
// Placeholder for the other steps you would create:
// import { CausesStep } from '@/features/causes/CausesStep';
// import { WorksheetStep } from '@/features/worksheet/WorksheetStep';

export default function App() {
  const { step } = useHazopStore();

  return (
    <AppLayout>
      {/* Wizard Steps Logic */}
      {step === 'upload' && <UploadStep />}
      {step === 'deviations' && <DeviationsStep />}
      
      {/* 
        {step === 'causes' && <CausesStep />}
        {step === 'worksheet' && <WorksheetStep />}
      */}
      
      {step === 'causes' && (
        <div className="text-center p-12 bg-white rounded-2xl border shadow-sm max-w-2xl mx-auto mt-12 text-slate-500">
           Causes component placeholder. Check useHazopStore for the generated causes data!
        </div>
      )}
    </AppLayout>
  );
}
