import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CreateOrderInput,
  CreateProductInput,
  Order,
  OrderStatus,
  Product,
  ToastItem,
  ToastType,
  UpdateOrderInput,
  UpdateProductInput,
} from '@/types';
import { storageService } from '@/services/storageService';
import { supabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { generateInvoiceId, generateProductId } from '@/utils/formatters';

export type DatabaseStatus = 'connecting' | 'supabase' | 'local';

export interface OrderActionResult {
  success: boolean;
  order?: Order;
  error?: string;
}

interface AppContextValue {
  products: Product[];
  orders: Order[];
  toasts: ToastItem[];
  dbStatus: DatabaseStatus;
  dbError: string | null;
  refreshFromSupabase: () => Promise<void>;
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
  // Order CRUD
  createOrder: (input: CreateOrderInput) => Promise<OrderActionResult>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  updateOrder: (orderId: string, input: UpdateOrderInput) => Promise<OrderActionResult>;
  deleteOrder: (orderId: string) => Promise<void>;
  // Product CRUD
  createProduct: (input: CreateProductInput) => Promise<Product | null>;
  updateProduct: (productId: string, input: UpdateProductInput) => Promise<Product | null>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>(
    isSupabaseConfigured ? 'connecting' : 'local'
  );
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    storageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    storageService.saveOrders(orders);
  }, [orders]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setDbStatus('local');
      setDbError('Konfigurasi VITE_SUPABASE_URL belum diisi.');
      return;
    }

    setDbStatus('connecting');
    const result = await supabaseService.fetchAll();
    if (result.connected && result.products && result.orders) {
      if (result.products.length > 0) {
        setProducts(result.products);
      }
      setOrders(result.orders);
      setDbStatus('supabase');
      setDbError(null);
    } else {
      setDbStatus('local');
      setDbError(result.errorMessage ?? 'Gagal terhubung ke Supabase.');
    }
  }, []);

  useEffect(() => {
    void refreshFromSupabase();
  }, [refreshFromSupabase]);

  // ==========================
  // ORDER CRUD (Supabase orders + order_items)
  // ==========================

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<OrderActionResult> => {
      const targetProduct = products.find((p) => p.id === input.productId);
      if (!targetProduct) {
        const error = 'Produk yang dipilih tidak ditemukan.';
        addToast('error', 'Pesanan Gagal', error);
        return { success: false, error };
      }

      if (!input.allowUnavailableProduct && !targetProduct.isAvailable) {
        const error = 'Produk sedang tidak tersedia untuk pemesanan.';
        addToast('error', 'Produk Nonaktif', error);
        return { success: false, error };
      }

      const qty = Math.max(1, Math.floor(input.quantity));
      const initialStatus: OrderStatus = input.status ?? 'Pending';

      if (initialStatus !== 'Dibatalkan' && targetProduct.stock < qty) {
        const error = `Stok tidak mencukupi. Sisa stok ${targetProduct.name}: ${targetProduct.stock} pcs.`;
        addToast('error', 'Stok Tidak Mencukupi', error);
        return { success: false, error };
      }

      const newOrder: Order = {
        id: generateInvoiceId(orders.map((o) => o.id)),
        customerName: input.customerName.trim(),
        whatsapp: input.whatsapp.trim(),
        address: input.address.trim(),
        productId: targetProduct.id,
        productName: targetProduct.name,
        quantity: qty,
        unitPrice: targetProduct.price,
        totalPrice: targetProduct.price * qty,
        notes: input.notes.trim(),
        paymentMethod: input.paymentMethod,
        status: initialStatus,
        createdAt: new Date().toISOString(),
      };

      // Simpan langsung ke tabel orders & order_items di Supabase
      if (isSupabaseConfigured) {
        const dbRes = await supabaseService.createOrderInDb(newOrder);
        if (!dbRes.success) {
          const error =
            dbRes.errorMessage ?? 'Gagal menyimpan pesanan ke database Supabase.';
          addToast('error', 'Gagal Menyimpan ke Supabase', error);
          return { success: false, error };
        }
      }

      const updatedProduct: Product =
        initialStatus !== 'Dibatalkan'
          ? { ...targetProduct, stock: Math.max(0, targetProduct.stock - qty) }
          : targetProduct;

      if (initialStatus !== 'Dibatalkan') {
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProduct.id ? updatedProduct : p))
        );
        if (isSupabaseConfigured) {
          void supabaseService.updateProductInDb(updatedProduct);
        }
      }

      setOrders((prev) => [newOrder, ...prev]);

      addToast(
        'success',
        'Pesanan Tersimpan di Supabase',
        `Invoice ${newOrder.id} telah tercatat di orders & order_items.`
      );
      return { success: true, order: newOrder };
    },
    [products, orders, addToast]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
      const existing = orders.find((o) => o.id === orderId);
      if (!existing) {
        addToast('error', 'Gagal Memperbarui', 'Data pesanan tidak ditemukan.');
        return false;
      }

      if (existing.status === newStatus) {
        return true;
      }

      const wasCancelled = existing.status === 'Dibatalkan';
      const willCancel = newStatus === 'Dibatalkan';
      const targetProduct = products.find((p) => p.id === existing.productId);

      if (wasCancelled && !willCancel && targetProduct && targetProduct.stock < existing.quantity) {
        addToast(
          'error',
          'Stok Tidak Mencukupi',
          `Tidak dapat mengaktifkan pesanan. Sisa stok ${targetProduct.name} hanya ${targetProduct.stock} pcs.`
        );
        return false;
      }

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.updateOrderStatusInDb(orderId, newStatus);
        if (!dbRes.success) {
          addToast('error', 'Gagal Update Supabase', dbRes.errorMessage);
          return false;
        }
      }

      if (!wasCancelled && willCancel && targetProduct) {
        const restoredProduct: Product = {
          ...targetProduct,
          stock: targetProduct.stock + existing.quantity,
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProduct.id ? restoredProduct : p))
        );
        void supabaseService.updateProductInDb(restoredProduct);
      }

      if (wasCancelled && !willCancel && targetProduct) {
        const deductedProduct: Product = {
          ...targetProduct,
          stock: Math.max(0, targetProduct.stock - existing.quantity),
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProduct.id ? deductedProduct : p))
        );
        void supabaseService.updateProductInDb(deductedProduct);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      addToast(
        'success',
        'Status Pesanan Diperbarui',
        willCancel && !wasCancelled
          ? `${existing.id} dibatalkan dan ${existing.quantity} pcs stok dikembalikan.`
          : `${existing.id} kini berstatus "${newStatus}".`
      );
      return true;
    },
    [orders, products, dbStatus, addToast]
  );

  const updateOrder = useCallback(
    async (orderId: string, input: UpdateOrderInput): Promise<OrderActionResult> => {
      const existing = orders.find((o) => o.id === orderId);
      if (!existing) {
        const error = 'Pesanan tidak ditemukan.';
        addToast('error', 'Gagal Memperbarui', error);
        return { success: false, error };
      }

      const nextProduct = products.find((p) => p.id === input.productId);
      if (!nextProduct) {
        const error = 'Produk yang dipilih tidak ditemukan.';
        addToast('error', 'Gagal Memperbarui', error);
        return { success: false, error };
      }

      const nextQty = Math.max(1, Math.floor(input.quantity));
      const wasActive = existing.status !== 'Dibatalkan';
      const willBeActive = input.status !== 'Dibatalkan';

      const stockMap = new Map<string, number>();
      for (const p of products) {
        stockMap.set(p.id, p.stock);
      }

      if (wasActive && stockMap.has(existing.productId)) {
        stockMap.set(
          existing.productId,
          (stockMap.get(existing.productId) ?? 0) + existing.quantity
        );
      }

      if (willBeActive) {
        const availableStock = stockMap.get(nextProduct.id) ?? 0;
        if (availableStock < nextQty) {
          const error = `Stok ${nextProduct.name} tidak mencukupi (tersedia ${availableStock} pcs).`;
          addToast('error', 'Stok Tidak Mencukupi', error);
          return { success: false, error };
        }
        stockMap.set(nextProduct.id, availableStock - nextQty);
      }

      const updatedOrder: Order = {
        ...existing,
        customerName: input.customerName.trim(),
        whatsapp: input.whatsapp.trim(),
        address: input.address.trim(),
        productId: nextProduct.id,
        productName: nextProduct.name,
        quantity: nextQty,
        unitPrice: nextProduct.price,
        totalPrice: nextProduct.price * nextQty,
        notes: input.notes.trim(),
        paymentMethod: input.paymentMethod,
        status: input.status,
      };

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.updateOrderInDb(updatedOrder);
        if (!dbRes.success) {
          const error = dbRes.errorMessage ?? 'Gagal memperbarui pesanan di Supabase.';
          addToast('error', 'Gagal Update Supabase', error);
          return { success: false, error };
        }
      }

      const updatedProductsList: Product[] = products.map((p) => ({
        ...p,
        stock: stockMap.get(p.id) ?? p.stock,
      }));
      setProducts(updatedProductsList);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

      for (const p of updatedProductsList) {
        const orig = products.find((o) => o.id === p.id);
        if (orig && orig.stock !== p.stock) {
          void supabaseService.updateProductInDb(p);
        }
      }

      addToast('success', 'Pesanan Diperbarui', `Detail invoice ${updatedOrder.id} telah disimpan.`);
      return { success: true, order: updatedOrder };
    },
    [orders, products, dbStatus, addToast]
  );

  const deleteOrder = useCallback(
    async (orderId: string): Promise<void> => {
      const existing = orders.find((o) => o.id === orderId);
      if (!existing) return;

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.deleteOrderInDb(orderId);
        if (!dbRes.success) {
          addToast('error', 'Gagal Hapus dari Supabase', dbRes.errorMessage);
          return;
        }
      }

      if (
        existing.status === 'Pending' ||
        existing.status === 'Diproses' ||
        existing.status === 'Dikirim'
      ) {
        const targetProduct = products.find((p) => p.id === existing.productId);
        if (targetProduct) {
          const restored: Product = {
            ...targetProduct,
            stock: targetProduct.stock + existing.quantity,
          };
          setProducts((prev) => prev.map((p) => (p.id === restored.id ? restored : p)));
          void supabaseService.updateProductInDb(restored);
        }
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      addToast('info', 'Pesanan Dihapus', `Invoice ${existing.id} telah dihapus.`);
    },
    [orders, products, dbStatus, addToast]
  );

  // ==========================
  // PRODUCT CRUD
  // ==========================

  const createProduct = useCallback(
    async (input: CreateProductInput): Promise<Product | null> => {
      const cleanInput: Omit<Product, 'id'> = {
        name: input.name.trim(),
        category: input.category.trim(),
        price: Math.max(0, Math.floor(input.price)),
        stock: Math.max(0, Math.floor(input.stock)),
        description: input.description.trim(),
        imageUrl: input.imageUrl.trim(),
        isAvailable: input.isAvailable,
      };

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.createProductInDb(cleanInput);
        if (!dbRes.success || !dbRes.product) {
          addToast('error', 'Gagal Menambah Produk', dbRes.errorMessage);
          return null;
        }
        const created = dbRes.product;
        setProducts((prev) => [...prev, created]);
        addToast('success', 'Produk Ditambahkan', `${created.name} tersimpan di Supabase.`);
        return created;
      }

      const newProduct: Product = {
        id: generateProductId(products.map((p) => p.id)),
        ...cleanInput,
      };
      setProducts((prev) => [...prev, newProduct]);
      addToast('success', 'Produk Ditambahkan', `${newProduct.name} berhasil masuk katalog.`);
      return newProduct;
    },
    [products, dbStatus, addToast]
  );

  const updateProduct = useCallback(
    async (productId: string, input: UpdateProductInput): Promise<Product | null> => {
      const existing = products.find((p) => p.id === productId);
      if (!existing) {
        addToast('error', 'Gagal Memperbarui', 'Produk tidak ditemukan.');
        return null;
      }

      const updated: Product = {
        ...existing,
        name: input.name.trim(),
        category: input.category.trim(),
        price: Math.max(0, Math.floor(input.price)),
        stock: Math.max(0, Math.floor(input.stock)),
        description: input.description.trim(),
        imageUrl: input.imageUrl.trim(),
        isAvailable: input.isAvailable,
      };

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.updateProductInDb(updated);
        if (!dbRes.success) {
          addToast('error', 'Gagal Update Produk', dbRes.errorMessage);
          return null;
        }
      }

      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      addToast('success', 'Produk Diperbarui', `Perubahan pada ${updated.name} telah disimpan.`);
      return updated;
    },
    [products, dbStatus, addToast]
  );

  const toggleProductAvailability = useCallback(
    async (productId: string): Promise<void> => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;

      const updated: Product = { ...target, isAvailable: !target.isAvailable };
      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.updateProductInDb(updated);
        if (!dbRes.success) {
          addToast('error', 'Gagal Ubah Status Produk', dbRes.errorMessage);
          return;
        }
      }

      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      addToast(
        'info',
        updated.isAvailable ? 'Produk Diaktifkan' : 'Produk Dinonaktifkan',
        `${updated.name} kini ${updated.isAvailable ? 'tersedia' : 'tidak tersedia'} di katalog.`
      );
    },
    [products, dbStatus, addToast]
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<void> => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;

      if (isSupabaseConfigured && dbStatus === 'supabase') {
        const dbRes = await supabaseService.deleteProductInDb(productId);
        if (!dbRes.success) {
          addToast('error', 'Gagal Hapus Produk', dbRes.errorMessage);
          return;
        }
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast('info', 'Produk Dihapus', `${target.name} telah dihapus dari katalog.`);
    },
    [products, dbStatus, addToast]
  );

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        toasts,
        dbStatus,
        dbError,
        refreshFromSupabase,
        addToast,
        removeToast,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        createProduct,
        updateProduct,
        toggleProductAvailability,
        deleteProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp harus digunakan di dalam AppProvider.');
  }
  return ctx;
}
