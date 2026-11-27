import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, MessageCircle, X } from 'lucide-react';
import { Order } from '@/types';
import { formatDateID, formatRupiah } from '@/utils/formatters';
import { buildOrderWhatsAppUrl } from '@/utils/whatsapp';
import { SPMonogram } from '@/components/BrandLogo';
import { StatusBadge } from '@/components/StatusBadge';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const whatsappUrl = buildOrderWhatsAppUrl(order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="animate-fade-in-up relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#EADBC8] bg-[#FAF8F5] shadow-2xl">
        {/* Top Header */}
        <div className="relative border-b border-[#EADBC8] bg-[#F5EFEB] px-6 py-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-[#5A5550] transition-colors hover:bg-[#EADBC8]/60 hover:text-[#1E1E1E] cursor-pointer"
            aria-label="Tutup modal invoice"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 id="invoice-modal-title" className="mt-3 font-display text-2xl font-semibold text-[#1E1E1E]">
            Pesanan Berhasil Dibuat
          </h3>
          <p className="mt-1 text-xs text-[#5A5550]">
            Simpan nomor invoice Anda untuk melacak status pesanan kapan saja.
          </p>

          {/* Invoice Number Pill */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#C5A880] bg-[#FAF8F5] px-4 py-2">
            <SPMonogram className="h-5 w-5 text-[#1E1E1E]" />
            <span className="font-mono text-sm font-bold tracking-wider text-[#1E1E1E]">
              {order.id}
            </span>
            <button
              type="button"
              onClick={handleCopyInvoice}
              className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#F5EFEB] px-2.5 py-1 text-[11px] font-medium text-[#1E1E1E] transition-colors hover:bg-[#EADBC8] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Salin
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4 px-6 py-5 text-sm">
          <div className="flex items-center justify-between border-b border-[#EADBC8]/70 pb-3">
            <span className="text-[#5A5550]">Status Pesanan</span>
            <StatusBadge status={order.status} size="md" />
          </div>

          <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-[#EADBC8] bg-[#F5EFEB]/70 p-4">
            <div className="flex justify-between gap-4">
              <span className="text-[#5A5550]">Tanggal</span>
              <span className="text-right font-medium text-[#1E1E1E]">
                {formatDateID(order.createdAt)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#5A5550]">Pemesan</span>
              <span className="text-right font-medium text-[#1E1E1E]">{order.customerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#5A5550]">WhatsApp</span>
              <span className="text-right font-medium text-[#1E1E1E]">{order.whatsapp}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-[#5A5550]">Alamat</span>
              <span className="text-right font-medium text-[#1E1E1E]">{order.address}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADBC8] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A6885E]">
              Rincian Produk
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#1E1E1E]">{order.productName}</p>
                <p className="text-xs text-[#5A5550]">
                  {order.quantity} pcs × {formatRupiah(order.unitPrice)}
                </p>
              </div>
              <p className="font-semibold text-[#1E1E1E]">{formatRupiah(order.totalPrice)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#EADBC8] pt-3">
              <span className="text-xs text-[#5A5550]">Metode Pembayaran</span>
              <span className="text-xs font-semibold text-[#1E1E1E]">{order.paymentMethod}</span>
            </div>
            {order.notes && (
              <div className="mt-2 border-t border-dashed border-[#EADBC8] pt-2 text-xs text-[#5A5550]">
                <span className="font-medium text-[#1E1E1E]">Catatan:</span> {order.notes}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-[#EADBC8] pt-3">
              <span className="font-semibold text-[#1E1E1E]">Total Pembayaran</span>
              <span className="font-display text-xl font-bold text-[#1E1E1E]">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800"
            >
              <MessageCircle className="h-4 w-4" />
              Kirim Konfirmasi ke WhatsApp Admin
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#EADBC8] bg-[#F5EFEB] px-5 py-2.5 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#EADBC8]/70 cursor-pointer"
            >
              Selesai & Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
