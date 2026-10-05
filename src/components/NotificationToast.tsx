'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-lg shadow-xl border text-xs animate-in slide-in-from-bottom-5 fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-slate-700 text-white'
                : toast.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-100'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="shrink-0 mr-2.5 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-slate-100">{toast.title}</div>
              {toast.description && (
                <div className="text-slate-300 text-[11px] mt-0.5">{toast.description}</div>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
