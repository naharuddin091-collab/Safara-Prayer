import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SparkleStarIcon } from '@/components/BrandLogo';
import { createOrder } from '@/services/orderService';
import type { OrderWithItems, Product } from '@/types/database';
import { buildWhatsAppConfirmationUrl, formatRupiah } from '@/utils/format';

interface OrderFormProps {
  products: Product[];
  selectedQuantities: Record<string, number>;
  onChangeQuantity: (productId: string, nextQty: number) => void;
  onClearCart: () => void;
}

export function OrderForm({
  products,
  selectedQuantities,
  onChangeQuantity,
  onClearCart,
}: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderWithItems | null>(null);

  const selectedItems = useMemo(() => {
    return products
      .map((product) => {
        const quantity = selectedQuantities[product.id] ?? 0;
        return {
          product,
          quantity,
          subtotal: product.price * quantity,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [products, selectedQuantities]);

  const totalItems = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedItems]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (selectedItems.length === 0) {
      setFormError('Silakan pilih minimal satu produk dari koleksi di atas.');
      return;
    }

    if (!customerName.trim() || !customerWhatsapp.trim() || !shippingAddress.trim()) {
      setFormError('Nama lengkap, nomor WhatsApp, dan alamat pengiriman wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const order = await createOrder({
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        shipping_address: shippingAddress,
        notes,
        items: selectedItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      });

      setCreatedOrder(order);
      onClearCart();
      setCustomerName('');
      setCustomerWhatsapp('');
      setShippingAddress('');
      setNotes('');
      toast.success(`Pesanan ${order.invoice_code} berhasil dibuat!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat pesanan.';
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success('Kode pesanan berhasil disalin.');
  }

  if (createdOrder) {
    const itemsSummary = createdOrder.order_items
      .map((item) => {
        const name = item.product?.name ?? 'Produk Safara Prayer';
        return `- ${name} x${item.quantity} (${formatRupiah(item.subtotal)})`;
      })
      .join('\n');

    const waUrl = buildWhatsAppConfirmationUrl({
      orderCode: createdOrder.invoice_code,
      customerName: createdOrder.customer_name,
      totalAmount: createdOrder.total_amount,
      itemsSummary,
      shippingAddress: createdOrder.shipping_address,
    });

    return (
      <section id="pesan" className="border-t border-[#D6C3B3] bg-[#F3E5D8]/60 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1917] text-[#FAF6F2]">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <p className="mt-4 text-[11px] font-medium tracking-[0.24em] uppercase text-[#57534E]">
              Pesanan Tercatat
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#1C1917] sm:text-4xl">
              Terima Kasih, {createdOrder.customer_name}
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Simpan kode pesanan berikut untuk melacak status pengiriman Anda kapan saja.
            </p>

            {/* Order Code Box */}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8] px-5 py-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <span className="block text-[10px] font-medium tracking-[0.2em] uppercase text-[#57534E]">
                  Kode Pesanan
                </span>
                <span className="font-mono text-lg font-bold tracking-wider text-[#1C1917]">
                  {createdOrder.invoice_code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(createdOrder.invoice_code)}
                className="inline-flex items-center gap-2 rounded-full border border-[#1C1917]/30 bg-[#FAF6F2] px-4 py-2 text-xs font-medium text-[#1C1917] transition hover:border-[#1C1917]"
              >
                <Copy className="h-3.5 w-3.5" />
                Salin Kode
              </button>
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-2xl border border-[#D6C3B3]/80 bg-[#FAF6F2] p-5 text-left">
              <div className="flex items-center justify-between border-b border-[#D6C3B3]/60 pb-3 text-xs tracking-[0.14em] uppercase text-[#57534E]">
                <span>Ringkasan Pesanan</span>
                <span>{createdOrder.order_items.length} produk</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {createdOrder.order_items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <span className="text-[#1C1917]">
                      {item.product?.name ?? 'Produk'} × {item.quantity}
                    </span>
                    <span className="font-medium text-[#1C1917]">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-[#D6C3B3]/80 pt-3">
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                  Total Tagihan
                </span>
                <span className="font-display text-2xl font-semibold text-[#1C1917]">
                  {formatRupiah(createdOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
              >
                <MessageCircle className="h-4 w-4" />
                Konfirmasi via WhatsApp
              </a>

              <Link
                to={`/track?code=${encodeURIComponent(createdOrder.invoice_code)}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1C1917] bg-transparent px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#1C1917] transition hover:bg-[#E8D4C3]"
              >
                <Search className="h-4 w-4" />
                Lacak Pesanan
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setCreatedOrder(null)}
              className="mt-6 text-xs font-medium tracking-[0.14em] uppercase text-[#57534E] underline underline-offset-4 transition hover:text-[#1C1917]"
            >
              Buat Pesanan Baru
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pesan" className="border-t border-[#D6C3B3] bg-[#F3E5D8]/65 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center gap-3 text-[#57534E]">
            <span className="h-[1px] w-10 bg-[#D6C3B3]" />
            <SparkleStarIcon className="h-5 w-5 text-[#1C1917]" />
            <span className="h-[1px] w-10 bg-[#D6C3B3]" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium tracking-[0.16em] uppercase text-[#1C1917] sm:text-4xl">
            Formulir Pemesanan
          </h2>
          <p className="mt-3 text-sm text-[#57534E]">
            Lengkapi data pengiriman Anda. Total tagihan dihitung secara otomatis sesuai produk
            yang dipilih.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Left: Customer Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] p-6 sm:p-8 lg:col-span-7"
          >
            <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
              Detail Penerima
            </h3>
            <p className="mt-1 text-xs text-[#57534E]">
              Pastikan nomor WhatsApp aktif untuk kemudahan konfirmasi pengiriman.
            </p>

            {formError && (
              <div className="mt-5 rounded-xl border border-[#DFB9B9] bg-[#FDF2F2] px-4 py-3 text-xs text-[#7F1D1D]">
                {formError}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="customer_name"
                  className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
                >
                  Nama Lengkap *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Aisyah Rahmawati"
                  className="mt-2 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="customer_whatsapp"
                  className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
                >
                  Nomor WhatsApp *
                </label>
                <input
                  id="customer_whatsapp"
                  type="tel"
                  required
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="mt-2 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="shipping_address"
                  className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
                >
                  Alamat Pengiriman Lengkap *
                </label>
                <textarea
                  id="shipping_address"
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kecamatan, kota/kabupaten, kode pos"
                  className="mt-2 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="order_notes"
                  className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
                >
                  Catatan Tambahan <span className="normal-case text-[#57534E]">(Opsional)</span>
                </label>
                <input
                  id="order_notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Request kartu ucapan hadiah / warna alternatif"
                  className="mt-2 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1C1917] px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#FAF6F2] transition hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses Pesanan...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Buat Pesanan Sekarang
                </>
              )}
            </button>
          </form>

          {/* Right: Real-time Order Summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-[#D6C3B3] bg-[#E8D4C3]/75 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#D6C3B3] pb-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Ringkasan Pesanan
                  </h3>
                  <p className="text-xs text-[#57534E]">
                    {totalItems > 0 ? `${totalItems} item dipilih` : 'Belum ada item dipilih'}
                  </p>
                </div>
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.12em] uppercase text-[#57534E] transition hover:text-[#1C1917]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {selectedItems.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-[#57534E]/60" />
                  <p className="mt-3 text-sm text-[#57534E]">
                    Pilih produk dari katalog di atas untuk melihat rincian kalkulasi pesanan Anda.
                  </p>
                  <a
                    href="#katalog"
                    className="mt-4 inline-block text-xs font-medium tracking-[0.16em] uppercase text-[#1C1917] underline underline-offset-4"
                  >
                    Lihat Koleksi
                  </a>
                </div>
              ) : (
                <>
                  <ul className="mt-5 divide-y divide-[#D6C3B3]/80">
                    {selectedItems.map(({ product, quantity, subtotal }) => (
                      <li key={product.id} className="py-4 first:pt-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-lg font-semibold leading-snug text-[#1C1917]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#57534E]">
                              {formatRupiah(product.price)} / pcs
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[#1C1917]">
                            {formatRupiah(subtotal)}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onChangeQuantity(product.id, quantity - 1)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D6C3B3] bg-[#FAF6F2] text-[#1C1917] transition hover:border-[#1C1917]"
                            aria-label={`Kurangi ${product.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-8 text-center text-xs font-semibold text-[#1C1917]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= product.stock}
                            onClick={() =>
                              onChangeQuantity(product.id, Math.min(product.stock, quantity + 1))
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D6C3B3] bg-[#FAF6F2] text-[#1C1917] transition hover:border-[#1C1917] disabled:opacity-40"
                            aria-label={`Tambah ${product.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 space-y-2 border-t border-[#D6C3B3] pt-4">
                    <div className="flex items-center justify-between text-xs text-[#57534E]">
                      <span>Total Item</span>
                      <span>{totalItems} pcs</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#57534E]">
                      <span>Ongkos Kirim</span>
                      <span>Dikonfirmasi via WhatsApp</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-[#D6C3B3]/80 pt-3">
                      <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#1C1917]">
                        Total Estimasi
                      </span>
                      <span className="font-display text-3xl font-semibold text-[#1C1917]">
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
