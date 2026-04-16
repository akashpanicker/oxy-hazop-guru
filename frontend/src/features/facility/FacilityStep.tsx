import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface DiagramNode {
  id: string;
  number: string;
  name: string;
  available: boolean;
  top: number;
  left: number;
}

// Node positions use a unified coordinate system.
// SVG paths reference these same coordinates directly.
// Card width: 200px, approximate card height: 140px
const DIAGRAM_NODES: DiagramNode[] = [
  { id: 'dry-tree', number: 'Dry Tree', name: 'production flowline', available: false, top: 60, left: 80 },
  { id: 'caesar', number: 'Caesar Tonga', name: 'Subsea Production Flowline', available: false, top: 310, left: 80 },
  { id: 'ticonderoga', number: 'Ticonderoga', name: 'Subsea Production Flowline', available: false, top: 530, left: 80 },
  { id: '11', number: 'Node 11', name: 'Test Header and Test separator', available: true, top: 310, left: 380 },
  { id: '26', number: 'Node 26', name: 'FGC 1st stage suction header and FGC No. 1 1st Stage Compressor', available: false, top: 30, left: 680 },
  { id: '27', number: 'Node 27', name: 'FGC 2nd stage suction header and FGC No. 1 2nd Stage Compressor', available: false, top: 175, left: 680 },
  { id: '28', number: 'Node 28', name: 'FGC 3rd stage suction header and FGC No. 1 3rd Stage Compressor', available: true, top: 320, left: 680 },
  { id: '15', number: 'Node 15', name: 'IP Oil Production Header and IP Production Separator', available: true, top: 465, left: 680 },
  { id: 'lp-prod', number: 'LP Production', name: 'Header and Separator', available: false, top: 600, left: 960 },
];

const FLOW_COLORS = {
  GAS: '#EF4444',
  OIL: '#3B82F6',
  PRODUCTION: '#10B981',
  FEED: '#F97316',
  GRAY: '#9CA3AF',
};

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

  const handleFacilitySelect = (id: string) => {
    setSelectedFacility(id);
    setIsOpen(false);
    setLoadingNodes(true);
    setShowNodes(false);

    setTimeout(() => {
      setLoadingNodes(false);
      setShowNodes(true);
      setSelectedNodes(['11', '15', '28']);
    }, 600);
  };

  const toggleNode = (id: string) => {
    if (selectedNodes.includes(id)) {
      setSelectedNodes(selectedNodes.filter(n => n !== id));
    } else {
      if (selectedNodes.length >= 5) {
        alert('Maximum 5 nodes per analysis');
        return;
      }
      setSelectedNodes([...selectedNodes, id]);
    }
  };



  return (
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto pt-2 pb-12">
      
      {/* Upper Section: Title and Facility Selection */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-[16px] font-bold text-[#1A1A1A] mb-1 tracking-tight">Select Facility & Nodes</h1>
            <p className="text-[14px] text-[#6B7280]">Choose the offshore platform and nodes you want to analyze</p>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-5 border-none">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-oxy-blue text-white flex items-center justify-center font-bold text-xs">1</span>
              <h2 className="text-[16px] font-semibold text-[#1A1A1A]">Select Facility</h2>
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
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#E5E7EB] rounded-[8px] shadow-xl overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
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
        </div>
      </div>

      {/* Lower Section: Node Diagram */}
      <div className="w-full">
        {loadingNodes && (
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-24 border-none flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-oxy-blue rounded-full animate-spin"></div>
            <p className="text-[#6B7280] font-medium">Loading available nodes...</p>
          </div>
        )}

        {showNodes && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Diagram Header */}
            <div className="flex items-start justify-between border-b-2 border-[#E5E7EB] pb-5">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-oxy-blue text-white flex items-center justify-center font-bold text-sm">2</span>
                <div>
                  <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Select Nodes to Analyze</h2>
                  <p className="text-[14px] text-[#6B7280]">Choose one or more nodes from the flow diagram below</p>
                </div>
              </div>
            </div>

            {/* Interaction Canvas — overflow-x allows scroll on narrow screens */}
            <div className="border border-[#E5E7EB] rounded-[12px] shadow-sm overflow-x-auto">
              <div className="relative" style={{ minWidth: '1200px', minHeight: '780px', background: '#FAFBFC' }}>
                {/* Visible dot grid background */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}></div>

                {/* ========== SVG Connections Layer ========== */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  <defs>
                    {/* Arrow markers — 12×10 filled triangles, pushed forward */}
                    <marker id="arrow-feed" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
                      <polygon points="0 0, 12 5, 0 10" fill={FLOW_COLORS.FEED} />
                    </marker>
                    <marker id="arrow-gas" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
                      <polygon points="0 0, 12 5, 0 10" fill={FLOW_COLORS.GAS} />
                    </marker>
                    <marker id="arrow-production" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
                      <polygon points="0 0, 12 5, 0 10" fill={FLOW_COLORS.PRODUCTION} />
                    </marker>
                    <marker id="arrow-gray" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
                      <polygon points="0 0, 12 5, 0 10" fill={FLOW_COLORS.GRAY} />
                    </marker>
                  </defs>

                  {/* ── FEED FLOWS (Orange) ── */}

                  {/* 1. Dry Tree → Node 11 */}
                  <path
                    d="M 260,115 H 320 V 355 H 380"
                    stroke={FLOW_COLORS.FEED} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-feed)"
                    opacity={selectedNodes.includes('11') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 2. Caesar Tonga → Node 11 */}
                  <path
                    d="M 260,365 H 320 V 370 H 380"
                    stroke={FLOW_COLORS.FEED} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-feed)"
                    opacity={selectedNodes.includes('11') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 3. Ticonderoga → Node 11 */}
                  <path
                    d="M 260,585 H 320 V 380 H 380"
                    stroke={FLOW_COLORS.FEED} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-feed)"
                    opacity={selectedNodes.includes('11') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* ── GRAY FLOWS (Node 11 → Node 26 & Node 27) ── */}

                  {/* 4a. Gray vertical spine from Node 11 top upward */}
                  <path
                    d="M 470,310 V 85"
                    stroke={FLOW_COLORS.GRAY} strokeWidth="3" fill="none"
                    strokeLinecap="square"
                    opacity="0.7"
                    className="transition-opacity duration-300"
                  />

                  {/* 4b. Gray branch right to Node 26 */}
                  <path
                    d="M 470,85 H 680"
                    stroke={FLOW_COLORS.GRAY} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-gray)"
                    opacity="0.7"
                    className="transition-opacity duration-300"
                  />

                  {/* 4c. Gray branch right to Node 27 */}
                  <path
                    d="M 470,230 H 680"
                    stroke={FLOW_COLORS.GRAY} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-gray)"
                    opacity="0.7"
                    className="transition-opacity duration-300"
                  />

                  {/* ── GAS FLOWS (Red) ── */}

                  {/* 5. Node 11 → Node 28 */}
                  <path
                    d="M 560,375 H 680"
                    stroke={FLOW_COLORS.GAS} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-gas)"
                    opacity={selectedNodes.includes('11') && selectedNodes.includes('28') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 6. Node 28 → right extension (red) */}
                  <path
                    d="M 860,365 H 940"
                    stroke={FLOW_COLORS.GAS} strokeWidth="3" fill="none"
                    strokeLinecap="square"
                    markerEnd="url(#arrow-gas)"
                    opacity={selectedNodes.includes('28') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 7. Node 28 → right extension (green) */}
                  <path
                    d="M 860,385 H 940"
                    stroke={FLOW_COLORS.PRODUCTION} strokeWidth="3" fill="none"
                    strokeLinecap="square"
                    markerEnd="url(#arrow-production)"
                    opacity={selectedNodes.includes('28') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* ── PRODUCTION FLOWS (Green) ── */}

                  {/* 8. Node 11 → Node 15 (down, right) */}
                  <path
                    d="M 470,420 V 520 H 680"
                    stroke={FLOW_COLORS.PRODUCTION} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-production)"
                    opacity={selectedNodes.includes('11') && selectedNodes.includes('15') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 9. Node 15 → LP Production (down, right) */}
                  <path
                    d="M 770,575 V 655 H 960"
                    stroke={FLOW_COLORS.PRODUCTION} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-production)"
                    opacity={selectedNodes.includes('15') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />



                  {/* 11. Node 15 → Node 27 (red, left-side route) */}
                  <path
                    d="M 770,465 H 660 V 230 H 680"
                    stroke={FLOW_COLORS.GAS} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-gas)"
                    opacity={selectedNodes.includes('15') ? 1 : 0.7}
                    className="transition-opacity duration-300"
                  />

                  {/* 12. LP Production → Node 26 (gray, up then left) */}
                  <path
                    d="M 1050,600 V 85 H 860"
                    stroke={FLOW_COLORS.GRAY} strokeWidth="3" fill="none"
                    strokeLinecap="square" strokeLinejoin="miter"
                    markerEnd="url(#arrow-gray)"
                    opacity="0.7"
                    className="transition-opacity duration-300"
                  />

                </svg>

                {/* ========== Node Cards Layer ========== */}
                <div className="absolute inset-0" style={{ zIndex: 10 }}>
                  {DIAGRAM_NODES.map((node) => {
                    const isSelected = selectedNodes.includes(node.id);
                    const isAvailable = node.available;

                    return (
                      <div
                        key={node.id}
                        role={isAvailable ? 'checkbox' : undefined}
                        aria-checked={isAvailable ? isSelected : undefined}
                        aria-disabled={!isAvailable}
                        aria-label={`${node.number}, ${node.name}${isSelected ? ', selected' : ''}`}
                        tabIndex={isAvailable ? 0 : -1}
                        onClick={() => isAvailable && toggleNode(node.id)}
                        onKeyDown={(e) => {
                          if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            toggleNode(node.id);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: node.top,
                          left: node.left,
                          width: 180,
                          minHeight: 110,
                        }}
                        className={`rounded-[10px] p-[14px] transition-all duration-200 flex flex-col
                          ${!isAvailable
                            ? 'bg-[#F3F4F6] border-2 border-[#D1D5DB] opacity-65 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#EFF6FF] border-[3px] border-[#00539B] shadow-[0_4px_16px_rgba(0,83,155,0.18)] cursor-pointer'
                              : 'bg-white border-[3px] border-[#00539B] shadow-[0_2px_8px_rgba(0,83,155,0.12)] cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,83,155,0.22)] hover:border-[#003D73]'
                          }
                        `}
                      >
                        {/* Internal Checkbox */}
                        {isAvailable && (
                          <div className={`w-[20px] h-[20px] rounded border-2 flex items-center justify-center transition-colors mb-1.5
                            ${isSelected ? 'bg-[#00539B] border-[#00539B]' : 'bg-white border-[#00539B]'}
                          `}>
                            {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div className="text-[14px] font-bold text-[#1A1A1A] mb-0.5 leading-tight">{node.number}</div>
                          <div className="text-[11px] text-[#6B7280] leading-snug">{node.name}</div>
                        </div>


                      </div>
                    );
                  })}
                </div>

                {/* ========== Legend Panel ========== */}
                <div className="absolute bg-white border border-[#E5E7EB] rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.08)]" style={{ bottom: 40, right: 40, zIndex: 15, padding: '12px 20px' }}>
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Flow Types:</div>
                  <div className="flex gap-5">
                    {[
                      { color: FLOW_COLORS.GAS, label: 'Gas' },
                      { color: FLOW_COLORS.OIL, label: 'Oil' },
                      { color: FLOW_COLORS.PRODUCTION, label: 'Production' },
                      { color: FLOW_COLORS.FEED, label: 'Feed' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-[8px]">
                        {/* Line sample with arrowhead */}
                        <svg width="44" height="10" viewBox="0 0 44 10">
                          <line x1="0" y1="5" x2="34" y2="5" stroke={item.color} strokeWidth="3" strokeLinecap="round" />
                          <polygon points="34,1 42,5 34,9" fill={item.color} />
                        </svg>
                        <span className="text-[13px] text-[#4A4A4A]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
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
