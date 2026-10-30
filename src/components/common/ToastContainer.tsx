import React from 'react';
import { useNovel } from '../../context/NovelContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNovel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-[#2a2d3e] bg-[#0d0e14]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#f472b6] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#fb7185] shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#38bdf8] shrink-0" />}
            <span className="text-gray-200 font-medium leading-tight">{toast.message}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
