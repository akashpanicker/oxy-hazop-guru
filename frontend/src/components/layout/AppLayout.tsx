import logo from '@/assets/oxy-logo.png';
import { ReactNode } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { LeftNav } from './LeftNav';
import React from 'react';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const BREADCRUMBS: Record<string, string[]> = {
  dashboard: ['Dashboard'],
  facility: ['Dashboard', 'Select Facility & Nodes'],
  equipment: ['Dashboard', 'Select Facility & Nodes', 'Review Equipment'],
  deviations: ['Dashboard', 'Select Facility & Nodes', 'Review Equipment', 'Select Deviations'],
  report: ['Dashboard', 'Select Facility & Nodes', 'Review Equipment', 'Select Deviations', 'Generate Report'],
};

export function AppLayout({ children, hideNav }: AppLayoutProps) {
  const { step, setStep } = useHazopStore();

  // Left Nav triggers only on specific wizard steps
  const showLeftNav = ['facility', 'equipment', 'deviations'].includes(step) && !hideNav;

  const currentPath = BREADCRUMBS[step] || [];

  return (
    <div className="min-h-screen flex flex-col bg-oxy-bg font-sans">
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#E5E7EB] z-[1000] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center shrink-0">
              <img src={logo} alt="Oxy Logo" className="h-[36px] w-auto object-contain" />
            </div>
            <div className="flex flex-col border-l border-[#E5E7EB] pl-4">
              <span className="text-[14px] font-bold tracking-tight text-[#1A1A1A] leading-tight">
                HAZOP GURU
              </span>
              {currentPath.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-0.5">
                  {currentPath.map((item, idx) => (
                    <React.Fragment key={item}>
                      {idx > 0 && <span className="text-[#D1D5DB]">/</span>}
                      <span
                        className={`transition-colors ${idx === currentPath.length - 1 ? 'text-[#6B7280]' : 'hover:text-oxy-blue cursor-pointer'}`}
                        onClick={() => {
                          if (item === 'Dashboard') setStep('dashboard');
                          if (item === 'Select Facility & Nodes') setStep('facility');
                          if (item === 'Review Equipment') setStep('equipment');
                        }}
                      >
                        {item}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[32px] h-[32px] rounded-full bg-oxy-blue text-white flex items-center justify-center text-[14px] font-medium leading-none">
                JD
              </div>
              <span className="text-[#4A4A4A] text-[14px] font-medium hidden sm:block">John Doe</span>
            </div>
          </div>
        </header>
      )}

      {showLeftNav && <LeftNav />}

      <main
        className={
          hideNav
            ? "flex-1 flex flex-col"
            : showLeftNav
              ? "mt-[60px] lg:ml-[240px] mb-[72px] px-4 md:px-6 lg:px-12 py-4 lg:py-8 min-h-[calc(100vh-132px)]"
              : "mt-[60px] mb-[72px] px-4 md:px-6 lg:py-8 min-h-[calc(100vh-132px)] max-w-[1440px] mx-auto w-full"
        }
      >
        {children}
      </main>

    </div>
  );
}
