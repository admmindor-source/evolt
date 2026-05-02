import { describe, it, expect } from 'vitest';
import {
  getDailyBlocks,
  getWorkoutDetail,
  getSupplementDetail,
  getDayNumber,
} from '@/lib/routine/templates';

describe('getDailyBlocks', () => {
  it('returns 4 blocks for any profile type', () => {
    const blocks = getDailyBlocks('intermediario-hipertrofia');
    expect(blocks).toHaveLength(4);
  });

  it('blocks cover all 4 categories', () => {
    const blocks = getDailyBlocks('iniciante-emagrecimento');
    const cats = blocks.map((b) => b.category);
    expect(cats).toContain('supplement');
    expect(cats).toContain('workout');
    expect(cats).toContain('nutrition');
    expect(cats).toContain('hydration');
  });

  it('falls back to saude-geral for unknown profile', () => {
    // @ts-expect-error testing unknown value
    const blocks = getDailyBlocks('unknown-type');
    expect(blocks).toHaveLength(4);
  });

  it('returns blocks for all 8 profile types without throwing', () => {
    const types = [
      'iniciante-emagrecimento',
      'intermediario-emagrecimento',
      'avancado-emagrecimento',
      'iniciante-hipertrofia',
      'intermediario-hipertrofia',
      'avancado-hipertrofia',
      'saude-geral',
      'qualidade-sono',
    ] as const;
    for (const t of types) {
      expect(() => getDailyBlocks(t)).not.toThrow();
      expect(getDailyBlocks(t)).toHaveLength(4);
    }
  });
});

describe('getWorkoutDetail', () => {
  it('returns a workout with exercises for hipertrofia', () => {
    const w = getWorkoutDetail('intermediario-hipertrofia');
    expect(w.exercises.length).toBeGreaterThan(0);
    expect(w.title).toContain('Hipertrofia');
    expect(w.duration).toBeTruthy();
  });

  it('each exercise has name, sets, reps and rest', () => {
    const w = getWorkoutDetail('avancado-emagrecimento');
    for (const ex of w.exercises) {
      expect(ex.name).toBeTruthy();
      expect(typeof ex.sets).toBe('number');
      expect(ex.reps).toBeTruthy();
      expect(ex.rest).toBeTruthy();
    }
  });

  it('falls back for unknown profile', () => {
    // @ts-expect-error testing unknown value
    const w = getWorkoutDetail('unknown');
    expect(w.exercises.length).toBeGreaterThan(0);
  });
});

describe('getSupplementDetail', () => {
  it('returns detail for WHEY01', () => {
    const s = getSupplementDetail('WHEY01');
    expect(s.name).toBe('Proteína Whey');
    expect(s.howToUse).toBeTruthy();
    expect(s.benefits).toBeTruthy();
    expect(s.tip).toBeTruthy();
  });

  it('returns detail for all 6 SKUs', () => {
    const skus = ['WHEY01', 'CREA01', 'MULT01', 'OMEG01', 'PRET01', 'JOIN01'];
    for (const sku of skus) {
      const s = getSupplementDetail(sku);
      expect(s.name).toBeTruthy();
      expect(s.howToUse).toBeTruthy();
    }
  });

  it('returns fallback for unknown SKU', () => {
    const s = getSupplementDetail('UNKNOWN');
    expect(s.howToUse).toBeTruthy();
  });
});

describe('getDayNumber', () => {
  it('returns 1 for activation today', () => {
    const today = new Date().toISOString();
    expect(getDayNumber(today)).toBe(1);
  });

  it('returns 2 for activation yesterday', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    expect(getDayNumber(yesterday)).toBe(2);
  });

  it('returns at least 1 for future activation date (edge case)', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(getDayNumber(future)).toBeGreaterThanOrEqual(1);
  });
});
