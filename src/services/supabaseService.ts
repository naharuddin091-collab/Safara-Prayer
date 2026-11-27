import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, PaymentMethod, Product } from '@/types';

type DbOrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface DbProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  stock: number;
  image_url: string;
  is_active: boolean;
}

interface DbOrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

interface DbOrderRow {
  id: string;
  invoice_code: string;
  customer_name: string;
  customer_whatsapp: string;
  shipping_address: string;
  notes: string;
  total_amount: number | string;
  status: DbOrderStatus;
  created_at: string;
  order_items?: DbOrderItemRow[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function mapDbStatusToUi(status: DbOrderStatus): OrderStatus {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'paid':
    case 'processing':
      return 'Diproses';
    case 'shipped':
      return 'Dikirim';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return 'Pending';
  }
}

function mapUiStatusToDb(status: OrderStatus): DbOrderStatus {
  switch (status) {
    case 'Pending':
      return 'pending';
    case 'Diproses':
      return 'processing';
    case 'Dikirim':
      return 'shipped';
    case 'Selesai':
      return 'completed';
    case 'Dibatalkan':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function inferCategory(name: string, slug: string): string {
  const text = `${name} ${slug}`.toLowerCase();
  if (text.includes('hampers') || text.includes('box') || text.includes('gift')) {
    return 'Hampers Sajadah';
  }
  if (text.includes('mukena')) {
    return 'Mukena';
  }
  if (text.includes('umrah') || text.includes('haji')) {
    return 'Perlengkapan Umrah';
  }
  if (text.includes('sarung')) {
    return 'Aksesoris Ibadah';
  }
  return 'Sajadah Travel';
}

/**
 * Mengganti URL eksternal lama (Unsplash) dengan foto produk lokal light warm yang sesuai
 */
function normalizeProductImage(imageUrl: string, name: string, slug: string): string {
  if (imageUrl && imageUrl.startsWith('/images/')) {
    return imageUrl;
  }
  const text = `${name} ${slug}`.toLowerCase();
  if (text.includes('hampers') || text.includes('box')) return '/images/safara-packaging.jpg';
  if (text.includes('mukena')) return '/images/mukena-safara-silk.jpg';
  if (text.includes('umrah')) return '/images/paket-umrah-lengkap.jpg';
  if (text.includes('charcoal') || text.includes('sarung')) return '/images/product-charcoal.jpg';
  if (text.includes('ivory')) return '/images/product-ivory.jpg';
  if (text.includes('taupe') || text.includes('pocket')) return '/images/product-taupe.jpg';
  if (text.includes('woven') || text.includes('sand')) return '/images/hero-sajadah.jpg';
  return '/images/sajadah-travel-velvet.jpg';
}

function slugify(text: string): string {
  return `${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
}

function extractPaymentAndNotes(rawNotes: string): {
  paymentMethod: PaymentMethod;
  cleanNotes: string;
} {
  const match = /^\[Pembayaran:\s*([^\]]+)\]\s*(.*)$/s.exec(rawNotes.trim());
  if (!match) {
    return {
      paymentMethod: 'Transfer Bank BCA/BSI',
      cleanNotes: rawNotes,
    };
  }
  const methodRaw = match[1].trim();
  const cleanNotes = match[2].trim();
  if (
    methodRaw === 'Transfer Bank BCA/BSI' ||
    methodRaw === 'QRIS' ||
    methodRaw === 'COD (Bayar di Tempat)'
  ) {
    return { paymentMethod: methodRaw, cleanNotes };
  }
  return { paymentMethod: 'Transfer Bank BCA/BSI', cleanNotes };
}

function encodePaymentAndNotes(paymentMethod: PaymentMethod, notes: string): string {
  const trimmed = notes.trim();
  return trimmed ? `[Pembayaran: ${paymentMethod}] ${trimmed}` : `[Pembayaran: ${paymentMethod}]`;
}

function dbRowToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: inferCategory(row.name, row.slug),
    price: Number(row.price),
    stock: Number(row.stock),
    description: row.description,
    imageUrl: normalizeProductImage(row.image_url, row.name, row.slug),
    isAvailable: Boolean(row.is_active),
  };
}

function dbRowToOrder(row: DbOrderRow, productMap: Map<string, Product>): Order {
  const firstItem = row.order_items?.[0];
  const product = firstItem ? productMap.get(firstItem.product_id) : undefined;
  const { paymentMethod, cleanNotes } = extractPaymentAndNotes(row.notes ?? '');

  return {
    id: row.invoice_code,
    customerName: row.customer_name,
    whatsapp: row.customer_whatsapp,
    address: row.shipping_address,
    productId: firstItem?.product_id ?? '',
    productName: product?.name ?? 'Produk Safara Prayer',
    quantity: firstItem?.quantity ?? 1,
    unitPrice: firstItem ? Number(firstItem.unit_price) : Number(row.total_amount),
    totalPrice: Number(row.total_amount),
    notes: cleanNotes,
    paymentMethod,
    status: mapDbStatusToUi(row.status),
    createdAt: row.created_at,
  };
}

export interface SupabaseSyncResult {
  connected: boolean;
  products?: Product[];
  orders?: Order[];
  errorMessage?: string;
}

export interface SupabaseWriteResult {
  success: boolean;
  errorMessage?: string;
  dbId?: string;
}

export const supabaseService = {
  /**
   * Mengambil seluruh data dari tabel public.products, public.orders, dan public.order_items
   */
  async fetchAll(): Promise<SupabaseSyncResult> {
    if (!supabase) {
      return {
        connected: false,
        errorMessage: 'VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi.',
      };
    }

    const [prodRes, ordRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: true }),
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false }),
    ]);

    if (prodRes.error) {
      return {
        connected: false,
        errorMessage: `Gagal memuat tabel products: ${prodRes.error.message}`,
      };
    }

    if (ordRes.error) {
      return {
        connected: false,
        errorMessage: `Gagal memuat tabel orders: ${ordRes.error.message}`,
      };
    }

    const products = ((prodRes.data as DbProductRow[]) ?? []).map(dbRowToProduct);
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));
    const orders = ((ordRes.data as DbOrderRow[]) ?? []).map((row) =>
      dbRowToOrder(row, productMap)
    );

    return { connected: true, products, orders };
  },

  /**
   * Menyimpan pesanan baru ke tabel public.orders DAN public.order_items secara berurutan
   */
  async createOrderInDb(order: Order): Promise<SupabaseWriteResult> {
    if (!supabase) {
      return {
        success: false,
        errorMessage: 'Client Supabase belum terkonfigurasi.',
      };
    }

    if (!isUuid(order.productId)) {
      return {
        success: false,
        errorMessage:
          'ID produk belum sinkron dengan UUID tabel products di Supabase. Silakan refresh halaman dan coba lagi.',
      };
    }

    // 1. Insert ke tabel public.orders
    const orderInsertRes = await supabase
      .from('orders')
      .insert({
        invoice_code: order.id,
        customer_name: order.customerName,
        customer_whatsapp: order.whatsapp,
        shipping_address: order.address,
        notes: encodePaymentAndNotes(order.paymentMethod, order.notes),
        total_amount: order.totalPrice,
        status: mapUiStatusToDb(order.status),
      })
      .select('id')
      .single();

    if (orderInsertRes.error || !orderInsertRes.data) {
      return {
        success: false,
        errorMessage: `Gagal menyimpan ke tabel orders: ${
          orderInsertRes.error?.message ?? 'Respon kosong dari Supabase.'
        }`,
      };
    }

    const insertedOrderId = (orderInsertRes.data as { id: string }).id;

    // 2. Insert ke tabel public.order_items
    const itemInsertRes = await supabase.from('order_items').insert({
      order_id: insertedOrderId,
      product_id: order.productId,
      quantity: order.quantity,
      unit_price: order.unitPrice,
      subtotal: order.totalPrice,
    });

    if (itemInsertRes.error) {
      return {
        success: false,
        errorMessage: `Pesanan masuk ke orders, tetapi gagal menyimpan ke order_items: ${itemInsertRes.error.message}`,
      };
    }

    return { success: true, dbId: insertedOrderId };
  },

  async updateOrderStatusInDb(invoiceCode: string, status: OrderStatus): Promise<SupabaseWriteResult> {
    if (!supabase) {
      return { success: false, errorMessage: 'Client Supabase belum terkonfigurasi.' };
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: mapUiStatusToDb(status) })
      .eq('invoice_code', invoiceCode);

    if (error) {
      return {
        success: false,
        errorMessage: `Gagal memperbarui status di Supabase: ${error.message}`,
      };
    }
    return { success: true };
  },

  async updateOrderInDb(order: Order): Promise<SupabaseWriteResult> {
    if (!supabase) {
      return { success: false, errorMessage: 'Client Supabase belum terkonfigurasi.' };
    }
    const { data, error } = await supabase
      .from('orders')
      .update({
        customer_name: order.customerName,
        customer_whatsapp: order.whatsapp,
        shipping_address: order.address,
        notes: encodePaymentAndNotes(order.paymentMethod, order.notes),
        total_amount: order.totalPrice,
        status: mapUiStatusToDb(order.status),
      })
      .eq('invoice_code', order.id)
      .select('id')
      .single();

    if (error || !data) {
      return {
        success: false,
        errorMessage: `Gagal memperbarui pesanan di Supabase: ${error?.message ?? 'Data tidak ditemukan.'}`,
      };
    }

    const orderUuid = (data as { id: string }).id;
    if (isUuid(order.productId)) {
      await supabase
        .from('order_items')
        .update({
          product_id: order.productId,
          quantity: order.quantity,
          unit_price: order.unitPrice,
          subtotal: order.totalPrice,
        })
        .eq('order_id', orderUuid);
    }

    return { success: true };
  },

  async deleteOrderInDb(invoiceCode: string): Promise<SupabaseWriteResult> {
    if (!supabase) {
      return { success: false, errorMessage: 'Client Supabase belum terkonfigurasi.' };
    }
    const { error } = await supabase.from('orders').delete().eq('invoice_code', invoiceCode);
    if (error) {
      return {
        success: false,
        errorMessage: `Gagal menghapus pesanan di Supabase: ${error.message}`,
      };
    }
    return { success: true };
  },

  async createProductInDb(product: Omit<Product, 'id'>): Promise<{
    success: boolean;
    product?: Product;
    errorMessage?: string;
  }> {
    if (!supabase) {
      return { success: false, errorMessage: 'Client Supabase belum terkonfigurasi.' };
    }
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl,
        is_active: product.isAvailable,
      })
      .select('*')
      .single();

    if (error || !data) {
      return {
        success: false,
        errorMessage: `Gagal menambah produk di Supabase: ${error?.message ?? 'Respon kosong.'}`,
      };
    }
    return { success: true, product: dbRowToProduct(data as DbProductRow) };
  },

  async updateProductInDb(product: Product): Promise<SupabaseWriteResult> {
    if (!supabase || !isUuid(product.id)) {
      return { success: false, errorMessage: 'Produk tidak memiliki UUID Supabase yang valid.' };
    }
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl,
        is_active: product.isAvailable,
      })
      .eq('id', product.id);

    if (error) {
      return {
        success: false,
        errorMessage: `Gagal memperbarui produk di Supabase: ${error.message}`,
      };
    }
    return { success: true };
  },

  async deleteProductInDb(productId: string): Promise<SupabaseWriteResult> {
    if (!supabase || !isUuid(productId)) {
      return { success: false, errorMessage: 'ID produk tidak valid.' };
    }
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      return {
        success: false,
        errorMessage: `Gagal menghapus produk di Supabase: ${error.message}`,
      };
    }
    return { success: true };
  },
};
