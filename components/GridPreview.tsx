import React from 'react';
import { GridFile } from '../types';
import { FileText, X } from 'lucide-react';

interface GridPreviewProps {
  files: GridFile[];
  onRemove: (id: string) => void;
}

export const GridPreview: React.FC<GridPreviewProps> = ({ files, onRemove }) => {
  // Create an array of 9 slots
  const slots = Array.from({ length: 9 }, (_, index) => {
    return files[index] || null;
  });

  return (
    <div className="w-full max-w-[595px] aspect-[210/297] bg-white shadow-xl border border-slate-200 p-8 mx-auto relative overflow-hidden">
      {/* A4 Paper Watermark/Instruction */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
        <span className="text-9xl font-bold text-slate-900">A4</span>
      </div>

      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full w-full relative z-10">
        {slots.map((file, index) => (
          <div
            key={index}
            className={`
              relative flex flex-col items-center justify-center p-2 rounded border-2 border-dashed transition-all
              ${file 
                ? 'border-indigo-200 bg-indigo-50/50' 
                : 'border-slate-200 bg-slate-50/50 text-slate-300'
              }
            `}
          >
            {file ? (
              <>
                <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                <span className="text-[10px] text-center font-medium text-slate-600 line-clamp-2 break-all px-1">
                  {file.name}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={() => onRemove(file.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 hover:bg-red-50 hover:border-red-200 group"
                  title="Remove PDF"
                >
                  <X className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                </button>
                <div className="absolute top-1 left-2 text-[10px] font-bold text-indigo-200">
                  #{index + 1}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold opacity-20">{index + 1}</span>
                <span className="text-[10px] mt-1 font-medium">Empty</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};