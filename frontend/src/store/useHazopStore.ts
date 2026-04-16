import { create } from 'zustand'

export interface HazopItem {
  [key: string]: any; // To be strictly typed based on Anthropic API
}

export interface AnalysisParams {
  pdlor_dollar_per_bbl?: number;
  pdlor_apc_production_lost?: number;
  [key: string]: any;
}

interface HazopState {
  step: 'upload' | 'deviations' | 'causes' | 'worksheet';
  setStep: (step: 'upload' | 'deviations' | 'causes' | 'worksheet') => void;
  
  extractedItems: any | null;
  setExtractedItems: (items: any) => void;
  
  pdfFilename: string | null;
  setPdfFilename: (filename: string) => void;
  
  selectedDeviations: string[];
  setSelectedDeviations: (deviations: string[]) => void;
  
  otherDeviation: string;
  setOtherDeviation: (val: string) => void;
  
  causes: any | null;
  setCauses: (causes: any) => void;
  
  confirmedCauses: any | null;
  setConfirmedCauses: (causes: any) => void;
  
  worksheetData: any | null;
  setWorksheetData: (data: any) => void;
  
  analysisParams: AnalysisParams;
  setAnalysisParams: (params: AnalysisParams) => void;
  
  reset: () => void;
}

export const useHazopStore = create<HazopState>((set) => ({
  step: 'upload',
  setStep: (step) => set({ step }),
  
  extractedItems: null,
  setExtractedItems: (extractedItems) => set({ extractedItems }),
  
  pdfFilename: null,
  setPdfFilename: (pdfFilename) => set({ pdfFilename }),
  
  selectedDeviations: [],
  setSelectedDeviations: (selectedDeviations) => set({ selectedDeviations }),
  
  otherDeviation: '',
  setOtherDeviation: (otherDeviation) => set({ otherDeviation }),
  
  causes: null,
  setCauses: (causes) => set({ causes }),
  
  confirmedCauses: null,
  setConfirmedCauses: (confirmedCauses) => set({ confirmedCauses }),
  
  worksheetData: null,
  setWorksheetData: (worksheetData) => set({ worksheetData }),
  
  analysisParams: {},
  setAnalysisParams: (analysisParams) => set({ analysisParams }),

  reset: () => set({
    step: 'upload',
    extractedItems: null,
    pdfFilename: null,
    selectedDeviations: [],
    otherDeviation: '',
    causes: null,
    confirmedCauses: null,
    worksheetData: null,
    analysisParams: {}
  })
}));
