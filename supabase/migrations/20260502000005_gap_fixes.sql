-- Gap fixes: body_measurements, hydration_logs, expanded goal values

-- 1. body_measurements table
create table if not exists public.body_measurements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  measured_at   date not null default current_date,
  cintura_cm    numeric(5,1),
  quadril_cm    numeric(5,1),
  peito_cm      numeric(5,1),
  braco_cm      numeric(5,1),
  created_at    timestamptz not null default now()
);

create index body_measurements_user_date_idx on public.body_measurements(user_id, measured_at desc);

alter table public.body_measurements enable row level security;

create policy "body_measurements_select_own"
  on public.body_measurements for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "body_measurements_insert_own"
  on public.body_measurements for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 2. hydration_logs table
create table if not exists public.hydration_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null default current_date,
  ml_added    smallint not null check (ml_added > 0),
  created_at  timestamptz not null default now()
);

create index hydration_logs_user_date_idx on public.hydration_logs(user_id, log_date desc);

alter table public.hydration_logs enable row level security;

create policy "hydration_logs_select_own"
  on public.hydration_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "hydration_logs_insert_own"
  on public.hydration_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "hydration_logs_delete_own"
  on public.hydration_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Expand goal check constraint to include new values
alter table public.user_profiles
  drop constraint if exists user_profiles_goal_check;

alter table public.user_profiles
  add constraint user_profiles_goal_check
  check (goal in ('emagrecimento', 'hipertrofia', 'saude_geral', 'qualidade_sono', 'performance', 'definicao_muscular', 'suporte_articular'));
