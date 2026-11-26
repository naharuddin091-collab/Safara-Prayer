import { supabase } from '@/lib/supabase';
import type {
  CreateOrderInput,
  OrderItem,
  OrderStatus,
  OrderWithItems,
} from '@/types/database';

function generateOrderCode(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i += 1) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SFR-${yyyy}${mm}${dd}-${randomPart}`;
}

function normalizeOrderItem(row: Record<string, unknown>): OrderItem {
  const rawProduct = row.product as Record<string, unknown> | null | undefined;
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: String(row.product_id),
    quantity: Number(row.quantity ?? 0),
    unit_price: Number(row.unit_price ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    product: rawProduct
      ? {
          id: String(rawProduct.id),
          name: String(rawProduct.name),
          slug: String(rawProduct.slug),
          image_url: String(rawProduct.image_url ?? ''),
        }
      : null,
  };
}

function normalizeOrder(row: Record<string, unknown>): OrderWithItems {
  const rawItems = Array.isArray(row.order_items)
    ? (row.order_items as Record<string, unknown>[])
    : [];

  return {
    id: String(row.id),
    invoice_code: String(row.invoice_code),
    customer_name: String(row.customer_name),
    customer_whatsapp: String(row.customer_whatsapp),
    shipping_address: String(row.shipping_address),
    notes: String(row.notes ?? ''),
    total_amount: Number(row.total_amount ?? 0),
    status: row.status as OrderStatus,
    created_at: String(row.created_at),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
    order_items: rawItems.map(normalizeOrderItem),
  };
}

const ORDER_WITH_ITEMS_SELECT = `
  *,
  order_items (
    id,
    order_id,
    product_id,
    quantity,
    unit_price,
    subtotal,
    product:products (
      id,
      name,
      slug,
      image_url
    )
  )
`;

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  if (!input.items.length) {
    throw new Error('Pilih minimal satu produk sebelum membuat pesanan.');
  }

  const preparedItems = input.items.map((item) => {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Number(item.unit_price);
    return {
      product_id: item.product_id,
      quantity,
      unit_price: unitPrice,
      subtotal: quantity * unitPrice,
    };
  });

  const totalAmount = preparedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const invoiceCode = generateOrderCode();

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      invoice_code: invoiceCode,
      customer_name: input.customer_name.trim(),
      customer_whatsapp: input.customer_whatsapp.trim(),
      shipping_address: input.shipping_address.trim(),
      notes: (input.notes ?? '').trim(),
      total_amount: totalAmount,
      status: 'pending' as OrderStatus,
    })
    .select('*')
    .single();

  if (orderError || !orderData) {
    throw new Error(
      `Gagal membuat pesanan: ${orderError?.message ?? 'Data pesanan tidak tersimpan.'}`
    );
  }

  const orderItemsPayload = preparedItems.map((item) => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    throw new Error(`Pesanan tercatat, namun gagal menyimpan item: ${itemsError.message}`);
  }

  const fullOrder = await getOrderByInvoice(invoiceCode);
  if (!fullOrder) {
    return normalizeOrder({
      ...(orderData as Record<string, unknown>),
      order_items: orderItemsPayload,
    });
  }

  return fullOrder;
}

export async function getAllOrders(
  statusFilter?: OrderStatus | 'all'
): Promise<OrderWithItems[]> {
  let query = supabase
    .from('orders')
    .select(ORDER_WITH_ITEMS_SELECT)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat daftar pesanan: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeOrder(row as Record<string, unknown>));
}

export async function getOrderByInvoice(
  invoiceCode: string
): Promise<OrderWithItems | null> {
  const normalized = invoiceCode.trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq('invoice_code', normalized)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal melacak pesanan: ${error.message}`);
  }

  if (!data) return null;
  return normalizeOrder(data as Record<string, unknown>);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderWithItems> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select(ORDER_WITH_ITEMS_SELECT)
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui status pesanan: ${error.message}`);
  }

  return normalizeOrder(data as Record<string, unknown>);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);

  if (error) {
    throw new Error(`Gagal menghapus pesanan: ${error.message}`);
  }
}
