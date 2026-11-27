export type OrderStatus =
  | 'Pending'
  | 'Diproses'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export type PaymentMethod =
  | 'Transfer Bank BCA/BSI'
  | 'QRIS'
  | 'COD (Bayar di Tempat)';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface Order {
  id: string; // Format: INV-YYYYMMDD-XXXX
  customerName: string;
  whatsapp: string;
  address: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO string
}

export interface CreateOrderInput {
  customerName: string;
  whatsapp: string;
  address: string;
  productId: string;
  quantity: number;
  notes: string;
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
  allowUnavailableProduct?: boolean;
}

export interface UpdateOrderInput {
  customerName: string;
  whatsapp: string;
  address: string;
  productId: string;
  quantity: number;
  notes: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface UpdateProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'Pending',
  'Diproses',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
] as const;

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'Transfer Bank BCA/BSI',
  'QRIS',
  'COD (Bayar di Tempat)',
] as const;

export const PRODUCT_CATEGORIES: readonly string[] = [
  'Sajadah Travel',
  'Hampers Sajadah',
  'Mukena',
  'Perlengkapan Umrah',
  'Aksesoris Ibadah',
] as const;
