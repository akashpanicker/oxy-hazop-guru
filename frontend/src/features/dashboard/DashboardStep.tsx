import React from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';

export function DashboardStep() {
  const { setStep } = useHazopStore();

  return (
    <div className="flex flex-col max-w-full mx-auto w-full">
      <h1 className="text-[20px] font-bold text-[#1A1A1A] mb-8 tracking-[-0.02em] text-left">
        Welcome to HAZOP Guru
      </h1>

      <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-8 md:p-12 mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-oxy-blue shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] leading-[1.3]">
            What is HAZOP Guru?
          </h2>
        </div>

        <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-8 max-w-[700px]">
          HAZOP Guru automates hazard analysis for offshore platforms.
          Our AI extracts equipment from P&IDs, suggests deviations, and
          generates audit-ready reports in minutes.
        </p>

        <div className="bg-[#F3F4F6] p-6 rounded-[8px]">
          <h3 className="font-semibold text-[#1A1A1A] mb-4 text-[14px]">Quick Start:</h3>
          <ol className="list-decimal pl-5 text-[#4A4A4A] space-y-3 text-[14px] leading-[1.8]">
            <li>Select your facility</li>
            <li>Choose nodes to analyze</li>
            <li>Verify extracted equipment</li>
            <li>Select deviations</li>
            <li>Generate HAZOP report</li>
          </ol>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-auto md:h-[72px] bg-white border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-4 md:py-0 gap-4 md:gap-0 z-[800] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <Button
          variant="outline"
          onClick={() => setStep('login')}
          className="w-full md:w-auto text-[#6B7280] border-[#D1D5DB] font-medium text-[14px] px-6 py-3 rounded-[6px] hover:border-oxy-blue hover:text-oxy-blue transition-all"
        >
          <span className="mr-2">←</span> Back to Login
        </Button>

        <Button
          onClick={() => setStep('facility')}
          className="w-full md:w-auto bg-oxy-blue text-white font-semibold text-[14px] px-8 py-3.5 rounded-[6px] md:min-w-[220px] transition-all hover:bg-[#003D73] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,83,155,0.2)] border-none"
        >
          Start New Analysis <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
}
