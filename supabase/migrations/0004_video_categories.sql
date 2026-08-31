-- ===========================================================================
-- Omega Replenishers International Ministry
-- Admin-created video categories + per-video category tagging, used on the
-- new /teachings page. The School of the Prophets playlist is intentionally
-- excluded from this system -- it stands on its own with no categories.
-- ===========================================================================

create table if not exists public.video_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  label text not null unique check (char_length(label) between 1 and 60),
  display_order int not null default 0
);

comment on table public.video_categories is
  'Admin-created topic tags (e.g. Prophecy, Deliverance) for the /teachings video library.';

alter table public.video_categories enable row level security;

drop policy if exists "Public can read video categories" on public.video_categories;
create policy "Public can read video categories"
  on public.video_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage video categories" on public.video_categories;
create policy "Authenticated can manage video categories"
  on public.video_categories
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- video_category_assignments
-- Many-to-many: a YouTube video id can carry more than one category tag.
-- `video_id` is the raw YouTube video id (not a foreign key -- videos live
-- on YouTube, not in this database).
-- ---------------------------------------------------------------------------
create table if not exists public.video_category_assignments (
  video_id text not null,
  category_id uuid not null references public.video_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, category_id)
);

comment on table public.video_category_assignments is
  'Tags a YouTube video (by id) with one or more video_categories, set from /admin.';

create index if not exists video_category_assignments_category_idx
  on public.video_category_assignments (category_id);

alter table public.video_category_assignments enable row level security;

drop policy if exists "Public can read video category assignments" on public.video_category_assignments;
create policy "Public can read video category assignments"
  on public.video_category_assignments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage video category assignments" on public.video_category_assignments;
create policy "Authenticated can manage video category assignments"
  on public.video_category_assignments
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed with the topic tags already in use, so the admin editor and
-- /teachings page start with something rather than an empty list.
insert into public.video_categories (label, display_order) values
  ('Prophecy', 1),
  ('Deliverance', 2),
  ('Faith', 3),
  ('Leadership', 4),
  ('Revival', 5),
  ('Prayer', 6)
on conflict (label) do nothing;
