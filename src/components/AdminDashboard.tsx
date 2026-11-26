import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Eye,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { deleteOrder, getAllOrders, updateOrderStatus } from '@/services/orderService';
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  updateProduct,
} from '@/services/productService';
import type { OrderStatus, OrderWithItems, Product } from '@/types/database';
import {
  buildWhatsAppCustomerLink,
  formatDateTime,
  formatRupiah,
  ORDER_STATUS_META,
  ORDER_STATUS_OPTIONS,
} from '@/utils/format';

type ActiveTab = 'orders' | 'products';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  is_active: boolean;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '10',
  image_url: '',
  is_active: true,
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Order filters & detail modal
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);

  const loadDashboardData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [ordersData, productsData] = await Promise.all([
        getAllOrders('all'),
        getAllProductsAdmin(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const activeProducts = products.filter((p) => p.is_active).length;

    return { totalOrders, pendingOrders, revenue, activeProducts };
  }, [orders, products]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesQuery =
        !q ||
        order.invoice_code.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_whatsapp.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, orderSearch, statusFilter]);

  async function handleStatusChange(orderId: string, nextStatus: OrderStatus) {
    try {
      setUpdatingOrderId(orderId);
      const updated = await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      toast.success(`Status pesanan diperbarui ke "${ORDER_STATUS_META[nextStatus].label}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleDeleteOrder(order: OrderWithItems) {
    const confirmed = window.confirm(
      `Hapus permanen pesanan ${order.invoice_code} atas nama ${order.customer_name}?`
    );
    if (!confirmed) return;

    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
      toast.success(`Pesanan ${order.invoice_code} berhasil dihapus.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pesanan.');
    }
  }

  function openCreateProductModal() {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductModalOpen(true);
  }

  function openEditProductModal(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url,
      is_active: product.is_active,
    });
    setProductModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const numericPrice = Number(productForm.price);
    const numericStock = Number(productForm.stock);

    if (!productForm.name.trim()) {
      toast.error('Nama produk wajib diisi.');
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Harga produk tidak valid.');
      return;
    }
    if (Number.isNaN(numericStock) || numericStock < 0) {
      toast.error('Stok produk tidak valid.');
      return;
    }

    try {
      setSavingProduct(true);
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, {
          name: productForm.name,
          description: productForm.description,
          price: numericPrice,
          stock: numericStock,
          image_url: productForm.image_url,
          is_active: productForm.is_active,
        });
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(`Produk "${updated.name}" berhasil diperbarui.`);
      } else {
        const created = await createProduct({
          name: productForm.name,
          description: productForm.description,
          price: numericPrice,
          stock: numericStock,
          image_url: productForm.image_url,
          is_active: productForm.is_active,
        });
        setProducts((prev) => [created, ...prev]);
        toast.success(`Produk "${created.name}" berhasil ditambahkan.`);
      }
      setProductModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleToggleProductActive(product: Product) {
    try {
      const updated = await updateProduct(product.id, { is_active: !product.is_active });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(
        updated.is_active
          ? `"${updated.name}" diaktifkan di katalog.`
          : `"${updated.name}" disembunyikan dari katalog.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status produk.');
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(`Hapus produk "${product.name}"?`);
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(`Produk "${product.name}" berhasil dihapus.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus produk.');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success('Anda telah keluar dari Panel Admin.');
    navigate('/admin/login', { replace: true });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D6C3B3] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#57534E]">
            Safara Prayer Management
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-[0.08em] uppercase text-[#1C1917] sm:text-4xl">
            Panel Admin
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase text-[#1C1917] transition hover:border-[#1C1917]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Segarkan
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/65 p-5">
          <div className="flex items-center justify-between text-[#57534E]">
            <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
              Total Pesanan
            </span>
            <ShoppingBag className="h-4 w-4 text-[#1C1917]" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-[#1C1917]">
            {metrics.totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/65 p-5">
          <div className="flex items-center justify-between text-[#57534E]">
            <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
              Menunggu Bayar
            </span>
            <Clock className="h-4 w-4 text-[#1C1917]" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-[#1C1917]">
            {metrics.pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D6C3B3] bg-[#E8D4C3]/70 p-5">
          <div className="flex items-center justify-between text-[#57534E]">
            <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
              Estimasi Omzet
            </span>
            <Wallet className="h-4 w-4 text-[#1C1917]" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-[#1C1917]">
            {formatRupiah(metrics.revenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/65 p-5">
          <div className="flex items-center justify-between text-[#57534E]">
            <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
              Produk Aktif
            </span>
            <Package className="h-4 w-4 text-[#1C1917]" />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-[#1C1917]">
            {metrics.activeProducts}{' '}
            <span className="font-sans text-xs font-normal text-[#57534E]">
              / {products.length}
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-9 flex items-center gap-2 border-b border-[#D6C3B3]">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`border-b-2 px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition ${
            activeTab === 'orders'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Manajemen Pesanan ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`border-b-2 px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition ${
            activeTab === 'products'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Manajemen Produk ({products.length})
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#57534E]">
          <Loader2 className="h-6 w-6 animate-spin text-[#1C1917]" />
          <p className="mt-3 text-xs tracking-[0.16em] uppercase">Memuat data...</p>
        </div>
      ) : activeTab === 'orders' ? (
        /* ======================== TAB 1: ORDERS ======================== */
        <section className="mt-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Cari kode pesanan, nama, atau WhatsApp..."
                className="w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] py-2.5 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
              aria-label="Filter status pesanan"
            >
              <option value="all">Semua Status</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_META[status].label}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/40 p-12 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-[#57534E]" />
              <p className="mt-3 font-display text-xl font-semibold text-[#1C1917]">
                Belum Ada Pesanan
              </p>
              <p className="mt-1 text-xs text-[#57534E]">
                Pesanan pelanggan yang masuk akan tampil secara otomatis di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#D6C3B3] bg-[#FAF6F2]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-[#D6C3B3] bg-[#F3E5D8]/75 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#57534E]">
                    <tr>
                      <th className="px-5 py-3.5">Kode &amp; Waktu</th>
                      <th className="px-5 py-3.5">Pelanggan</th>
                      <th className="px-5 py-3.5">Item</th>
                      <th className="px-5 py-3.5">Total</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6C3B3]/60">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-[#F3E5D8]/35">
                        <td className="px-5 py-4 align-top">
                          <p className="font-mono text-xs font-bold text-[#1C1917]">
                            {order.invoice_code}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#57534E]">
                            {formatDateTime(order.created_at)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-[#1C1917]">{order.customer_name}</p>
                          <p className="text-xs text-[#57534E]">{order.customer_whatsapp}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <ul className="space-y-0.5 text-xs text-[#57534E]">
                            {order.order_items.map((item) => (
                              <li key={item.id}>
                                <span className="text-[#1C1917]">
                                  {item.product?.name ?? 'Produk'}
                                </span>{' '}
                                × {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-5 py-4 align-top font-semibold text-[#1C1917]">
                          {formatRupiah(order.total_amount)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`rounded-full border px-3 py-1 text-xs font-medium focus:outline-none ${ORDER_STATUS_META[order.status].badgeClass}`}
                            aria-label={`Ubah status pesanan ${order.invoice_code}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option
                                key={st}
                                value={st}
                                className="bg-[#FAF6F2] text-[#1C1917]"
                              >
                                {ORDER_STATUS_META[st].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#1C1917] transition hover:border-[#1C1917] hover:bg-[#E8D4C3]"
                              title="Lihat Detail"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={buildWhatsAppCustomerLink(
                                order.customer_whatsapp,
                                `Assalamualaikum ${order.customer_name}, kami dari Safara Prayer menginformasikan pesanan ${order.invoice_code}.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#1C1917] transition hover:border-[#1C1917] hover:bg-[#E8D4C3]"
                              title="Hubungi via WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#7F1D1D] transition hover:border-[#7F1D1D] hover:bg-[#FDF2F2]"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* ======================== TAB 2: PRODUCTS ======================== */
        <section className="mt-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-[#57534E]">
              Kelola katalog perlengkapan ibadah Safara Prayer (tambah, ubah harga/stok, aktifkan,
              atau hapus).
            </p>
            <button
              type="button"
              onClick={openCreateProductModal}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1C1917] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#D6C3B3] bg-[#F3E5D8]/40 p-12 text-center">
              <Package className="mx-auto h-8 w-8 text-[#57534E]" />
              <p className="mt-3 font-display text-xl font-semibold text-[#1C1917]">
                Katalog Masih Kosong
              </p>
              <button
                type="button"
                onClick={openCreateProductModal}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#FAF6F2]"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk Pertama
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#D6C3B3] bg-[#FAF6F2]"
                >
                  <div className="relative aspect-[16/10] bg-[#E8D4C3]/60">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#57534E]">
                        Tanpa Gambar
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${
                        product.is_active
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF6F2]'
                          : 'border-[#D6C3B3] bg-[#FAF6F2]/90 text-[#57534E]'
                      }`}
                    >
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#57534E]">
                      {product.description || '—'}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#D6C3B3]/70 pt-3">
                      <span className="font-display text-xl font-semibold text-[#1C1917]">
                        {formatRupiah(product.price)}
                      </span>
                      <span className="text-xs text-[#57534E]">Stok: {product.stock}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleProductActive(product)}
                        className="rounded-full border border-[#D6C3B3] bg-[#F3E5D8]/70 px-3.5 py-1.5 text-[11px] font-medium text-[#1C1917] transition hover:border-[#1C1917]"
                      >
                        {product.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#1C1917] transition hover:border-[#1C1917] hover:bg-[#E8D4C3]"
                          title="Edit Produk"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#7F1D1D] transition hover:border-[#7F1D1D] hover:bg-[#FDF2F2]"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ======================== ORDER DETAIL MODAL ======================== */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#D6C3B3] pb-4">
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#57534E]">
                  Detail Pesanan
                </p>
                <h2 className="mt-0.5 font-mono text-lg font-bold text-[#1C1917]">
                  {selectedOrder.invoice_code}
                </h2>
                <p className="text-xs text-[#57534E]">
                  {formatDateTime(selectedOrder.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#1C1917] hover:bg-[#E8D4C3]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="grid gap-3 rounded-2xl border border-[#D6C3B3]/80 bg-[#F3E5D8]/50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#57534E]">Nama</p>
                  <p className="font-semibold text-[#1C1917]">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#57534E]">
                    WhatsApp
                  </p>
                  <p className="font-semibold text-[#1C1917]">{selectedOrder.customer_whatsapp}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#57534E]">
                    Alamat Pengiriman
                  </p>
                  <p className="mt-0.5 text-[#1C1917]">{selectedOrder.shipping_address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-[#57534E]">
                      Catatan
                    </p>
                    <p className="mt-0.5 italic text-[#57534E]">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#57534E]">
                  Produk Dipesan
                </p>
                <ul className="mt-2 divide-y divide-[#D6C3B3]/60 rounded-2xl border border-[#D6C3B3] px-4">
                  {selectedOrder.order_items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-[#1C1917]">
                          {item.product?.name ?? 'Produk'}
                        </p>
                        <p className="text-xs text-[#57534E]">
                          {item.quantity} × {formatRupiah(item.unit_price)}
                        </p>
                      </div>
                      <span className="font-semibold text-[#1C1917]">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#D6C3B3] pt-4">
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                  Total
                </span>
                <span className="font-display text-3xl font-semibold text-[#1C1917]">
                  {formatRupiah(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== PRODUCT CREATE/EDIT MODAL ======================== */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/50 p-4 backdrop-blur-xs"
          onClick={() => setProductModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D6C3B3] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3B3] text-[#1C1917] hover:bg-[#E8D4C3]"
                aria-label="Tutup form produk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Sajadah Travel Safara Pocket Series"
                  className="mt-1.5 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Jelaskan material, ukuran, dan keunggulan produk..."
                  className="mt-1.5 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]">
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="149000"
                    className="mt-1.5 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]">
                    Stok *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="25"
                    className="mt-1.5 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]">
                  URL Gambar Produk
                </label>
                <input
                  type="text"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://... atau /images/product-taupe.jpg"
                  className="mt-1.5 w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#1C1917] focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D6C3B3] bg-[#F3E5D8]/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) =>
                    setProductForm({ ...productForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#1C1917]"
                />
                <span className="text-xs font-medium text-[#1C1917]">
                  Tampilkan produk ini di katalog pelanggan
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-full border border-[#D6C3B3] px-5 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-[#FAF6F2] hover:bg-[#292524] disabled:opacity-50"
                >
                  {savingProduct && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
