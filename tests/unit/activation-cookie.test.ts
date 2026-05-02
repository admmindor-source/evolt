import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers cookies BEFORE importing the module under test
const cookieStore = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieStore.has(name) ? { value: cookieStore.get(name)! } : undefined),
    set: (name: string, value: string) => { cookieStore.set(name, value); },
    delete: (name: string) => { cookieStore.delete(name); },
  }),
}));

const { setPendingActivation, getPendingActivation, clearPendingActivation } = await import('@/lib/qr/pending');
const { PENDING_COOKIE_NAME } = await import('@/lib/qr/parse');

describe('Pending activation cookie (ACT-03)', () => {
  beforeEach(() => { cookieStore.clear(); });

  it('sets and reads back token', async () => {
    await setPendingActivation({ sku: 'whey-protein', campaign: 'insta-2026-05' });
    const got = await getPendingActivation();
    expect(got).toEqual({ sku: 'whey-protein', campaign: 'insta-2026-05' });
  });

  it('returns null when cookie absent', async () => {
    expect(await getPendingActivation()).toBeNull();
  });

  it('returns null on malformed JSON', async () => {
    cookieStore.set(PENDING_COOKIE_NAME, 'not-json{{{');
    expect(await getPendingActivation()).toBeNull();
  });

  it('returns null on missing sku field', async () => {
    cookieStore.set(PENDING_COOKIE_NAME, JSON.stringify({ campaign: 'x' }));
    expect(await getPendingActivation()).toBeNull();
  });

  it('clear removes cookie', async () => {
    await setPendingActivation({ sku: 'creatina' });
    await clearPendingActivation();
    expect(await getPendingActivation()).toBeNull();
  });
});
