import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '@/lib/recommendations/engine';

const baseSignals = {
  profileType: 'intermediario-hipertrofia' as const,
  activatedSku: 'WHEY01',
  goal: 'hipertrofia',
  training_level: 'intermediario',
  days_per_week: 4,
  age: 28,
  weight_kg: 80,
  current_supplements: [] as string[],
};

describe('generateRecommendations', () => {
  it('never includes the activated SKU', () => {
    const recs = generateRecommendations({ ...baseSignals, activatedSku: 'CREA01' });
    expect(recs.map((r) => r.sku)).not.toContain('CREA01');
  });

  it('returns at most 4 recommendations', () => {
    const recs = generateRecommendations(baseSignals);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it('never returns duplicate SKUs', () => {
    const recs = generateRecommendations(baseSignals);
    const skus = recs.map((r) => r.sku);
    const unique = new Set(skus);
    expect(unique.size).toBe(skus.length);
  });

  it('does NOT recommend PRET01 for non-trainers (days_per_week < 2) — REC-04', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      goal: 'emagrecimento',
      days_per_week: 1,
    });
    expect(recs.map((r) => r.sku)).not.toContain('PRET01');
  });

  it('recommends PRET01 for active trainers with training goals', () => {
    const recs = generateRecommendations({ ...baseSignals, days_per_week: 4 });
    expect(recs.map((r) => r.sku)).toContain('PRET01');
  });

  it('does NOT recommend JOIN01 without context (young, normal weight, not advanced) — REC-05', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      training_level: 'iniciante',
      age: 25,
      weight_kg: 70,
    });
    expect(recs.map((r) => r.sku)).not.toContain('JOIN01');
  });

  it('recommends JOIN01 for advanced trainers — REC-05', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      training_level: 'avancado',
      activatedSku: 'WHEY01',
    });
    expect(recs.map((r) => r.sku)).toContain('JOIN01');
  });

  it('recommends JOIN01 for users over 40 — REC-05', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      training_level: 'iniciante',
      age: 45,
      weight_kg: 70,
    });
    expect(recs.map((r) => r.sku)).toContain('JOIN01');
  });

  it('recommends JOIN01 for users over 90kg — REC-05', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      training_level: 'iniciante',
      age: 25,
      weight_kg: 95,
    });
    expect(recs.map((r) => r.sku)).toContain('JOIN01');
  });

  it('excludes current_supplements from recommendations', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      current_supplements: ['CREA01', 'OMEG01'],
    });
    const skus = recs.map((r) => r.sku);
    expect(skus).not.toContain('CREA01');
    expect(skus).not.toContain('OMEG01');
  });

  it('each recommendation has reason_text and rule_id', () => {
    const recs = generateRecommendations(baseSignals);
    for (const rec of recs) {
      expect(rec.reason_text.length).toBeGreaterThan(10);
      expect(rec.rule_id).toBeTruthy();
    }
  });

  it('saude_geral profile does not get PRET01 (no training context)', () => {
    const recs = generateRecommendations({
      ...baseSignals,
      goal: 'saude_geral',
      days_per_week: 1,
      training_level: 'iniciante',
    });
    expect(recs.map((r) => r.sku)).not.toContain('PRET01');
  });
});
