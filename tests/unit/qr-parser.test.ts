import { describe, it, expect } from 'vitest';
import { parseToken, isValidManualCodeFormat, normalizeManualCode } from '@/lib/qr/parse';

describe('parseToken (ACT-01, ACT-02)', () => {
  it('accepts valid sku + campaign', () => {
    expect(parseToken({ sku: 'whey-protein', c: 'insta-2026-05' })).toEqual({
      sku: 'whey-protein',
      campaign: 'insta-2026-05',
    });
  });

  it('accepts sku without campaign', () => {
    expect(parseToken({ sku: 'creatina' })).toEqual({ sku: 'creatina' });
  });

  it('rejects uppercase sku', () => {
    expect(parseToken({ sku: 'WHEY-PROTEIN' })).toBeNull();
  });

  it('rejects sku with spaces', () => {
    expect(parseToken({ sku: 'whey protein' })).toBeNull();
  });

  it('rejects path traversal', () => {
    expect(parseToken({ sku: '../../../etc/passwd' })).toBeNull();
  });

  it('rejects empty sku', () => {
    expect(parseToken({ sku: '' })).toBeNull();
    expect(parseToken({})).toBeNull();
    expect(parseToken({ sku: null })).toBeNull();
  });

  it('rejects sku > 50 chars', () => {
    expect(parseToken({ sku: 'a'.repeat(51) })).toBeNull();
  });

  it('rejects campaign > 50 chars', () => {
    expect(parseToken({ sku: 'whey-protein', c: 'a'.repeat(51) })).toBeNull();
  });

  it('rejects campaign with invalid chars', () => {
    expect(parseToken({ sku: 'whey-protein', c: 'INSTA 2026' })).toBeNull();
  });
});

describe('manual code helpers (ACT-04)', () => {
  it('normalizes to uppercase + trim', () => {
    expect(normalizeManualCode('whey01')).toBe('WHEY01');
    expect(normalizeManualCode('  Whey01  ')).toBe('WHEY01');
  });

  it('accepts valid format', () => {
    expect(isValidManualCodeFormat('WHEY01')).toBe(true);
    expect(isValidManualCodeFormat('CREA01')).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(isValidManualCodeFormat('WH')).toBe(false); // < 3
    expect(isValidManualCodeFormat('!!!')).toBe(false);
    expect(isValidManualCodeFormat('whey01')).toBe(false); // lowercase
    expect(isValidManualCodeFormat('A'.repeat(21))).toBe(false); // > 20
  });
});
