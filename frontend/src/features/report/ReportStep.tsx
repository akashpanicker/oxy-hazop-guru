import React, { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// ── Simple markdown renderer ─────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
      : part
  );
}

function AnalysisRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key} className="list-disc list-inside space-y-1 ml-2 mb-3">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-sm text-slate-700 leading-relaxed">{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    const key = String(i);

    if (line.startsWith('## ')) {
      flushList(key + 'l');
      elements.push(<h2 key={key} className="text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-200 pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      flushList(key + 'l');
      elements.push(<h3 key={key} className="text-base font-semibold text-oxy-blue mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      flushList(key + 'l');
      elements.push(<h4 key={key} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{line.slice(5)}</h4>);
    } else if (line.match(/^[-*] /)) {
      listBuffer.push(line.slice(2));
    } else if (line.match(/^\d+\. /)) {
      listBuffer.push(line.replace(/^\d+\. /, ''));
    } else if (line.trim() === '') {
      flushList(key + 'l');
      elements.push(<div key={key} className="h-2" />);
    } else if (line.startsWith('|')) {
      flushList(key + 'l');
      elements.push(<p key={key} className="text-xs font-mono text-slate-600 leading-relaxed">{line}</p>);
    } else {
      flushList(key + 'l');
      elements.push(<p key={key} className="text-sm text-slate-700 leading-relaxed mb-1">{renderInline(line)}</p>);
    }
  });

  flushList('end');
  return <div>{elements}</div>;
}

// ── Main component ───────────────────────────────────────────────────────────

export function ReportStep() {
  const {
    setStep,
    deviationAnalyses,
    pdfFilename,
    selectedNodes,
    setDeviationAnalyses,
    setWorksheetData,
  } = useHazopStore();

  const [activeTab, setActiveTab] = useState<string>('');
  const [expandedAll, setExpandedAll] = useState(false);

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

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pt-4 pb-24">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#1A1A1A]">HAZOP Analysis Results</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {pdfFilename || 'P&ID Analysis'} · {deviations.length} deviation{deviations.length !== 1 ? 's' : ''} analyzed
            · Nodes: {selectedNodes.join(', ')}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <Button variant="outline" size="sm" onClick={() => setExpandedAll(v => !v)}>
            {expandedAll ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
            {expandedAll ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-0 no-print">
        {deviations.map(dev => (
          <button
            key={dev}
            onClick={() => setActiveTab(dev)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors
              ${currentTab === dev
                ? 'bg-white border-slate-200 text-oxy-blue border-b-white -mb-px z-10 relative'
                : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
          >
            {dev}
          </button>
        ))}
      </div>

      {/* Analysis panel */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-6 min-h-[400px]">
        {deviations.map(dev => (
          <div key={dev} className={dev === currentTab ? 'block' : 'hidden print:block'}>
            {/* Print-only deviation heading */}
            <h2 className="hidden print:block text-xl font-bold text-slate-900 mb-4 border-b pb-2">{dev}</h2>
            <AnalysisRenderer text={deviationAnalyses[dev]} />
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-oxy-blue">{deviations.length}</div>
          <div className="text-xs text-slate-500 mt-1">Deviations Analyzed</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-oxy-blue">{selectedNodes.length}</div>
          <div className="text-xs text-slate-500 mt-1">Nodes Included</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">claude-opus-4-7</div>
          <div className="text-xs text-slate-500 mt-1">Model Used</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-oxy-blue">
            {Object.values(deviationAnalyses as Record<string, string>).reduce((sum, txt) => sum + txt.split(/\n/).filter((l: string) => l.match(/^##+ /)).length, 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Analysis Sections</div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[800] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] no-print">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Deviations
        </Button>

        <div className="text-sm text-slate-500 font-medium">
          Analysis Complete · <span className="text-oxy-blue font-semibold">{deviations.length} deviation{deviations.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setDeviationAnalyses(null); setStep('dashboard'); }}>
            New Analysis
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
