-- ===========================================================================
-- Prophet Shedrack A. O. International Ministries
-- Initial schema: prayer_requests, testimonials
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- prayer_requests
-- Captured from the public "Prayer Altar" form.
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  request text not null check (char_length(request) between 1 and 4000),
  is_public boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'answered'))
);

comment on table public.prayer_requests is
  'Confidential prayer requests submitted through the Prayer Altar page.';
comment on column public.prayer_requests.is_public is
  'True if the submitter opted to allow their testimony to be shared publicly once answered.';
comment on column public.prayer_requests.status is
  'Workflow state managed by ministry operators via the /admin dashboard.';

create index if not exists prayer_requests_status_idx on public.prayer_requests (status);
create index if not exists prayer_requests_created_at_idx on public.prayer_requests (created_at desc);

alter table public.prayer_requests enable row level security;

-- Anyone (including anonymous site visitors) may submit a prayer request,
-- but nobody can read them back through the public API. Reads are performed
-- exclusively by trusted server code using the service role key.
drop policy if exists "Public can submit prayer requests" on public.prayer_requests;
create policy "Public can submit prayer requests"
  on public.prayer_requests
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- testimonials
-- Miracle / breakthrough reports displayed on the Testimonials Wall.
-- Ministry staff add and approve entries directly (Supabase Studio or a
-- future internal tool); only approved rows are ever readable publicly.
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  testimony_date date not null default current_date,
  category text not null check (char_length(category) between 1 and 80),
  content text not null check (char_length(content) between 1 and 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

comment on table public.testimonials is
  'Miracle and breakthrough reports shown on the public Testimonials Wall.';
comment on column public.testimonials.status is
  'Only rows with status = approved are visible to public visitors.';

create index if not exists testimonials_status_idx on public.testimonials (status);
create index if not exists testimonials_date_idx on public.testimonials (testimony_date desc);

alter table public.testimonials enable row level security;

drop policy if exists "Public can read approved testimonials" on public.testimonials;
create policy "Public can read approved testimonials"
  on public.testimonials
  for select
  to anon, authenticated
  using (status = 'approved');
