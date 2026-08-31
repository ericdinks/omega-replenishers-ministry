-- ===========================================================================
-- Omega Replenishers International Ministry
-- Donation tiers: admin-editable giving amounts shown on /giving
-- ===========================================================================

create table if not exists public.donation_tiers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  label text not null unique check (char_length(label) between 1 and 100),
  amount numeric(10, 2) not null check (amount > 0),
  description text not null default '',
  is_active boolean not null default true,
  display_order int not null default 0
);

comment on table public.donation_tiers is
  'Preset giving amounts (label, amount, description) shown as cards on /giving. Managed from /admin.';

create index if not exists donation_tiers_active_idx on public.donation_tiers (is_active, display_order);

alter table public.donation_tiers enable row level security;

drop policy if exists "Public can read active donation tiers" on public.donation_tiers;
create policy "Public can read active donation tiers"
  on public.donation_tiers
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated can manage donation tiers" on public.donation_tiers;
create policy "Authenticated can manage donation tiers"
  on public.donation_tiers
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed with the tiers already live on the site, so nothing changes visually
-- until an operator edits them from /admin.
insert into public.donation_tiers (label, amount, description, display_order) values
  ('Seed Offering', 25, 'Sow a seed of faith into the ministry''s work.', 1),
  ('Tithe', 100, 'Bring your tithe in faithful obedience.', 2),
  ('Kingdom Partner', 250, 'Partner monthly to advance the Gospel globally.', 3),
  ('Vision Offering', 500, 'Invest directly into the ministry''s vision and outreach.', 4)
on conflict (label) do nothing;
