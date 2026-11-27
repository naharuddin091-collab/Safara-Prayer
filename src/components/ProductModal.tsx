import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { PRODUCT_CATEGORIES, Product } from '@/types';

export interface ProductModalSubmitPayload {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface ProductModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialProduct?: Product | null;
  onClose: () => void;
  onSubmit: (payload: ProductModalSubmitPayload) => void;
}

const DEFAULT_FALLBACK_IMAGE = '/images/sajadah-travel-velvet.jpg';

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  mode,
  initialProduct,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState(150000);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrorMsg('');
    if (mode === 'edit' && initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setPrice(initialProduct.price);
      setStock(initialProduct.stock);
      setDescription(initialProduct.description);
      setImageUrl(initialProduct.imageUrl);
      setIsAvailable(initialProduct.isAvailable);
    } else {
      setName('');
      setCategory(PRODUCT_CATEGORIES[0]);
      setPrice(150000);
      setStock(15);
      setDescription('');
      setImageUrl(DEFAULT_FALLBACK_IMAGE);
      setIsAvailable(true);
    }
  }, [open, mode, initialProduct]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !category.trim() || !description.trim()) {
      setErrorMsg('Nama produk, kategori, dan deskripsi wajib diisi.');
      return;
    }

    if (price < 0 || stock < 0) {
      setErrorMsg('Harga dan stok tidak boleh bernilai negatif.');
      return;
    }

    onSubmit({
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      description: description.trim(),
      imageUrl: imageUrl.trim() || DEFAULT_FALLBACK_IMAGE,
      isAvailable,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="animate-fade-in-up relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#EADBC8] bg-[#FAF8F5] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EADBC8] bg-[#F5EFEB] px-6 py-4">
          <div>
            <h3 id="product-modal-title" className="font-display text-xl font-semibold text-[#1E1E1E]">
              {mode === 'create'
                ? 'Tambah Produk Baru'
                : `Edit Produk ${initialProduct?.id ?? ''}`}
            </h3>
            <p className="text-xs text-[#5A5550]">
              Kelola informasi katalog, harga, ketersediaan stok, dan foto produk.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#5A5550] transition-colors hover:bg-[#EADBC8]/70 hover:text-[#1E1E1E] cursor-pointer"
            aria-label="Tutup modal produk"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {errorMsg && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Nama Produk *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mukena Safara Silk"
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Harga (Rupiah) *
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Stok Tersedia (pcs) *
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
              URL Gambar Produk
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#EADBC8] bg-[#F5EFEB]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-[#A6885E]" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
              Deskripsi Produk *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bahan, keunggulan, kelengkapan, dan nuansa produk..."
              required
              className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EADBC8] bg-[#F5EFEB] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1E1E1E]">Status Ketersediaan Katalog</p>
              <p className="text-xs text-[#5A5550]">
                Jika dinonaktifkan, produk akan ditandai tidak tersedia di halaman utama.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                isAvailable ? 'bg-[#1E1E1E]' : 'bg-[#D5C3AD]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#FAF8F5] transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

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
              {mode === 'create' ? 'Tambahkan Produk' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
