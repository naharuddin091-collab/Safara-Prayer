import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="animate-fade-in-up relative w-full max-w-md rounded-3xl border border-[#EADBC8] bg-[#FAF8F5] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#5A5550] transition-colors hover:bg-[#EADBC8]/60 hover:text-[#1E1E1E] cursor-pointer"
          aria-label="Tutup dialog konfirmasi"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="font-display text-xl font-semibold text-[#1E1E1E]"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A5550]">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#EADBC8] bg-[#F5EFEB] px-5 py-2 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#EADBC8]/70 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
