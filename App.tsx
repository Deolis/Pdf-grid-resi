import React, { useState, useCallback, useEffect } from 'react';
import { GridPreview } from './components/GridPreview';
import { DropInput } from './components/DropInput';
import { GridFile, ProcessingStatus } from './types';
import { generateGridPdf } from './services/pdfService';
import { Download, Loader2, Trash2, AlertCircle } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<GridFile[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [exportName, setExportName] = useState<string>("grid-layout");
  
  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (files.length >= 9) {
      alert("Maximum 9 files allowed. Please remove some files to add new ones.");
      return;
    }

    const availableSlots = 9 - files.length;
    const filesToAdd = newFiles.slice(0, availableSlots).map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      size: f.size
    }));

    setFiles(prev => [...prev, ...filesToAdd]);
    // Reset generated PDF when files change
    setGeneratedUrl(null);
    setStatus(ProcessingStatus.IDLE);
  }, [files]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setGeneratedUrl(null);
    setStatus(ProcessingStatus.IDLE);
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setGeneratedUrl(null);
    setStatus(ProcessingStatus.IDLE);
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    setStatus(ProcessingStatus.PROCESSING);
    try {
      const pdfBytes = await generateGridPdf(files, {
        margin: 20,
        gap: 15,
        showBorders: true
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
      setStatus(ProcessingStatus.COMPLETE);
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [generatedUrl]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className="bg-white/90 rounded-[1px]"></div>
                <div className="bg-white/90 rounded-[1px]"></div>
                <div className="bg-white/90 rounded-[1px]"></div>
                <div className="bg-white/90 rounded-[1px]"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PDF<span className="text-indigo-600">Grid</span></h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
              {files.length} / 9 Slots Filled
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        
        {/* Left Column: Controls & Input */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-6">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload Files</h2>
            <DropInput 
              onFilesSelected={handleFilesSelected} 
              disabled={files.length >= 9} 
            />
            
            <div className="mt-6 flex flex-col space-y-3">
               <div className="flex items-center justify-between text-sm text-slate-600">
                 <span>Files loaded:</span>
                 <span className="font-semibold">{files.length}</span>
               </div>
               
               {files.length > 0 && (
                 <button 
                   onClick={handleClearAll}
                   className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1 w-max transition-colors"
                 >
                   <Trash2 className="w-4 h-4" />
                   <span>Clear all files</span>
                 </button>
               )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex-grow flex flex-col justify-center">
             <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">Actions</h2>
                
                <div>
                  <label htmlFor="filename" className="block text-sm font-medium text-slate-700 mb-1">
                    Export Filename
                  </label>
                  <div className="flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      id="filename"
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                      className="flex-1 block w-full min-w-0 rounded-l-lg border-slate-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none"
                      placeholder="grid-layout"
                    />
                    <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                      .pdf
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={files.length === 0 || status === ProcessingStatus.PROCESSING}
                  className={`
                    w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2
                    ${files.length === 0 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }
                  `}
                >
                  {status === ProcessingStatus.PROCESSING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-0.5 w-4 h-4 opacity-80">
                         <div className="bg-white rounded-[0.5px]"></div>
                         <div className="bg-white rounded-[0.5px]"></div>
                         <div className="bg-white rounded-[0.5px]"></div>
                         <div className="bg-white rounded-[0.5px]"></div>
                      </div>
                      <span>Generate Grid PDF</span>
                    </>
                  )}
                </button>

                {status === ProcessingStatus.ERROR && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Failed to generate PDF. One of the files might be corrupted.</span>
                  </div>
                )}

                {generatedUrl && (
                  <a
                    href={generatedUrl}
                    download={`${exportName.trim() || 'grid-layout'}.pdf`}
                    className="block w-full"
                  >
                    <button className="w-full py-4 px-6 rounded-xl font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>
                  </a>
                )}
             </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed px-2">
            <p>Note: This tool runs entirely in your browser. Your files are not uploaded to any server. It extracts the first page of each PDF and arranges them into a 3x3 grid on an A4 page.</p>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-slate-200/50 rounded-2xl p-6 lg:p-12 border border-slate-200 flex-grow flex items-center justify-center overflow-auto min-h-[600px]">
             <GridPreview files={files} onRemove={handleRemoveFile} />
          </div>
          <p className="text-center text-sm text-slate-400 mt-4">Preview of layout order (Left-to-Right, Top-to-Bottom)</p>
        </div>

      </main>
    </div>
  );
}