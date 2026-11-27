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

interface OrderActionResult {
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
  createOrder: (input: CreateOrderInput) => OrderActionResult;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => boolean;
  updateOrder: (orderId: string, input: UpdateOrderInput) => OrderActionResult;
  deleteOrder: (orderId: string) => void;
  // Product CRUD
  createProduct: (input: CreateProductInput) => Product;
  updateProduct: (productId: string, input: UpdateProductInput) => Product | null;
  toggleProductAvailability: (productId: string) => void;
  deleteProduct: (productId: string) => void;
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
      }, 4200);
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
      setProducts(result.products);
      setOrders(result.orders);
      setDbStatus('supabase');
      setDbError(null);
    } else {
      setDbStatus('local');
      setDbError(result.errorMessage ?? 'Tabel Supabase belum siap.');
    }
  }, []);

  useEffect(() => {
    void refreshFromSupabase();
  }, [refreshFromSupabase]);

  // ==========================
  // ORDER CRUD (Supabase + Local Cache)
  // ==========================

  const createOrder = useCallback(
    (input: CreateOrderInput): OrderActionResult => {
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

      const updatedProduct: Product =
        initialStatus !== 'Dibatalkan'
          ? { ...targetProduct, stock: Math.max(0, targetProduct.stock - qty) }
          : targetProduct;

      if (initialStatus !== 'Dibatalkan') {
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProduct.id ? updatedProduct : p))
        );
        void supabaseService.upsertProduct(updatedProduct);
      }

      setOrders((prev) => [newOrder, ...prev]);
      void supabaseService.upsertOrder(newOrder);

      addToast(
        'success',
        'Pesanan Berhasil Dibuat',
        `Invoice ${newOrder.id} tersimpan dan stok diperbarui.`
      );
      return { success: true, order: newOrder };
    },
    [products, orders, addToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus): boolean => {
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

      // Jika diubah dari aktif -> Dibatalkan, kembalikan stok otomatis
      if (!wasCancelled && willCancel && targetProduct) {
        const restoredProduct: Product = {
          ...targetProduct,
          stock: targetProduct.stock + existing.quantity,
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProduct.id ? restoredProduct : p))
        );
        void supabaseService.upsertProduct(restoredProduct);
      }

      // Jika diaktifkan kembali dari Dibatalkan -> status aktif, kurangi stok lagi
      if (wasCancelled && !willCancel) {
        if (targetProduct && targetProduct.stock < existing.quantity) {
          addToast(
            'error',
            'Stok Tidak Mencukupi',
            `Tidak dapat mengaktifkan pesanan. Sisa stok ${targetProduct.name} hanya ${targetProduct.stock} pcs.`
          );
          return false;
        }
        if (targetProduct) {
          const deductedProduct: Product = {
            ...targetProduct,
            stock: Math.max(0, targetProduct.stock - existing.quantity),
          };
          setProducts((prev) =>
            prev.map((p) => (p.id === targetProduct.id ? deductedProduct : p))
          );
          void supabaseService.upsertProduct(deductedProduct);
        }
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      void supabaseService.updateOrderStatus(orderId, newStatus);

      addToast(
        'success',
        'Status Pesanan Diperbarui',
        willCancel && !wasCancelled
          ? `${existing.id} dibatalkan dan ${existing.quantity} pcs stok dikembalikan.`
          : `${existing.id} kini berstatus "${newStatus}".`
      );
      return true;
    },
    [orders, products, addToast]
  );

  const updateOrder = useCallback(
    (orderId: string, input: UpdateOrderInput): OrderActionResult => {
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

      const updatedProductsList: Product[] = products.map((p) => ({
        ...p,
        stock: stockMap.get(p.id) ?? p.stock,
      }));
      const changedProducts = updatedProductsList.filter((p) => {
        const orig = products.find((o) => o.id === p.id);
        return orig && orig.stock !== p.stock;
      });

      setProducts(updatedProductsList);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

      if (changedProducts.length > 0) {
        void supabaseService.upsertProducts(changedProducts);
      }
      void supabaseService.upsertOrder(updatedOrder);

      addToast('success', 'Pesanan Diperbarui', `Detail invoice ${updatedOrder.id} telah disimpan.`);
      return { success: true, order: updatedOrder };
    },
    [orders, products, addToast]
  );

  const deleteOrder = useCallback(
    (orderId: string) => {
      const existing = orders.find((o) => o.id === orderId);
      if (!existing) return;

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
          void supabaseService.upsertProduct(restored);
        }
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      void supabaseService.deleteOrder(orderId);
      addToast('info', 'Pesanan Dihapus', `Invoice ${existing.id} telah dihapus dari sistem.`);
    },
    [orders, products, addToast]
  );

  // ==========================
  // PRODUCT CRUD (Supabase + Local Cache)
  // ==========================

  const createProduct = useCallback(
    (input: CreateProductInput): Product => {
      const newProduct: Product = {
        id: generateProductId(products.map((p) => p.id)),
        name: input.name.trim(),
        category: input.category.trim(),
        price: Math.max(0, Math.floor(input.price)),
        stock: Math.max(0, Math.floor(input.stock)),
        description: input.description.trim(),
        imageUrl: input.imageUrl.trim(),
        isAvailable: input.isAvailable,
      };

      setProducts((prev) => [...prev, newProduct]);
      void supabaseService.upsertProduct(newProduct);
      addToast('success', 'Produk Ditambahkan', `${newProduct.name} berhasil masuk katalog.`);
      return newProduct;
    },
    [products, addToast]
  );

  const updateProduct = useCallback(
    (productId: string, input: UpdateProductInput): Product | null => {
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

      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      void supabaseService.upsertProduct(updated);
      addToast('success', 'Produk Diperbarui', `Perubahan pada ${updated.name} telah disimpan.`);
      return updated;
    },
    [products, addToast]
  );

  const toggleProductAvailability = useCallback(
    (productId: string) => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;

      const updated: Product = { ...target, isAvailable: !target.isAvailable };
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      void supabaseService.upsertProduct(updated);
      addToast(
        'info',
        updated.isAvailable ? 'Produk Diaktifkan' : 'Produk Dinonaktifkan',
        `${updated.name} kini ${updated.isAvailable ? 'tersedia' : 'tidak tersedia'} di katalog.`
      );
    },
    [products, addToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      void supabaseService.deleteProduct(productId);
      addToast('info', 'Produk Dihapus', `${target.name} telah dihapus dari katalog.`);
    },
    [products, addToast]
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
