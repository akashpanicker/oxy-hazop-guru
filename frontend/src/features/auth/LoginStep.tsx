import logo from '@/assets/oxy-logo.png';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';

export function LoginStep() {
  const { setStep } = useHazopStore();

  return (
    <div className="flex-1 flex items-center justify-center -mt-8">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 text-center">
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <img src={logo} alt="Oxy Logo" className="w-full h-auto object-contain" />
        </div>
        <h1 className="text-[20px] font-bold text-oxy-dark mb-2">HAZOP GURU</h1>
        <p className="text-[16px] text-oxy-grayText mb-8">
          Streamline your HAZOP analysis with AI-powered automation
        </p>

        <Button
          variant="primary"
          size="sm"
          className="w-full !h-[36px] !max-h-[36px]"
          onClick={() => setStep('dashboard')}
        >
          Sign in with SSO
        </Button>

        <p className="text-[12px] text-slate-400 mt-8">
          HAZOP P&ID Analysis Engine &copy; 2026
        </p>
      </div>
    </div>
  );
}
