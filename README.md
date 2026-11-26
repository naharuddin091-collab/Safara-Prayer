# Safara Prayer — E-Commerce & Order Management System

Aplikasi web e-commerce & manajemen pesanan siap produksi untuk **Safara Prayer** (Sajadah Travel Premium), dibangun menggunakan **Vite + React + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + React Hook Form + Zod + Supabase (PostgreSQL, Auth, Storage, RLS)**.

## Fitur Utama

### Storefront Pelanggan
- **Homepage Editorial Premium**: Announcement bar, navbar, hero section, produk unggulan, kategori, keunggulan brand, banner promosi, produk terlaris, testimoni, FAQ, CTA kontak WhatsApp, dan footer.
- **Katalog Produk (`/products`)**: Pencarian, filter kategori, rentang harga, filter stok tersedia, sorting (terbaru, termurah, termahal), dan pagination.
- **Detail Produk (`/products/:slug`)**: Galeri foto, pilihan warna & varian dengan validasi stok live, spesifikasi material/ukuran/berat, Tambah ke Keranjang, Beli Sekarang, dan produk terkait.
- **Keranjang Belanja (`/cart`)**: Tersimpan di `localStorage` untuk kenyamanan pengguna, validasi voucher diskon langsung ke backend Supabase (`validate_promotion`).
- **Checkout Atomik (`/checkout`)**: Validasi form Zod, perhitungan harga & diskon diverifikasi server (`create_order_atomic`), pencegahan double checkout via `idempotency_key`, dan pengurangan stok atomik dengan `FOR UPDATE` + pencatatan `stock_movements`.
- **Lacak Pesanan (`/orders/track`)**: Pelacakan aman menggunakan Nomor Pesanan + WhatsApp/Email (`track_order`) tanpa membocorkan data pelanggan lain, lengkap dengan upload bukti bayar dan timeline pesanan.

### Dashboard Admin (`/admin`)
- **Overview & Analitik**: 8 kartu KPI, grafik penjualan & jumlah pesanan (Recharts), filter tanggal (Hari ini, 7 hari, 30 hari, Bulan ini, Custom), pesanan terbaru, produk terlaris, dan peringatan stok menipis.
- **CRUD Lengkap**: Produk (termasuk arsip & upload gambar), Kategori, Varian, Inventori & Riwayat Stok (`stock_movements`), Pesanan (verifikasi/tolak pembayaran, input resi, update status, batalkan pesanan dengan pemulihan stok otomatis — tidak pernah hard-delete), Pelanggan (termasuk anonimisasi data), Promosi/Voucher, Banner, FAQ, serta Metode Pengiriman & Pembayaran.

## Panduan Setup Supabase & Lokal

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Buat proyek Supabase** lalu jalankan SQL berikut secara berurutan di **Supabase SQL Editor**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_and_functions.sql`
   - `supabase/seed.sql` (data katalog awal Safara Prayer)

3. **Buat akun Admin pertama**:
   - Daftar user baru di **Supabase Auth → Users** (misal `admin@safaraprayer.id`).
   - Jalankan SQL berikut untuk memberikan peran `admin`:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@safaraprayer.id';
     ```

4. **Konfigurasi Environment Variables**:
   Salin `.env.example` menjadi `.env` dan isi kredensial proyek Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   VITE_WHATSAPP_NUMBER=6281234567890
   VITE_STORE_NAME=Safara Prayer
   ```

5. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```

## Deployment ke Vercel
- Push repositori ke GitHub/GitLab dan import ke Vercel.
- Tambahkan Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`, `VITE_STORE_NAME`).
- File `vercel.json` sudah dikonfigurasi untuk SPA routing React Router.
