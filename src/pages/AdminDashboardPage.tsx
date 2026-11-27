import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Edit3,
  FileText,
  Lock,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ORDER_STATUSES, Order, OrderStatus, Product } from '@/types';
import { formatDateID, formatRupiah } from '@/utils/formatters';
import { BrandLogo } from '@/components/BrandLogo';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderModal, OrderModalSubmitPayload } from '@/components/OrderModal';
import { ProductModal, ProductModalSubmitPayload } from '@/components/ProductModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { InvoiceModal } from '@/components/InvoiceModal';

const ADMIN_SESSION_KEY = 'safara_admin_authenticated_v1';
const DEFAULT_ADMIN_PIN = 'admin123';

type DashboardTab = 'orders' | 'products';

export const AdminDashboardPage: React.FC = () => {
  const {
    products,
    orders,
    dbStatus,
    dbError,
    refreshFromSupabase,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    createProduct,
    updateProduct,
    toggleProductAvailability,
    deleteProduct,
  } = useApp();

  // Simple sessionStorage Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Tabs & Filters
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | OrderStatus>('Semua');
  const [productSearch, setProductSearch] = useState('');

  // Modals State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalMode, setOrderModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [previewInvoiceOrder, setPreviewInvoiceOrder] = useState<Order | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Confirm Dialog State
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => undefined,
  });

  // ==========================
  // KPI CALCULATIONS
  // ==========================
  const kpi = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'Dibatalkan')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const completedOrders = orders.filter((o) => o.status === 'Selesai').length;
    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'Semua' || order.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.whatsapp.toLowerCase().includes(q) ||
        order.productName.toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, statusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Status Count Map
  const statusCounts = useMemo(() => {
    const counts: Record<'Semua' | OrderStatus, number> = {
      Semua: orders.length,
      Pending: 0,
      Diproses: 0,
      Dikirim: 0,
      Selesai: 0,
      Dibatalkan: 0,
    };
    for (const o of orders) {
      counts[o.status] += 1;
    }
    return counts;
  }, [orders]);

  // ==========================
  // AUTH HANDLERS
  // ==========================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_ADMIN_PIN) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setPinInput('');
      setAuthError('');
    } else {
      setAuthError('PIN / Password salah. Gunakan password default: admin123');
    }
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  // ==========================
  // ORDER CRUD HANDLERS
  // ==========================
  const openCreateOrderModal = () => {
    setOrderModalMode('create');
    setEditingOrder(null);
    setOrderModalOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setOrderModalMode('edit');
    setEditingOrder(order);
    setOrderModalOpen(true);
  };

  const handleOrderModalSubmit = async (payload: OrderModalSubmitPayload): Promise<boolean> => {
    if (orderModalMode === 'create') {
      const res = await createOrder({
        ...payload,
        allowUnavailableProduct: true,
      });
      return res.success;
    }
    if (editingOrder) {
      const res = await updateOrder(editingOrder.id, payload);
      return res.success;
    }
    return false;
  };

  const requestDeleteOrder = (order: Order) => {
    setConfirmState({
      open: true,
      title: `Hapus Pesanan ${order.id}?`,
      description: `Pesanan atas nama ${order.customerName} (${order.productName} × ${order.quantity}) akan dihapus permanen. Jika status masih aktif, stok akan dikembalikan otomatis.`,
      onConfirm: () => {
        deleteOrder(order.id);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  // ==========================
  // PRODUCT CRUD HANDLERS
  // ==========================
  const openCreateProductModal = () => {
    setProductModalMode('create');
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductModalMode('edit');
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleProductModalSubmit = (payload: ProductModalSubmitPayload) => {
    if (productModalMode === 'create') {
      void createProduct(payload);
    } else if (editingProduct) {
      void updateProduct(editingProduct.id, payload);
    }
  };

  const requestDeleteProduct = (product: Product) => {
    setConfirmState({
      open: true,
      title: `Hapus Produk "${product.name}"?`,
      description:
        'Produk yang dihapus akan hilang dari katalog pelanggan. Data riwayat pesanan sebelumnya tetap tersimpan aman.',
      onConfirm: () => {
        deleteProduct(product.id);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  // ==========================
  // LOGIN VIEW
  // ==========================
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#FAF8F5] px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#EADBC8] bg-[#F5EFEB]/85 p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <BrandLogo variant="full" size="sm" />
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#C5A880]/60 bg-[#FAF8F5] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#A6885E]">
              <Lock className="h-3.5 w-3.5" />
              Portal Admin
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold text-[#1E1E1E]">
              Masuk Admin Dashboard
            </h1>
            <p className="mt-1 text-xs text-[#5A5550]">
              Masukkan PIN / Password admin untuk mengelola pesanan dan katalog produk.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {authError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="admin-pin"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5A5550]"
              >
                PIN / Password Admin
              </label>
              <input
                id="admin-pin"
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Masukkan password..."
                required
                className="w-full rounded-xl border border-[#DFCEB9] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#1E1E1E] py-3 text-sm font-semibold text-[#FAF8F5] shadow-sm transition-colors hover:bg-slate-800 cursor-pointer"
            >
              Masuk Dashboard
            </button>

            <p className="text-center text-[11px] text-[#5A5550]">
              Password default demo:{' '}
              <code className="rounded bg-[#EADBC8]/70 px-1.5 py-0.5 font-mono font-semibold text-[#1E1E1E]">
                admin123
              </code>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ==========================
  // AUTHENTICATED DASHBOARD
  // ==========================
  return (
    <div className="min-h-[85vh] bg-[#FAF8F5] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#EADBC8] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A6885E]">
              Safara Prayer Management
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#1E1E1E]">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <div
              title={dbError ?? 'Status sinkronisasi database Supabase'}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold ${dbStatus === 'supabase'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : dbStatus === 'connecting'
                    ? 'border-[#DFCEB9] bg-[#F7F1E8] text-[#665E57]'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
            >
              <Database className="h-3.5 w-3.5" />
              {dbStatus === 'supabase'
                ? 'Supabase Live'
                : dbStatus === 'connecting'
                  ? 'Menghubungkan Supabase...'
                  : 'Mode Lokal (Jalankan schema.sql)'}
            </div>
            <button
              type="button"
              onClick={() => void refreshFromSupabase()}
              title="Sinkronkan ulang dengan Supabase"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EADBC8] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E1E1E] transition-colors hover:border-[#C5A880] cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dbStatus === 'connecting' ? 'animate-spin' : ''}`} />
              Sync
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-[#EADBC8] bg-[#F5EFEB] px-5 py-2 text-xs font-semibold text-[#1E1E1E] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Total Pesanan
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F5EFEB] text-[#1E1E1E]">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-[#1E1E1E]">{kpi.totalOrders}</p>
            <p className="mt-1 text-xs text-[#5A5550]">Seluruh transaksi tercatat</p>
          </div>

          <div className="rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Total Pendapatan
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EADBC8]/60 text-[#A6885E]">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-[#1E1E1E] sm:text-3xl">
              {formatRupiah(kpi.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-[#5A5550]">Pesanan aktif & selesai</p>
          </div>

          <div className="rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Perlu Diproses
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-amber-700">
              {kpi.pendingOrders}
            </p>
            <p className="mt-1 text-xs text-[#5A5550]">Menunggu konfirmasi (Pending)</p>
          </div>

          <div className="rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A5550]">
                Pesanan Selesai
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-emerald-700">
              {kpi.completedOrders}
            </p>
            <p className="mt-1 text-xs text-[#5A5550]">Transaksi tuntas terkirim</p>
          </div>
        </div>

        {/* Main Tabs Switcher */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-[#EADBC8] bg-[#F5EFEB] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'orders'
                  ? 'bg-[#1E1E1E] text-[#FAF8F5] shadow-xs'
                  : 'text-[#5A5550] hover:text-[#1E1E1E]'
                }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Manajemen Pesanan ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'products'
                  ? 'bg-[#1E1E1E] text-[#FAF8F5] shadow-xs'
                  : 'text-[#5A5550] hover:text-[#1E1E1E]'
                }`}
            >
              <Package className="h-3.5 w-3.5" />
              Manajemen Katalog Produk ({products.length})
            </button>
          </div>

          {activeTab === 'orders' ? (
            <button
              type="button"
              onClick={openCreateOrderModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#1E1E1E] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] shadow-sm transition-colors hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#C5A880]" />
              Tambah Pesanan Manual
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateProductModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#1E1E1E] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] shadow-sm transition-colors hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#C5A880]" />
              Tambah Produk Baru
            </button>
          )}
        </div>

        {/* =============================================================== */}
        {/* TAB A: MANAJEMEN PESANAN (CRUD ORDERS)                          */}
        {/* =============================================================== */}
        {activeTab === 'orders' && (
          <section className="mt-6 rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs sm:p-6">
            {/* Search & Status Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A6885E]" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari nama, invoice, WhatsApp, produk..."
                  className="w-full rounded-xl border border-[#DFCEB9] bg-[#FAF8F5] py-2.5 pl-10 pr-4 text-xs text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Semua', ...ORDER_STATUSES] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${statusFilter === status
                        ? 'bg-[#1E1E1E] text-[#FAF8F5]'
                        : 'border border-[#EADBC8] bg-[#FAF8F5] text-[#5A5550] hover:border-[#C5A880] hover:text-[#1E1E1E]'
                      }`}
                  >
                    {status} ({statusCounts[status]})
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Table */}
            <div className="mt-6 overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EADBC8] bg-[#FAF8F5] py-12 text-center text-sm text-[#5A5550]">
                  Tidak ada pesanan yang cocok dengan filter saat ini.
                </div>
              ) : (
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#EADBC8] text-[11px] font-semibold uppercase tracking-wider text-[#A6885E]">
                      <th className="pb-3 pr-4">Invoice & Tanggal</th>
                      <th className="pb-3 pr-4">Pelanggan</th>
                      <th className="pb-3 pr-4">Produk & Qty</th>
                      <th className="pb-3 pr-4">Total & Bayar</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFEB]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-[#FAF8F5]/80">
                        <td className="py-4 pr-4 align-top">
                          <p className="font-mono text-xs font-bold text-[#1E1E1E]">{order.id}</p>
                          <p className="mt-0.5 text-[11px] text-[#5A5550]">
                            {formatDateID(order.createdAt)}
                          </p>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <p className="font-semibold text-[#1E1E1E]">{order.customerName}</p>
                          <p className="text-xs text-[#5A5550]">{order.whatsapp}</p>
                          <p className="mt-0.5 line-clamp-1 max-w-[220px] text-[11px] text-[#5A5550]">
                            {order.address}
                          </p>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <p className="font-medium text-[#1E1E1E]">{order.productName}</p>
                          <p className="text-xs text-[#5A5550]">
                            {order.quantity} pcs × {formatRupiah(order.unitPrice)}
                          </p>
                          {order.notes && (
                            <p className="mt-1 line-clamp-1 max-w-[220px] text-[11px] italic text-[#A6885E]">
                              "{order.notes}"
                            </p>
                          )}
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <p className="font-display text-base font-bold text-[#1E1E1E]">
                            {formatRupiah(order.totalPrice)}
                          </p>
                          <p className="text-[11px] text-[#5A5550]">{order.paymentMethod}</p>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <StatusBadge status={order.status} />
                            <select
                              aria-label={`Ubah status pesanan ${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className="w-32 rounded-lg border border-[#DFCEB9] bg-[#FAF8F5] px-2 py-1 text-xs font-medium text-[#1E1E1E] outline-none focus:border-[#C5A880] cursor-pointer"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-4 text-right align-top">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewInvoiceOrder(order)}
                              title="Lihat Invoice"
                              className="rounded-lg border border-[#EADBC8] bg-[#FAF8F5] p-2 text-[#5A5550] transition hover:border-[#C5A880] hover:text-[#1E1E1E] cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditOrderModal(order)}
                              title="Edit Pesanan"
                              className="rounded-lg border border-[#EADBC8] bg-[#FAF8F5] p-2 text-[#1E1E1E] transition hover:border-[#C5A880] hover:bg-[#EADBC8]/50 cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteOrder(order)}
                              title="Hapus Pesanan"
                              className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* =============================================================== */}
        {/* TAB B: MANAJEMEN KATALOG PRODUK (CRUD PRODUCTS)                 */}
        {/* =============================================================== */}
        {activeTab === 'products' && (
          <section className="mt-6 rounded-3xl border border-[#EADBC8] bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A6885E]" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama produk, kategori, atau ID..."
                  className="w-full rounded-xl border border-[#DFCEB9] bg-[#FAF8F5] py-2.5 pl-10 pr-4 text-xs text-[#1E1E1E] outline-none transition focus:border-[#C5A880] focus:bg-white"
                />
              </div>
              <p className="text-xs text-[#5A5550]">
                Indikator peringatan muncul otomatis jika stok produk{' '}
                <strong className="text-amber-700">≤ 5 pcs</strong>.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= 5;
                const isZeroStock = product.stock === 0;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#EADBC8] bg-[#FAF8F5]/70 p-4 sm:flex-row"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-32 w-full shrink-0 rounded-xl border border-[#EADBC8] object-cover sm:h-32 sm:w-32"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full border border-[#DFCEB9] bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A6885E]">
                            {product.id} • {product.category}
                          </span>

                          {isLowStock && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isZeroStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {isZeroStock ? 'Stok Habis' : `Stok Menipis (${product.stock})`}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 font-display text-lg font-semibold text-[#1E1E1E]">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[#5A5550]">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EADBC8] pt-3">
                        <div>
                          <p className="font-display text-base font-bold text-[#1E1E1E]">
                            {formatRupiah(product.price)}
                          </p>
                          <p className="text-[11px] text-[#5A5550]">
                            Stok: <strong className="text-[#1E1E1E]">{product.stock} pcs</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick Availability Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleProductAvailability(product.id)}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${product.isAvailable
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'border-[#DFCEB9] bg-[#EADBC8]/50 text-[#5A5550] hover:bg-[#EADBC8]'
                              }`}
                          >
                            {product.isAvailable ? 'Aktif' : 'Nonaktif'}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditProductModal(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#EADBC8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1E1E1E] transition hover:border-[#C5A880] cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <OrderModal
        open={orderModalOpen}
        mode={orderModalMode}
        initialOrder={editingOrder}
        products={products}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderModalSubmit}
      />

      <ProductModal
        open={productModalOpen}
        mode={productModalMode}
        initialProduct={editingProduct}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleProductModalSubmit}
      />

      <InvoiceModal
        order={previewInvoiceOrder}
        onClose={() => setPreviewInvoiceOrder(null)}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};
