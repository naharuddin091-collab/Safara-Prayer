import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, PaymentMethod, Product } from '@/types';
import { SEED_ORDERS, SEED_PRODUCTS } from '@/services/storageService';

const PRODUCTS_TABLE = 'safara_products';
const ORDERS_TABLE = 'safara_orders';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  is_available: boolean;
}

interface OrderRow {
  id: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    description: row.description,
    imageUrl: row.image_url,
    isAvailable: Boolean(row.is_available),
  };
}

function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    description: product.description,
    image_url: product.imageUrl,
    is_available: product.isAvailable,
  };
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    address: row.address,
    productId: row.product_id,
    productName: row.product_name,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    notes: row.notes,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  };
}

function orderToRow(order: Order): OrderRow {
  return {
    id: order.id,
    customer_name: order.customerName,
    whatsapp: order.whatsapp,
    address: order.address,
    product_id: order.productId,
    product_name: order.productName,
    quantity: order.quantity,
    unit_price: order.unitPrice,
    total_price: order.totalPrice,
    notes: order.notes,
    payment_method: order.paymentMethod,
    status: order.status,
    created_at: order.createdAt,
  };
}

export interface SupabaseSyncResult {
  connected: boolean;
  products?: Product[];
  orders?: Order[];
  errorMessage?: string;
}

export const supabaseService = {
  async fetchAll(): Promise<SupabaseSyncResult> {
    if (!supabase) {
      return { connected: false, errorMessage: 'Variabel VITE_SUPABASE_URL belum diatur.' };
    }

    const [prodRes, ordRes] = await Promise.all([
      supabase.from(PRODUCTS_TABLE).select('*').order('id', { ascending: true }),
      supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false }),
    ]);

    if (prodRes.error || ordRes.error) {
      const msg = prodRes.error?.message ?? ordRes.error?.message ?? 'Gagal terhubung ke Supabase.';
      return { connected: false, errorMessage: msg };
    }

    let products = ((prodRes.data as ProductRow[]) ?? []).map(rowToProduct);
    let orders = ((ordRes.data as OrderRow[]) ?? []).map(rowToOrder);

    // Auto-seed ke Supabase jika tabel produk masih kosong
    if (products.length === 0) {
      const seedProdRes = await supabase
        .from(PRODUCTS_TABLE)
        .upsert(SEED_PRODUCTS.map(productToRow), { onConflict: 'id' });
      if (!seedProdRes.error) {
        products = [...SEED_PRODUCTS];
      }
    }

    if (orders.length === 0) {
      const seedOrdRes = await supabase
        .from(ORDERS_TABLE)
        .upsert(SEED_ORDERS.map(orderToRow), { onConflict: 'id' });
      if (!seedOrdRes.error) {
        orders = [...SEED_ORDERS];
      }
    }

    return { connected: true, products, orders };
  },

  async upsertProduct(product: Product): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .upsert(productToRow(product), { onConflict: 'id' });
    return !error;
  },

  async upsertProducts(products: Product[]): Promise<boolean> {
    if (!supabase || products.length === 0) return false;
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .upsert(products.map(productToRow), { onConflict: 'id' });
    return !error;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', productId);
    return !error;
  },

  async upsertOrder(order: Order): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from(ORDERS_TABLE)
      .upsert(orderToRow(order), { onConflict: 'id' });
    return !error;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from(ORDERS_TABLE)
      .update({ status })
      .eq('id', orderId);
    return !error;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from(ORDERS_TABLE).delete().eq('id', orderId);
    return !error;
  },
};
