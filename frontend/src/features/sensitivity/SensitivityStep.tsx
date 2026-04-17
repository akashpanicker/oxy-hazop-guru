import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft, Play, Info, BarChart3, Loader2, ChevronDown,
  CheckCircle2, XCircle, TrendingUp, FileDown, BookmarkPlus,
} from 'lucide-react';

// ── Risk matrix: RISK_MATRIX[probability][consequence] ─────────────────────
const RISK_MATRIX: Record<number, Record<number, string>> = {
  1: { 1: 'A', 2: 'A', 3: 'A', 4: 'B', 5: 'C' },
  2: { 1: 'A', 2: 'A', 3: 'B', 4: 'C', 5: 'D' },
  3: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'D' },
  4: { 1: 'B', 2: 'C', 3: 'D', 4: 'D', 5: 'E' },
  5: { 1: 'C', 2: 'D', 3: 'D', 4: 'E', 5: 'E' },
};

const RISK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: '#D1FAE5', text: '#065F46', label: 'Negligible' },
  B: { bg: '#DBEAFE', text: '#1E40AF', label: 'Low' },
  C: { bg: '#FEF3C7', text: '#92400E', label: 'Medium' },
  D: { bg: '#FED7AA', text: '#9A3412', label: 'Medium-High' },
  E: { bg: '#FEE2E2', text: '#991B1B', label: 'Critical' },
};

const RISK_ORDER: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

// Node info mirrors DIAGRAM_NODES in FacilityStep
const NODE_INFO: Record<string, { number: string; name: string }> = {
  '11': { number: 'Node 11', name: 'Test Header and Test Separator' },
  '15': { number: 'Node 15', name: 'IP Oil Production Header and IP Production Separator' },
  '28': { number: 'Node 28', name: 'FGC 3rd Stage Compressor' },
};

function getNodeLabel(nodeId: string): string {
  const info = NODE_INFO[nodeId];
  return info ? `${info.number} — ${info.name}` : `Node ${nodeId}`;
}

function getDeviceTag(device: any): string {
  if (typeof device === 'string') return device;
  return device.tag || device.tag_number || device.instrument_tag || device.name || device.id || 'Unknown';
}

function getDeviceDescription(device: any): string {
  if (typeof device === 'string') return '';
  return device.description || device.function || device.type || '';
}

// Abbreviate deviation name for table row header
function shortDeviation(dev: string): string {
  const d = dev.toLowerCase();
  if (d.includes('high pressure') || d.includes('hi pressure')) return 'HP';
  if (d.includes('low pressure') || d.includes('lo pressure')) return 'LP';
  if (d.includes('high level')) return 'HL';
  if (d.includes('low level')) return 'LL';
  if (d.includes('high flow')) return 'HF';
  if (d.includes('low flow') || d.includes('no flow')) return 'NF';
  if (d.includes('reverse flow')) return 'RF';
  if (d.includes('high temp')) return 'HT';
  if (d.includes('low temp')) return 'LT';
  if (d.includes('high liquid')) return 'HL';
  if (d.includes('leak') || d.includes('rupture')) return 'LR';
  return dev.replace(/[aeiou]/gi, '').slice(0, 3).toUpperCase();
}

// ── Data types ─────────────────────────────────────────────────────────────
interface RiskRow {
  label: 'C/P' | 'S/I';        // Consequence/Probability  or  Safety/Impact
  consequence: number;
  probability: number;
  currentLevel: string;
  newLevel: string;
  changed: boolean;
}

interface DeviationGroup {
  deviationShort: string;
  deviationFull: string;
  rows: RiskRow[];
}

interface AnalysisResult {
  failedBarrier: string;
  groups: DeviationGroup[];
  barriers: string[];              // remaining active barriers
  explanation: string;
}

// ── Build analysis result from store data ──────────────────────────────────
function buildAnalysis(
  deviationAnalyses: Record<string, any>,
  deviceTag: string,
  allDevices: string[],
): AnalysisResult {
  const groups: DeviationGroup[] = [];

  for (const [dev, analysis] of Object.entries(deviationAnalyses || {})) {
    const causes: any[] = analysis?.included_causes || [];
    if (causes.length === 0) continue;

    // Find worst PAF (C/P) and worst ECR (S/I) across all causes
    let bestPaf = { c: 3, p: 2, level: 'C' };
    let bestEcr = { c: 3, p: 2, level: 'C' };

    for (const cause of causes) {
      const paf = cause?.paf || {};
      const ecr = cause?.ecr || cause?.pdlor || {};

      const pafC = Number(paf.risk_c) || 0;
      const pafP = Number(paf.risk_p) || 0;
      const pafL = paf.risk_level || '';
      if (pafL && pafC > 0 && pafP > 0) {
        if ((RISK_ORDER[pafL] || 0) > (RISK_ORDER[bestPaf.level] || 0)) {
          bestPaf = { c: pafC, p: pafP, level: pafL };
        }
      }

      const ecrC = Number(ecr.risk_c) || 0;
      const ecrP = Number(ecr.risk_p) || 0;
      const ecrL = ecr.risk_level || '';
      if (ecrL && ecrC > 0 && ecrP > 0) {
        if ((RISK_ORDER[ecrL] || 0) > (RISK_ORDER[bestEcr.level] || 0)) {
          bestEcr = { c: ecrC, p: ecrP, level: ecrL };
        }
      }
    }

    // Simulate failure: S/I (ECR) probability increases by 1; C/P (PAF) unchanged
    const newEcrP = Math.min(5, bestEcr.p + 1);
    const newEcrLevel = RISK_MATRIX[newEcrP]?.[bestEcr.c] || bestEcr.level;
    const ecrChanged = newEcrLevel !== bestEcr.level;

    const rows: RiskRow[] = [
      {
        label: 'C/P',
        consequence: bestPaf.c,
        probability: bestPaf.p,
        currentLevel: bestPaf.level,
        newLevel: bestPaf.level,   // PAF unchanged by device failure
        changed: false,
      },
      {
        label: 'S/I',
        consequence: bestEcr.c,
        probability: bestEcr.p,
        currentLevel: bestEcr.level,
        newLevel: newEcrLevel,
        changed: ecrChanged,
      },
    ];

    groups.push({
      deviationShort: shortDeviation(dev),
      deviationFull: dev,
      rows,
    });
  }

  // Fallback if no real data
  if (groups.length === 0) {
    groups.push({
      deviationShort: 'HP',
      deviationFull: 'High Pressure',
      rows: [
        { label: 'C/P', consequence: 5, probability: 1, currentLevel: 'C', newLevel: 'C', changed: false },
        { label: 'S/I', consequence: 5, probability: 2, currentLevel: 'D', newLevel: 'E', changed: true },
      ],
    });
  }

  const changedGroups = groups.filter(g => g.rows.some(r => r.changed));
  const maxNewLevel = groups
    .flatMap(g => g.rows)
    .reduce((max, r) => (RISK_ORDER[r.newLevel] || 0) > (RISK_ORDER[max] || 0) ? r.newLevel : max, 'A');
  const maxCurrentLevel = groups
    .flatMap(g => g.rows)
    .reduce((max, r) => (RISK_ORDER[r.currentLevel] || 0) > (RISK_ORDER[max] || 0) ? r.currentLevel : max, 'A');

  const explanation =
    `With ${deviceTag} failed, one critical safety layer is removed. ` +
    `${changedGroups.length > 0
      ? `The Safety/Impact (S/I) risk level increases for ${changedGroups.map(g => g.deviationFull).join(', ')}. `
      : ''}` +
    `Overall risk changes from ${maxCurrentLevel} (${RISK_COLORS[maxCurrentLevel]?.label || ''}) ` +
    `to ${maxNewLevel} (${RISK_COLORS[maxNewLevel]?.label || ''}) due to loss of an independent protection layer.`;

  return {
    failedBarrier: deviceTag,
    groups,
    barriers: allDevices.filter(t => t !== deviceTag),
    explanation,
  };
}

// ── Custom Select ──────────────────────────────────────────────────────────
interface SelectOption { value: string; label: string; sublabel?: string }

function Select({
  id, value, onChange, options, placeholder, disabled, ariaLabel,
}: {
  id: string; value: string; onChange: (v: string) => void; options: SelectOption[];
  placeholder: string; disabled?: boolean; ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`w-full h-[56px] border-2 rounded-[8px] text-[16px] px-4 pr-10 appearance-none bg-white transition-all outline-none
          ${disabled
            ? 'border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed bg-[#F9FAFB]'
            : 'border-[#E5E7EB] text-[#1A1A1A] cursor-pointer hover:border-[#00539B] focus:border-[#00539B] focus:shadow-[0_0_0_3px_rgba(0,83,155,0.1)]'}
          ${value ? 'text-[#00539B]' : ''}
        `}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}{opt.sublabel ? ` — ${opt.sublabel}` : ''}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${disabled ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}
      />
    </div>
  );
}

// ── Inline risk level chip ─────────────────────────────────────────────────
function RiskChip({ level, changed }: { level: string; changed?: boolean }) {
  const colors = RISK_COLORS[level] || { bg: '#F3F4F6', text: '#374151', label: '' };
  return (
    <span
      className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-[5px] text-[13px] font-bold tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
      title={colors.label}
    >
      {level}
      {changed && <TrendingUp size={11} className="ml-0.5" style={{ color: '#DC2626' }} />}
    </span>
  );
}

// ── Barrier pill ───────────────────────────────────────────────────────────
function BarrierPill({ tag, failed }: { tag: string; failed?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border
        ${failed
          ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] line-through'
          : 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'}`}
    >
      {failed ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
      {tag}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function SensitivityStep() {
  const { setStep, selectedNodes, extractionResults, deviationAnalyses } = useHazopStore();

  const [selectedNode, setSelectedNode] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isDeviceFailed, setIsDeviceFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedToReport, setSavedToReport] = useState(false);

  // Node dropdown options
  const nodeOptions: SelectOption[] = selectedNodes.map(id => ({
    value: id,
    label: getNodeLabel(id),
  }));

  // Safety device options for the selected node
  const rawDevices: any[] = selectedNode
    ? (extractionResults[selectedNode]?.safety_devices || [])
    : [];

  const deviceOptions: SelectOption[] = rawDevices.map((d, i) => ({
    value: `${i}:${getDeviceTag(d)}`,
    label: getDeviceTag(d),
    sublabel: getDeviceDescription(d),
  }));

  const canRunAnalysis = Boolean(selectedNode && selectedDevice && isDeviceFailed);

  function handleNodeChange(nodeId: string) {
    setSelectedNode(nodeId);
    setSelectedDevice('');
    setResult(null);
  }

  function handleRunAnalysis() {
    if (!canRunAnalysis) return;
    setIsLoading(true);
    setResult(null);

    const deviceTag = selectedDevice.split(':').slice(1).join(':');
    const allDeviceTags = rawDevices.map(d => getDeviceTag(d));

    setTimeout(() => {
      setResult(buildAnalysis(deviationAnalyses || {}, deviceTag, allDeviceTags));
      setIsLoading(false);
    }, 1400);
  }

  function handleRunAnother() {
    setResult(null);
    setSavedToReport(false);
  }

  const deviceTagDisplay = selectedDevice ? selectedDevice.split(':').slice(1).join(':') : '';
  const nodeLabel = selectedNode ? getNodeLabel(selectedNode) : '';

  return (
    <div className="py-6 max-w-[1040px] mx-auto">

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1A1A1A] leading-tight">Sensitivity Analysis</h1>
        <p className="text-[16px] text-[#6B7280] mt-1">Test how risk changes when safety devices fail</p>
      </div>

      {/* ── Configure panel ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8 mb-6 max-w-[800px]">
        <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-6">Configure Sensitivity Test</h2>

        {/* Step 1 */}
        <div className="mb-6">
          <label htmlFor="node-select" className="block text-[16px] font-medium text-[#1A1A1A] mb-2">
            1. Select Equipment / Node
          </label>
          <Select
            id="node-select"
            value={selectedNode}
            onChange={handleNodeChange}
            options={nodeOptions}
            placeholder="Choose a node..."
            ariaLabel="Select equipment for sensitivity test"
          />
        </div>

        {/* Step 2 */}
        <div className="mb-6">
          <label htmlFor="device-select" className="block text-[16px] font-medium text-[#1A1A1A] mb-1">
            2. Select Safety Device to Test
          </label>
          <p className="text-[14px] text-[#6B7280] mb-2">Choose which safety device failure to simulate</p>
          <Select
            id="device-select"
            value={selectedDevice}
            onChange={setSelectedDevice}
            options={deviceOptions}
            placeholder={selectedNode ? 'Choose a safety device...' : 'Select a node first'}
            disabled={!selectedNode || deviceOptions.length === 0}
            ariaLabel="Select safety device to test failure"
          />
          {selectedNode && deviceOptions.length === 0 && (
            <p className="text-[13px] text-[#9CA3AF] mt-2 italic">No safety devices found for this node.</p>
          )}
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                ${isDeviceFailed ? 'bg-[#00539B] border-[#00539B]' : 'border-[#D1D5DB] bg-white'}
                ${!selectedDevice ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
              role="checkbox"
              aria-checked={isDeviceFailed}
              aria-label="Mark this device as failed"
              tabIndex={selectedDevice ? 0 : -1}
              onClick={() => selectedDevice && setIsDeviceFailed(v => !v)}
              onKeyDown={e => {
                if ((e.key === ' ' || e.key === 'Enter') && selectedDevice) {
                  e.preventDefault();
                  setIsDeviceFailed(v => !v);
                }
              }}
            >
              {isDeviceFailed && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <span className={`text-[16px] font-medium ${!selectedDevice ? 'text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
                Mark this device as <span className="text-[#DC2626] font-semibold">FAILED</span>
              </span>
              <p className="text-[13px] text-[#6B7280] italic mt-1">
                This simulates what happens if the selected safety device is unavailable
              </p>
            </div>
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={handleRunAnalysis}
          disabled={!canRunAnalysis || isLoading}
          aria-label="Run sensitivity analysis"
          className={`inline-flex items-center gap-2 px-8 py-[14px] text-[16px] font-semibold rounded-[8px] min-w-[200px] transition-all duration-150
            ${canRunAnalysis && !isLoading
              ? 'bg-[#00539B] text-white hover:bg-[#003D73] hover:-translate-y-[1px] hover:shadow-md cursor-pointer'
              : 'bg-[#9CA3AF] text-white cursor-not-allowed'}
          `}
        >
          {isLoading
            ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
            : <><Play size={18} /> Run Analysis</>
          }
        </button>
      </div>

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-12 flex flex-col items-center gap-4 max-w-[800px]">
          <Loader2 size={48} className="text-[#00539B] animate-spin" />
          <p className="text-[18px] font-semibold text-[#1A1A1A]">Analyzing Risk Scenarios...</p>
          <p className="text-[14px] text-[#6B7280]">
            Testing {deviceTagDisplay} failure impact on {nodeLabel}
          </p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !result && (
        <div
          className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] flex flex-col items-center justify-center text-center py-20 px-8 max-w-[800px]"
          aria-live="polite"
        >
          <BarChart3 size={64} className="text-[#9CA3AF] mb-4" />
          <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Run Your First Sensitivity Test</h3>
          <p className="text-[14px] text-[#6B7280] max-w-[360px] leading-relaxed">
            Select an equipment node and safety device above to see how risk levels change when protection fails.
          </p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {!isLoading && result && (
        <div className="animate-fade-in-down" role="region" aria-label="Sensitivity analysis results" aria-live="polite">
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8">

            {/* Results header */}
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-1">Results</h2>
            <p className="text-[13px] text-[#6B7280] mb-6">
              Scenario: <span className="font-medium text-[#DC2626]">{result.failedBarrier} failed</span>
              {' '}on <span className="font-medium text-[#1A1A1A]">{nodeLabel}</span>
            </p>

            {/* ── Risk comparison table ────────────────────────────────── */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-[14px]" style={{ borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                  <tr className="bg-[#F9FAFB]">
                    <th className="border border-[#E5E7EB] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] w-[180px]">
                      Deviation / Device
                    </th>
                    <th className="border border-[#E5E7EB] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Current Risk
                      <span className="block text-[10px] font-normal normal-case text-[#9CA3AF] mt-0.5">All Devices Operational</span>
                    </th>
                    <th className="border border-[#E5E7EB] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      New Risk
                      <span className="block text-[10px] font-normal normal-case text-[#DC2626] mt-0.5">{result.failedBarrier} Failed</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.groups.map((group, gi) => (
                    group.rows.map((row, ri) => (
                      <tr key={`${gi}-${ri}`} className="hover:bg-[#FAFAFA] transition-colors">
                        {/* Left cell — rowspan over C/P and S/I rows */}
                        {ri === 0 && (
                          <td
                            rowSpan={group.rows.length}
                            className="border border-[#E5E7EB] px-4 py-3 align-middle"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-[20px] font-bold text-[#1A1A1A] leading-none">
                                {group.deviationShort}
                              </span>
                              <span className="text-[12px] font-semibold text-[#00539B] leading-tight">
                                {result.failedBarrier}
                              </span>
                              <span className="text-[11px] text-[#DC2626] font-medium uppercase tracking-wide leading-tight">
                                Failed
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Current risk */}
                        <td className="border border-[#E5E7EB] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#6B7280] w-[28px] shrink-0">{row.label}:</span>
                            <RiskChip level={row.currentLevel} />
                            <span className="text-[11px] text-[#9CA3AF]">
                              C={row.consequence} P={row.probability}
                            </span>
                          </div>
                        </td>

                        {/* New risk */}
                        <td className="border border-[#E5E7EB] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#6B7280] w-[28px] shrink-0">{row.label}:</span>
                            <RiskChip level={row.newLevel} changed={row.changed} />
                            {row.changed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]">
                                <TrendingUp size={12} />
                                {row.currentLevel} → {row.newLevel}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#9CA3AF]">No change</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>

            {/* Column key */}
            <div className="flex flex-wrap gap-4 mb-6 px-1">
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <span className="font-semibold text-[#1A1A1A]">C/P</span> = Consequence / Probability (Process Asset Factor)
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <span className="font-semibold text-[#1A1A1A]">S/I</span> = Safety / Impact (Personnel &amp; Environmental Risk)
              </div>
            </div>

            {/* Safety barriers summary */}
            <div className="border border-[#E5E7EB] rounded-[8px] p-4 mb-6">
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Safety Barriers After Failure</p>
              <div className="flex flex-wrap gap-2">
                {result.barriers.map(tag => <BarrierPill key={tag} tag={tag} />)}
                <BarrierPill tag={result.failedBarrier} failed />
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-5 mb-6">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-[#00539B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">What Changed?</h4>
                  <p className="text-[13px] text-[#4A4A4A] leading-relaxed mb-3">{result.explanation}</p>
                  <ul className="flex flex-col gap-1.5">
                    {[
                      { label: 'Impact', value: `S/I risk increases for ${result.groups.filter(g => g.rows.some(r => r.changed)).length} deviation(s)` },
                      { label: 'Reason', value: 'Loss of independent protection layer (IPL)' },
                      { label: 'Remaining barriers', value: `${result.barriers.length} active device${result.barriers.length !== 1 ? 's' : ''} still operational` },
                      { label: 'Recommendation', value: `Prioritize repair / replacement of ${result.failedBarrier}` },
                    ].map(item => (
                      <li key={item.label} className="flex items-start gap-2 text-[13px] text-[#1A1A1A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00539B] shrink-0 mt-[5px]" />
                        <span><span className="font-semibold">{item.label}:</span> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-5 border-t border-[#E5E7EB]">
              <button
                onClick={handleRunAnother}
                className="inline-flex items-center gap-2 px-6 py-3 text-[15px] font-medium text-[#00539B] bg-white border-2 border-[#00539B] rounded-[8px] hover:bg-[#F0F9FF] transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> Run Another Test
              </button>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-3 text-[15px] font-medium text-[#6B7280] bg-white border-2 border-[#D1D5DB] rounded-[8px] hover:bg-[#F9FAFB] transition-colors cursor-pointer no-print"
                >
                  <FileDown size={16} /> Export as PDF
                </button>
                <button
                  onClick={() => setSavedToReport(true)}
                  disabled={savedToReport}
                  className={`inline-flex items-center gap-2 px-5 py-3 text-[15px] font-medium text-white rounded-[8px] transition-colors
                    ${savedToReport ? 'bg-[#2D7D46] cursor-default' : 'bg-[#00539B] hover:bg-[#003D73] cursor-pointer'}`}
                >
                  {savedToReport
                    ? <><CheckCircle2 size={16} /> Saved</>
                    : <><BookmarkPlus size={16} /> Save to Report</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-6 lg:px-12 z-[800] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] no-print">
        <Button variant="outline" onClick={() => setStep('report')} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Report
        </Button>
        <span className="text-[13px] text-[#9CA3AF] font-medium hidden sm:block">
          Sensitivity Analysis · Optional Step
        </span>
        <div className="w-[160px]" />
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.35s ease both; }
      `}</style>
    </div>
  );
}
