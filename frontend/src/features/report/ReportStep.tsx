import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, AlertCircle, FlaskConical } from 'lucide-react';

// ── Risk level colours (matches HTML worksheet) ───────────────────────────
const RISK_CELL: Record<string, { bg: string; color: string }> = {
  A: { bg: '#28a745', color: '#fff' },
  B: { bg: '#8bc34a', color: '#fff' },
  C: { bg: '#ffc107', color: '#000' },
  D: { bg: '#ff9800', color: '#fff' },
  E: { bg: '#dc3545', color: '#fff' },
};

// ── Category badge ─────────────────────────────────────────────────────────
function CategoryBadge({ cat }: { cat: 'paf' | 'pdlor' | 'ecr' }) {
  const MAP = {
    paf:   { label: 'PAF',    bg: '#0d6efd', color: '#fff' },
    pdlor: { label: 'PD/LOR', bg: '#ffc107', color: '#000' },
    ecr:   { label: 'ECR',    bg: '#198754', color: '#fff' },
  };
  const s = MAP[cat];
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

// ── Row background colours ─────────────────────────────────────────────────
const ROW_BG = { paf: '#D6EAF8', pdlor: '#FDEBD0', ecr: '#E8F5E9' };

// ── Single worksheet for one deviation result ──────────────────────────────
function WorksheetTable({ result, drawingRef, analysisParams }: {
  result: any;
  drawingRef: string;
  analysisParams: any;
}) {
  const includedCauses: any[]  = result.included_causes  || [];
  const excludedCauses: any[]  = result.excluded_causes  || [];
  const crossRefCauses: any[]  = result.cross_referenced_causes || [];

  const tdStyle: React.CSSProperties = {
    border: '1px solid #ccc', padding: '5px 7px', verticalAlign: 'top', fontSize: 12,
  };
  const thStyle: React.CSSProperties = {
    background: '#343a40', color: '#fff', fontSize: 11, textTransform: 'uppercase',
    border: '1px solid #555', padding: '6px 8px', verticalAlign: 'middle',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
      {/* ── Header info ─────────────────────────────────────────────── */}
      <div style={{ background: '#cfe2ff', border: '1px solid #b6d4fe', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 4 }}>
          <span><strong>Drawing:</strong> {drawingRef}</span>
          <span><strong>Gas Max P:</strong> {analysisParams.max_pressure_gas || '—'} PSIG</span>
          <span><strong>Liquid Max P:</strong> {analysisParams.max_pressure_liquid || '—'} PSIG</span>
          <span><strong>Liquid Inv:</strong> {analysisParams.max_liquid_inventory || '—'} bbl</span>
        </div>
        <div><strong>Design Pressure:</strong> {result.design_pressure || '—'}</div>
        <hr style={{ margin: '6px 0', borderColor: '#b6d4fe' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: '#198754', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{includedCauses.length} Included</span>
          <span style={{ background: '#6c757d', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{excludedCauses.length} Excluded</span>
          <span style={{ background: '#ffc107', color: '#000', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{crossRefCauses.length} Cross-Referenced</span>
        </div>
      </div>

      {/* ── Main worksheet table ─────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 20 }}>
          <thead>
            <tr>
              {['#','Deviation','Cause','Drawing/Ref','Intermediate Consequence','Category',
                'Scenario / Final Impacts','PEC','Mitigation (CME Details)','CME Name','CME #','Risk C','Risk P','Risk Level']
                .map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {includedCauses.length === 0 && (
              <tr>
                <td colSpan={14} style={{ ...tdStyle, textAlign: 'center', color: '#999', fontStyle: 'italic', padding: 24 }}>
                  No included causes generated.
                </td>
              </tr>
            )}
            {includedCauses.map((cause: any, ci: number) => {
              const cats: Array<'paf' | 'pdlor' | 'ecr'> = ['paf', 'pdlor', 'ecr'];
              return cats.map((cat, ri) => {
                const row = cause[cat] || {};
                const isFirst = ri === 0;
                const bg = ROW_BG[cat];
                const riskInfo = RISK_CELL[row.risk_level] || { bg: '#e0e0e0', color: '#000' };

                return (
                  <tr key={`${ci}-${cat}`} style={{ background: bg }}>
                    {/* Rowspanned cells — only on first sub-row */}
                    {isFirst && (
                      <>
                        <td rowSpan={3} style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, background: bg }}>{cause.number}</td>
                        <td rowSpan={3} style={{ ...tdStyle, background: bg }}>{result.deviation}</td>
                        <td rowSpan={3} style={{ ...tdStyle, background: bg }}>{cause.cause}</td>
                        <td rowSpan={3} style={{ ...tdStyle, whiteSpace: 'nowrap', background: bg }}>{drawingRef}</td>
                        <td rowSpan={3} style={{ ...tdStyle, background: bg }}>{cause.intermediate_consequence}</td>
                      </>
                    )}

                    {/* Category badge */}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                      <CategoryBadge cat={cat} />
                    </td>

                    {/* Scenario bullets */}
                    <td style={tdStyle}>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {(row.scenario_bullets || []).map((b: string, i: number) => (
                          <li key={i} style={{ marginBottom: 2 }}>{b}</li>
                        ))}
                      </ul>
                    </td>

                    {/* PEC */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {cat === 'paf' && row.pec
                        ? <span style={{ color: '#dc3545', fontWeight: 700 }}>YES</span>
                        : <span style={{ color: '#999' }}>—</span>}
                    </td>

                    {/* Mitigation */}
                    <td style={tdStyle}>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {(row.mitigation_bullets || []).map((m: string, i: number) => (
                          <li key={i} style={{ marginBottom: 2 }}>{m}</li>
                        ))}
                      </ul>
                    </td>

                    {/* CME Name */}
                    <td style={{ ...tdStyle, fontSize: 11 }}>{row.cme_names || '—'}</td>

                    {/* CME # */}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{row.cme_count ?? '—'}</td>

                    {/* Risk C */}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{row.risk_c ?? '—'}</td>

                    {/* Risk P */}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{row.risk_p ?? '—'}</td>

                    {/* Risk Level */}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, background: riskInfo.bg, color: riskInfo.color }}>
                      {row.risk_level || '—'}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* ── Excluded causes ─────────────────────────────────────────── */}
      {excludedCauses.length > 0 && (
        <div style={{ border: '1px solid #dee2e6', borderRadius: 6, marginBottom: 16 }}>
          <div style={{ background: '#f8f9fa', padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid #dee2e6', fontSize: 12 }}>
            Excluded Causes ({excludedCauses.length})
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['Cause','Line Type','Max Pressure','Ratio','Rationale'].map(h => (
                  <th key={h} style={{ ...thStyle, background: '#6c757d' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excludedCauses.map((item: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{item.cause}</td>
                  <td style={tdStyle}>{item.line_type}</td>
                  <td style={tdStyle}>{item.max_pressure} PSIG</td>
                  <td style={tdStyle}>{item.ratio}x</td>
                  <td style={{ ...tdStyle, fontSize: 11, color: '#555' }}>{item.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Cross-referenced causes ──────────────────────────────────── */}
      {crossRefCauses.length > 0 && (
        <div style={{ border: '1px solid #b6d4fe', borderRadius: 6, marginBottom: 16 }}>
          <div style={{ background: '#cfe2ff', padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid #b6d4fe', fontSize: 12, color: '#084298' }}>
            Cross-Referenced Causes ({crossRefCauses.length})
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['Cause','Note'].map(h => (
                  <th key={h} style={{ ...thStyle, background: '#0d6efd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossRefCauses.map((item: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{item.cause}</td>
                  <td style={{ ...tdStyle, color: '#0d6efd', fontSize: 11 }}>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div style={{ border: '1px solid #dee2e6', borderRadius: 6, marginBottom: 8 }}>
        <div style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid #dee2e6', fontSize: 12 }}>Legend</div>
        <div style={{ padding: 12, display: 'flex', gap: 40, flexWrap: 'wrap', fontSize: 12 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Row Colours</div>
            {(['paf','pdlor','ecr'] as const).map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ width: 16, height: 16, background: ROW_BG[c], border: '1px solid #ccc', display: 'inline-block', borderRadius: 2 }} />
                <span>{c === 'paf' ? 'PAF — People, Assets, Facilities' : c === 'pdlor' ? 'PD/LOR — Process Deviation / Loss of Revenue' : 'ECR — Environmental Cleanup / Remediation'}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Risk Levels</div>
            {(['A','B','C','D','E'] as const).map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ width: 16, height: 16, background: RISK_CELL[r].bg, display: 'inline-block', borderRadius: 2 }} />
                <span>{r} — {['Negligible','Low','Medium','High','Critical'][['A','B','C','D','E'].indexOf(r)]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export function ReportStep() {
  const {
    setStep,
    deviationAnalyses,
    pdfFilename,
    selectedNodes,
    analysisParams,
    setDeviationAnalyses,
    setWorksheetData,
  } = useHazopStore();

  const [activeTab, setActiveTab] = useState('');

  const deviations = deviationAnalyses ? Object.keys(deviationAnalyses) : [];
  const currentTab = activeTab || deviations[0] || '';

  if (!deviationAnalyses || deviations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-[#9CA3AF]" />
        <h2 className="text-xl font-semibold text-[#1A1A1A]">No analysis data</h2>
        <p className="text-[#6B7280]">Please complete the deviation selection step first.</p>
        <Button onClick={() => setStep('deviations')} className="mt-4">
          <ArrowLeft size={18} className="mr-2" /> Back to Deviations
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    setDeviationAnalyses(null);
    setWorksheetData(null);
    setStep('deviations');
  };

  const drawingRef = pdfFilename || `Node${selectedNodes.join(',')}`;

  return (
    <div className="flex flex-col gap-4 max-w-[1500px] mx-auto w-full pt-4 pb-24">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* Page header */}
      <div className="flex justify-between items-end flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">HAZOP Worksheet</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {drawingRef} · {deviations.length} deviation{deviations.length !== 1 ? 's' : ''} · Nodes: {selectedNodes.join(', ')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
          <Printer size={16} className="mr-2" /> Print
        </Button>
      </div>

      {/* Deviation tabs */}
      {deviations.length > 1 && (
        <div className="flex gap-2 flex-wrap border-b border-slate-200 no-print">
          {deviations.map(dev => (
            <button
              key={dev}
              onClick={() => setActiveTab(dev)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors
                ${currentTab === dev
                  ? 'bg-white border-slate-200 text-[#00539B] -mb-px relative z-10'
                  : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
            >
              {dev}
            </button>
          ))}
        </div>
      )}

      {/* Worksheet panels */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-5">
        {deviations.map(dev => (
          <div key={dev} className={deviations.length === 1 || dev === currentTab ? 'block' : 'hidden print:block'}>
            {/* Print spacer between deviations */}
            <div className="hidden print:block" style={{ pageBreakBefore: 'auto', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>HAZOP Worksheet — {dev}</h2>
            </div>
            <WorksheetTable
              result={deviationAnalyses[dev]}
              drawingRef={drawingRef}
              analysisParams={analysisParams}
            />
          </div>
        ))}
      </div>

      {/* Footer credit */}
      <p className="text-[10px] text-slate-400 text-center no-print">Generated by HAZOP P&amp;ID Analysis Tool</p>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] no-print">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Deviations
        </Button>

        <div className="text-sm text-slate-500 font-medium">
          Analysis Complete · <span className="text-[#00539B] font-semibold">{deviations.length} deviation{deviations.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setDeviationAnalyses(null); setStep('dashboard'); }}>
            New Analysis
          </Button>
          <Button variant="outline" onClick={() => setStep('sensitivity')} className="flex items-center gap-2">
            <FlaskConical size={16} /> Sensitivity Analysis
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
