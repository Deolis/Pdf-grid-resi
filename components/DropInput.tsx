import React, { useRef, useState } from 'react';
import { Upload, Plus } from 'lucide-react';

interface DropInputProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DropInput: React.FC<DropInputProps> = ({ onFilesSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type === 'application/pdf');
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      } else {
        alert('Please drop PDF files only.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`
        relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
        flex flex-col items-center justify-center text-center h-32
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 shadow-inner' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      
      <div className="flex items-center space-x-3 pointer-events-none">
        <div className={`
          p-2 rounded-lg transition-colors
          ${isDragging ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
        `}>
          {isDragging ? <Plus className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
        </div>
        <div className="text-left">
          <p className={`font-semibold ${isDragging ? 'text-indigo-700' : 'text-slate-700'}`}>
            {isDragging ? 'Drop PDFs here' : 'Click to upload PDFs'}
          </p>
          <p className="text-xs text-slate-500">
            Select up to 9 files. Only first page used.
          </p>
        </div>
      </div>
    </div>
  );
};