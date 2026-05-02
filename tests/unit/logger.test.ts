import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, redact, PII_KEYS } from '@/lib/logger';

describe('redact (SEC-03)', () => {
  it('redacts email at top level', () => {
    expect(redact({ email: 'a@b.com', other: 'ok' })).toEqual({ email: '[REDACTED]', other: 'ok' });
  });

  it('redacts whatsapp nested in user object', () => {
    expect(redact({ user: { whatsapp: '+5511999', name: 'maria' } })).toEqual({
      user: { whatsapp: '[REDACTED]', name: 'maria' },
    });
  });

  it('redacts password inside arrays', () => {
    expect(redact({ items: [{ password: 'x' }, { ok: 1 }] })).toEqual({
      items: [{ password: '[REDACTED]' }, { ok: 1 }],
    });
  });

  it('redacts case-insensitive keys', () => {
    expect(redact({ Email: 'a@b.com', WHATSAPP: '+55' })).toEqual({
      Email: '[REDACTED]',
      WHATSAPP: '[REDACTED]',
    });
  });

  it('preserves primitives unchanged', () => {
    expect(redact('hello')).toBe('hello');
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBe(null);
    expect(redact(undefined)).toBe(undefined);
  });

  it('redacts tokens', () => {
    expect(redact({ access_token: 'jwt-xyz', refresh_token: 'r' })).toEqual({
      access_token: '[REDACTED]',
      refresh_token: '[REDACTED]',
    });
  });

  it('PII_KEYS list is non-empty and includes core fields', () => {
    expect(PII_KEYS).toEqual(expect.arrayContaining(['email', 'whatsapp', 'password']));
  });
});

describe('logger output (SEC-03)', () => {
  let stdoutLines: string[];
  let stderrLines: string[];
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutLines = [];
    stderrLines = [];
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
      stdoutLines.push(String(chunk));
      return true;
    });
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
      stderrLines.push(String(chunk));
      return true;
    });
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('logger.info writes redacted JSON line to stdout', () => {
    logger.info('user_signup', { email: 'maria@example.com', user_id: 'u-1' });
    const out = stdoutLines.join('');
    expect(out).toContain('user_signup');
    expect(out).toContain('[REDACTED]');
    expect(out).not.toContain('maria@example.com');
    const parsed = JSON.parse(out.trim());
    expect(parsed.meta.email).toBe('[REDACTED]');
    expect(parsed.meta.user_id).toBe('u-1');
  });

  it('logger.error writes to stderr', () => {
    logger.error('boom', { whatsapp: '+5511999999999' });
    const err = stderrLines.join('');
    expect(err).toContain('[REDACTED]');
    expect(err).not.toContain('+5511999999999');
  });
});
