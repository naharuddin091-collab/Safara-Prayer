import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  ORDER_STATUSES,
  Order,
  OrderStatus,
  PAYMENT_METHODS,
  PaymentMethod,
  Product,
} from '@/types';
import { formatRupiah } from '@/utils/formatters';

export interface OrderModalSubmitPayload {
  customerName: string;
  whatsapp: string;
  address: string;
  productId: string;
  quantity: number;
  notes: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

interface OrderModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialOrder?: Order | null;
  products: Product[];
  onClose: () => void;
  onSubmit: (payload: OrderModalSubmitPayload) => boolean;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  open,
  mode,
  initialOrder,
  products,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer Bank BCA/BSI');
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrorMsg('');
    if (mode === 'edit' && initialOrder) {
      setCustomerName(initialOrder.customerName);
      setWhatsapp(initialOrder.whatsapp);
      setAddress(initialOrder.address);
      setProductId(initialOrder.productId);
      setQuantity(initialOrder.quantity);
      setPaymentMethod(initialOrder.paymentMethod);
      setStatus(initialOrder.status);
      setNotes(initialOrder.notes);
    } else {
      const defaultProduct = products.find((p) => p.isAvailable && p.stock > 0) ?? products[0];
      setCustomerName('');
      setWhatsapp('');
      setAddress('');
      setProductId(defaultProduct?.id ?? '');
      setQuantity(1);
      setPaymentMethod('Transfer Bank BCA/BSI');
      setStatus('Pending');
      setNotes('');
    }
  }, [open, mode, initialOrder, products]);

  if (!open) return null;

  const selectedProduct = products.find((p) => p.id === productId);
  const estimatedTotal = (selectedProduct?.price ?? 0) * Math.max(1, quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !whatsapp.trim() || !address.trim()) {
      setErrorMsg('Nama pelanggan, nomor WhatsApp, dan alamat pengiriman wajib diisi.');
      return;
    }

    if (!productId) {
      setErrorMsg('Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (quantity < 1) {
      setErrorMsg('Jumlah pesanan minimal 1 pcs.');
      return;
    }

    const ok = onSubmit({
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      productId,
      quantity,
      notes: notes.trim(),
      paymentMethod,
      status,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="animate-fade-in-up relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#EADBC8] bg-[#FAF8F5] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EADBC8] bg-[#F5EFEB] px-6 py-4">
          <div>
            <h3 id="order-modal-title" className="font-display text-xl font-semibold text-[#1E1E1E]">
              {mode === 'create' ? 'Tambah Pesanan Manual' : `Edit Pesanan ${initialOrder?.id ?? ''}`}
            </h3>
            <p className="text-xs text-[#5A5550]">
              {mode === 'create'
                ? 'Catat pesanan yang masuk dari WhatsApp, Instagram, atau offline.'
                : 'Perbarui detail pesanan pelanggan dan penyesuaian stok otomatis.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#5A5550] transition-colors hover:bg-[#EADBC8]/70 hover:text-[#1E1E1E] cursor-pointer"
            aria-label="Tutup modal pesanan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {errorMsg && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Nama Lengkap Pemesan *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Siti Khadijah"
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0812xxxxxxxx"
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
              Alamat Lengkap Pengiriman *
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jalan, nomor rumah, kecamatan, kota, kode pos..."
              required
              className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Pilih Produk *
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatRupiah(product.price)} (Stok: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Jumlah *
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Status Pesanan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
              Catatan Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Permintaan warna, kartu ucapan, atau instruksi pengiriman..."
              className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
            />
          </div>

          {/* Live Total Summary */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EADBC8] bg-[#F5EFEB] px-4 py-3.5">
            <div>
              <p className="text-xs text-[#5A5550]">Estimasi Total Pembayaran</p>
              <p className="text-[11px] text-[#A6885E]">
                {selectedProduct
                  ? `${quantity} pcs × ${formatRupiah(selectedProduct.price)}`
                  : 'Pilih produk'}
              </p>
            </div>
            <p className="font-display text-xl font-bold text-[#1E1E1E]">
              {formatRupiah(estimatedTotal)}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#EADBC8] bg-[#F5EFEB] px-5 py-2.5 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#EADBC8]/70 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#1E1E1E] px-6 py-2.5 text-sm font-semibold text-[#FAF8F5] shadow-sm transition-colors hover:bg-slate-800 cursor-pointer"
            >
              {mode === 'create' ? 'Simpan Pesanan' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
