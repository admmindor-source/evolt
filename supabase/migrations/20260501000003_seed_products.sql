-- 20260501000003_seed_products.sql
-- Phase 1: Seed dos 6 SKUs EVOLT iniciais

insert into public.products (sku, name, description, category, manual_code, price_brl, active)
values
  ('whey-protein',     'Whey Protein',     'Suporte proteico de absorcao rapida para apos o treino.',     'protein',        'WHEY01', 149.90, true),
  ('creatina',         'Creatina',         'Forca, desempenho e constancia em treinos de qualquer nivel.', 'creatine',       'CREA01',  89.90, true),
  ('pre-treino',       'Pre-treino',       'Energia e foco antes do treino para sessoes mais intensas.',   'pre_workout',    'PRE01',  119.90, true),
  ('multivitaminico',  'Multivitaminico',  'Cobertura nutricional base para rotina corrida.',              'multivit',       'MULTI01', 79.90, true),
  ('omega-3',          'Omega 3',          'Saude geral, bem-estar e suporte cardiovascular.',             'omega3',         'OMEGA01', 69.90, true),
  ('articulacoes',     'Articulacoes',     'Suporte articular e conforto para impacto e maior idade.',     'joint_support',  'JOINT01', 109.90, true)
on conflict (sku) do update
  set name = excluded.name,
      description = excluded.description,
      category = excluded.category,
      manual_code = excluded.manual_code,
      price_brl = excluded.price_brl,
      active = excluded.active;
