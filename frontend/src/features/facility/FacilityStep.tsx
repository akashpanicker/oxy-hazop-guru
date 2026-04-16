import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { Building2, Target, Clock, Info, ArrowLeft, ArrowRight } from 'lucide-react';

export function FacilityStep() {
  const { setStep } = useHazopStore();
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'simple' | 'hfd' | 'pid'>('simple');

  const facilities = [
    { id: 'constitution', name: 'Constitution Platform', available: true },
    { id: 'delta', name: 'Delta Platform (Coming Soon)', available: false },
    { id: 'epsilon', name: 'Epsilon Platform (Coming Soon)', available: false },
  ];

  const nodes = [
    { id: '11', number: 'Node 11', name: 'Oil Sep #2', available: true },
    { id: '15', number: 'Node 15', name: 'Flash Gas Scrb', available: true },
    { id: '28', number: 'Node 28', name: 'Compressor', available: true },
  ];

  const handleFacilitySelect = (id: string) => {
    setSelectedFacility(id);
    setIsOpen(false);
    setLoadingNodes(true);
    setShowNodes(false);

    // Simulate loading
    setTimeout(() => {
      setLoadingNodes(false);
      setShowNodes(true);
      setSelectedNodes(['11', '15', '28']); // Pre-select defaults
    }, 600);
  };

  const toggleNode = (id: string) => {
    if (selectedNodes.includes(id)) {
      setSelectedNodes(selectedNodes.filter(n => n !== id));
    } else {
      setSelectedNodes([...selectedNodes, id]);
    }
  };

  const estimatedTime = selectedNodes.length * 2;
  const facilityName = facilities.find(f => f.id === selectedFacility)?.name || 'None';

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto w-full pt-2 pb-6">

      {/* Left Column: Analysis Setup */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-[20px] font-bold text-[#1A1A1A] mb-1 tracking-tight">Select Facility & Nodes</h1>
          <p className="text-[14px] text-[#6B7280]">Choose the offshore platform and nodes you want to analyze</p>
        </div>

        {/* Section 1: Facility */}
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-5 border-none">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-oxy-blue text-white flex items-center justify-center font-bold text-xs">1</span>
            <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Select Facility</h2>
          </div>

          <div className="relative w-full max-w-[600px]">
            <label className="block text-sm font-medium text-[#4A4A4A] mb-2">Choose the offshore platform you want to analyze</label>
            <button
              type="button"
              className={`w-full h-[56px] px-4 flex items-center justify-between bg-white border rounded-[8px] text-left transition-all
                ${isOpen ? 'border-oxy-blue ring-4 ring-oxy-blue/10' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'}
              `}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={`text-[16px] ${selectedFacility ? 'text-[#1A1A1A] font-medium' : 'text-[#9CA3AF]'}`}>
                {selectedFacility ? facilities.find(f => f.id === selectedFacility)?.name : 'Select a facility...'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#E5E7EB] rounded-[8px] shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                {facilities.map((fac) => (
                  <button
                    key={fac.id}
                    disabled={!fac.available}
                    className={`w-full px-4 py-3.5 text-left text-[15px] flex items-center justify-between border-b border-[#F3F4F6] last:border-none transition-colors ${fac.available
                        ? 'hover:bg-[#F9FAFB] cursor-pointer text-[#1A1A1A]'
                        : 'text-[#9CA3AF] cursor-not-allowed bg-[#F9FAFB]/50'
                      }`}
                    onClick={() => handleFacilitySelect(fac.id)}
                  >
                    <span>{fac.name}</span>
                    {selectedFacility === fac.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00539B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Nodes */}
        {loadingNodes && (
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-12 border-none flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-oxy-blue rounded-full animate-spin"></div>
            <p className="text-[#6B7280] font-medium">Loading available nodes...</p>
          </div>
        )}

        {showNodes && (
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-5 border-none animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-oxy-blue text-white flex items-center justify-center font-bold text-xs">2</span>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Select Nodes to Analyze</h2>
                  <p className="text-xs text-[#6B7280]">Choose one or more nodes from the flow diagram below</p>
                </div>
              </div>

              {/* View toggles */}
              <div className="bg-[#F3F4F6] rounded-[8px] p-1 flex">
                {[
                  { id: 'simple', label: 'Simple Flow' },
                  { id: 'hfd', label: 'HFD Detail' },
                  { id: 'pid', label: 'Full P&ID' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id as any)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-[6px] transition-all ${viewMode === v.id ? 'bg-white text-oxy-blue shadow-sm' : 'text-[#6B7280] hover:text-[#4A4A4A]'
                      }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative border border-[#F3F4F6] rounded-[10px] p-5 bg-[#F9FAFB]/50 overflow-x-auto">
              <div className="min-w-[800px] flex items-center justify-center gap-8 py-2">
                {nodes.map((node, i) => {
                  const isSelected = selectedNodes.includes(node.id);
                  const isAvailable = node.available;

                  return (
                    <React.Fragment key={node.id}>
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => toggleNode(node.id)}
                        className={`w-[180px] p-4 rounded-[12px] text-left transition-all border-2 relative group
                          ${!isAvailable ? 'bg-white border-dashed border-[#E5E7EB] opacity-60 cursor-not-allowed' :
                            isSelected ? 'bg-white border-oxy-blue shadow-lg scale-[1.02]' : 'bg-white border-transparent hover:border-[#D1D5DB]'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors mb-3
                          ${isSelected ? 'bg-oxy-blue border-oxy-blue text-white' : 'bg-white border-[#D1D5DB] group-hover:border-[#9CA3AF]'}
                        `}>
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <div className="text-[18px] font-bold text-[#1A1A1A] mb-1">{node.number}</div>
                        <div className="text-[14px] text-[#6B7280]">{node.name}</div>
                        {!isAvailable && <div className="mt-4 inline-block text-[10px] font-bold tracking-wider text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded">COMING SOON</div>}
                      </button>

                      {i < nodes.length - 1 && (
                        <div className="flex items-center gap-1 text-[#E5E7EB]">
                          <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 8H36M36 8L30 2M36 8L30 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Selection Summary */}
      <div className="w-full lg:w-[300px] shrink-0">
        <div className="sticky top-[72px] flex flex-col gap-4">
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-4 border-none">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">Selection Summary</h3>

            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-oxy-blue" />
                </div>
                <div>
                  <div className="text-[14px] text-[#6B7280]">Facility:</div>
                  <div className="text-[14px] text-[#1A1A1A] font-semibold mt-0.5">{facilityName}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Target size={20} className="text-oxy-blue" />
                </div>
                <div>
                  <div className="text-[14px] text-[#6B7280]">Nodes Selected:</div>
                  <div className="text-[14px] text-[#1A1A1A] font-semibold mt-0.5">{selectedNodes.length} nodes</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-oxy-blue" />
                </div>
                <div>
                  <div className="text-[14px] text-[#6B7280]">Estimated Analysis Time:</div>
                  <div className="text-[14px] text-[#1A1A1A] font-semibold mt-0.5">{estimatedTime} minutes</div>
                </div>
              </div>
            </div>

            {selectedNodes.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
                <div className="text-[12px] font-bold text-[#9CA3AF] tracking-wider uppercase mb-3">SELECTED NODES</div>
                <div className="flex flex-wrap gap-2">
                  {selectedNodes.map(id => {
                    const node = nodes.find(n => n.id === id);
                    return (
                      <div key={id} className="bg-oxy-blue/10 text-oxy-blue px-3 py-1.5 rounded-full text-[13px] font-semibold border border-oxy-blue/20">
                        {node?.number}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50/50 border border-blue-100/50 rounded-[12px] p-6">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Info size={18} className="text-oxy-blue" />
              </div>
              <p className="text-[13px] text-[#4A4A4A] leading-[1.6]">
                You can select up to 5 nodes for a single analysis session.
                Average analysis time is 2 minutes per node.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#E5E7EB] flex items-center justify-between px-12 z-[1000] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <Button
          variant="outline"
          onClick={() => setStep('dashboard')}
          className="text-[#6B7280] border-[#D1D5DB] font-medium text-[16px] px-6 py-2.5 rounded-[6px] hover:border-oxy-blue hover:text-oxy-blue transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4 text-sm text-[#9CA3AF] font-medium uppercase tracking-widest hidden sm:flex">
          Step 1 of 4
        </div>

        <Button
          disabled={!selectedFacility || selectedNodes.length === 0}
          onClick={() => setStep('equipment')}
          className="bg-oxy-blue text-white font-semibold text-[16px] px-8 py-2.5 rounded-[6px] transition-all hover:bg-[#003D73] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed border-none flex items-center gap-2"
        >
          Continue to Equipment Review
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
