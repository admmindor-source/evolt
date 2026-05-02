import { describe, it, expect } from 'vitest';
import { getInitialRecommendations } from '@/lib/onboarding/initial-recs';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

describe('getInitialRecommendations (ONB-06)', () => {
  it('filters out the activated SKU from results', () => {
    const recs = getInitialRecommendations('iniciante-emagrecimento', 'CREA01');
    expect(recs.find((r) => r.sku === 'CREA01')).toBeUndefined();
  });

  it('returns at most 4 recommendations', () => {
    const recs = getInitialRecommendations('avancado-hipertrofia', '');
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it('returns exactly 4 for profiles with 4 recs and no activated sku match', () => {
    const recs = getInitialRecommendations('avancado-hipertrofia', 'WHEY01');
    expect(recs.length).toBe(4);
  });

  it('returns empty array for unknown profile type (no crash)', () => {
    const recs = getInitialRecommendations('unknown-profile' as ProfileType, '');
    expect(recs).toEqual([]);
  });

  it('every rec has sku, reason_text (non-empty string), and priority (number)', () => {
    const recs = getInitialRecommendations('iniciante-hipertrofia', '');
    for (const rec of recs) {
      expect(typeof rec.sku).toBe('string');
      expect(rec.sku.length).toBeGreaterThan(0);
      expect(typeof rec.reason_text).toBe('string');
      expect(rec.reason_text.length).toBeGreaterThan(0);
      expect(typeof rec.priority).toBe('number');
    }
  });

  it('returns recs when activatedSku does not match any rec', () => {
    const recs = getInitialRecommendations('saude-geral', 'NONEXISTENT');
    expect(recs.length).toBeGreaterThan(0);
  });

  it('covers all 8 profile types without throwing', () => {
    const profiles: ProfileType[] = [
      'iniciante-emagrecimento', 'intermediario-emagrecimento', 'avancado-emagrecimento',
      'iniciante-hipertrofia', 'intermediario-hipertrofia', 'avancado-hipertrofia',
      'saude-geral', 'qualidade-sono',
    ];
    for (const p of profiles) {
      expect(() => getInitialRecommendations(p, '')).not.toThrow();
    }
  });
});
