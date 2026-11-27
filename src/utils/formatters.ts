/**
 * Format angka ke mata uang Rupiah Indonesia (IDR)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string ke format tanggal Indonesia yang rapi
 */
export function formatDateID(isoString: string, includeTime = true): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const datePart = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);

  if (!includeTime) {
    return datePart;
  }

  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart}, ${timePart} WIB`;
}

/**
 * Generate ID Invoice unik berformat INV-YYYYMMDD-XXXX
 */
export function generateInvoiceId(existingIds: string[] = []): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `INV-${year}${month}${day}-`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let candidate = '';
  let attempts = 0;

  do {
    let suffix = '';
    for (let i = 0; i < 4; i += 1) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    candidate = `${datePrefix}${suffix}`;
    attempts += 1;
  } while (existingIds.includes(candidate) && attempts < 100);

  return candidate;
}

/**
 * Generate ID Produk unik berformat PROD-XX
 */
export function generateProductId(existingIds: string[] = []): string {
  let maxNum = 0;
  for (const id of existingIds) {
    const match = /^PROD-(\d+)$/i.exec(id);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = String(maxNum + 1).padStart(2, '0');
  return `PROD-${nextNum}`;
}

/**
 * Normalisasi nomor WhatsApp untuk pencocokan pencarian
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}
