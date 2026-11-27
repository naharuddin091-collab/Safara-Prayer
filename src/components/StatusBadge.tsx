import React from 'react';
import { OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: 'border-[#C5A880] bg-[#EADBC8]/60 text-[#7A5C32]',
  Diproses: 'border-sky-300 bg-sky-50 text-sky-800',
  Dikirim: 'border-indigo-300 bg-indigo-50 text-indigo-800',
  Selesai: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Dibatalkan: 'border-rose-300 bg-rose-50 text-rose-700',
};

const STATUS_DOTS: Record<OrderStatus, string> = {
  Pending: 'bg-[#C5A880]',
  Diproses: 'bg-sky-500',
  Dikirim: 'bg-indigo-500',
  Selesai: 'bg-emerald-500',
  Dibatalkan: 'bg-rose-500',
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const padding = size === 'md' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${padding} ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {status}
    </span>
  );
};
