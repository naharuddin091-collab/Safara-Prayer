-- ============================================================================
-- Safara Prayer — Supabase Database Schema (products, orders, order_items)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_code text not null unique,
  customer_name text not null,
  customer_whatsapp text not null,
  shipping_address text not null,
  notes text not null default '',
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0)
);

-- ----------------------------------------------------------------------------
-- 2. INDEXES
-- ----------------------------------------------------------------------------

create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_orders_invoice_code on public.orders (invoice_code);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- ----------------------------------------------------------------------------
-- 3. TRIGGERS (updated_at)
-- ----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.handle_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full access to products" on public.products;
create policy "Admin full access to products"
  on public.products
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can view orders for tracking" on public.orders;
create policy "Public can view orders for tracking"
  on public.orders
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full access to orders" on public.orders;
create policy "Admin full access to orders"
  on public.orders
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public can insert order items" on public.order_items;
create policy "Public can insert order items"
  on public.order_items
  for insert
  to anon, authenticated
  with check (quantity > 0);

drop policy if exists "Public can view order items" on public.order_items;
create policy "Public can view order items"
  on public.order_items
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full access to order items" on public.order_items;
create policy "Admin full access to order items"
  on public.order_items
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 5. SEED DATA PRODUK SAJADAH & PERLENGKAPAN IBADAH (LIGHT WARM LOCAL IMAGES)
-- ----------------------------------------------------------------------------

insert into public.products (name, slug, description, price, stock, image_url, is_active)
values
  (
    'Sajadah Travel Turki Velvet',
    'sajadah-travel-turki-velvet',
    'Sajadah travel unggulan berbahan beludru lembut bernuansa champagne beige dengan motif mihrab Islami emboss dan rumbai rapi. Dilengkapi drawstring velvet pouch berujung emas.',
    120000,
    30,
    '/images/sajadah-travel-velvet.jpg',
    true
  ),
  (
    'Sajadah Travel Ivory Minimalis',
    'sajadah-travel-ivory-minimalis',
    'Sajadah travel warna warm ivory dengan detail bordir mihrab elegan yang tenang dan bersih. Ringan, mudah dilipat, serta dilengkapi pouch resleting ivory senada.',
    60000,
    40,
    '/images/product-ivory.jpg',
    true
  ),
  (
    'Sajadah Travel Warm Taupe Pocket',
    'sajadah-travel-warm-taupe-pocket',
    'Sajadah saku ultra-ringkas bernuansa warm taupe berbahan parasut halus tahan air. Praktis disimpan di tas harian untuk pelajar, pekerja dinamis, hingga wisatawan muslim.',
    50000,
    35,
    '/images/product-taupe.jpg',
    true
  ),
  (
    'Sajadah Travel Deep Charcoal Gold',
    'sajadah-travel-deep-charcoal-gold',
    'Sajadah travel warna deep charcoal berwibawa dengan list bordir geometris emas hangat. Dilengkapi pouch resleting kanvas lembut yang maskulin sekaligus elegan.',
    85000,
    25,
    '/images/product-charcoal.jpg',
    true
  ),
  (
    'Hampers Sajadah Eksklusif Box',
    'hampers-sajadah-eksklusif-box',
    'Set bingkisan sajadah mewah dalam Signature Light Warm Hardbox berpita satin hitam, lengkap dengan paper bag monogram SP, sajadah emboss, velvet pouch, dan kartu doa.',
    450000,
    15,
    '/images/safara-packaging.jpg',
    true
  )
on conflict (slug) do update set
  image_url = excluded.image_url,
  description = excluded.description;
