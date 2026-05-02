-- 20260501000000_initial_schema.sql
-- Phase 1: Foundation — products, user_profiles, product_activations + handle_new_user trigger

-- products (catalog, no user data)
create table public.products (
  sku           text primary key,
  name          text not null,
  description   text not null,
  category      text not null check (category in ('protein','creatine','pre_workout','multivit','omega3','joint_support')),
  manual_code   text unique not null,
  price_brl     numeric(10,2),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index products_active_idx on public.products(active) where active = true;
create index products_manual_code_lower_idx on public.products(lower(manual_code));

-- user_profiles (1:1 com auth.users)
create table public.user_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  whatsapp    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- product_activations (n:1 user, n:1 sku)
create table public.product_activations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  sku           text not null references public.products(sku),
  campaign      text,
  activated_at  timestamptz not null default now()
);

create index activations_user_idx on public.product_activations(user_id);
create index activations_sku_idx on public.product_activations(sku);
create index activations_campaign_idx on public.product_activations(campaign) where campaign is not null;

-- updated_at trigger for user_profiles
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_touch_updated_at
  before update on public.user_profiles
  for each row execute function public.touch_updated_at();

-- handle_new_user: auto-create user_profiles from auth.users metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, full_name, whatsapp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
