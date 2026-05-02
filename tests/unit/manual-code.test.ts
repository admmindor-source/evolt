import { describe, it, expect } from 'vitest';
import { isValidManualCodeFormat, normalizeManualCode } from '@/lib/qr/parse';

describe('Manual code (ACT-04) — pure helpers', () => {
  it('normalizes input', () => {
    expect(normalizeManualCode(' whey01 ')).toBe('WHEY01');
  });

  it('accepts WHEY01 format', () => {
    expect(isValidManualCodeFormat('WHEY01')).toBe(true);
  });

  it('rejects empty', () => {
    expect(isValidManualCodeFormat('')).toBe(false);
  });
});
