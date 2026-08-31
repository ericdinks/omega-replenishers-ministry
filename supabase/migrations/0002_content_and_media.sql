-- ===========================================================================
-- Omega Replenishers International Ministry
-- Content management: editable site text, video messages, announcements
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- site_content
-- Key/value store for the small set of text fields ministry operators can
-- edit from /admin without a code deploy (homepage hero, About bio, contact
-- details). Anything not listed here is still plain code -- ask a developer
-- to change it.
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.site_content is
  'Admin-editable text fields shown on the public site (see /admin content editor).';

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage site content" on public.site_content;
create policy "Authenticated can manage site content"
  on public.site_content
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed with the real content already agreed for the site, so the admin
-- editor opens pre-filled with accurate copy rather than blank fields.
insert into public.site_content (key, value) values
  ('hero_title', 'Encounter the Prophetic Word That Changes Nations'),
  ('hero_description', 'A global ministry under Prophet Shedrack A. O., gathering people from every nation for continual intercession that replenishes the Earth. Join us live, grow through the School of the Prophets, and bring your prayer needs to the altar.'),
  ('about_description', 'A global ministry under Prophet Shedrack A. O., gathering people from every nation for continual intercession that replenishes the Earth.'),
  ('about_bio', 'A bond servant of God with the mandate to gather people from all phases of the world and let them replenish the Earth with continual intercession.'),
  ('contact_phone', '+234 806 610 1405'),
  ('contact_email', 'prophetshedrackaogboji@gmail.com'),
  ('contact_address', 'Abuja, Nigeria'),
  ('teachings_video_limit', '50')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- video_messages
-- A single "current" video message from the pastor, shown on the homepage.
-- Publishing a new one (recorded live via webcam, or uploaded from disk)
-- deactivates the previous row instead of deleting it, keeping a light
-- history without ever showing more than one on the public site.
-- ---------------------------------------------------------------------------
create table if not exists public.video_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  video_url text not null,
  source_type text not null default 'uploaded' check (source_type in ('recorded', 'uploaded')),
  caption text not null default '',
  is_active boolean not null default true
);

comment on table public.video_messages is
  'Video messages recorded or uploaded from /admin. Only the active one shows on the homepage.';

create index if not exists video_messages_active_idx on public.video_messages (is_active, created_at desc);

alter table public.video_messages enable row level security;

drop policy if exists "Public can read active video message" on public.video_messages;
create policy "Public can read active video message"
  on public.video_messages
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated can manage video messages" on public.video_messages;
create policy "Authenticated can manage video messages"
  on public.video_messages
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- announcements
-- Poster-style banners for the homepage. Admin can type text and/or upload
-- an image; multiple rows may exist, but only active ones are public, and
-- the homepage displays at most two.
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0
);

comment on table public.announcements is
  'Poster/banner announcements managed from /admin; the homepage shows active ones, most recent first, capped at two.';

create index if not exists announcements_active_idx on public.announcements (is_active, display_order, created_at desc);

alter table public.announcements enable row level security;

drop policy if exists "Public can read active announcements" on public.announcements;
create policy "Public can read active announcements"
  on public.announcements
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated can manage announcements" on public.announcements;
create policy "Authenticated can manage announcements"
  on public.announcements
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage: a public "media" bucket for video messages and announcement
-- images. Public SELECT lets the homepage display files by URL; writes are
-- restricted to authenticated (ministry operator) sessions only.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Authenticated can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Authenticated can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Authenticated can delete media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media');
