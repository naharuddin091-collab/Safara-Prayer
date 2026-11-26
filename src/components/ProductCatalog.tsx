import { AlertCircle, Check, Minus, Plus, RefreshCw, ShoppingBag } from 'lucide-react';
import { LotusIcon } from '@/components/BrandLogo';
import type { Product } from '@/types/database';
import { formatRupiah } from '@/utils/format';

interface ProductCatalogProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedQuantities: Record<string, number>;
  onChangeQuantity: (productId: string, nextQty: number) => void;
  onRetry: () => void;
}

const FALLBACK_IMAGES = [
  '/images/product-taupe.jpg',
  '/images/product-ivory.jpg',
  '/images/product-charcoal.jpg',
];

export function ProductCatalog({
  products,
  loading,
  error,
  selectedQuantities,
  onChangeQuantity,
  onRetry,
}: ProductCatalogProps) {
  return (
    <section id="katalog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      {/* Section Header */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center justify-center gap-3 text-[#57534E]">
          <span className="h-[1px] w-10 bg-[#D6C3B3]" />
          <LotusIcon className="h-5 w-5 text-[#1C1917]" />
          <span className="h-[1px] w-10 bg-[#D6C3B3]" />
        </div>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-[0.16em] uppercase text-[#1C1917] sm:text-4xl">
          Koleksi Pilihan
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
          Setiap perlengkapan ibadah dirancang dengan material lembut, ringan dilipat, dan nuansa
          warna hangat yang menenangkan. Pilih produk yang Anda inginkan untuk langsung memesan.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-[#D6C3B3]/80 bg-[#FAF6F2]"
            >
              <div className="aspect-[4/3] animate-pulse bg-[#E8D4C3]/70" />
              <div className="space-y-3 p-6">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#E8D4C3]/80" />
                <div className="h-3 w-full animate-pulse rounded bg-[#F3E5D8]" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-[#F3E5D8]" />
                <div className="pt-3">
                  <div className="h-10 w-full animate-pulse rounded-full bg-[#E8D4C3]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/60 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[#1C1917]" />
          <h3 className="mt-3 font-display text-xl font-semibold text-[#1C1917]">
            Katalog Belum Dapat Dimuat
          </h3>
          <p className="mt-2 text-sm text-[#57534E]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Muat Ulang
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/50 p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-[#57534E]" />
          <h3 className="mt-3 font-display text-xl font-semibold text-[#1C1917]">
            Belum Ada Produk Aktif
          </h3>
          <p className="mt-1.5 text-sm text-[#57534E]">
            Silakan tambahkan atau aktifkan produk melalui Panel Admin terlebih dahulu.
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const qty = selectedQuantities[product.id] ?? 0;
            const outOfStock = product.stock <= 0;
            const fallbackImg = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

            return (
              <article
                key={product.id}
                className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                  qty > 0
                    ? 'border-[#1C1917] bg-[#F3E5D8]/65 shadow-sm'
                    : 'border-[#D6C3B3] bg-[#FAF6F2] hover:border-[#1C1917]/50 hover:shadow-sm'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E8D4C3]/60">
                  <img
                    src={product.image_url || fallbackImg}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + fallbackImg) {
                        target.src = fallbackImg;
                      }
                    }}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  />

                  {/* Stock Badge */}
                  <div className="absolute left-3.5 top-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.14em] uppercase backdrop-blur-sm ${
                        outOfStock
                          ? 'border-[#D6C3B3] bg-[#FAF6F2]/90 text-[#7F1D1D]'
                          : 'border-[#D6C3B3]/80 bg-[#FAF6F2]/90 text-[#1C1917]'
                      }`}
                    >
                      {outOfStock ? 'Stok Habis' : `Stok ${product.stock}`}
                    </span>
                  </div>

                  {/* Selected Badge */}
                  {qty > 0 && (
                    <div className="absolute right-3.5 top-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1C1917] px-3 py-1 text-[10px] font-medium tracking-[0.12em] uppercase text-[#FAF6F2]">
                        <Check className="h-3 w-3" />
                        Dipilih ({qty})
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Body */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-semibold leading-snug text-[#1C1917]">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-[#57534E] sm:text-sm">
                    {product.description ||
                      'Perlengkapan ibadah perjalanan berbahan lembut, praktis, dan elegan.'}
                  </p>

                  {/* Price & Quick Action */}
                  <div className="mt-6 border-t border-[#D6C3B3]/80 pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] tracking-[0.14em] uppercase text-[#57534E]">
                        Harga
                      </span>
                      <span className="font-display text-2xl font-semibold text-[#1C1917]">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    <div className="mt-4">
                      {outOfStock ? (
                        <button
                          type="button"
                          disabled
                          className="w-full cursor-not-allowed rounded-full border border-[#D6C3B3] bg-[#E8D4C3]/50 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#57534E]"
                        >
                          Stok Habis
                        </button>
                      ) : qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(product.id, 1)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1917] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Pilih Produk
                        </button>
                      ) : (
                        <div className="flex items-center justify-between rounded-full border border-[#1C1917] bg-[#FAF6F2] p-1">
                          <button
                            type="button"
                            onClick={() => onChangeQuantity(product.id, qty - 1)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1C1917] transition hover:bg-[#E8D4C3]"
                            aria-label={`Kurangi jumlah ${product.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#1C1917]">
                            {qty} pcs
                          </span>
                          <button
                            type="button"
                            disabled={qty >= product.stock}
                            onClick={() =>
                              onChangeQuantity(product.id, Math.min(product.stock, qty + 1))
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1917] text-[#FAF6F2] transition hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Tambah jumlah ${product.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
