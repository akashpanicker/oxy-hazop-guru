import { create } from 'zustand'
import type { AnalysisParams, ExtractionResult } from '@/types/hazop';

interface HazopState {
  step: 'login' | 'dashboard' | 'facility' | 'equipment' | 'deviations' | 'report';
  setStep: (step: HazopState['step']) => void;

  // Loading & error
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;

  // Node selection
  selectedNodes: string[];
  setSelectedNodes: (nodes: string[]) => void;

  // Extraction results (per-node and combined)
  extractionResults: Record<string, ExtractionResult>;
  setExtractionResult: (nodeId: string, result: ExtractionResult) => void;
  clearExtractionResults: () => void;

  // Combined/edited extraction data used downstream
  extractedItems: ExtractionResult | null;
  setExtractedItems: (items: ExtractionResult | null) => void;

  pdfFilename: string | null;
  setPdfFilename: (filename: string) => void;

  selectedDeviations: string[];
  setSelectedDeviations: (deviations: string[]) => void;

  otherDeviation: string;
  setOtherDeviation: (val: string) => void;

  causes: Record<string, string[]> | null;
  setCauses: (causes: Record<string, string[]> | null) => void;

  confirmedCauses: Record<string, string[]> | null;
  setConfirmedCauses: (causes: Record<string, string[]> | null) => void;

  worksheetData: any | null;
  setWorksheetData: (data: any) => void;

  deviationAnalyses: Record<string, any> | null;
  setDeviationAnalyses: (analyses: Record<string, any> | null) => void;

  analysisParams: AnalysisParams;
  setAnalysisParams: (params: AnalysisParams) => void;

  reset: () => void;
}

const initialState = {
  step: 'login' as const,
  isLoading: false,
  loadingMessage: '',
  error: null as string | null,
  selectedNodes: [] as string[],
  extractionResults: {} as Record<string, ExtractionResult>,
  extractedItems: null as ExtractionResult | null,
  pdfFilename: null as string | null,
  selectedDeviations: [] as string[],
  otherDeviation: '',
  causes: null as Record<string, string[]> | null,
  confirmedCauses: null as Record<string, string[]> | null,
  worksheetData: null as any,
  analysisParams: {} as AnalysisParams,
  deviationAnalyses: null as Record<string, string> | null,
};

export const useHazopStore = create<HazopState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  // Loading & error
  setLoading: (isLoading, message = '') => set({ isLoading, loadingMessage: message }),
  setError: (error) => set({ error }),

  // Node selection
  setSelectedNodes: (selectedNodes) => set({ selectedNodes }),

  // Per-node extraction results
  setExtractionResult: (nodeId, result) =>
    set((state) => ({
      extractionResults: { ...state.extractionResults, [nodeId]: result },
    })),
  clearExtractionResults: () => set({ extractionResults: {} }),

  // Combined extraction data
  setExtractedItems: (extractedItems) => set({ extractedItems }),

  setPdfFilename: (pdfFilename) => set({ pdfFilename }),

  setSelectedDeviations: (selectedDeviations) => set({ selectedDeviations }),

  setOtherDeviation: (otherDeviation) => set({ otherDeviation }),

  setCauses: (causes) => set({ causes }),

  setConfirmedCauses: (confirmedCauses) => set({ confirmedCauses }),

  setWorksheetData: (worksheetData) => set({ worksheetData }),

  setAnalysisParams: (analysisParams) => set({ analysisParams }),

  setDeviationAnalyses: (deviationAnalyses) => set({ deviationAnalyses }),

  reset: () => set(initialState),
}));

/**
 * Merge extraction results from multiple nodes into a single view.
 * Concatenates all major_equipment, instruments_causes, and safety_devices arrays.
 */
export function mergeExtractionResults(
  results: Record<string, ExtractionResult>
): ExtractionResult {
  const merged: ExtractionResult = {
    major_equipment: [],
    instruments_causes: [],
    safety_devices: [],
  };

  for (const [nodeId, result] of Object.entries(results)) {
    if (result.major_equipment) {
      merged.major_equipment.push(
        ...result.major_equipment.map((item: any) => ({ ...item, _nodeId: nodeId }))
      );
    }
    if (result.instruments_causes) {
      merged.instruments_causes.push(
        ...result.instruments_causes.map((item: any) => ({ ...item, _nodeId: nodeId }))
      );
    }
    if (result.safety_devices) {
      merged.safety_devices.push(
        ...result.safety_devices.map((item: any) => ({ ...item, _nodeId: nodeId }))
      );
    }
  }

  return merged;
}
