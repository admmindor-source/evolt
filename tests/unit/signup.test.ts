import { describe, it, expect } from 'vitest';
import { SignupSchema } from '@/lib/validation/signup';
import { LoginSchema, isSafeNextPath } from '@/lib/validation/login';

describe('SignupSchema (AUTH-01)', () => {
  const valid = {
    full_name: 'Maria Silva',
    email: 'maria@example.com',
    whatsapp: '+5511999999999',
    password: 'longpass1',
  };

  it('accepts valid input', () => {
    expect(SignupSchema.safeParse(valid).success).toBe(true);
  });

  it('lowercases email', () => {
    const r = SignupSchema.parse({ ...valid, email: 'MARIA@EXAMPLE.COM' });
    expect(r.email).toBe('maria@example.com');
  });

  it('rejects short full_name', () => {
    expect(SignupSchema.safeParse({ ...valid, full_name: 'A' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(SignupSchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false);
  });

  it('rejects whatsapp with letters', () => {
    expect(SignupSchema.safeParse({ ...valid, whatsapp: '+55ABC999999999' }).success).toBe(false);
  });

  it('rejects short password', () => {
    expect(SignupSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
  });

  it('rejects password longer than bcrypt limit', () => {
    expect(SignupSchema.safeParse({ ...valid, password: 'a'.repeat(73) }).success).toBe(false);
  });
});

describe('LoginSchema (AUTH-02)', () => {
  it('accepts email + password', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('rejects empty password', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('isSafeNextPath (open redirect prevention)', () => {
  it('accepts simple path', () => {
    expect(isSafeNextPath('/home')).toBe(true);
    expect(isSafeNextPath('/onboarding/passo-2')).toBe(true);
    expect(isSafeNextPath('/perfil?tab=geral')).toBe(true);
  });

  it('rejects protocol-relative URL', () => {
    expect(isSafeNextPath('//evil.com/x')).toBe(false);
  });

  it('rejects absolute URL', () => {
    expect(isSafeNextPath('https://evil.com')).toBe(false);
  });

  it('rejects javascript: URL', () => {
    expect(isSafeNextPath('javascript:alert(1)')).toBe(false);
  });

  it('rejects backslash trick', () => {
    expect(isSafeNextPath('/\\evil.com')).toBe(false);
  });

  it('rejects null/empty/non-leading-slash', () => {
    expect(isSafeNextPath(null)).toBe(false);
    expect(isSafeNextPath('')).toBe(false);
    expect(isSafeNextPath('home')).toBe(false);
  });
});
