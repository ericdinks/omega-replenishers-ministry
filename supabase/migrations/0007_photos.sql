-- ===========================================================================
-- Omega Replenishers International Ministry
-- Photo gallery: admin-uploaded pictures grouped into albums, shown on
-- the public /gallery page. Reuses the existing public "media" Storage
-- bucket (see 0002_content_and_media.sql) -- no new bucket needed.
-- ===========================================================================

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  caption text not null default '',
  album text not null default 'General' check (char_length(album) between 1 and 200),
  display_order int not null default 0
);

comment on table public.photos is
  'Gallery pictures uploaded from /admin, grouped by album and shown on /gallery.';

create index if not exists photos_album_idx on public.photos (album, display_order, created_at desc);

alter table public.photos enable row level security;

drop policy if exists "Public can read photos" on public.photos;
create policy "Public can read photos"
  on public.photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage photos" on public.photos;
create policy "Authenticated can manage photos"
  on public.photos
  for all
  to authenticated
  using (true)
  with check (true);
