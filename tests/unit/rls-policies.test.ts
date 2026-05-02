import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const skipReason = !url || !anonKey ? 'NEXT_PUBLIC_SUPABASE_URL/ANON_KEY not set — run with `npx dotenv -e .env.local -- npx vitest`' : null;

describe.skipIf(skipReason)('RLS policies (SEC-01)', () => {
  let anon: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    anon = createClient<Database>(url!, anonKey!);
  });

  it('anon role cannot read user_profiles (RLS deny)', async () => {
    const { data, error } = await anon.from('user_profiles').select('user_id').limit(1);
    // Two acceptable outcomes: empty array (RLS filters all rows) OR explicit error.
    if (error) {
      expect(error.code).toMatch(/PGRST|42501/);
    } else {
      expect(data).toEqual([]);
    }
  });

  it('anon role cannot read product_activations (RLS deny)', async () => {
    const { data, error } = await anon.from('product_activations').select('id').limit(1);
    if (error) {
      expect(error.code).toMatch(/PGRST|42501/);
    } else {
      expect(data).toEqual([]);
    }
  });

  it('anon role CAN read active products (catalog public)', async () => {
    const { data, error } = await anon.from('products').select('sku, name, manual_code').eq('active', true);
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThanOrEqual(6);
    const skus = (data ?? []).map((p) => p.sku);
    expect(skus).toEqual(expect.arrayContaining([
      'whey-protein', 'creatina', 'pre-treino', 'multivitaminico', 'omega-3', 'articulacoes',
    ]));
  });

  it('anon role cannot insert into user_profiles (RLS deny)', async () => {
    const { error } = await anon.from('user_profiles').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      full_name: 'attacker',
      whatsapp: '+5500000000000',
    });
    expect(error).not.toBeNull();
  });
});
