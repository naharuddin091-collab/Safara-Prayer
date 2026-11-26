import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'monogram';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SPMonogram: React.FC<{ className?: string }> = ({ className = 'h-12 w-12' }) => (
  <svg
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Monogram SP Safara Prayer"
  >
    {/* Vertical stem & bowl of P (back layer) */}
    <path
      d="M54 36H76C90.5 36 99 44 99 56.5C99 69.5 89.5 77.5 74.5 77.5H64V112C64 115.5 65.5 117 70 117.5V120H46V117.5C50.5 117 52 115.5 52 112V43C52 39.5 50.5 38.5 46 38V36H54ZM64 41.5V72.5H72.5C82.5 72.5 87.5 66.5 87.5 56.8C87.5 47 82.2 41.5 72.5 41.5H64Z"
      fill="currentColor"
    />
    {/* Subtle cutout halo behind S diagonal to create clean intertwined illusion */}
    <path
      d="M36 44C42 54 67 66 74 79"
      stroke="#F3E5D8"
      strokeWidth="6"
      strokeLinecap="round"
      className="opacity-0"
    />
    {/* Elegant Classic Serif S (intertwined front layer) */}
    <path
      d="M78 14.5V35H75.2C73 25.2 66.2 18.8 55.2 18.8C45.2 18.8 39 24.4 39 32.6C39 40.2 44.5 44.8 57.2 51.8L64.5 55.8C78.8 63.6 84.5 71.2 84.5 82.5C84.5 97.2 72.2 106.5 54.5 106.5C45.2 106.5 37.2 104 31.8 100.2L29.2 105.2H26.8V78.5H29.6C32.4 91.8 41.2 101.2 54.2 101.2C65.2 101.2 72.6 95.4 72.6 86.2C72.6 78.2 67.2 73 54.4 66L47.2 62C33.8 54.6 28.2 47.4 28.2 36.4C28.2 22.8 39.8 13.5 55.5 13.5C63.5 13.5 70.2 15.6 74.8 18.8L76.2 14.5H78Z"
      fill="currentColor"
    />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  showTagline = false,
  className = '',
  size = 'md',
}) => {
  if (variant === 'monogram') {
    const dim = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
    return <SPMonogram className={`text-[#1C1917] ${dim} ${className}`} />;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 text-[#1C1917] ${className}`}>
        <SPMonogram className="h-10 w-10 shrink-0" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-[0.22em] uppercase">
            SAFARA
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-[0.75px] w-3 bg-[#1C1917]/50" />
            <span className="font-display text-[10px] font-medium tracking-[0.36em] uppercase text-[#57534E]">
              PRAYER
            </span>
            <span className="h-[0.75px] w-3 bg-[#1C1917]/50" />
          </div>
        </div>
      </div>
    );
  }

  const monogramSize =
    size === 'sm' ? 'h-14 w-14' : size === 'lg' ? 'h-24 w-24' : 'h-20 w-20';
  const titleSize =
    size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl';

  return (
    <div className={`inline-flex flex-col items-center text-center text-[#1C1917] ${className}`}>
      <SPMonogram className={monogramSize} />
      <span className={`mt-2 font-display font-medium tracking-[0.22em] uppercase ${titleSize}`}>
        SAFARA
      </span>
      <div className="mt-1 flex items-center gap-3">
        <span className="h-[0.75px] w-8 bg-[#1C1917]/45" />
        <span className="font-display text-xs sm:text-sm font-medium tracking-[0.42em] uppercase text-[#1C1917]/90">
          PRAYER
        </span>
        <span className="h-[0.75px] w-8 bg-[#1C1917]/45" />
      </div>
      {showTagline && (
        <p className="mt-3 max-w-xs font-display text-sm sm:text-base italic leading-snug text-[#57534E]">
          Elegance in Every Prayer,
          <br />
          Serenity in Every Journey.
        </p>
      )}
    </div>
  );
};

/* ============================================================================
 * Safara Prayer Signature Decorative Icons (Minimalist Hairline Motifs)
 * ============================================================================ */

export const LotusIcon: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg
    viewBox="0 0 48 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 6C20 13 20 22 24 29C28 22 28 13 24 6Z" />
    <path d="M24 29C17 24 13 17 14 11C19 14 22 20 24 29Z" />
    <path d="M24 29C31 24 35 17 34 11C29 14 26 20 24 29Z" />
    <path d="M24 29C14 29 8 24 6 18C12 18 18 22 24 29Z" />
    <path d="M24 29C34 29 40 24 42 18C36 18 30 22 24 29Z" />
  </svg>
);

export const DomeIcon: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg
    viewBox="0 0 36 42"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 36V19C9 14 13 10.5 18 6C23 10.5 27 14 27 19V36" />
    <path d="M18 3V6" />
    <path d="M6 36H30" />
  </svg>
);

export const SparkleStarIcon: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 6C22 14.5 25.5 18 34 18C25.5 18 22 21.5 22 30C22 21.5 18.5 18 10 18C18.5 18 22 14.5 22 6Z" />
    <path d="M10 6C10 8.8 11.2 10 14 10C11.2 10 10 11.2 10 14C10 11.2 8.8 10 6 10C8.8 10 10 8.8 10 6Z" />
    <path d="M31 27C31 29.2 31.8 30 34 30C31.8 30 31 30.8 31 33C31 30.8 30.2 30 28 30C30.2 30 31 29.2 31 27Z" />
  </svg>
);

export const DiamondIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg
    viewBox="0 0 36 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 5H26L32 13L18 28L4 13L10 5Z" />
    <path d="M4 13H32" />
    <path d="M18 28L13 13L18 5L23 13L18 28Z" />
  </svg>
);

export const SprigIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 29C15 24 20 17 25 8" />
    <path d="M18 19C13 18 10 14 11 10C15 11 18 14 18 19Z" />
    <path d="M21 15C26 14 29 10 28 6C24 7 21 10 21 15Z" />
    <path d="M14 25C19 25 23 23 24 19C20 19 16 21 14 25Z" />
  </svg>
);

export const InfinityIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg
    viewBox="0 0 44 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M13 6C8.5 6 5 8.8 5 12C5 15.2 8.5 18 13 18C18.5 18 25.5 6 31 6C35.5 6 39 8.8 39 12C39 15.2 35.5 18 31 18C25.5 18 18.5 6 13 6Z" />
  </svg>
);

export const OrnamentalCorner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 220"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.9"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <circle cx="0" cy="0" r="170" strokeDasharray="3 5" opacity="0.45" />
    <circle cx="0" cy="0" r="130" opacity="0.35" />
    <circle cx="0" cy="0" r="85" opacity="0.3" />
    <path d="M0 170C35 145 55 110 75 75C110 55 145 35 170 0" opacity="0.4" />
    <path d="M0 120C28 100 45 75 60 60C75 45 100 28 120 0" opacity="0.35" />
    <path d="M35 0C35 45 75 75 115 75" opacity="0.28" />
    <path d="M0 35C45 35 75 75 75 115" opacity="0.28" />
  </svg>
);
