import { useState } from 'react';
import { useHazopStore } from '@/store/useHazopStore';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import axios from 'axios';

export function UploadStep() {
  const { setStep, setExtractedItems, setPdfFilename } = useHazopStore();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // In production, this proxies to Flask
      const response = await axios.post('/api/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setExtractedItems(response.data);
      setPdfFilename(file.name);
      
      // Save analysis params - mock params for now based on app.py
      await axios.post('/api/save-items', {
        ...response.data,
        analysis_params: {}
      });
      
      setStep('deviations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-semibold text-slate-800">Upload P&ID Document</h2>
          <p className="text-slate-500 mt-2">Upload your piping and instrumentation diagram (PDF) to begin the AI-powered HAZOP analysis.</p>
        </div>
        
        <div className="p-8">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer group relative"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            
            <h3 className="text-lg font-medium text-slate-700">
              {file ? file.name : "Click to select a PDF file"}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF files are supported"}
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? 'Analyzing Document...' : 'Start Extraction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
