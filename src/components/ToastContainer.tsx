import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const styleMap = {
          success: {
            container: 'border-emerald-200 bg-[#FAF8F5] text-[#1E1E1E]',
            icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />,
          },
          error: {
            container: 'border-rose-200 bg-[#FAF8F5] text-[#1E1E1E]',
            icon: <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />,
          },
          info: {
            container: 'border-[#C5A880] bg-[#FAF8F5] text-[#1E1E1E]',
            icon: <Info className="h-5 w-5 shrink-0 text-[#A6885E]" />,
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`animate-fade-in-up pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${styleMap.container}`}
          >
            {styleMap.icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1E1E1E]">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#5A5550]">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 text-[#5A5550] transition-colors hover:bg-[#EADBC8]/60 hover:text-[#1E1E1E] cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
