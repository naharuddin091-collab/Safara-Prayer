import { Order, Product } from '@/types';

const PRODUCTS_STORAGE_KEY = 'safara_prayer_products_v5';
const ORDERS_STORAGE_KEY = 'safara_prayer_orders_v2';

const LEGACY_STORAGE_KEYS = [
  'safara_prayer_products',
  'safara_prayer_products_v1',
  'safara_prayer_products_v2',
  'safara_prayer_products_v3',
  'safara_prayer_products_v4',
  'safara_prayer_orders',
  'safara_prayer_orders_v1',
] as const;

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'PROD-01',
    name: 'Sajadah Travel Turki Velvet',
    category: 'Sajadah Travel',
    price: 120000,
    stock: 30,
    description:
      'Sajadah travel unggulan berbahan beludru lembut bernuansa champagne beige dengan motif mihrab Islami emboss dan rumbai rapi. Dilengkapi drawstring velvet pouch berujung emas.',
    imageUrl: '/images/sajadah-travel-velvet.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-02',
    name: 'Sajadah Travel Ivory Minimalis',
    category: 'Sajadah Travel',
    price: 60000,
    stock: 40,
    description:
      'Sajadah travel warna warm ivory dengan detail bordir mihrab elegan yang tenang dan bersih. Ringan, mudah dilipat, serta dilengkapi pouch resleting ivory senada.',
    imageUrl: '/images/product-ivory.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-03',
    name: 'Sajadah Travel Warm Taupe Pocket',
    category: 'Sajadah Travel',
    price: 50000,
    stock: 35,
    description:
      'Sajadah saku ultra-ringkas bernuansa warm taupe berbahan parasut halus tahan air. Praktis disimpan di tas harian untuk pelajar, pekerja dinamis, hingga wisatawan muslim.',
    imageUrl: '/images/product-taupe.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-04',
    name: 'Sajadah Travel Deep Charcoal Gold',
    category: 'Sajadah Travel',
    price: 85000,
    stock: 25,
    description:
      'Sajadah travel warna deep charcoal berwibawa dengan list bordir geometris emas hangat. Dilengkapi pouch resleting kanvas lembut yang maskulin sekaligus elegan.',
    imageUrl: '/images/product-charcoal.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-05',
    name: 'Sajadah Travel Woven Sand',
    category: 'Sajadah Travel',
    price: 95000,
    stock: 20,
    description:
      'Sajadah travel tenun halus bermotif geometris Islami dalam palet warm sand. Nyaman digunakan di berbagai permukaan dan hadir bersama pouch resleting taupe.',
    imageUrl: '/images/hero-sajadah.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-06',
    name: 'Hampers Sajadah Eksklusif Box',
    category: 'Hampers Sajadah',
    price: 450000,
    stock: 15,
    description:
      'Set bingkisan sajadah mewah dalam Signature Light Warm Hardbox berpita satin hitam, lengkap dengan paper bag monogram SP, sajadah emboss, velvet pouch, dan kartu doa.',
    imageUrl: '/images/safara-packaging.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-07',
    name: 'Mukena Safara Silk Premium',
    category: 'Mukena',
    price: 285000,
    stock: 25,
    description:
      'Mukena berbahan Armani Silk ivory yang lembut, sejuk di kulit, dan dihiasi renda tonal halus. Dilengkapi pouch serut sutra berujung emas yang anggun untuk perjalanan.',
    imageUrl: '/images/mukena-safara-silk.jpg',
    isAvailable: true,
  },
  {
    id: 'PROD-08',
    name: 'Paket Perlengkapan Umrah Lengkap',
    category: 'Perlengkapan Umrah',
    price: 850000,
    stock: 10,
    description:
      'Paket terpadu bernuansa ivory & warm beige untuk perjalanan suci: sajadah travel gulung, busana ibadah lembut, tasbih mutiara 33 butir, buku doa linen, dan travel organizer.',
    imageUrl: '/images/paket-umrah-lengkap.jpg',
    isAvailable: true,
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'INV-20261124-8A2F',
    customerName: 'Aisyah Rahmadani',
    whatsapp: '081260448811',
    address: 'Jl. Teuku Umar No. 42, Setui, Banda Aceh, Aceh 23243',
    productId: 'PROD-01',
    productName: 'Sajadah Travel Turki Velvet',
    quantity: 2,
    unitPrice: 120000,
    totalPrice: 240000,
    notes: 'Mohon bungkus rapi dengan kartu ucapan Safara Prayer.',
    paymentMethod: 'Transfer Bank BCA/BSI',
    status: 'Pending',
    createdAt: '2026-11-24T09:15:00.000Z',
  },
  {
    id: 'INV-20261123-4K9M',
    customerName: 'Nadia Putri Azzahra',
    whatsapp: '085277193340',
    address: 'Komplek Griya Indah Blok C-12, Medan Sunggal, Sumatera Utara 20122',
    productId: 'PROD-06',
    productName: 'Hampers Sajadah Eksklusif Box',
    quantity: 1,
    unitPrice: 450000,
    totalPrice: 450000,
    notes: 'Kartu ucapan: Barakallahu fiikum untuk Ibu tercinta.',
    paymentMethod: 'QRIS',
    status: 'Diproses',
    createdAt: '2026-11-23T14:40:00.000Z',
  },
  {
    id: 'INV-20261120-7P3X',
    customerName: 'Muhammad Farhan Hakim',
    whatsapp: '081398221045',
    address: 'Jl. Kemang Raya No. 18, Jakarta Selatan, DKI Jakarta 12730',
    productId: 'PROD-08',
    productName: 'Paket Perlengkapan Umrah Lengkap',
    quantity: 2,
    unitPrice: 850000,
    totalPrice: 1700000,
    notes: 'Untuk keberangkatan Umrah awal bulan depan, terima kasih.',
    paymentMethod: 'Transfer Bank BCA/BSI',
    status: 'Selesai',
    createdAt: '2026-11-20T06:25:00.000Z',
  },
];

function clearLegacyStorageKeys(): void {
  try {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore storage access errors gracefully
  }
}

function safeRead<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, data: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

/**
 * Layer abstraksi penyimpanan data Safara Prayer (localStorage).
 * Otomatis membersihkan key lama agar katalog sajadah terbaru selalu tampil tanpa hapus cache manual.
 */
export const storageService = {
  getProducts(): Product[] {
    clearLegacyStorageKeys();
    const existing = safeRead<Product[]>(PRODUCTS_STORAGE_KEY);
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    safeWrite(PRODUCTS_STORAGE_KEY, SEED_PRODUCTS);
    return [...SEED_PRODUCTS];
  },

  saveProducts(products: Product[]): void {
    safeWrite(PRODUCTS_STORAGE_KEY, products);
  },

  getOrders(): Order[] {
    clearLegacyStorageKeys();
    const existing = safeRead<Order[]>(ORDERS_STORAGE_KEY);
    if (existing && Array.isArray(existing)) {
      return existing;
    }
    safeWrite(ORDERS_STORAGE_KEY, SEED_ORDERS);
    return [...SEED_ORDERS];
  },

  saveOrders(orders: Order[]): void {
    safeWrite(ORDERS_STORAGE_KEY, orders);
  },

  resetSeedData(): { products: Product[]; orders: Order[] } {
    clearLegacyStorageKeys();
    safeWrite(PRODUCTS_STORAGE_KEY, SEED_PRODUCTS);
    safeWrite(ORDERS_STORAGE_KEY, SEED_ORDERS);
    return {
      products: [...SEED_PRODUCTS],
      orders: [...SEED_ORDERS],
    };
  },
};
