import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';

interface NodeItem {
  id: string;
  number: string;
  name: string;
  available: boolean;
}

export function NodesStep() {
  const { setStep } = useHazopStore();
  const [selectedNodes, setSelectedNodes] = useState<string[]>(['11', '15', '28']); // Pre-select based on prompt requirement
  const [viewMode, setViewMode] = useState<'simple' | 'hfd' | 'pid'>('simple');

  const nodes: NodeItem[] = [
    { id: '11', number: 'Node 11', name: 'HP Oil Sep #2', available: true },
    { id: '15', number: 'Node 15', name: 'Flash Gas Scrb', available: true },
    { id: '28', number: 'Node 28', name: 'Compressor', available: true },
    { id: '5', number: 'Node 5', name: 'Coming Soon', available: false },
  ];

  const handleToggle = (id: string) => {
    if (selectedNodes.includes(id)) {
      setSelectedNodes(selectedNodes.filter(n => n !== id));
    } else {
      setSelectedNodes([...selectedNodes, id]);
    }
  };

  const estimatedTime = selectedNodes.length * 2;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pt-4">
      <div>
        <h1 className="text-[32px] font-bold text-oxy-dark mb-2">Constitution Platform - Select Nodes</h1>
        <p className="text-[16px] text-oxy-grayText">
          Select the nodes you want to include in this analysis.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 border border-slate-100 flex flex-col gap-6 relative">
        <div className="text-center font-bold text-lg text-oxy-grayText mb-4">PROCESS FLOW DIAGRAM</div>
        
        {/* Mock Flow Diagram area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 min-h-[300px] relative px-4">
          
          {nodes.map((node, i) => {
            const isSelected = selectedNodes.includes(node.id);
            const isAvailable = node.available;

            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && handleToggle(node.id)}
                  className={`w-[200px] h-[120px] rounded-[16px] flex flex-col items-center justify-center p-4 transition-all
                    ${!isAvailable ? 'bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 cursor-not-allowed opacity-70' : 
                      isSelected ? 'bg-oxy-blue border-2 border-oxy-blue text-white shadow-md' : 'bg-white border-2 border-oxy-border text-oxy-dark hover:border-oxy-blue/50'
                    }
                  `}
                >
                  <span className={`text-[18px] font-bold ${isSelected ? 'text-white' : (isAvailable ? 'text-oxy-dark' : 'text-slate-400')}`}>
                    {node.number}
                  </span>
                  <span className={`text-[14px] mt-1 mb-3 ${isSelected ? 'text-blue-100' : 'text-oxy-grayText'}`}>
                    {node.name}
                  </span>
                  {isAvailable && (
                    <div className="flex items-center gap-2">
                       <div className={`flex items-center justify-center w-5 h-5 rounded border ${isSelected ? 'bg-white border-white text-oxy-blue' : 'bg-white border-oxy-border'}`}>
                         {isSelected && (
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M20 6 9 17l-5-5"/>
                           </svg>
                         )}
                       </div>
                       <span className="text-sm font-semibold">{isSelected ? 'SELECTED' : 'SELECT'}</span>
                    </div>
                  )}
                </button>

                {/* Arrow to next node (except last one) */}
                {i < nodes.length - 1 && i < 2 && (
                   <div className="hidden sm:flex text-slate-400 font-bold items-center justify-center">
                     <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="12" x2="36" y2="12" stroke="#94A3B8" strokeWidth="3"/>
                        <path d="M38 12L28 17V7L38 12Z" fill="#94A3B8"/>
                     </svg>
                   </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* View toggles */}
        <div className="absolute top-8 right-8 bg-slate-50 rounded-lg p-1 border border-slate-200 flex">
          {[
            { id: 'simple', label: 'Simple Flow' },
            { id: 'hfd', label: 'HFD Detail' },
            { id: 'pid', label: 'Full P&ID' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === v.id ? 'bg-white text-oxy-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] left-[240px] max-lg:left-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('facility')}>
            ← Back
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Step 2 of 5</span>
          <span>•</span>
          <span>Selected {selectedNodes.length} nodes (~{estimatedTime}m estimated)</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            disabled={selectedNodes.length === 0}
            onClick={() => setStep('equipment')} // go to equipment verification
          >
            Run HAZOP Analysis →
          </Button>
        </div>
      </div>
    </div>
  );
}
