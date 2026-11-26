import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 border-b pb-1 text-xs font-medium tracking-[0.16em] uppercase transition-colors ${
      isActive
        ? 'border-[#1C1917] text-[#1C1917]'
        : 'border-transparent text-[#57534E] hover:border-[#D6C3B3] hover:text-[#1C1917]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6C3B3]/80 bg-[#FAF6F2]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="group focus:outline-none" aria-label="Beranda Safara Prayer">
          <BrandLogo variant="horizontal" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi Utama">
          <NavLink to="/" end className={navLinkClass}>
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Katalog &amp; Pesan</span>
            {cartCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1C1917] px-1.5 text-[10px] font-semibold text-[#FAF6F2]">
                {cartCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/track" className={navLinkClass}>
            <Search className="h-3.5 w-3.5" />
            <span>Lacak Pesanan</span>
          </NavLink>

          <NavLink to="/admin" className={navLinkClass}>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D6C3B3] bg-[#F3E5D8]/60 text-[#1C1917] transition hover:bg-[#E8D4C3] md:hidden"
          aria-label="Buka menu navigasi"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#D6C3B3]/70 bg-[#FAF6F2] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Navigasi Mobile">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium tracking-[0.14em] uppercase transition ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FAF6F2]'
                    : 'bg-[#F3E5D8]/60 text-[#1C1917] hover:bg-[#E8D4C3]'
                }`
              }
            >
              <span className="inline-flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4" />
                Katalog &amp; Pesan
              </span>
              {cartCount > 0 && (
                <span className="rounded-full bg-[#E8D4C3] px-2 py-0.5 text-[10px] font-semibold text-[#1C1917]">
                  {cartCount} item
                </span>
              )}
            </NavLink>

            <NavLink
              to="/track"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-medium tracking-[0.14em] uppercase transition ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FAF6F2]'
                    : 'bg-[#F3E5D8]/60 text-[#1C1917] hover:bg-[#E8D4C3]'
                }`
              }
            >
              <Search className="h-4 w-4" />
              Lacak Pesanan
            </NavLink>

            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-medium tracking-[0.14em] uppercase transition ${
                  isActive
                    ? 'bg-[#1C1917] text-[#FAF6F2]'
                    : 'bg-[#F3E5D8]/60 text-[#1C1917] hover:bg-[#E8D4C3]'
                }`
              }
            >
              <ShieldCheck className="h-4 w-4" />
              Panel Admin
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
