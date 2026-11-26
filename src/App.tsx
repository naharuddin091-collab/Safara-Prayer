import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { BrandLogo } from '@/components/BrandLogo';
import { HeroSection } from '@/components/HeroSection';
import { Navbar } from '@/components/Navbar';
import { OrderForm } from '@/components/OrderForm';
import { OrderTracker } from '@/components/OrderTracker';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getActiveProducts } from '@/services/productService';
import type { Product } from '@/types/database';

function CatalogAndOrderView({
  products,
  loading,
  error,
  selectedQuantities,
  onChangeQuantity,
  onClearCart,
  onRetry,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedQuantities: Record<string, number>;
  onChangeQuantity: (productId: string, nextQty: number) => void;
  onClearCart: () => void;
  onRetry: () => void;
}) {
  return (
    <main>
      <HeroSection />
      <ProductCatalog
        products={products}
        loading={loading}
        error={error}
        selectedQuantities={selectedQuantities}
        onChangeQuantity={onChangeQuantity}
        onRetry={onRetry}
      />
      <OrderForm
        products={products}
        selectedQuantities={selectedQuantities}
        onChangeQuantity={onChangeQuantity}
        onClearCart={onClearCart}
      />
    </main>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);
      const data = await getActiveProducts();
      setProducts(data);
    } catch (err) {
      setProductsError(
        err instanceof Error ? err.message : 'Gagal memuat katalog produk Safara Prayer.'
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChangeQuantity = useCallback((productId: string, nextQty: number) => {
    setSelectedQuantities((prev) => {
      const updated = { ...prev };
      if (nextQty <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = nextQty;
      }
      return updated;
    });
  }, []);

  const handleClearCart = useCallback(() => {
    setSelectedQuantities({});
  }, []);

  const cartCount = useMemo(
    () => Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0),
    [selectedQuantities]
  );

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C1917',
            color: '#FAF6F2',
            border: '1px solid #292524',
          },
        }}
      />
      <div className="flex min-h-screen flex-col bg-[#FAF6F2] text-[#1C1917]">
        <Navbar cartCount={cartCount} />

        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <CatalogAndOrderView
                  products={products}
                  loading={loadingProducts}
                  error={productsError}
                  selectedQuantities={selectedQuantities}
                  onChangeQuantity={handleChangeQuantity}
                  onClearCart={handleClearCart}
                  onRetry={fetchProducts}
                />
              }
            />
            <Route path="/track" element={<OrderTracker />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <footer className="border-t border-[#D6C3B3] bg-[#F3E5D8]/80 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
            <BrandLogo variant="horizontal" />
            <div className="text-xs text-[#57534E]">
              <p className="font-display text-sm italic text-[#1C1917]">
                Elegance in Every Prayer, Serenity in Every Journey.
              </p>
              <p className="mt-1">
                © {new Date().getFullYear()} SAFARA PRAYER. Seluruh hak cipta dilindungi.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
