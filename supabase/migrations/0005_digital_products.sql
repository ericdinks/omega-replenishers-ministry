-- ===========================================================================
-- Omega Replenishers International Ministry
-- Digital products (e-books, music, and future product types) + orders.
--
-- Payment still runs through PayPal.me (no PayPal API integration), so
-- there is no automatic "payment confirmed" webhook. The flow is:
--   1. Customer picks a product, submits name + email (creates a pending
--      order), then is redirected to PayPal to pay the exact price.
--   2. The ministry operator checks PayPal for the matching payment and,
--      from /admin, generates a time-limited signed download link and
--      sends it to the customer directly (email, WhatsApp, etc).
--   3. The operator marks the order fulfilled.
-- ===========================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  category text not null check (char_length(category) between 1 and 60),
  price numeric(10, 2) not null check (price > 0),
  cover_image_url text,
  file_path text not null,
  is_active boolean not null default true,
  display_order int not null default 0
);

comment on table public.products is
  'Digital products (e-books, music, etc.) sold via PayPal on /store. file_path is a path inside the private digital-products storage bucket, never a public URL.';

create index if not exists products_active_idx on public.products (is_active, display_order);

alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated can manage products" on public.products;
create policy "Authenticated can manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- product_orders
-- One row per purchase attempt. Public can only ever INSERT their own
-- order (never read any of them back) -- reading and fulfilling is
-- restricted to authenticated ministry operators in /admin.
-- ---------------------------------------------------------------------------
create table if not exists public.product_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 1 and 200),
  customer_email text not null check (char_length(customer_email) between 3 and 320),
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'fulfilled'))
);

comment on table public.product_orders is
  'Purchase intents for /store products. Created by the public purchase form before redirecting to PayPal; fulfilled manually from /admin.';

create index if not exists product_orders_status_idx on public.product_orders (status, created_at desc);

alter table public.product_orders enable row level security;

drop policy if exists "Public can create product orders" on public.product_orders;
create policy "Public can create product orders"
  on public.product_orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated can manage product orders" on public.product_orders;
create policy "Authenticated can manage product orders"
  on public.product_orders
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage: a PRIVATE bucket for the actual book/music files. Unlike the
-- public "media" bucket, nothing here is publicly readable -- files are
-- only ever accessed via short-lived signed URLs generated server-side
-- with the service role key, after an operator confirms payment.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('digital-products', 'digital-products', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated can manage digital product files" on storage.objects;
create policy "Authenticated can manage digital product files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'digital-products')
  with check (bucket_id = 'digital-products');
