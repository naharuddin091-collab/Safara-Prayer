import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Search,
  XCircle,
} from 'lucide-react';
import { DomeIcon, OrnamentalCorner } from '@/components/BrandLogo';
import { getOrderByInvoice } from '@/services/orderService';
import type { OrderWithItems } from '@/types/database';
import {
  buildWhatsAppConfirmationUrl,
  formatDateTime,
  formatRupiah,
  ORDER_STATUS_META,
  ORDER_TIMELINE_STEPS,
} from '@/utils/format';

export function OrderTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';

  const [queryCode, setQueryCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState<OrderWithItems | null>(null);

  async function runSearch(codeToSearch: string) {
    const cleaned = codeToSearch.trim().toUpperCase();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const result = await getOrderByInvoice(cleaned);
      if (!result) {
        setOrder(null);
        setNotFound(true);
      } else {
        setOrder(result);
      }
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Gagal melacak pesanan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) {
      setQueryCode(initialCode);
      runSearch(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = queryCode.trim().toUpperCase();
    if (!cleaned) return;
    setSearchParams({ code: cleaned });
    runSearch(cleaned);
  }

  const currentStepIndex = order ? ORDER_TIMELINE_STEPS.indexOf(order.status) : -1;

  return (
    <main className="relative overflow-hidden py-14 sm:py-20">
      <OrnamentalCorner className="absolute -right-8 -top-8 h-56 w-56 rotate-90 text-[#D6C3B3]" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-3">
            <span className="h-[1px] w-10 bg-[#D6C3B3]" />
            <DomeIcon className="h-6 w-6 text-[#1C1917]" />
            <span className="h-[1px] w-10 bg-[#D6C3B3]" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium tracking-[0.16em] uppercase text-[#1C1917] sm:text-4xl">
            Lacak Pesanan
          </h1>
          <p className="mt-2 text-sm text-[#57534E]">
            Masukkan kode pesanan Anda (contoh:{' '}
            <span className="font-mono font-medium text-[#1C1917]">SFR-20261126-XXXX</span>) untuk
            melihat status terkini.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/70 p-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
            <input
              type="text"
              value={queryCode}
              onChange={(e) => setQueryCode(e.target.value)}
              placeholder="Masukkan kode pesanan (misal: SFR-20261126-AB12)"
              className="w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] py-3 pl-11 pr-4 font-mono text-sm uppercase text-[#1C1917] placeholder:font-sans placeholder:normal-case placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !queryCode.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-7 py-3 text-xs font-medium tracking-[0.18em] uppercase text-[#FAF6F2] transition hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Lacak
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#DFB9B9] bg-[#FDF2F2] p-4 text-sm text-[#7F1D1D]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Not Found */}
        {notFound && !loading && (
          <div className="mt-8 rounded-3xl border border-[#D6C3B3] bg-[#F3E5D8]/45 p-10 text-center">
            <Package className="mx-auto h-9 w-9 text-[#57534E]" />
            <h2 className="mt-3 font-display text-2xl font-semibold text-[#1C1917]">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Kami tidak menemukan pesanan dengan kode{' '}
              <span className="font-mono font-semibold text-[#1C1917]">
                {queryCode.trim().toUpperCase()}
              </span>
              . Periksa kembali penulisan kode pesanan Anda.
            </p>
          </div>
        )}

        {/* Order Result Card */}
        {order && !loading && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] shadow-sm">
            {/* Top Banner */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#D6C3B3] bg-[#F3E5D8]/80 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
              <div>
                <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#57534E]">
                  Kode Pesanan
                </p>
                <p className="mt-0.5 font-mono text-xl font-bold tracking-wider text-[#1C1917]">
                  {order.invoice_code}
                </p>
                <p className="mt-1 text-xs text-[#57534E]">
                  Dibuat pada {formatDateTime(order.created_at)}
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${ORDER_STATUS_META[order.status].badgeClass}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${ORDER_STATUS_META[order.status].dotClass}`}
                />
                {ORDER_STATUS_META[order.status].label}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {/* Status Timeline or Cancelled Notice */}
              {order.status === 'cancelled' ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#DFB9B9] bg-[#FDF2F2] p-4 text-sm text-[#7F1D1D]">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Pesanan Dibatalkan</p>
                    <p className="mt-0.5 text-xs">
                      Silakan hubungi tim Safara Prayer melalui WhatsApp apabila Anda memerlukan
                      bantuan lebih lanjut.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#57534E]">
                    Perjalanan Pesanan
                  </p>
                  <p className="mt-1 text-sm text-[#1C1917]">
                    {ORDER_STATUS_META[order.status].description}
                  </p>

                  <ol className="mt-6 grid gap-4 sm:grid-cols-5">
                    {ORDER_TIMELINE_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <li
                          key={step}
                          className={`relative flex items-center gap-3 rounded-2xl border p-3 sm:flex-col sm:text-center ${
                            isCurrent
                              ? 'border-[#1C1917] bg-[#F3E5D8]'
                              : isDone
                                ? 'border-[#D6C3B3] bg-[#FAF6F2]'
                                : 'border-[#D6C3B3]/50 bg-[#FAF6F2]/50 opacity-55'
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isDone
                                ? 'bg-[#1C1917] text-[#FAF6F2]'
                                : 'border border-[#D6C3B3] bg-[#FAF6F2] text-[#57534E]'
                            }`}
                          >
                            {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          <span className="text-xs font-medium leading-tight text-[#1C1917]">
                            {ORDER_STATUS_META[step].label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Customer & Shipping Info */}
              <div className="mt-8 grid gap-5 border-t border-[#D6C3B3]/80 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#57534E]">
                    Penerima
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-[#1C1917]">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-[#57534E]">{order.customer_whatsapp}</p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-[#57534E]">
                    <MapPin className="h-3.5 w-3.5" />
                    Alamat Pengiriman
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1C1917]">
                    {order.shipping_address}
                  </p>
                  {order.notes && (
                    <p className="mt-1.5 text-xs italic text-[#57534E]">
                      Catatan: &ldquo;{order.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-7 border-t border-[#D6C3B3]/80 pt-6">
                <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#57534E]">
                  Rincian Produk
                </p>
                <div className="mt-3 divide-y divide-[#D6C3B3]/60 rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/35 px-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3.5 text-sm"
                    >
                      <div>
                        <p className="font-medium text-[#1C1917]">
                          {item.product?.name ?? 'Produk Safara Prayer'}
                        </p>
                        <p className="text-xs text-[#57534E]">
                          {item.quantity} × {formatRupiah(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold text-[#1C1917]">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#57534E]">
                    Total Pembayaran
                  </span>
                  <span className="font-display text-3xl font-semibold text-[#1C1917]">
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Follow-Up */}
              <div className="mt-7 flex justify-end border-t border-[#D6C3B3]/80 pt-5">
                <a
                  href={buildWhatsAppConfirmationUrl({
                    orderCode: order.invoice_code,
                    customerName: order.customer_name,
                    totalAmount: order.total_amount,
                    itemsSummary: order.order_items
                      .map(
                        (item) =>
                          `- ${item.product?.name ?? 'Produk'} x${item.quantity} (${formatRupiah(item.subtotal)})`
                      )
                      .join('\n'),
                    shippingAddress: order.shipping_address,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
