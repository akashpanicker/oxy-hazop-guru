import { useHazopStore } from '@/store/useHazopStore';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export function DeviationsStep() {
  const { 
    extractedItems, 
    selectedDeviations, 
    setSelectedDeviations,
    otherDeviation,
    setOtherDeviation,
    setStep,
    setCauses
  } = useHazopStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const DEVIATION_OPTIONS = ['High Pressure', 'Low Pressure', 'High Flow', 'Low Flow', 'High Temperature', 'Low Temperature'];

  const handleToggleDeviation = (dev: string) => {
    setSelectedDeviations(
      selectedDeviations.includes(dev)
        ? selectedDeviations.filter(d => d !== dev)
        : [...selectedDeviations, dev]
    );
  };

  const generateCauses = async () => {
    setIsLoading(true);
    try {
      const payload = {
        deviations: selectedDeviations,
        other_text: otherDeviation
      };
      
      // Save deviations first
      await axios.post('/api/submit-deviations', payload);
      
      // Request causes generation from Claude
      const response = await axios.post('/api/generate-causes', payload);
      setCauses(response.data.causes);
      
      setStep('causes');
    } catch (error) {
      console.error(error);
      alert('Failed to generate causes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Extracted Node Definition</h2>
        <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm border border-slate-200">
           {/* Preview of extracted items could go here */}
           <p className="text-slate-600">Successfully extracted {extractedItems?.instruments_causes?.length || 0} instruments.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-semibold text-slate-800">Select Deviations</h2>
          <p className="text-slate-500 mt-2">Which deviations would you like to analyze for this node?</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEVIATION_OPTIONS.map(dev => (
              <label 
                key={dev} 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedDeviations.includes(dev) ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedDeviations.includes(dev)}
                  onChange={() => handleToggleDeviation(dev)}
                />
                <span className="font-medium text-slate-700">{dev}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Other Deviation (Optional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="e.g. Reverse Flow, No Flow"
              value={otherDeviation}
              onChange={(e) => setOtherDeviation(e.target.value)}
            />
          </div>

          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep('upload')}
              className="text-slate-600 hover:text-slate-900 px-4 py-2 font-medium flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={generateCauses}
              disabled={isLoading || (selectedDeviations.length === 0 && !otherDeviation)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Generate Causes'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
