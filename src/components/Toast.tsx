import React from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        let bg = 'bg-[#16191E]/95 border-emerald-500/40 text-emerald-100';

        if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-indigo-400" />;
          bg = 'bg-[#16191E]/95 border-indigo-500/40 text-indigo-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          bg = 'bg-[#16191E]/95 border-amber-500/40 text-amber-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-400" />;
          bg = 'bg-[#16191E]/95 border-red-500/40 text-red-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md text-xs font-medium ${bg} animate-slideUp`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
