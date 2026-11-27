import { Order } from '@/types';
import { formatDateID, formatRupiah } from '@/utils/formatters';

export const ADMIN_WHATSAPP_NUMBER = '6281234567890';

/**
 * Membuat URL WhatsApp terstruktur untuk konfirmasi pesanan baru ke Admin Safara Prayer
 */
export function buildOrderWhatsAppUrl(order: Order): string {
  const lines = [
    'Assalamu\'alaikum Admin *Safara Prayer* ✨',
    'Saya ingin mengonfirmasi pesanan saya dengan rincian berikut:',
    '',
    `*No. Invoice:* ${order.id}`,
    `*Tanggal:* ${formatDateID(order.createdAt)}`,
    `*Nama Pemesan:* ${order.customerName}`,
    `*No. WhatsApp:* ${order.whatsapp}`,
    `*Alamat Pengiriman:* ${order.address}`,
    '',
    '*Rincian Pesanan:*',
    `• Produk: ${order.productName}`,
    `• Jumlah: ${order.quantity} pcs`,
    `• Harga Satuan: ${formatRupiah(order.unitPrice)}`,
    `• *Total Pembayaran: ${formatRupiah(order.totalPrice)}*`,
    `• Metode Pembayaran: ${order.paymentMethod}`,
    order.notes.trim() ? `• Catatan: ${order.notes.trim()}` : '• Catatan: -',
    '',
    'Mohon informasi langkah selanjutnya untuk penyelesaian pesanan. Terima kasih 🙏',
  ];

  const encodedMessage = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

/**
 * Membuat URL WhatsApp untuk menanyakan status pesanan dari halaman Lacak Pesanan
 */
export function buildTrackOrderWhatsAppUrl(order: Order): string {
  const lines = [
    'Assalamu\'alaikum Admin *Safara Prayer* ✨',
    `Saya ingin menanyakan perkembangan pesanan saya dengan nomor invoice *${order.id}*.`,
    '',
    `• Nama: ${order.customerName}`,
    `• Produk: ${order.productName} (${order.quantity} pcs)`,
    `• Total: ${formatRupiah(order.totalPrice)}`,
    `• Status Saat Ini: ${order.status}`,
    '',
    'Terima kasih atas bantuannya 🙏',
  ];

  const encodedMessage = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
