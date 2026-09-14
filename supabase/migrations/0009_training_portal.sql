-- ===========================================================================
-- Omega Replenishers International Ministry
-- Prophetic Training Portal -- Phase 1: courses, YouTube/text materials,
-- and enrollment (free = instant, paid = manual PayPal.me + admin/teacher
-- confirms, same pattern as the digital products store).
--
-- Requires 0008_roles_and_security.sql (profiles table + is_admin()) to
-- already be applied.
-- ===========================================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  price numeric(10, 2) not null default 0 check (price >= 0),
  is_active boolean not null default true
);

comment on table public.courses is
  'Training Portal courses. price = 0 means free/instant enrollment; otherwise enrollment starts pending_payment until an admin or the owning teacher confirms the PayPal payment.';

create index if not exists courses_teacher_idx on public.courses (teacher_id);
create index if not exists courses_active_idx on public.courses (is_active);

alter table public.courses enable row level security;

drop policy if exists "Public can read active courses" on public.courses;
create policy "Public can read active courses"
  on public.courses
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage all courses" on public.courses;
create policy "Admins can manage all courses"
  on public.courses
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Teachers can manage own courses" on public.courses;
create policy "Teachers can manage own courses"
  on public.courses
  for all
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- ---------------------------------------------------------------------------
-- course_enrollments
-- A student can create/read only their own enrollment rows (self-
-- registration). An admin or the owning teacher can read/update all
-- enrollments for a course, to confirm a payment or review the roster.
--
-- Created before course_materials because that table's RLS references
-- this one -- Postgres validates a CREATE POLICY's referenced tables
-- immediately, not lazily.
-- ---------------------------------------------------------------------------
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending_payment')),
  amount_due numeric(10, 2) not null default 0,
  unique (course_id, student_id)
);

comment on table public.course_enrollments is
  'One row per student per course. status starts pending_payment for paid courses until an admin/teacher confirms the PayPal payment landed, or active immediately for free courses.';

create index if not exists course_enrollments_student_idx on public.course_enrollments (student_id);
create index if not exists course_enrollments_course_idx on public.course_enrollments (course_id, status);

alter table public.course_enrollments enable row level security;

drop policy if exists "Students can create own enrollment" on public.course_enrollments;
create policy "Students can create own enrollment"
  on public.course_enrollments
  for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students can read own enrollment" on public.course_enrollments;
create policy "Students can read own enrollment"
  on public.course_enrollments
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "Admins can manage all enrollments" on public.course_enrollments;
create policy "Admins can manage all enrollments"
  on public.course_enrollments
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Teachers can manage own course enrollments" on public.course_enrollments;
create policy "Teachers can manage own course enrollments"
  on public.course_enrollments
  for all
  to authenticated
  using (exists (
    select 1 from public.courses
    where courses.id = course_enrollments.course_id
    and courses.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.courses
    where courses.id = course_enrollments.course_id
    and courses.teacher_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- course_materials
-- Readable only by an admin, the owning teacher, or a student with an
-- active enrollment in that course -- never by the public.
-- ---------------------------------------------------------------------------
create table if not exists public.course_materials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  material_type text not null check (material_type in ('youtube', 'text')),
  youtube_video_id text,
  body text not null default '',
  display_order int not null default 0
);

comment on table public.course_materials is
  'Course lessons: either an Unlisted YouTube video (youtube_video_id) or a plain text note (body).';

create index if not exists course_materials_course_idx on public.course_materials (course_id, display_order);

alter table public.course_materials enable row level security;

drop policy if exists "Admins can manage all course materials" on public.course_materials;
create policy "Admins can manage all course materials"
  on public.course_materials
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Teachers can manage own course materials" on public.course_materials;
create policy "Teachers can manage own course materials"
  on public.course_materials
  for all
  to authenticated
  using (exists (
    select 1 from public.courses
    where courses.id = course_materials.course_id
    and courses.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.courses
    where courses.id = course_materials.course_id
    and courses.teacher_id = auth.uid()
  ));

drop policy if exists "Enrolled students can read course materials" on public.course_materials;
create policy "Enrolled students can read course materials"
  on public.course_materials
  for select
  to authenticated
  using (exists (
    select 1 from public.course_enrollments
    where course_enrollments.course_id = course_materials.course_id
    and course_enrollments.student_id = auth.uid()
    and course_enrollments.status = 'active'
  ));
