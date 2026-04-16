import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';

export function FacilityStep() {
  const { setStep } = useHazopStore();
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const facilities = [
    { id: 'constitution', name: 'Constitution Platform', available: true },
    { id: 'delta', name: 'Delta Platform (Coming Soon)', available: false },
    { id: 'epsilon', name: 'Epsilon Platform (Coming Soon)', available: false },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto w-full pt-8">
      <div>
        <h1 className="text-[32px] font-bold text-oxy-dark mb-2">Select Facility</h1>
        <p className="text-[16px] text-oxy-grayText">
          Choose the offshore platform you want to analyze:
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 border border-slate-100 flex flex-col gap-6">
        
        <div className="relative max-w-[500px]">
          <button 
            type="button" 
            className="w-full h-[56px] px-4 flex items-center justify-between bg-white border border-oxy-border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-oxy-blue"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`text-[16px] ${selectedFacility ? 'text-oxy-dark font-medium' : 'text-slate-400'}`}>
              {selectedFacility ? facilities.find(f => f.id === selectedFacility)?.name : 'Select a facility...'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-oxy-border rounded-lg shadow-lg overflow-hidden z-10">
              {facilities.map((fac) => (
                <button
                  key={fac.id}
                  disabled={!fac.available}
                  className={`w-full px-4 py-3 text-left text-[16px] flex items-center justify-between ${
                    fac.available 
                      ? 'hover:bg-slate-50 cursor-pointer text-oxy-dark' 
                      : 'text-slate-400 cursor-not-allowed bg-slate-50 opacity-70'
                  }`}
                  onClick={() => {
                    if (fac.available) {
                      setSelectedFacility(fac.id);
                      setIsOpen(false);
                    }
                  }}
                >
                  <span>{fac.name}</span>
                  {selectedFacility === fac.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-oxy-blue">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] left-[240px] max-lg:left-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('dashboard')}>
            ← Back
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Step 1 of 5</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            disabled={!selectedFacility}
            onClick={() => setStep('nodes')}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
