export interface HazopItem {
  [key: string]: any;
}

export interface AnalysisParams {
  max_pressure_gas?: string;
  max_pressure_liquid?: string;
  max_liquid_inventory?: string;
  pdlor_dollar_per_bbl?: number;
  pdlor_apc_production_lost?: number;
  [key: string]: any;
}

export interface ExtractionResult {
  major_equipment: any[];
  instruments_causes: any[];
  safety_devices: any[];
}
