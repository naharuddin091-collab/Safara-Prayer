import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  MessageCircle,
  Package,
  Search,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { formatDateID, formatRupiah, normalizePhone } from '@/utils/formatters';
import { buildTrackOrderWhatsAppUrl } from '@/utils/whatsapp';
import { StatusBadge } from '@/components/StatusBadge';
import { MandalaOrnament } from '@/components/BrandLogo';

const PROGRESS_STEPS: OrderStatus[] = ['Pending', 'Diproses', 'Dikirim', 'Selesai'];

export const TrackOrderPage: React.FC = () => {
  const { orders } = useApp();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const matchedOrders: Order[] = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const lowerQuery = trimmed.toLowerCase();
    const normalizedQueryPhone = normalizePhone(trimmed);

    return orders.filter((order) => {
      const invoiceMatch = order.id.toLowerCase().includes(lowerQuery);
      const phoneMatch =
        normalizedQueryPhone.length >= 4 &&
        normalizePhone(order.whatsapp).includes(normalizedQueryPhone);
      return invoiceMatch || phoneMatch;
    });
  }, [orders, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
  };

  const handleQuickLookup = (invoiceId: string) => {
    setQuery(invoiceId);
    setHasSearched(true);
  };

  return (
    <div className="relative min-h-[82vh] overflow-hidden bg-[#FAF8F5] py-12 sm:py-16">
      <MandalaOrnament className="absolute -right-28 top-10 h-80 w-80 text-[#C5A880] opacity-[0.12]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A6885E] transition-colors hover:text-[#1E1E1E]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="mt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A6885E]">
            Transparansi Pengiriman
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1E1E1E] sm:text-4xl">
            Lacak Status Pesanan Anda
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#5A5550]">
            Masukkan <strong>Nomor Invoice</strong> (contoh: INV-20261124-8A2F) atau{' '}
            <strong>Nomor WhatsApp</strong> yang Anda gunakan saat memesan.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#EADBC8] bg-[#F5EFEB]/90 p-3 shadow-sm"
        >
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A6885E]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) setHasSearched(false);
                }}
                placeholder="Cari No. Invoice atau No. WhatsApp..."
                className="w-full rounded-2xl border border-[#DFCEB9] bg-white py-3 pl-11 pr-4 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E1E1E] px-6 py-3 text-sm font-semibold text-[#FAF8F5] shadow-xs transition-colors hover:bg-slate-800 cursor-pointer"
            >
              <Search className="h-4 w-4 text-[#C5A880]" />
              Lacak Sekarang
            </button>
          </div>

          {/* Contoh Invoice untuk uji coba cepat */}
          {orders.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs text-[#5A5550]">
              <span>Contoh invoice:</span>
              {orders.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleQuickLookup(sample.id)}
                  className="rounded-full border border-[#DFCEB9] bg-[#FAF8F5] px-3 py-1 font-mono text-[11px] font-medium text-[#1E1E1E] transition hover:border-[#C5A880] hover:bg-[#EADBC8]/50 cursor-pointer"
                >
                  {sample.id}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="mt-10 space-y-6">
          {hasSearched && matchedOrders.length === 0 && (
            <div className="rounded-3xl border border-[#EADBC8] bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EFEB] text-[#A6885E]">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-[#1E1E1E]">
                Pesanan Tidak Ditemukan
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-[#5A5550]">
                Kami tidak menemukan pesanan dengan kata kunci{' '}
                <span className="font-semibold text-[#1E1E1E]">"{query}"</span>. Pastikan nomor
                invoice atau nomor WhatsApp sudah sesuai.
              </p>
            </div>
          )}

          {hasSearched &&
            matchedOrders.map((order) => {
              const currentStepIndex = PROGRESS_STEPS.indexOf(order.status);
              const isCancelled = order.status === 'Dibatalkan';

              return (
                <article
                  key={order.id}
                  className="animate-fade-in-up overflow-hidden rounded-3xl border border-[#EADBC8] bg-white shadow-sm"
                >
                  {/* Card Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EADBC8] bg-[#F5EFEB]/80 px-6 py-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A6885E]">
                        Nomor Invoice
                      </p>
                      <p className="font-mono text-base font-bold text-[#1E1E1E]">{order.id}</p>
                    </div>
                    <StatusBadge status={order.status} size="md" />
                  </div>

                  {/* Progress Timeline */}
                  <div className="border-b border-[#F5EFEB] px-6 py-5">
                    {isCancelled ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                        Pesanan ini telah dibatalkan. Silakan hubungi admin WhatsApp jika Anda
                        membutuhkan bantuan lebih lanjut.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {PROGRESS_STEPS.map((step, index) => {
                          const completed = index <= currentStepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center text-center">
                              <div className="flex w-full items-center">
                                <div
                                  className={`h-1 flex-1 rounded-full ${
                                    index === 0
                                      ? 'bg-transparent'
                                      : completed
                                        ? 'bg-[#C5A880]'
                                        : 'bg-[#EADBC8]'
                                  }`}
                                />
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                    completed
                                      ? 'border-[#1E1E1E] bg-[#1E1E1E] text-[#FAF8F5]'
                                      : 'border-[#DFCEB9] bg-[#FAF8F5] text-[#5A5550]'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div
                                  className={`h-1 flex-1 rounded-full ${
                                    index === PROGRESS_STEPS.length - 1
                                      ? 'bg-transparent'
                                      : index < currentStepIndex
                                        ? 'bg-[#C5A880]'
                                        : 'bg-[#EADBC8]'
                                  }`}
                                />
                              </div>
                              <span
                                className={`mt-2 text-[11px] font-semibold ${
                                  completed ? 'text-[#1E1E1E]' : 'text-[#5A5550]/70'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-6 p-6 md:grid-cols-12">
                    <div className="space-y-3 text-sm md:col-span-7">
                      <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-[#A6885E]" />
                        <div>
                          <p className="text-xs text-[#5A5550]">Nama Pemesan & WhatsApp</p>
                          <p className="font-semibold text-[#1E1E1E]">
                            {order.customerName} ({order.whatsapp})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A6885E]" />
                        <div>
                          <p className="text-xs text-[#5A5550]">Alamat Pengiriman</p>
                          <p className="font-medium text-[#1E1E1E]">{order.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#A6885E]" />
                        <div>
                          <p className="text-xs text-[#5A5550]">Waktu Pemesanan</p>
                          <p className="font-medium text-[#1E1E1E]">
                            {formatDateID(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#A6885E]" />
                        <div>
                          <p className="text-xs text-[#5A5550]">Metode Pembayaran</p>
                          <p className="font-medium text-[#1E1E1E]">{order.paymentMethod}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="rounded-xl border border-[#EADBC8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-[#5A5550]">
                          <span className="font-semibold text-[#1E1E1E]">Catatan:</span>{' '}
                          {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Product & Price Box */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#EADBC8] bg-[#FAF8F5] p-5 md:col-span-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#A6885E]">
                          Rincian Produk
                        </p>
                        <h3 className="mt-1.5 font-display text-lg font-semibold text-[#1E1E1E]">
                          {order.productName}
                        </h3>
                        <p className="mt-1 text-xs text-[#5A5550]">
                          {order.quantity} pcs × {formatRupiah(order.unitPrice)}
                        </p>

                        <div className="mt-4 border-t border-[#EADBC8] pt-3">
                          <p className="text-xs text-[#5A5550]">Total Pembayaran</p>
                          <p className="font-display text-2xl font-bold text-[#1E1E1E]">
                            {formatRupiah(order.totalPrice)}
                          </p>
                        </div>
                      </div>

                      <a
                        href={buildTrackOrderWhatsAppUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Hubungi Admin via WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
};
