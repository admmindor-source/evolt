-- 20260501000001_rls_policies.sql
-- Phase 1: RLS for products, user_profiles, product_activations

-- products: catalog publico (anon + authenticated podem ler ativos)
alter table public.products enable row level security;

create policy "products_select_active_public"
  on public.products for select
  to anon, authenticated
  using (active = true);
-- Sem INSERT/UPDATE/DELETE — admin via service_role apenas

-- user_profiles: dono apenas
alter table public.user_profiles enable row level security;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- product_activations: dono apenas
alter table public.product_activations enable row level security;

create policy "activations_select_own"
  on public.product_activations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "activations_insert_own"
  on public.product_activations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
