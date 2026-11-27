import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo, MandalaOrnament } from '@/components/BrandLogo';
import { ADMIN_WHATSAPP_NUMBER } from '@/utils/whatsapp';

const BRAND_PILLARS = ['Elegant', 'Modest', 'Serene', 'Timeless', 'Spiritual'];

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-[#E5D6C3] bg-gradient-to-b from-[#F7F1E8] to-[#EFE3D3] text-[#231F1D]">
      {/* Ornamen Pola Mandala / Floral Islami Tipis di Latar Belakang Footer */}
      <MandalaOrnament className="absolute -left-24 -top-24 h-80 w-80 text-[#C8AE8C] opacity-[0.22]" />
      <MandalaOrnament className="absolute -bottom-28 -right-24 h-96 w-96 text-[#C8AE8C] opacity-[0.2]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <BrandLogo variant="horizontal" tone="dark" />
            <p className="mt-4 max-w-md font-display text-base italic text-[#665E57]">
              "Elegance in Every Prayer, Serenity in Every Journey."
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#665E57]">
              SAFARA PRAYER hadir sebagai representasi keindahan dalam kesederhanaan,
              ketenangan dalam setiap doa, serta keteguhan dalam perjalanan spiritual Anda.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {BRAND_PILLARS.map((pillar) => (
                <span
                  key={pillar}
                  className="rounded-full border border-[#D8C4AA] bg-[#FDFBF8]/80 px-3 py-1 text-[11px] font-medium tracking-wider uppercase text-[#665E57]"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-semibold tracking-[0.2em] uppercase text-[#A38660]">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#665E57]">
              <li>
                <Link to="/" className="transition-colors hover:text-[#231F1D]">
                  Beranda & Katalog
                </Link>
              </li>
              <li>
                <Link to="/track" className="transition-colors hover:text-[#231F1D]">
                  Lacak Status Pesanan
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#231F1D]"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#A38660]" />
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-semibold tracking-[0.2em] uppercase text-[#A38660]">
              Layanan Pelanggan
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[#665E57]">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A38660]" />
                <span>Banda Aceh, Indonesia — Melayani Pengiriman Seluruh Nusantara</span>
              </div>
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#231F1D]/15 bg-[#231F1D] px-4 py-2.5 text-xs font-medium text-[#FDFBF8] shadow-xs transition-colors hover:bg-slate-800"
              >
                <MessageCircle className="h-4 w-4 text-[#C8AE8C]" />
                WhatsApp Admin: +62 812-3456-7890
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#DFCEB9] pt-6 text-xs text-[#665E57] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SAFARA PRAYER. Seluruh hak cipta dilindungi.</p>
          <p className="font-display italic text-[#8A7050]">
            May your prayers bring peace, and your journey be filled with blessings.
          </p>
        </div>
      </div>
    </footer>
  );
};
