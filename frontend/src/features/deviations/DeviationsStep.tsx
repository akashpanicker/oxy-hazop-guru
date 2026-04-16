import { useHazopStore } from '@/store/useHazopStore';
import { Loader2, Settings, Wrench, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import React from 'react';

export function DeviationsStep() {
  const { 
    selectedDeviations, 
    setSelectedDeviations,
    otherDeviation,
    setOtherDeviation,
    setStep,
  } = useHazopStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const DEVIATION_OPTIONS = ['High Pressure', 'Low Pressure', 'High Flow', 'Low Flow', 'High Temperature', 'Low Temperature'];

  useEffect(() => {
    if (selectedDeviations.length === 0) {
      setSelectedDeviations(['High Pressure']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleDeviation = (dev: string) => {
    setSelectedDeviations(
      selectedDeviations.includes(dev)
        ? selectedDeviations.filter(d => d !== dev)
        : [...selectedDeviations, dev]
    );
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('report');
    } catch (error) {
      console.error(error);
      alert('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 lg:px-12 py-8 bg-oxy-bg min-h-[calc(100vh-64px)] relative flex flex-col">
      
      {/* Equipment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 text-center transition-all duration-200 hover:border-oxy-blue hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,83,155,0.1)]">
          <div className="flex justify-center mb-3">
            <Settings size={22} className="text-oxy-blue" />
          </div>
          <div className="text-[20px] font-bold text-oxy-blue mb-1 leading-none">1</div>
          <div className="text-[14px] font-medium text-slate-500">Major Equipment</div>
        </div>
        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 text-center transition-all duration-200 hover:border-oxy-blue hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,83,155,0.1)]">
          <div className="flex justify-center mb-3">
            <Wrench size={22} className="text-oxy-blue" />
          </div>
          <div className="text-[20px] font-bold text-oxy-blue mb-1 leading-none">4</div>
          <div className="text-[14px] font-medium text-slate-500">Instruments</div>
        </div>
        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 text-center transition-all duration-200 hover:border-oxy-blue hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,83,155,0.1)]">
          <div className="flex justify-center mb-3">
            <Shield size={22} className="text-oxy-blue" />
          </div>
          <div className="text-[20px] font-bold text-oxy-blue mb-1 leading-none">10</div>
          <div className="text-[14px] font-medium text-slate-500">Safety Devices</div>
        </div>
      </div>
      
      <div className="relative">
        {/* Selection Counter */}
        <div className="absolute top-2 right-4 text-[14px] text-slate-500 hidden sm:block">
          <span className="font-bold text-[18px] text-oxy-blue">{selectedDeviations.length + (otherDeviation ? 1 : 0)}</span> of 6 deviations selected
        </div>

        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-[20px] font-semibold text-oxy-dark">Select Deviations</h2>
            <span className="bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-[12px] font-medium">At least 1 required</span>
          </div>
          <p className="text-[16px] text-slate-500">Which deviations would you like to analyze for this node?</p>
        </div>

        {/* Deviation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {DEVIATION_OPTIONS.map(dev => (
            <Checkbox
              key={dev}
              label={dev}
              checked={selectedDeviations.includes(dev)}
              onChange={() => handleToggleDeviation(dev)}
            />
          ))}
        </div>
        
        {/* Other Deviation Input */}
        <div className="mb-8">
          <label className="block text-[14px] font-medium text-oxy-dark mb-2">Other Deviation (Optional)</label>
          <input 
            type="text" 
            className="w-full p-[14px_16px] text-[16px] border-2 border-[#E5E7EB] rounded-lg transition-all duration-150 focus:outline-none focus:border-oxy-blue focus:shadow-[0_0_0_3px_rgba(0,83,155,0.1)] placeholder:text-slate-400"
            placeholder="e.g., Reverse Flow, As Well As, Composition Change"
            value={otherDeviation}
            onChange={(e) => setOtherDeviation(e.target.value)}
          />
        </div>

      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[1000] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('equipment')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Step 3 of 4</span>
          <span>•</span>
          <span>Select Deviations</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={generateReport}
            disabled={isLoading || (selectedDeviations.length === 0 && !otherDeviation)}
            className="min-w-[180px] flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                Continue to Analysis
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center p-[24px] text-[#9CA3AF] text-[12px] mt-12 mb-auto">
        HAZOP P&ID Analysis Engine © 2026
      </footer>

    </div>
  );
}
