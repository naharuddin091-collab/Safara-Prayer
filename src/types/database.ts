export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  invoice_code: string;
  customer_name: string;
  customer_whatsapp: string;
  shipping_address: string;
  notes: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'image_url'> | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_whatsapp: string;
  shipping_address: string;
  notes?: string;
  items: CreateOrderItemInput[];
}
