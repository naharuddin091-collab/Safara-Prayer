import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleScrollLink = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5D6C3] bg-[#FDFBF8]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="focus:outline-none"
          aria-label="Safara Prayer Beranda"
        >
          <BrandLogo variant="horizontal" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-[#1E1E1E]' : 'text-[#5A5550] hover:text-[#1E1E1E]'
            }`}
          >
            Beranda
          </Link>
          <button
            type="button"
            onClick={() => handleScrollLink('katalog')}
            className="text-sm font-medium text-[#5A5550] transition-colors hover:text-[#1E1E1E] cursor-pointer"
          >
            Katalog
          </button>
          <button
            type="button"
            onClick={() => handleScrollLink('pesan')}
            className="text-sm font-medium text-[#5A5550] transition-colors hover:text-[#1E1E1E] cursor-pointer"
          >
            Form Pemesanan
          </button>
          <Link
            to="/track"
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/track')
                ? 'text-[#A6885E] font-semibold'
                : 'text-[#5A5550] hover:text-[#1E1E1E]'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Lacak Pesanan
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/admin"
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all ${
              isActive('/admin')
                ? 'border-[#C5A880] bg-[#EADBC8]/60 text-[#1E1E1E]'
                : 'border-[#EADBC8] bg-[#F5EFEB] text-[#1E1E1E] hover:border-[#C5A880]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#A6885E]" />
            Admin
          </Link>
          <button
            type="button"
            onClick={() => handleScrollLink('pesan')}
            className="inline-flex items-center gap-2 rounded-full bg-[#1E1E1E] px-5 py-2 text-xs font-medium tracking-wide text-[#FAF8F5] shadow-sm transition-all hover:bg-slate-800 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#C5A880]" />
            Pesan Sekarang
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EADBC8] bg-[#F5EFEB] text-[#1E1E1E] md:hidden"
          aria-label="Buka menu navigasi"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-[#EADBC8] bg-[#FAF8F5] px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive('/') ? 'bg-[#EADBC8]/60 text-[#1E1E1E]' : 'text-[#5A5550]'
              }`}
            >
              Beranda
            </Link>
            <button
              type="button"
              onClick={() => handleScrollLink('katalog')}
              className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#5A5550] hover:bg-[#F5EFEB]"
            >
              Katalog Produk
            </button>
            <button
              type="button"
              onClick={() => handleScrollLink('pesan')}
              className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#5A5550] hover:bg-[#F5EFEB]"
            >
              Form Pemesanan
            </button>
            <Link
              to="/track"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive('/track') ? 'bg-[#EADBC8]/60 text-[#1E1E1E]' : 'text-[#5A5550]'
              }`}
            >
              <Search className="h-4 w-4 text-[#A6885E]" />
              Lacak Pesanan
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive('/admin') ? 'bg-[#EADBC8]/60 text-[#1E1E1E]' : 'text-[#5A5550]'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#A6885E]" />
              Admin Dashboard
            </Link>
            <button
              type="button"
              onClick={() => handleScrollLink('pesan')}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#1E1E1E] px-5 py-3 text-sm font-medium text-[#FAF8F5]"
            >
              <ShoppingBag className="h-4 w-4 text-[#C5A880]" />
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
