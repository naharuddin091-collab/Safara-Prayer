import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  CheckCircle2,
  Gift,
  Heart,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Order, PAYMENT_METHODS, PaymentMethod, Product } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import {
  BrandLogo,
  DiamondIcon,
  DomeIcon,
  InfinityIcon,
  LotusIcon,
  MandalaOrnament,
  SPMonogram,
  SparkleStarIcon,
  SprigIcon,
} from '@/components/BrandLogo';
import { InvoiceModal } from '@/components/InvoiceModal';

const BRAND_CHARACTERS = [
  { label: 'Elegant', sub: 'Anggun & Berkelas', Icon: DiamondIcon },
  { label: 'Modest', sub: 'Sederhana & Tulus', Icon: SprigIcon },
  { label: 'Serene', sub: 'Tenang & Damai', Icon: LotusIcon },
  { label: 'Timeless', sub: 'Relevan Sepanjang Waktu', Icon: InfinityIcon },
  { label: 'Spiritual', sub: 'Dekat kepada Sang Pencipta', Icon: DomeIcon },
];

const PACKAGING_HIGHLIGHTS = [
  {
    title: 'Hardbox & Paper Bag Pita Satin',
    desc: 'Kemasan light warm ivory bertekstur halus dengan pita satin hitam eksklusif serta hangtag monogram SP.',
  },
  {
    title: 'Drawstring Velvet Pouch',
    desc: 'Pouch serut bernuansa cream lembut dengan ujung tali emas untuk menjaga perlengkapan ibadah tetap ringkas & rapi.',
  },
  {
    title: 'Embossed Belly Band',
    desc: 'Balutan pita kertas berembos monogram SP yang mengikat sajadah dengan sentuhan rapi dan mewah.',
  },
  {
    title: 'Signature Greeting Card',
    desc: 'Kartu doa eksklusif bertuliskan "May your prayers bring peace, and your journey be filled with blessings."',
  },
];

export const HomePage: React.FC = () => {
  const { products, createOrder } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Form Pemesanan State
  const firstAvailableProduct = useMemo(
    () => products.find((p) => p.isAvailable && p.stock > 0) ?? products[0],
    [products]
  );

  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    firstAvailableProduct?.id ?? ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer Bank BCA/BSI');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ['Semua', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Semua') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const selectedProduct: Product | undefined = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? firstAvailableProduct,
    [products, selectedProductId, firstAvailableProduct]
  );

  const maxQuantity = selectedProduct && selectedProduct.isAvailable ? selectedProduct.stock : 0;
  const effectiveQuantity = maxQuantity > 0 ? Math.min(Math.max(1, quantity), maxQuantity) : 1;
  const totalPrice = (selectedProduct?.price ?? 0) * effectiveQuantity;

  const handleSelectProductToOrder = (product: Product) => {
    setSelectedProductId(product.id);
    setQuantity(1);
    setFormError('');
    document.getElementById('pesan')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductChange = (newId: string) => {
    setSelectedProductId(newId);
    setQuantity(1);
    setFormError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || !whatsapp.trim() || !address.trim()) {
      setFormError('Mohon lengkapi nama pemesan, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    if (!selectedProduct) {
      setFormError('Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (!selectedProduct.isAvailable || selectedProduct.stock <= 0) {
      setFormError('Maaf, produk yang dipilih sedang habis atau tidak tersedia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        customerName,
        whatsapp,
        address,
        productId: selectedProduct.id,
        quantity: effectiveQuantity,
        notes,
        paymentMethod,
      });

      if (!result.success || !result.order) {
        setFormError(result.error ?? 'Terjadi kesalahan saat menyimpan pesanan ke Supabase.');
        return;
      }

      setCreatedOrder(result.order);
      setCustomerName('');
      setWhatsapp('');
      setAddress('');
      setQuantity(1);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF8] text-[#231F1D]">
      {/* ================================================================= */}
      {/* HERO SECTION (LIGHT WARM EDITORIAL WITH SIGNATURE PACKAGING)      */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden border-b border-[#E5D6C3] bg-gradient-to-br from-[#FDFBF8] via-[#F7F1E8] to-[#EFE3D3]/70 safara-grain">
        {/* Ornamen Pola Mandala / Floral Islami Tipis */}
        <MandalaOrnament className="absolute -left-28 -top-24 h-96 w-96 text-[#C8AE8C] opacity-[0.22]" />
        <MandalaOrnament className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] text-[#C8AE8C] opacity-[0.18]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy */}
            <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D8C4AA] bg-[#FDFBF8]/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A38660] shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Sajadah Travel Praktis, Elegan & Fungsional
              </span>

              <div className="mt-6">
                <BrandLogo variant="full" size="md" className="lg:items-start lg:text-left" />
              </div>

              <h1 className="mt-5 font-display text-2xl font-medium italic leading-relaxed text-[#231F1D] sm:text-3xl lg:text-[2.15rem]">
                “Elegance in Every Prayer, Serenity in Every Journey.”
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#665E57] sm:text-base">
                Identitas <strong>Safara Prayer</strong> berawal dari <strong>sajadah travel</strong>{' '}
                bernuansa <em>light warm</em> yang ultra-ringkas, lembut, dan mudah dilipat —
                hadir lengkap dengan <em>signature packaging</em> pita satin, velvet pouch, mukena
                silk, hingga hampers ibadah eksklusif.
              </p>

              {/* Hero CTAs */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
                <a
                  href="#katalog"
                  className="inline-flex items-center gap-2 rounded-full bg-[#231F1D] px-7 py-3.5 text-sm font-semibold text-[#FDFBF8] shadow-md transition-all hover:bg-slate-800 hover:shadow-lg"
                >
                  <ShoppingBag className="h-4 w-4 text-[#C8AE8C]" />
                  Lihat Koleksi Sajadah
                  <ArrowDown className="h-4 w-4" />
                </a>
                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8C4AA] bg-[#FDFBF8]/90 px-7 py-3.5 text-sm font-semibold text-[#231F1D] transition-all hover:border-[#C8AE8C] hover:bg-[#EFE3D3]/60"
                >
                  <Search className="h-4 w-4 text-[#A38660]" />
                  Lacak Pesanan
                </Link>
              </div>
            </div>

            {/* Right Sajadah & Signature Packaging Visual Showcase */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-xl">
                {/* Soft Warm Glow Frame */}
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-[#EFE3D3] via-[#FDFBF8] to-[#E5D6C3] opacity-80 blur-xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-[#E5D6C3] bg-[#FDFBF8] p-2.5 shadow-xl">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <img
                      src="/images/sajadah-travel-velvet.jpg"
                      alt="Sajadah Travel Turki Velvet Safara Prayer bernuansa light warm dengan drawstring velvet pouch"
                      className="aspect-[16/11] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-1 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F7F1E8] text-[#A38660]">
                        <Gift className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-semibold text-[#231F1D]">
                        Flagship: Sajadah Travel Velvet & Pouch
                      </span>
                    </div>
                    <span className="font-display text-xs italic text-[#8A7050]">
                      Ringan • Emboss Mihrab • Light Warm
                    </span>
                  </div>
                </div>

                {/* Floating Packaging Preview Card */}
                <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-[#E5D6C3] bg-[#FDFBF8]/95 p-3 shadow-md sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0 sm:max-w-xs">
                  <img
                    src="/images/safara-packaging.jpg"
                    alt="Signature Packaging Safara Prayer"
                    className="h-16 w-20 shrink-0 rounded-xl border border-[#E5D6C3] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A38660]">
                      Signature Packaging
                    </p>
                    <p className="font-display text-xs font-semibold text-[#231F1D]">
                      Hardbox Pita Satin & Paper Bag
                    </p>
                    <p className="text-[11px] text-[#665E57]">
                      Termasuk kartu ucapan doa eksklusif
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filosofi & Karakter Brand Strip */}
          <div className="mt-14 grid gap-4 rounded-3xl border border-[#E5D6C3] bg-[#FDFBF8]/85 p-6 backdrop-blur-xs sm:grid-cols-3">
            <div className="flex flex-col items-center text-center sm:border-r sm:border-[#E5D6C3] sm:px-4">
              <SPMonogram className="h-9 w-9 text-[#231F1D]" />
              <h2 className="mt-3 font-display text-sm font-semibold tracking-[0.18em] uppercase text-[#231F1D]">
                Elegance & Unity
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#665E57]">
                Huruf inisial SP yang menyatu melambangkan keindahan, ketulusan, dan kesatuan antara
                iman dan hati.
              </p>
            </div>
            <div className="flex flex-col items-center text-center sm:border-r sm:border-[#E5D6C3] sm:px-4">
              <LotusIcon className="h-9 w-9 text-[#A38660]" />
              <h2 className="mt-3 font-display text-sm font-semibold tracking-[0.18em] uppercase text-[#231F1D]">
                Serenity
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#665E57]">
                Nuansa warna light warm dan material lembut mencerminkan ketenangan serta kedamaian
                dalam beribadah.
              </p>
            </div>
            <div className="flex flex-col items-center text-center sm:px-4">
              <SparkleStarIcon className="h-9 w-9 text-[#A38660]" />
              <h2 className="mt-3 font-display text-sm font-semibold tracking-[0.18em] uppercase text-[#231F1D]">
                Timeless
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#665E57]">
                Desain klasik dan minimalis menjadikan setiap koleksi Safara Prayer relevan
                sepanjang waktu.
              </p>
            </div>
          </div>

          {/* 5 Karakter Brand */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {BRAND_CHARACTERS.map(({ label, sub, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border border-[#E5D6C3]/80 bg-[#FDFBF8]/90 px-3 py-4 text-center"
              >
                <Icon className="h-6 w-6 text-[#231F1D]" />
                <span className="mt-2 font-display text-sm font-semibold text-[#231F1D]">
                  {label}
                </span>
                <span className="mt-0.5 text-[11px] text-[#665E57]">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SIGNATURE PACKAGING EXPERIENCE                                    */}
      {/* ================================================================= */}
      <section className="border-b border-[#E5D6C3] bg-[#FDFBF8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 rounded-[2rem] border border-[#E5D6C3] bg-gradient-to-br from-[#F7F1E8] via-[#FDFBF8] to-[#F7F1E8] p-6 sm:p-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8C4AA] bg-[#FDFBF8] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A38660]">
                <Heart className="h-3 w-3" />
                Pengalaman Unboxing
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[#231F1D] sm:text-3xl">
                Kemasan Eksklusif Bernuansa Light Warm
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#665E57]">
                Setiap pesanan Safara Prayer dirancang istimewa agar siap langsung dijadikan hadiah
                bermakna maupun pendamping perjalanan ibadah yang berkesan.
              </p>
              <div className="mt-5 rounded-2xl border border-[#E5D6C3] bg-[#FDFBF8] p-4">
                <p className="font-display text-sm italic text-[#231F1D]">
                  “May your prayers bring peace, and your journey be filled with blessings.”
                </p>
                <p className="mt-1 text-[11px] text-[#A38660]">
                  — Tercetak di setiap kartu ucapan eksklusif Safara Prayer
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {PACKAGING_HIGHLIGHTS.map((item, idx) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#E5D6C3] bg-[#FDFBF8] p-5 shadow-2xs transition hover:border-[#C8AE8C]"
                >
                  <span className="font-display text-xs font-semibold tracking-widest text-[#A38660]">
                    0{idx + 1}
                  </span>
                  <h3 className="mt-1.5 font-display text-base font-semibold text-[#231F1D]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#665E57]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* KATALOG PRODUK                                                    */}
      {/* ================================================================= */}
      <section id="katalog" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38660]">
              Koleksi Pilihan
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#231F1D] sm:text-4xl">
              Katalog Sajadah Travel & Perlengkapan Ibadah
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#665E57]">
              Temukan koleksi unggulan sajadah travel praktis bernuansa light warm, hampers ibadah,
              mukena silk, dan paket umrah eksklusif.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#231F1D] text-[#FDFBF8] shadow-xs'
                    : 'border border-[#E5D6C3] bg-[#F7F1E8] text-[#665E57] hover:border-[#C8AE8C] hover:text-[#231F1D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const isOutOfStock = !product.isAvailable || product.stock <= 0;
            const isLowStock = !isOutOfStock && product.stock <= 5;

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#E5D6C3] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C8AE8C] hover:shadow-lg"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F1E8]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                    }`}
                  />
                  {/* Category Pill */}
                  <span className="absolute left-3.5 top-3.5 rounded-full border border-[#E5D6C3]/80 bg-[#FDFBF8]/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#231F1D] backdrop-blur-xs">
                    {product.category}
                  </span>

                  {/* Out of stock / Low stock Badge */}
                  {isOutOfStock ? (
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                      Stok Habis
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                      Sisa {product.stock}
                    </span>
                  ) : null}
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug text-[#231F1D]">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-[#665E57]">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F7F1E8] pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#A38660]">Harga</p>
                      <p className="font-display text-lg font-bold text-[#231F1D]">
                        {formatRupiah(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#665E57]">Sisa Stok</p>
                      <p
                        className={`text-xs font-semibold ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? 'Habis / Nonaktif' : `${product.stock} pcs`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleSelectProductToOrder(product)}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      isOutOfStock
                        ? 'cursor-not-allowed border border-[#E5D6C3] bg-[#F7F1E8] text-[#665E57]/60'
                        : 'cursor-pointer bg-[#231F1D] text-[#FDFBF8] hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-[#C8AE8C]" />
                    {isOutOfStock ? 'Stok Habis' : 'Pesan Sekarang'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* FORM PEMESANAN TERPADU (CREATE ORDER)                             */}
      {/* ================================================================= */}
      <section
        id="pesan"
        className="border-t border-[#E5D6C3] bg-[#F7F1E8]/80 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38660]">
              Pemesanan Mudah & Cepat
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#231F1D] sm:text-4xl">
              Formulir Pemesanan Safara Prayer
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#665E57]">
              Lengkapi data pemesanan di bawah ini. Nomor invoice unik akan langsung diterbitkan
              dan siap dikonfirmasi ke WhatsApp Admin.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            {/* Form Card */}
            <form
              onSubmit={handleSubmitOrder}
              className="space-y-5 rounded-3xl border border-[#E5D6C3] bg-[#FDFBF8] p-6 shadow-sm sm:p-8 lg:col-span-7"
            >
              {formError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="order-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                  >
                    Nama Lengkap Pemesan *
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Aisyah Rahmadani"
                    required
                    className="w-full rounded-xl border border-[#DFCEB9] bg-white px-4 py-2.5 text-sm text-[#231F1D] outline-none transition focus:border-[#C8AE8C] focus:ring-2 focus:ring-[#C8AE8C]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="order-wa"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                  >
                    Nomor WhatsApp *
                  </label>
                  <input
                    id="order-wa"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full rounded-xl border border-[#DFCEB9] bg-white px-4 py-2.5 text-sm text-[#231F1D] outline-none transition focus:border-[#C8AE8C] focus:ring-2 focus:ring-[#C8AE8C]/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-address"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                >
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  id="order-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kelurahan/kecamatan, kota, provinsi, dan kode pos"
                  required
                  className="w-full rounded-xl border border-[#DFCEB9] bg-white px-4 py-2.5 text-sm text-[#231F1D] outline-none transition focus:border-[#C8AE8C] focus:ring-2 focus:ring-[#C8AE8C]/25"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="order-product"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                  >
                    Pilihan Produk *
                  </label>
                  <select
                    id="order-product"
                    value={selectedProduct?.id ?? ''}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DFCEB9] bg-white px-3.5 py-2.5 text-sm text-[#231F1D] outline-none transition focus:border-[#C8AE8C] focus:ring-2 focus:ring-[#C8AE8C]/25"
                  >
                    {products.map((product) => {
                      const unavailable = !product.isAvailable || product.stock <= 0;
                      return (
                        <option key={product.id} value={product.id} disabled={unavailable}>
                          {product.name} — {formatRupiah(product.price)}{' '}
                          {unavailable ? '(Stok Habis)' : `(Stok: ${product.stock})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="order-qty"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                  >
                    Jumlah (Max {maxQuantity})
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-[#DFCEB9] bg-white">
                    <button
                      type="button"
                      disabled={effectiveQuantity <= 1 || maxQuantity <= 0}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center text-[#231F1D] transition hover:bg-[#F7F1E8] disabled:opacity-40 cursor-pointer"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      id="order-qty"
                      type="number"
                      min={1}
                      max={Math.max(1, maxQuantity)}
                      value={effectiveQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setQuantity(Math.min(Math.max(1, val), Math.max(1, maxQuantity)));
                      }}
                      className="h-10 w-full border-x border-[#E5D6C3] text-center text-sm font-semibold text-[#231F1D] outline-none"
                    />
                    <button
                      type="button"
                      disabled={effectiveQuantity >= maxQuantity || maxQuantity <= 0}
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      className="flex h-10 w-10 items-center justify-center text-[#231F1D] transition hover:bg-[#F7F1E8] disabled:opacity-40 cursor-pointer"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#665E57]">
                  Metode Pembayaran *
                </label>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'border-[#231F1D] bg-[#231F1D] text-[#FDFBF8] shadow-xs'
                          : 'border-[#DFCEB9] bg-white text-[#231F1D] hover:border-[#C8AE8C]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-notes"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#665E57]"
                >
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  id="order-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pilihan warna, pesan kartu ucapan hampers, atau waktu pengiriman..."
                  className="w-full rounded-xl border border-[#DFCEB9] bg-white px-4 py-2.5 text-sm text-[#231F1D] outline-none transition focus:border-[#C8AE8C] focus:ring-2 focus:ring-[#C8AE8C]/25"
                />
              </div>

              <button
                type="submit"
                disabled={maxQuantity <= 0 || isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#231F1D] px-6 py-3.5 text-sm font-semibold text-[#FDFBF8] shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#C8AE8C]" />
                {isSubmitting ? 'Menyimpan Pesanan ke Supabase...' : 'Buat Pesanan & Terbitkan Invoice'}
              </button>
            </form>

            {/* Real-Time Summary Sidebar */}
            <aside className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl border border-[#E5D6C3] bg-[#FDFBF8] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5D6C3] pb-4">
                  <h3 className="font-display text-xl font-semibold text-[#231F1D]">
                    Ringkasan Pesanan
                  </h3>
                  <Package className="h-5 w-5 text-[#A38660]" />
                </div>

                {selectedProduct ? (
                  <div className="mt-5 space-y-4">
                    <div className="flex gap-3.5">
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-20 w-20 shrink-0 rounded-2xl border border-[#E5D6C3] object-cover"
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A38660]">
                          {selectedProduct.category}
                        </span>
                        <h4 className="font-display text-base font-semibold text-[#231F1D]">
                          {selectedProduct.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-[#665E57]">
                          {formatRupiah(selectedProduct.price)} / pcs
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 rounded-2xl border border-[#E5D6C3] bg-[#F7F1E8]/80 p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#665E57]">Harga Satuan</span>
                        <span className="font-medium text-[#231F1D]">
                          {formatRupiah(selectedProduct.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#665E57]">Jumlah Pesanan</span>
                        <span className="font-medium text-[#231F1D]">{effectiveQuantity} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#665E57]">Metode Pembayaran</span>
                        <span className="font-medium text-[#231F1D]">{paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#665E57]">Stok Tersedia</span>
                        <span className="font-medium text-emerald-700">
                          {selectedProduct.isAvailable ? `${selectedProduct.stock} pcs` : 'Nonaktif'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5D6C3] pt-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#A38660]">
                          Total Pembayaran
                        </p>
                        <p className="text-[11px] text-[#665E57]">Kalkulasi otomatis real-time</p>
                      </div>
                      <p className="font-display text-2xl font-bold text-[#231F1D]">
                        {formatRupiah(totalPrice)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#665E57]">
                    Belum ada produk yang tersedia di katalog.
                  </p>
                )}

                <div className="mt-6 rounded-2xl border border-[#D8C4AA]/60 bg-[#EFE3D3]/45 p-4 text-xs leading-relaxed text-[#665E57]">
                  <p className="font-semibold text-[#231F1D]">Termasuk Signature Packaging</p>
                  <p className="mt-1">
                    Stok langsung terkunci saat pesanan dibuat. Anda dapat melacak status pesanan
                    kapan saja melalui halaman{' '}
                    <Link to="/track" className="font-semibold text-[#A38660] underline">
                      Lacak Pesanan
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Invoice Modal */}
      <InvoiceModal order={createdOrder} onClose={() => setCreatedOrder(null)} />
    </div>
  );
};
