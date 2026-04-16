import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Settings, Wrench, Shield, Image, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';

export function EquipmentStep() {
  const { setStep } = useHazopStore();
  const [expandedSections, setExpandedSections] = useState({
    major: false,
    instruments: false,
    safety: true,
  });
  const [viewMode, setViewMode] = useState<'simple' | 'hfd' | 'pid'>('hfd');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Multi-panel fake data
  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold text-oxy-dark">Review Extracted Equipment - Node 11: Oil Separator #2</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Section - Accordions (Full Width) */}
        <div className="w-full flex flex-col bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">

          <div className="p-4 flex flex-col gap-4">

            {/* Major Equipment Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => toggleSection('major')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.major ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-oxy-dark">Major Equipment</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">1</div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.major ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.major ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-6 border-t border-slate-200 bg-white">
                    <p className="text-sm text-slate-500 italic">No major equipment details found in recent P&ID.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruments Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => toggleSection('instruments')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.instruments ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Wrench size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-oxy-dark">Instruments/Causes</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">4</div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.instruments ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.instruments ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-0 border-t border-slate-200 bg-white">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Tag Number</th>
                          <th className="px-4 py-3">Cause Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-oxy-dark">PCV-201</td>
                          <td className="px-4 py-3 text-slate-600">Upstream wellhead control valve fails open.</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="p-4 border-b border-slate-200">
                      <Button variant="outline" size="sm" className="text-oxy-blue border-oxy-border border-dashed w-auto">
                        + Add Row
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Devices Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('safety')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.safety ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-oxy-dark">Safety Devices</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">10</div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.safety ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.safety ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-0 border-t border-slate-200 bg-white">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Tag Number</th>
                          <th className="px-4 py-3">Device Type</th>
                          <th className="px-4 py-3">Setpoint / Capacity</th>
                          <th className="px-4 py-3">State/Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { tag: 'PSV-201', type: 'Relief Valve', set: '2000 PSIG', resp: 'Opens to Flare' },
                          { tag: 'PSHL-202', type: 'Pressure Switch', set: '1800 PSIG (H)', resp: 'Closes SDV-101' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-oxy-dark">{row.tag}</td>
                            <td className="px-4 py-3 text-slate-600">{row.type}</td>
                            <td className="px-4 py-3 text-slate-600">{row.set}</td>
                            <td className="px-4 py-3 text-slate-600">{row.resp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 border-b border-slate-200 bg-white">
                      <Button variant="outline" size="sm" className="text-oxy-blue border-oxy-border border-dashed w-full sm:w-auto">
                        + Add Row
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Parameter inputs overlay */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 mt-auto">
            <h3 className="font-semibold text-sm text-oxy-dark mb-3 uppercase tracking-wider">Analysis Parameters</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Production Loss Value ($/bbl)</label>
                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" defaultValue="75" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">APC Production Loss</label>
                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" defaultValue="1000" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Visual Reference (Full Width) */}
        <div className="w-full h-[450px] flex flex-col bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-4 overflow-hidden mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-oxy-dark uppercase tracking-wider text-sm flex items-center gap-2">
              <Image size={18} className="text-oxy-blue" />
              Visual Reference
            </h3>

            <button className="text-oxy-blue text-sm font-medium hover:underline flex items-center gap-1">
              View Full Size
              <Maximize2 size={14} />
            </button>
          </div>

          <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative group">
            {/* Placeholder for the image */}
            <div className="absolute inset-0 max-w-full max-h-full flex items-center justify-center opacity-40 mix-blend-multiply">
              <svg viewBox="0 0 400 300" className="w-full h-full text-slate-400">
                <rect x="50" y="50" width="300" height="200" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="120" cy="150" r="30" fill="currentColor" opacity="0.2" />
                <rect x="200" y="100" width="100" height="100" fill="currentColor" opacity="0.1" />
                <line x1="150" y1="150" x2="200" y2="150" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="absolute p-3 bg-oxy-blue/10 border-2 border-oxy-blue rounded z-10 w-[40%] h-[40%] flex flex-col items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              <span className="bg-oxy-blue text-white px-2 py-1 rounded text-xs font-bold mb-1 shadow-sm">Node 11 Highlighted</span>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200">
              <label className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded ${viewMode === 'simple' ? 'bg-oxy-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <input type="radio" className="sr-only" checked={viewMode === 'simple'} onChange={() => setViewMode('simple')} />
                Simple Flow
              </label>
              <label className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded ${viewMode === 'hfd' ? 'bg-oxy-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <input type="radio" className="sr-only" checked={viewMode === 'hfd'} onChange={() => setViewMode('hfd')} />
                HFD
              </label>
              <label className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded ${viewMode === 'pid' ? 'bg-oxy-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <input type="radio" className="sr-only" checked={viewMode === 'pid'} onChange={() => setViewMode('pid')} />
                Full P&ID
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[1000] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('facility')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Step 2 of 4</span>
          <span>•</span>
          <span>Equipment Review</span>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => setStep('deviations')} className="flex items-center gap-2">
            Confirm Equipment
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
