import React from 'react';
import { useHazopStore } from '@/store/useHazopStore';

interface NavStep { id: string; number: number; label: string; badge?: string }

const steps: NavStep[] = [
  { id: 'facility', number: 1, label: 'Select Facility & Nodes' },
  { id: 'equipment', number: 2, label: 'Review Equipment' },
  { id: 'deviations', number: 3, label: 'Select Deviations' },
  { id: 'report', number: 4, label: 'Generate Report' },
  { id: 'sensitivity', number: 5, label: 'Sensitivity Analysis', badge: 'Optional' },
];

export function LeftNav() {
  const { step } = useHazopStore();

  const currentIndex = steps.findIndex(s => s.id === step);
  
  if (currentIndex === -1 && step !== 'report' && step !== 'sensitivity') return null;

  return (
    <aside className="fixed top-[60px] left-0 w-[240px] h-[calc(100vh-60px-72px)] bg-white border-r border-[#E5E7EB] py-6 overflow-y-auto z-[900] hidden lg:block">
      <ul className="list-none p-0 m-0">
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isCompleted = idx < currentIndex;
          
          return (
            <li 
              key={s.id} 
              className={`px-6 py-3 flex items-center gap-3 cursor-pointer transition-all duration-150 border-l-[3px] 
                ${isActive ? 'bg-[#EBF5FF] border-[#00539B]' : 'border-transparent hover:bg-[#F9FAFB]'} 
                ${isCompleted ? 'text-[#6B7280]' : ''}
              `}
            >
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0
                ${isActive ? 'bg-[#00539B] text-white' : (isCompleted ? 'bg-[#2D7D46] text-white' : 'bg-[#E5E7EB] text-[#6B7280]')}`}
              >
                {isCompleted ? '✓' : s.number}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[14px] font-medium ${isCompleted ? 'text-[#6B7280]' : 'text-[#1A1A1A]'}`}>
                  {s.label}
                </span>
                {s.badge && (
                  <span className="text-[10px] font-medium text-[#9CA3AF] bg-[#F3F4F6] rounded-full px-2 py-0.5 mt-0.5 self-start leading-tight">
                    {s.badge}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
