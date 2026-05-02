-- Phase 2: extend user_profiles with onboarding fields
-- Columns are nullable: handle_new_user trigger creates profile before onboarding.
-- onboarding_completed is the only NOT NULL column (false by default).
alter table public.user_profiles
  add column if not exists age               smallint check (age >= 13 and age <= 120),
  add column if not exists sex               text check (sex in ('masculino', 'feminino', 'outro')),
  add column if not exists weight_kg         numeric(5,1) check (weight_kg >= 30 and weight_kg <= 400),
  add column if not exists height_cm         smallint check (height_cm >= 100 and height_cm <= 250),
  add column if not exists goal              text check (goal in ('emagrecimento', 'hipertrofia', 'saude_geral', 'qualidade_sono')),
  add column if not exists training_level    text check (training_level in ('iniciante', 'intermediario', 'avancado')),
  add column if not exists days_per_week     smallint check (days_per_week >= 1 and days_per_week <= 7),
  add column if not exists minutes_per_day   smallint check (minutes_per_day >= 15 and minutes_per_day <= 240),
  add column if not exists current_supplements text[] default '{}',
  add column if not exists profile_type      text,
  add column if not exists onboarding_completed boolean not null default false;

-- Table for initial recommendations generated at onboarding completion.
-- Phase 4 will replace this with the full rule engine.
create table if not exists public.user_initial_recs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  recs       jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.user_initial_recs enable row level security;

create policy "user_initial_recs_select_own"
  on public.user_initial_recs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_initial_recs_insert_own"
  on public.user_initial_recs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_initial_recs_update_own"
  on public.user_initial_recs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
