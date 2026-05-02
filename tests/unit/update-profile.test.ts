import { describe, it, expect, vi, beforeEach } from 'vitest';

const updateImpl = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-test-123', email: 'test@example.com' } } }),
    },
    from: (_table: string) => ({
      update: (_data: unknown) => ({
        eq: (_col: string, _val: string) => updateImpl(),
      }),
    }),
  }),
}));

const { updateProfileAction } = await import('@/app/perfil/actions');

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    if (v !== '') fd.append(k, v);
  }
  return fd;
}

describe('updateProfileAction (PROF-02)', () => {
  beforeEach(() => {
    updateImpl.mockClear();
    updateImpl.mockImplementation(async () => ({ error: null }));
  });

  it('calls supabase update with weight_kg when provided', async () => {
    const fd = makeFormData({ weight_kg: '80' });
    // redirect() throws NEXT_REDIRECT in test env — ignore it, just check that update was called
    await updateProfileAction(null, fd).catch(() => {});
    expect(updateImpl).toHaveBeenCalledOnce();
  });

  it('calls supabase update with goal when provided', async () => {
    const fd = makeFormData({ goal: 'hipertrofia' });
    await updateProfileAction(null, fd).catch(() => {});
    expect(updateImpl).toHaveBeenCalledOnce();
  });

  it('returns error state for weight_kg below minimum (29)', async () => {
    const fd = makeFormData({ weight_kg: '29' });
    const result = await updateProfileAction(null, fd);
    expect(result?.ok).toBe(false);
    if (result && !result.ok) {
      expect(result.errors.weight_kg).toBeDefined();
    }
    expect(updateImpl).not.toHaveBeenCalled();
  });

  it('returns error state for invalid goal enum', async () => {
    const fd = makeFormData({ goal: 'invalido' });
    const result = await updateProfileAction(null, fd);
    expect(result?.ok).toBe(false);
    if (result && !result.ok) {
      expect(result.errors.goal).toBeDefined();
    }
    expect(updateImpl).not.toHaveBeenCalled();
  });

  it('returns error state when supabase update fails', async () => {
    updateImpl.mockImplementationOnce(async () => ({ error: { message: 'db error' } }));
    const fd = makeFormData({ weight_kg: '75' });
    const result = await updateProfileAction(null, fd);
    expect(result?.ok).toBe(false);
    if (result && !result.ok) {
      expect(result.errors._form).toBeDefined();
    }
  });

  it('does not call supabase update when both fields are empty (throws redirect)', async () => {
    const fd = makeFormData({ weight_kg: '', goal: '' });
    await expect(updateProfileAction(null, fd)).rejects.toThrow();
    expect(updateImpl).not.toHaveBeenCalled();
  });
});
