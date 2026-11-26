import type { OrderStatus } from '@/types/database';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  pending: {
    label: 'Menunggu Pembayaran',
    description: 'Pesanan telah diterima dan menunggu konfirmasi pembayaran Anda.',
    badgeClass: 'bg-[#F3E5D8] text-[#1C1917] border-[#D6C3B3]',
    dotClass: 'bg-[#9A6B42]',
  },
  paid: {
    label: 'Sudah Dibayar',
    description: 'Pembayaran telah diverifikasi dengan baik oleh tim Safara Prayer.',
    badgeClass: 'bg-[#EFE6DC] text-[#1C1917] border-[#C9B39E]',
    dotClass: 'bg-[#57534E]',
  },
  processing: {
    label: 'Sedang Diproses',
    description: 'Pesanan Anda sedang disiapkan dan dikemas dengan penuh ketelitian.',
    badgeClass: 'bg-[#E8D4C3] text-[#1C1917] border-[#C5AC96]',
    dotClass: 'bg-[#292524]',
  },
  shipped: {
    label: 'Dalam Pengiriman',
    description: 'Paket telah diserahkan ke kurir dan sedang dalam perjalanan menuju alamat Anda.',
    badgeClass: 'bg-[#292524] text-[#FAF6F2] border-[#292524]',
    dotClass: 'bg-[#E8D4C3]',
  },
  completed: {
    label: 'Selesai',
    description: 'Pesanan telah diterima. Semoga menghadirkan ketenangan dalam setiap ibadah.',
    badgeClass: 'bg-[#1C1917] text-[#FAF6F2] border-[#1C1917]',
    dotClass: 'bg-[#FAF6F2]',
  },
  cancelled: {
    label: 'Dibatalkan',
    description: 'Pesanan ini telah dibatalkan.',
    badgeClass: 'bg-[#FAF6F2] text-[#7F1D1D] border-[#DFB9B9]',
    dotClass: 'bg-[#991B1B]',
  },
};

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];

export const ORDER_TIMELINE_STEPS: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
];

export function buildWhatsAppConfirmationUrl(params: {
  orderCode: string;
  customerName: string;
  totalAmount: number;
  itemsSummary: string;
  shippingAddress: string;
}): string {
  const adminPhone = (
    (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '6281234567890'
  ).replace(/\D/g, '');

  const message = [
    'Assalamualaikum Safara Prayer, saya ingin mengonfirmasi pesanan:',
    '',
    `*Kode Pesanan:* ${params.orderCode}`,
    `*Nama:* ${params.customerName}`,
    `*Detail Pesanan:*`,
    params.itemsSummary,
    `*Total Tagihan:* ${formatRupiah(params.totalAmount)}`,
    `*Alamat Pengiriman:* ${params.shippingAddress}`,
    '',
    'Mohon informasi detail pembayaran. Terima kasih.',
  ].join('\n');

  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppCustomerLink(phone: string, text?: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${query}`;
}
