import React, { useState, useEffect } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import type { ExtractionResult } from '@/types/hazop';
import { Button } from '@/components/ui/Button';
import { Settings, Wrench, Shield, Trash2, Plus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export function EquipmentStep() {
  const {
    setStep,
    extractedItems,
    setExtractedItems,
    analysisParams,
    setAnalysisParams,
    pdfFilename,
    setLoading,
    setError,
    error,
  } = useHazopStore();

  const [expandedSections, setExpandedSections] = useState({
    major: true,
    instruments: true,
    safety: true,
  });

  // Local editable copies of the extraction data
  const [majorEquipment, setMajorEquipment] = useState<any[]>([]);
  const [instrumentsCauses, setInstrumentsCauses] = useState<any[]>([]);
  const [safetyDevices, setSafetyDevices] = useState<any[]>([]);

  // Analysis parameters
  const [localParams, setLocalParams] = useState({
    max_pressure_gas: analysisParams.max_pressure_gas || '',
    max_pressure_liquid: analysisParams.max_pressure_liquid || '',
    max_liquid_inventory: analysisParams.max_liquid_inventory || '',
  });

  // Initialize local state from store
  useEffect(() => {
    if (extractedItems) {
      setMajorEquipment(extractedItems.major_equipment || []);
      setInstrumentsCauses(extractedItems.instruments_causes || []);
      setSafetyDevices(extractedItems.safety_devices || []);
    }
  }, [extractedItems]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Cell editing
  const updateMajorEquipmentField = (index: number, field: string, value: string) => {
    setMajorEquipment(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateInstrumentField = (index: number, field: string, value: string) => {
    setInstrumentsCauses(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateSafetyField = (index: number, field: string, value: string) => {
    setSafetyDevices(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Add/Remove rows
  const addMajorEquipment = () => {
    setMajorEquipment(prev => [...prev, {
      tag: '', name: '', type: '', upstream_equipment: 'N/A', downstream_equipment: 'N/A',
      operating_parameters: '', design_parameters: '', size: '',
    }]);
  };

  const removeMajorEquipment = (index: number) => {
    setMajorEquipment(prev => prev.filter((_, i) => i !== index));
  };

  const addInstrument = () => {
    setInstrumentsCauses(prev => [...prev, {
      tag: '', type: '', description: '', associated_equipment: '',
      position: '', line_tag: '', line_service: '', destination_or_source: '', fail_position: '',
    }]);
  };

  const removeInstrument = (index: number) => {
    setInstrumentsCauses(prev => prev.filter((_, i) => i !== index));
  };

  const addSafetyDevice = () => {
    setSafetyDevices(prev => [...prev, {
      tag: '', type: '', description: '', associated_equipment: '',
      setpoint: '', destination: '', line_service: '',
    }]);
  };

  const removeSafetyDevice = (index: number) => {
    setSafetyDevices(prev => prev.filter((_, i) => i !== index));
  };

  // Save and continue
  const handleContinue = async () => {
    // Validate analysis parameters
    if (!localParams.max_pressure_gas || !localParams.max_pressure_liquid || !localParams.max_liquid_inventory) {
      setError('Please fill in all analysis parameters (Max Pressure Gas, Max Pressure Liquid, Max Liquid Inventory)');
      return;
    }

    setError(null);

    // Build the edited extraction data
    const editedItems: ExtractionResult = {
      major_equipment: majorEquipment,
      instruments_causes: instrumentsCauses,
      safety_devices: safetyDevices,
    };

    // Save to store
    setExtractedItems(editedItems);
    setAnalysisParams({
      ...localParams,
      pdlor_dollar_per_bbl: analysisParams.pdlor_dollar_per_bbl,
      pdlor_apc_production_lost: analysisParams.pdlor_apc_production_lost,
    });

    // Sync to backend session
    try {
      const savePayload = {
        ...editedItems,
        analysis_params: localParams,
      };

      await fetch('/api/save-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload),
      });
    } catch (err) {
      console.warn('Failed to sync to backend session:', err);
    }

    setStep('deviations');
  };

  // Empty state
  if (!extractedItems && majorEquipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-[#9CA3AF]" />
        <h2 className="text-xl font-semibold text-[#1A1A1A]">No extraction data found</h2>
        <p className="text-[#6B7280]">Please go back and extract equipment from a node first.</p>
        <Button onClick={() => setStep('facility')} className="mt-4">
          <ArrowLeft size={18} className="mr-2" />
          Back to Node Selection
        </Button>
      </div>
    );
  }

  const EditableCell = ({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) => (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-oxy-blue focus:outline-none focus:ring-0 px-0 py-1 text-sm text-slate-700 transition-colors ${className}`}
    />
  );

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="mb-1">
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">
          Review Extracted Equipment
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-1">
          Source: {pdfFilename || 'P&ID'} — Review, edit, or add items before proceeding
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-col bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          <div className="p-4 flex flex-col gap-4">

            {/* ── Major Equipment Section ── */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => toggleSection('major')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.major ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-[#1A1A1A]">Major Equipment</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">
                    {majorEquipment.length}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.major ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.major ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-0 border-t border-slate-200 bg-white">
                    {majorEquipment.length === 0 ? (
                      <p className="text-sm text-slate-500 italic p-6">No major equipment extracted.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 w-10"></th>
                              <th className="px-4 py-3">Tag</th>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Operating Params</th>
                              <th className="px-4 py-3">Design Params</th>
                              <th className="px-4 py-3">Size</th>
                            </tr>
                          </thead>
                          <tbody>
                            {majorEquipment.map((item, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                  <button onClick={() => removeMajorEquipment(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                                <td className="px-4 py-2"><EditableCell value={item.tag} onChange={v => updateMajorEquipmentField(i, 'tag', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.name} onChange={v => updateMajorEquipmentField(i, 'name', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.type} onChange={v => updateMajorEquipmentField(i, 'type', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.operating_parameters} onChange={v => updateMajorEquipmentField(i, 'operating_parameters', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.design_parameters} onChange={v => updateMajorEquipmentField(i, 'design_parameters', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.size} onChange={v => updateMajorEquipmentField(i, 'size', v)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="p-4 border-t border-slate-200">
                      <button
                        onClick={addMajorEquipment}
                        className="text-oxy-blue text-sm font-medium flex items-center gap-1.5 hover:underline"
                      >
                        <Plus size={14} /> Add Equipment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Instruments/Causes Section ── */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => toggleSection('instruments')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.instruments ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Wrench size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-[#1A1A1A]">Instruments / Causes</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">
                    {instrumentsCauses.length}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.instruments ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.instruments ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-0 border-t border-slate-200 bg-white">
                    {instrumentsCauses.length === 0 ? (
                      <p className="text-sm text-slate-500 italic p-6">No instruments extracted.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 w-10"></th>
                              <th className="px-4 py-3">Tag</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3 min-w-[200px]">Description</th>
                              <th className="px-4 py-3">Position</th>
                              <th className="px-4 py-3">Line Service</th>
                              <th className="px-4 py-3">Fail Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {instrumentsCauses.map((item, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                  <button onClick={() => removeInstrument(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                                <td className="px-4 py-2 font-medium text-[#1A1A1A]"><EditableCell value={item.tag} onChange={v => updateInstrumentField(i, 'tag', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.type} onChange={v => updateInstrumentField(i, 'type', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.description} onChange={v => updateInstrumentField(i, 'description', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.position} onChange={v => updateInstrumentField(i, 'position', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.line_service} onChange={v => updateInstrumentField(i, 'line_service', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.fail_position} onChange={v => updateInstrumentField(i, 'fail_position', v)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="p-4 border-t border-slate-200">
                      <button
                        onClick={addInstrument}
                        className="text-oxy-blue text-sm font-medium flex items-center gap-1.5 hover:underline"
                      >
                        <Plus size={14} /> Add Instrument
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Safety Devices Section ── */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('safety')}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 border-none outline-none
                  ${expandedSections.safety ? 'bg-[#EBF5FF]' : 'bg-[#F9FAFB] hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-oxy-blue" />
                  <span className="font-semibold text-[#1A1A1A]">Safety Devices</span>
                  <div className="bg-oxy-blue text-white rounded-full min-w-[28px] h-[28px] px-2 flex items-center justify-center text-[14px] font-bold">
                    {safetyDevices.length}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-300 ${expandedSections.safety ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedSections.safety ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <div className="p-0 border-t border-slate-200 bg-white">
                    {safetyDevices.length === 0 ? (
                      <p className="text-sm text-slate-500 italic p-6">No safety devices extracted.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 w-10"></th>
                              <th className="px-4 py-3">Tag</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3 min-w-[200px]">Description</th>
                              <th className="px-4 py-3">Setpoint</th>
                              <th className="px-4 py-3">Destination</th>
                              <th className="px-4 py-3">Line Service</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safetyDevices.map((item, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-2 py-2">
                                  <button onClick={() => removeSafetyDevice(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                                <td className="px-4 py-2 font-medium text-[#1A1A1A]"><EditableCell value={item.tag} onChange={v => updateSafetyField(i, 'tag', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.type} onChange={v => updateSafetyField(i, 'type', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.description} onChange={v => updateSafetyField(i, 'description', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.setpoint} onChange={v => updateSafetyField(i, 'setpoint', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.destination} onChange={v => updateSafetyField(i, 'destination', v)} /></td>
                                <td className="px-4 py-2"><EditableCell value={item.line_service} onChange={v => updateSafetyField(i, 'line_service', v)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="p-4 border-t border-slate-200">
                      <button
                        onClick={addSafetyDevice}
                        className="text-oxy-blue text-sm font-medium flex items-center gap-1.5 hover:underline"
                      >
                        <Plus size={14} /> Add Safety Device
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Parameters */}
          <div className="bg-slate-50 border-t border-slate-200 p-5 shrink-0 mt-auto">
            <h3 className="font-semibold text-sm text-[#1A1A1A] mb-4 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-oxy-blue"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Analysis Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Max Pressure — Gas (PSIG) *</label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-oxy-blue/20 focus:border-oxy-blue transition-all ${
                    error && !localParams.max_pressure_gas ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 5000"
                  value={localParams.max_pressure_gas}
                  onChange={(e) => setLocalParams(p => ({ ...p, max_pressure_gas: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Max Pressure — Liquid (PSIG) *</label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-oxy-blue/20 focus:border-oxy-blue transition-all ${
                    error && !localParams.max_pressure_liquid ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 1000"
                  value={localParams.max_pressure_liquid}
                  onChange={(e) => setLocalParams(p => ({ ...p, max_pressure_liquid: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Max Liquid Inventory (bbl) *</label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-oxy-blue/20 focus:border-oxy-blue transition-all ${
                    error && !localParams.max_liquid_inventory ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 400"
                  value={localParams.max_liquid_inventory}
                  onChange={(e) => setLocalParams(p => ({ ...p, max_liquid_inventory: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#E5E7EB] flex items-center justify-between px-12 z-[1000] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setStep('facility')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Step 2 of 4</span>
          <span>•</span>
          <span>Equipment Review</span>
          <span>•</span>
          <span className="text-oxy-blue font-semibold">
            {majorEquipment.length} equip · {instrumentsCauses.length} instruments · {safetyDevices.length} safety
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleContinue} className="flex items-center gap-2">
            Confirm Equipment
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
