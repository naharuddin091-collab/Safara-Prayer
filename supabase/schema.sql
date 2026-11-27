-- ============================================================================
-- Safara Prayer — Supabase Database Schema, RLS & Seed Data (Light Warm Sajadah)
-- Jalankan script ini sekali di Supabase SQL Editor -> Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.safara_products (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  description text not null default '',
  image_url text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safara_orders (
  id text primary key,
  customer_name text not null,
  whatsapp text not null,
  address text not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total_price integer not null check (total_price >= 0),
  notes text not null default '',
  payment_method text not null check (
    payment_method in ('Transfer Bank BCA/BSI', 'QRIS', 'COD (Bayar di Tempat)')
  ),
  status text not null default 'Pending' check (
    status in ('Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. INDEXES
-- ----------------------------------------------------------------------------

create index if not exists idx_safara_products_category on public.safara_products (category);
create index if not exists idx_safara_products_available on public.safara_products (is_available);
create index if not exists idx_safara_orders_status on public.safara_orders (status);
create index if not exists idx_safara_orders_whatsapp on public.safara_orders (whatsapp);
create index if not exists idx_safara_orders_created_at on public.safara_orders (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------

create or replace function public.handle_safara_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_safara_products_updated_at on public.safara_products;
create trigger trg_safara_products_updated_at
before update on public.safara_products
for each row
execute function public.handle_safara_updated_at();

drop trigger if exists trg_safara_orders_updated_at on public.safara_orders;
create trigger trg_safara_orders_updated_at
before update on public.safara_orders
for each row
execute function public.handle_safara_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

alter table public.safara_products enable row level security;
alter table public.safara_orders enable row level security;

drop policy if exists "Allow full access to safara_products" on public.safara_products;
create policy "Allow full access to safara_products"
  on public.safara_products
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow full access to safara_orders" on public.safara_orders;
create policy "Allow full access to safara_orders"
  on public.safara_orders
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 5. SEED DATA (8 Produk Katalog Sajadah & Perlengkapan Ibadah Safara Prayer)
-- ----------------------------------------------------------------------------

insert into public.safara_products (id, name, category, price, stock, description, image_url, is_available)
values
  (
    'PROD-01',
    'Sajadah Travel Turki Velvet',
    'Sajadah Travel',
    120000,
    30,
    'Sajadah travel unggulan berbahan beludru lembut bernuansa champagne beige dengan motif mihrab Islami emboss dan rumbai rapi. Dilengkapi drawstring velvet pouch berujung emas.',
    '/images/sajadah-travel-velvet.jpg',
    true
  ),
  (
    'PROD-02',
    'Sajadah Travel Ivory Minimalis',
    'Sajadah Travel',
    60000,
    40,
    'Sajadah travel warna warm ivory dengan detail bordir mihrab elegan yang tenang dan bersih. Ringan, mudah dilipat, serta dilengkapi pouch resleting ivory senada.',
    '/images/product-ivory.jpg',
    true
  ),
  (
    'PROD-03',
    'Sajadah Travel Warm Taupe Pocket',
    'Sajadah Travel',
    50000,
    35,
    'Sajadah saku ultra-ringkas bernuansa warm taupe berbahan parasut halus tahan air. Praktis disimpan di tas harian untuk pelajar, pekerja dinamis, hingga wisatawan muslim.',
    '/images/product-taupe.jpg',
    true
  ),
  (
    'PROD-04',
    'Sajadah Travel Deep Charcoal Gold',
    'Sajadah Travel',
    85000,
    25,
    'Sajadah travel warna deep charcoal berwibawa dengan list bordir geometris emas hangat. Dilengkapi pouch resleting kanvas lembut yang maskulin sekaligus elegan.',
    '/images/product-charcoal.jpg',
    true
  ),
  (
    'PROD-05',
    'Sajadah Travel Woven Sand',
    'Sajadah Travel',
    95000,
    20,
    'Sajadah travel tenun halus bermotif geometris Islami dalam palet warm sand. Nyaman digunakan di berbagai permukaan dan hadir bersama pouch resleting taupe.',
    '/images/hero-sajadah.jpg',
    true
  ),
  (
    'PROD-06',
    'Hampers Sajadah Eksklusif Box',
    'Hampers Sajadah',
    450000,
    15,
    'Set bingkisan sajadah mewah dalam Signature Light Warm Hardbox berpita satin hitam, lengkap dengan paper bag monogram SP, sajadah emboss, velvet pouch, dan kartu doa.',
    '/images/safara-packaging.jpg',
    true
  ),
  (
    'PROD-07',
    'Mukena Safara Silk Premium',
    'Mukena',
    285000,
    25,
    'Mukena berbahan Armani Silk ivory yang lembut, sejuk di kulit, dan dihiasi renda tonal halus. Dilengkapi pouch serut sutra berujung emas yang anggun untuk perjalanan.',
    '/images/mukena-safara-silk.jpg',
    true
  ),
  (
    'PROD-08',
    'Paket Perlengkapan Umrah Lengkap',
    'Perlengkapan Umrah',
    850000,
    10,
    'Paket terpadu bernuansa ivory & warm beige untuk perjalanan suci: sajadah travel gulung, busana ibadah lembut, tasbih mutiara 33 butir, buku doa linen, dan travel organizer.',
    '/images/paket-umrah-lengkap.jpg',
    true
  )
on conflict (id) do nothing;

-- 3 Contoh Pesanan Awal
insert into public.safara_orders (
  id, customer_name, whatsapp, address, product_id, product_name,
  quantity, unit_price, total_price, notes, payment_method, status, created_at
)
values
  (
    'INV-20261124-8A2F',
    'Aisyah Rahmadani',
    '081260448811',
    'Jl. Teuku Umar No. 42, Setui, Banda Aceh, Aceh 23243',
    'PROD-01',
    'Sajadah Travel Turki Velvet',
    2,
    120000,
    240000,
    'Mohon bungkus rapi dengan kartu ucapan Safara Prayer.',
    'Transfer Bank BCA/BSI',
    'Pending',
    '2026-11-24T09:15:00.000Z'
  ),
  (
    'INV-20261123-4K9M',
    'Nadia Putri Azzahra',
    '085277193340',
    'Komplek Griya Indah Blok C-12, Medan Sunggal, Sumatera Utara 20122',
    'PROD-06',
    'Hampers Sajadah Eksklusif Box',
    1,
    450000,
    450000,
    'Kartu ucapan: Barakallahu fiikum untuk Ibu tercinta.',
    'QRIS',
    'Diproses',
    '2026-11-23T14:40:00.000Z'
  ),
  (
    'INV-20261120-7P3X',
    'Muhammad Farhan Hakim',
    '081398221045',
    'Jl. Kemang Raya No. 18, Jakarta Selatan, DKI Jakarta 12730',
    'PROD-08',
    'Paket Perlengkapan Umrah Lengkap',
    2,
    850000,
    1700000,
    'Untuk keberangkatan Umrah awal bulan depan, terima kasih.',
    'Transfer Bank BCA/BSI',
    'Selesai',
    '2026-11-20T06:25:00.000Z'
  )
on conflict (id) do nothing;
