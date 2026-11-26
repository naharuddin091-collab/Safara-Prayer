import { Link } from 'react-router-dom';
import { ArrowDown, Search } from 'lucide-react';
import {
  BrandLogo,
  DiamondIcon,
  DomeIcon,
  InfinityIcon,
  LotusIcon,
  OrnamentalCorner,
  SparkleStarIcon,
  SprigIcon,
} from '@/components/BrandLogo';

const BRAND_CHARACTERS = [
  { icon: DiamondIcon, title: 'Elegant', subtitle: 'Anggun & Berkelas' },
  { icon: SprigIcon, title: 'Modest', subtitle: 'Sederhana & Tulus' },
  { icon: LotusIcon, title: 'Serene', subtitle: 'Tenang & Damai' },
  { icon: InfinityIcon, title: 'Timeless', subtitle: 'Relevan Sepanjang Waktu' },
  { icon: DomeIcon, title: 'Spiritual', subtitle: 'Dekat kepada Sang Pencipta' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#D6C3B3] bg-[#F3E5D8]">
      {/* Subtle decorative corner ornaments */}
      <OrnamentalCorner className="absolute -left-6 -top-6 h-56 w-56 text-[#C4AC97]" />
      <OrnamentalCorner className="absolute -bottom-6 -right-6 h-56 w-56 rotate-180 text-[#C4AC97]" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Brand Identity & Story */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D6C3B3] bg-[#FAF6F2]/80 px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] uppercase text-[#57534E]">
              <SparkleStarIcon className="h-3.5 w-3.5 text-[#1C1917]" />
              <span>Perlengkapan Ibadah Perjalanan</span>
            </div>

            <div className="mt-7 lg:hidden">
              <BrandLogo variant="full" size="md" showTagline />
            </div>

            <h1 className="mt-6 hidden font-display text-5xl font-medium leading-[1.08] tracking-[0.04em] text-[#1C1917] sm:text-6xl lg:block">
              Elegance in Every Prayer,{' '}
              <span className="italic font-normal text-[#292524]">
                Serenity in Every Journey.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#57534E] sm:text-base">
              <strong className="font-semibold text-[#1C1917]">SAFARA PRAYER</strong> hadir
              sebagai representasi keindahan dalam kesederhanaan, ketenangan dalam setiap doa,
              serta keteguhan dalam perjalanan spiritual. Dirancang ringan, ringkas, dan penuh
              ketulusan untuk menemani setiap langkah ibadah Anda.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
              <a
                href="#katalog"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#1C1917] px-7 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#FAF6F2] transition hover:bg-[#292524]"
              >
                <span>Jelajahi Koleksi</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </a>

              <Link
                to="/track"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#1C1917]/35 bg-[#FAF6F2]/75 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#1C1917] transition hover:border-[#1C1917] hover:bg-[#FAF6F2]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Lacak Pesanan</span>
              </Link>
            </div>

            {/* Philosophy Highlights */}
            <div className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-[#D6C3B3] pt-7">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <LotusIcon className="h-6 w-6 text-[#1C1917]" />
                <span className="mt-2 font-display text-sm font-semibold tracking-[0.14em] uppercase text-[#1C1917]">
                  Serenity
                </span>
                <span className="mt-0.5 text-xs text-[#57534E]">
                  Tenang &amp; damai dalam beribadah
                </span>
              </div>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <SparkleStarIcon className="h-6 w-6 text-[#1C1917]" />
                <span className="mt-2 font-display text-sm font-semibold tracking-[0.14em] uppercase text-[#1C1917]">
                  Timeless
                </span>
                <span className="mt-0.5 text-xs text-[#57534E]">
                  Klasik &amp; relevan sepanjang waktu
                </span>
              </div>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <DomeIcon className="h-6 w-6 text-[#1C1917]" />
                <span className="mt-2 font-display text-sm font-semibold tracking-[0.14em] uppercase text-[#1C1917]">
                  Spiritual
                </span>
                <span className="mt-0.5 text-xs text-[#57534E]">
                  Dekat kepada Sang Pencipta
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Arch-Framed Editorial Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm">
              <div className="arch-frame overflow-hidden border border-[#D6C3B3] bg-[#E8D4C3] p-3 shadow-sm">
                <div className="arch-frame relative aspect-[4/5] overflow-hidden bg-[#FAF6F2]">
                  <img
                    src="/images/hero-sajadah.jpg"
                    alt="Koleksi perlengkapan ibadah travel Safara Prayer"
                    className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/55 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-[#FAF6F2]">
                    <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#F3E5D8]">
                      Signature Travel Collection
                    </p>
                    <p className="mt-1 font-display text-xl italic">
                      Ringan dibawa, khusyuk di setiap sujud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Brand Monogram Seal */}
              <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-[#D6C3B3] bg-[#FAF6F2]/95 px-4 py-3 shadow-sm backdrop-blur sm:block">
                <BrandLogo variant="horizontal" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Character Strip (Karakter Brand) */}
        <div className="mt-14 rounded-2xl border border-[#D6C3B3] bg-[#E8D4C3]/75 px-5 py-6 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:max-w-xs lg:text-left">
              <p className="font-display text-xs font-semibold tracking-[0.26em] uppercase text-[#1C1917]">
                Karakter Brand
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                Keindahan sejati bukan hanya tentang penampilan, tetapi juga ketulusan hati.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5 lg:w-auto lg:flex-1 lg:divide-x lg:divide-[#D6C3B3]">
              {BRAND_CHARACTERS.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="flex flex-col items-center px-2 text-center"
                >
                  <Icon className="h-5 w-5 text-[#1C1917]" />
                  <span className="mt-2 font-display text-sm font-semibold text-[#1C1917]">
                    {title}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-tight text-[#57534E]">
                    {subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
