import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function ReportStep() {
  const { setStep } = useHazopStore();
  const [showCalculation, setShowCalculation] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pt-4 h-[calc(100vh-140px)]">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-bold text-oxy-dark">HAZOP Worksheet — High Pressure</h1>
          <p className="text-[16px] text-oxy-grayText mt-1">Node 11: HP Oil Separator #2</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Print
          </Button>
          <Button variant="outline" size="sm">Download HTML</Button>
          <Button variant="outline" size="sm">Download Excel</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-6 flex flex-col gap-6">
        
        {/* Node Metadata & AI Transparency */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Drawing:</span> <span className="text-slate-600">P&ID-11-Separator.pdf</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Design Pressure:</span> <span className="text-slate-600">2120 PSIG</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Max Pressures:</span> <span className="text-slate-600">Gas: 5000 PSIG | Liquid: 1000 PSIG</span></div>
            </div>
            
            <div className="w-[400px]">
              <button 
                onClick={() => setShowCalculation(!showCalculation)}
                className="w-full text-left bg-white border border-oxy-blue/30 rounded p-3 text-sm flex items-center justify-between hover:bg-oxy-bg transition-colors"
               >
                 <span className="font-semibold text-oxy-blue flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                   How was risk calculated?
                 </span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-oxy-blue transition-transform ${showCalculation ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              {showCalculation && (
                <div className="mt-2 bg-white border border-slate-200 p-4 text-sm rounded shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-2">Calculation Walkthrough:</h4>
                  <ul className="space-y-2 text-slate-600 list-disc list-inside">
                    <li><strong className="text-slate-700">PAF Consequence:</strong> C=5 (from table: 5000 PSIG + 6" leak → PEC level)</li>
                    <li><strong className="text-slate-700">Probability:</strong> P=2 (4 safeguards credited: PSV, PSHH, Gas Detection, Deluge)</li>
                    <li><strong className="text-slate-700">Risk Matrix:</strong> C=5 + P=2 → <span className="font-bold text-amber-600">RL=B (Medium)</span></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mock Worksheet Table */}
        <div className="flex-1 overflow-auto border border-slate-200 rounded">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-16">ID</th>
                <th className="px-4 py-3 min-w-[200px]">Causes</th>
                <th className="px-4 py-3 min-w-[200px]">Consequences</th>
                <th className="px-4 py-3 min-w-[200px]">Safeguards</th>
                <th className="px-4 py-3 text-center w-24">Risk</th>
                <th className="px-4 py-3 min-w-[200px]">Recommendations</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 font-medium font-mono">1.1</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">Inadvertent closure of SDV-150 on gas outlet.</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">Overpressure of separator leading to potential loss of containment and gas cloud.</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">
                  <ul className="list-disc list-inside space-y-1">
                    <li>PSV-101 (2000 PSIG)</li>
                    <li>PSHH-102 initiates shutdown</li>
                  </ul>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="pdlor">B-MED</Badge>
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">
                  None required at this time.
                </td>
              </tr>
              <tr className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 font-medium font-mono">1.2</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">Failure of PCV-200 full open from upstream wellhead.</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">Rapid overpressure exceeding design rating of vessel. Potential BLEVE if ignited.</td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal">
                  <ul className="list-disc list-inside space-y-1">
                    <li>PSV-101 sized for blocked discharge</li>
                    <li>Fire & gas system</li>
                  </ul>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="paf">A-HIGH</Badge>
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-normal text-amber-700 font-medium">
                  Review PSV capacity against new wellhead max pressure profile.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] left-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Analysis Complete</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => alert('Download starting...')}>
            Download Report
          </Button>
        </div>
      </div>

    </div>
  );
}
