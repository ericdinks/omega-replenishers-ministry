-- ===========================================================================
-- Omega Replenishers International Ministry
-- Roles & security hardening -- REQUIRED before the Training Portal can add
-- teacher/student logins.
--
-- Until now, every table's "manage" RLS policy has been `to authenticated
-- using (true)` -- i.e. ANY logged-in Supabase user is treated as a full
-- ministry admin, both directly against the database and via /admin's
-- server actions (which only check "is there a session"). This migration
-- introduces real roles (admin/teacher/student) via a `profiles` table and
-- tightens every existing "manage" policy to require the admin role.
-- Existing accounts are backfilled as admin so no current operator loses
-- access.
-- ===========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher', 'student')),
  full_name text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per Supabase Auth user, carrying their role (admin/teacher/student). Created automatically by the handle_new_user trigger below.';

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- is_admin(): security definer so it can read `profiles` regardless of the
-- calling role's own RLS on that table (avoids recursive-RLS issues), used
-- inside every other table's policies below.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Auto-create a profiles row whenever a new Supabase Auth user is created,
-- for every creation path (admin-created operator, admin-created teacher,
-- self-registered student) -- each just needs to pass the right role in
-- user_metadata / options.data at creation time. Defaults to 'student' if
-- none is given.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: every Supabase Auth user that exists today is a ministry admin
-- (that has been the only kind of account until now).
insert into public.profiles (id, role)
select id, 'admin' from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tighten every existing "manage" policy from `to authenticated using
-- (true)` to require the admin role.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated can manage site content" on public.site_content;
create policy "Admins can manage site content"
  on public.site_content
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage video messages" on public.video_messages;
create policy "Admins can manage video messages"
  on public.video_messages
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage donation tiers" on public.donation_tiers;
create policy "Admins can manage donation tiers"
  on public.donation_tiers
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage video categories" on public.video_categories;
create policy "Admins can manage video categories"
  on public.video_categories
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage video category assignments" on public.video_category_assignments;
create policy "Admins can manage video category assignments"
  on public.video_category_assignments
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage products" on public.products;
create policy "Admins can manage products"
  on public.products
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage product orders" on public.product_orders;
create policy "Admins can manage product orders"
  on public.product_orders
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can manage photos" on public.photos;
create policy "Admins can manage photos"
  on public.photos
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Storage: "media" bucket (hero image, posters, video messages, gallery).
drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Admins can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin(auth.uid()));

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Admins can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin(auth.uid()));

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Admins can delete media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin(auth.uid()));

-- Storage: "digital-products" bucket (private e-book/music files).
drop policy if exists "Authenticated can manage digital product files" on storage.objects;
create policy "Admins can manage digital product files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'digital-products' and public.is_admin(auth.uid()))
  with check (bucket_id = 'digital-products' and public.is_admin(auth.uid()));
