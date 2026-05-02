import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock cookies + supabase
const cookieStore = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieStore.has(name) ? { value: cookieStore.get(name)! } : undefined),
    set: (name: string, value: string) => { cookieStore.set(name, value); },
    delete: (name: string) => { cookieStore.delete(name); },
    getAll: () => [...cookieStore.entries()].map(([name, value]) => ({ name, value })),
  }),
}));

const insertCalls: any[] = [];
const insertImpl = vi.fn(async (row: any) => { insertCalls.push(row); return { error: null }; });
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (_table: string) => ({
      insert: insertImpl,
    }),
  }),
}));

const { materializeActivation } = await import('@/lib/activation/materialize');
const { PENDING_COOKIE_NAME } = await import('@/lib/qr/parse');

describe('materializeActivation (ACT-02)', () => {
  beforeEach(() => {
    cookieStore.clear();
    insertCalls.length = 0;
    insertImpl.mockClear();
  });

  it('returns activated:false when no pending cookie', async () => {
    const r = await materializeActivation('user-123');
    expect(r).toEqual({ ok: true, activated: false });
    expect(insertImpl).not.toHaveBeenCalled();
  });

  it('inserts row and clears cookie when pending', async () => {
    cookieStore.set(PENDING_COOKIE_NAME, JSON.stringify({ sku: 'whey-protein', campaign: 'insta-2026-05' }));
    const r = await materializeActivation('user-123');
    expect(r).toEqual({ ok: true, activated: true });
    expect(insertImpl).toHaveBeenCalledOnce();
    expect(insertCalls[0]).toEqual({
      user_id: 'user-123',
      sku: 'whey-protein',
      campaign: 'insta-2026-05',
    });
    expect(cookieStore.has(PENDING_COOKIE_NAME)).toBe(false);
  });

  it('handles cookie without campaign', async () => {
    cookieStore.set(PENDING_COOKIE_NAME, JSON.stringify({ sku: 'creatina' }));
    const r = await materializeActivation('user-9');
    expect(r).toEqual({ ok: true, activated: true });
    expect(insertCalls[0].campaign).toBeNull();
  });

  it('keeps cookie if insert fails (so user can retry)', async () => {
    insertImpl.mockImplementationOnce(async () => ({ error: { message: 'boom' } }));
    cookieStore.set(PENDING_COOKIE_NAME, JSON.stringify({ sku: 'whey-protein' }));
    const r = await materializeActivation('user-x');
    expect(r).toEqual({ ok: false, error: 'activation_insert_failed' });
    expect(cookieStore.has(PENDING_COOKIE_NAME)).toBe(true);
  });
});
