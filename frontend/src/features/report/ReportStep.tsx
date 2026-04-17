import React, { useState, useEffect } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AnalysisParams, ExtractionResult } from '@/types/hazop';
import { Loader2, AlertCircle, ArrowLeft, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';

// Map risk level letter to display info
const RISK_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  A: { label: 'A – Negligible', color: 'text-green-800', bg: 'bg-green-100' },
  B: { label: 'B – Low', color: 'text-blue-800', bg: 'bg-blue-100' },
  C: { label: 'C – Medium', color: 'text-amber-800', bg: 'bg-amber-100' },
  D: { label: 'D – High', color: 'text-orange-800', bg: 'bg-orange-100' },
  E: { label: 'E – Critical', color: 'text-red-800', bg: 'bg-red-100' },
};

// Map category to badge variant
function categoryVariant(cat: string): 'paf' | 'pdlor' | 'ecr' | 'neutral' {
  switch (cat?.toUpperCase()) {
    case 'PAF': return 'paf';
    case 'PD/LOR': return 'pdlor';
    case 'ECR': return 'ecr';
    default: return 'neutral';
  }
}

export function ReportStep() {
  const {
    setStep,
    confirmedCauses,
    extractedItems,
    analysisParams,
    pdfFilename,
    worksheetData,
    setWorksheetData,
    isLoading,
    loadingMessage,
    error,
    setLoading,
    setError,
  } = useHazopStore();

  const [showCalculation, setShowCalculation] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Generate worksheet on mount if not already available
  useEffect(() => {
    if (worksheetData) return; // Already generated
    if (!confirmedCauses) return; // No causes to confirm

    generateWorksheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateWorksheet = async () => {
    setError(null);
    setLoading(true, 'Generating HAZOP worksheet with risk calculations...');

    try {
      const response = await fetch('/api/confirm-causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed_causes: confirmedCauses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate worksheet');
      }

      const data = await response.json();
      setWorksheetData(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Worksheet generation failed:', err);
      setError(err.message || 'Failed to generate worksheet. Please try again.');
      setLoading(false);
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#00539B] rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Generating HAZOP Worksheet</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">{loadingMessage}</p>
            <p className="text-xs text-[#9CA3AF] mt-3">This may take 30-60 seconds for complex analyses</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !worksheetData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 max-w-lg mx-auto text-center">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Worksheet Generation Failed</h2>
        <p className="text-[#6B7280] text-sm">{error}</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => setStep('deviations')}>
            <ArrowLeft size={18} className="mr-2" /> Back to Deviations
          </Button>
          <Button onClick={generateWorksheet}>
            Retry Generation
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!worksheetData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-[#9CA3AF]" />
        <h2 className="text-xl font-semibold text-[#1A1A1A]">No worksheet data</h2>
        <p className="text-[#6B7280]">Please complete the analysis flow first.</p>
        <Button onClick={() => setStep('deviations')} className="mt-4">
          <ArrowLeft size={18} className="mr-2" /> Back to Deviations
        </Button>
      </div>
    );
  }

  const includedRows = worksheetData.included_rows || [];
  const excludedCauses = worksheetData.excluded_causes || [];
  const crossReferencedCauses = worksheetData.cross_referenced_causes || [];
  const designPressure = worksheetData.design_pressure;

  return (
    <div className="flex flex-col gap-6 max-w-[1500px] mx-auto w-full pt-4 pb-24 print:pb-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-m-0 { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">HAZOP Worksheet — High Pressure</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {pdfFilename || 'P&ID Analysis'} • Design Pressure: {designPressure || 'N/A'} PSIG
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-6 flex flex-col gap-6">

        {/* Node Metadata & AI Transparency */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Drawing:</span> <span className="text-slate-600">{pdfFilename || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Design Pressure:</span> <span className="text-slate-600">{designPressure || 'N/A'} PSIG</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Max Pressures:</span> <span className="text-slate-600">Gas: {analysisParams.max_pressure_gas || 'N/A'} PSIG | Liquid: {analysisParams.max_pressure_liquid || 'N/A'} PSIG</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Liquid Inventory:</span> <span className="text-slate-600">{analysisParams.max_liquid_inventory || 'N/A'} bbl</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-700 w-32">Rows Generated:</span> <span className="text-slate-600">{includedRows.length} included, {excludedCauses.length} excluded, {crossReferencedCauses.length} cross-referenced</span></div>
            </div>

            <div className="w-full sm:w-[400px]">
              <button
                onClick={() => setShowCalculation(!showCalculation)}
                className="w-full text-left bg-white border border-oxy-blue/30 rounded p-3 text-sm flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
              >
                <span className="font-semibold text-oxy-blue flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  How was risk calculated?
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-oxy-blue transition-transform ${showCalculation ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>

              {showCalculation && (
                <div className="mt-2 bg-white border border-slate-200 p-4 text-sm rounded shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-2">Methodology:</h4>
                  <ul className="space-y-2 text-slate-600 list-disc list-inside">
                    <li><strong className="text-slate-700">PAF (Personnel):</strong> Pressure ratio → hole size (Table 2) → consequence from PAF table (Table 4)</li>
                    <li><strong className="text-slate-700">PD/LOR (Financial):</strong> Downtime estimate × production rate + repair cost → financial threshold</li>
                    <li><strong className="text-slate-700">ECR (Environmental):</strong> Spill volume estimate → cleanup cost threshold</li>
                    <li><strong className="text-slate-700">Probability:</strong> P = max(1, C - CME_count) where CME = credited safeguards</li>
                    <li><strong className="text-slate-700">Risk Level:</strong> 5×5 matrix lookup (A–E)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Worksheet Table */}
        <div className="flex-1 overflow-auto border border-slate-200 rounded">
          <table className="w-full text-left text-sm min-w-[1200px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 w-14">No.</th>
                <th className="px-3 py-3 w-16">Cat.</th>
                <th className="px-3 py-3 min-w-[200px]">Cause</th>
                <th className="px-3 py-3 min-w-[220px]">Intermediate Consequence</th>
                <th className="px-3 py-3 min-w-[250px]">Scenario Comments</th>
                <th className="px-3 py-3 w-14">PEC</th>
                <th className="px-3 py-3 min-w-[200px]">CMEs / Safeguards</th>
                <th className="px-3 py-3 w-10">C</th>
                <th className="px-3 py-3 w-10">P</th>
                <th className="px-3 py-3 w-24 text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {includedRows.map((row: any, idx: number) => {
                const riskInfo = RISK_DISPLAY[row.risk_level] || { label: row.risk_level, color: 'text-slate-800', bg: 'bg-slate-100' };
                const isExpanded = expandedRows.has(row.number);

                return (
                  <tr key={idx} className={`border-b border-slate-200 hover:bg-slate-50/50 transition-colors ${
                    row.category === 'PAF' ? 'border-l-4 border-l-red-300' :
                    row.category === 'PD/LOR' ? 'border-l-4 border-l-amber-300' :
                    row.category === 'ECR' ? 'border-l-4 border-l-green-300' : ''
                  }`}>
                    <td className="px-3 py-3 text-slate-500 font-medium font-mono text-xs">{row.number}</td>
                    <td className="px-3 py-3">
                      <Badge variant={categoryVariant(row.category)}>
                        {row.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-700 whitespace-normal text-xs leading-relaxed">{row.cause}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-normal text-xs leading-relaxed">{row.intermediate_consequence}</td>
                    <td className="px-3 py-3 whitespace-normal">
                      {row.scenario_comments && (
                        <div>
                          <ul className={`list-disc list-inside space-y-1 text-xs text-slate-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {(row.scenario_comments || []).map((comment: string, ci: number) => (
                              <li key={ci}>{comment}</li>
                            ))}
                          </ul>
                          {row.scenario_comments?.length > 2 && (
                            <button
                              onClick={() => toggleRowExpand(row.number)}
                              className="text-oxy-blue text-xs mt-1 flex items-center gap-0.5 hover:underline"
                            >
                              {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> More</>}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {row.pec === 'YES' ? (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-normal">
                      {row.mitigation_bullets ? (
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600">
                          {row.mitigation_bullets.map((m: string, mi: number) => (
                            <li key={mi}>{m}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-slate-500">{row.cme_names || '—'}</span>
                      )}
                      {row.cme_count !== undefined && (
                        <div className="text-xs text-slate-400 mt-1">({row.cme_count} CME{row.cme_count !== 1 ? 's' : ''})</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-sm">{row.risk_c}</td>
                    <td className="px-3 py-3 text-center font-bold text-sm">{row.risk_p}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${riskInfo.bg} ${riskInfo.color}`}>
                        {riskInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {includedRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400 italic">
                    No included rows generated. Check excluded causes below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Excluded Causes */}
        {excludedCauses.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-sm text-slate-700">
                Excluded Causes ({excludedCauses.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Causes excluded due to pressure ratio &le; 1.1x design pressure</p>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2">Cause</th>
                    <th className="px-4 py-2">Line Type</th>
                    <th className="px-4 py-2">Max Pressure</th>
                    <th className="px-4 py-2">Ratio</th>
                    <th className="px-4 py-2">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {excludedCauses.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 text-sm">
                      <td className="px-4 py-2 text-slate-700">{item.cause}</td>
                      <td className="px-4 py-2 text-slate-500">{item.line_type}</td>
                      <td className="px-4 py-2 text-slate-500">{item.max_pressure} PSIG</td>
                      <td className="px-4 py-2 text-slate-500">{item.ratio}x</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{item.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cross-Referenced Causes */}
        {crossReferencedCauses.length > 0 && (
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
              <h3 className="font-semibold text-sm text-blue-800">
                Cross-Referenced Causes ({crossReferencedCauses.length})
              </h3>
              <p className="text-xs text-blue-600 mt-0.5">Liquid causes redirected to High Level deviation</p>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-50/30 text-blue-700 font-medium border-b border-blue-100">
                  <tr>
                    <th className="px-4 py-2">Cause</th>
                    <th className="px-4 py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {crossReferencedCauses.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-blue-100 text-sm">
                      <td className="px-4 py-2 text-slate-700">{item.cause}</td>
                      <td className="px-4 py-2 text-blue-600 text-xs">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] left-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => { setWorksheetData(null); setStep('deviations'); }}>
            <ArrowLeft size={18} className="mr-2" /> Back to Deviations
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Analysis Complete</span>
          <span>•</span>
          <span className="text-oxy-blue font-semibold">{includedRows.length} rows generated</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setStep('dashboard')}>
            New Analysis
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Print Report
          </Button>
        </div>
      </div>

    </div>
  );
}
