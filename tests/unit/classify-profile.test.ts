import { describe, it, expect } from 'vitest';
import { classifyProfile, type ClassifyInput } from '@/lib/onboarding/classify-profile';

const base: ClassifyInput = { goal: 'emagrecimento', training_level: 'iniciante', days_per_week: 3, age: 30 };

describe('classifyProfile (ONB-04) — all 9 profile types', () => {
  it('iniciante + emagrecimento → iniciante-emagrecimento', () => {
    expect(classifyProfile({ ...base, goal: 'emagrecimento', training_level: 'iniciante' })).toBe('iniciante-emagrecimento');
  });

  it('intermediario + emagrecimento → intermediario-emagrecimento', () => {
    expect(classifyProfile({ ...base, goal: 'emagrecimento', training_level: 'intermediario' })).toBe('intermediario-emagrecimento');
  });

  it('avancado + emagrecimento → avancado-emagrecimento', () => {
    expect(classifyProfile({ ...base, goal: 'emagrecimento', training_level: 'avancado' })).toBe('avancado-emagrecimento');
  });

  it('iniciante + hipertrofia → iniciante-hipertrofia', () => {
    expect(classifyProfile({ ...base, goal: 'hipertrofia', training_level: 'iniciante' })).toBe('iniciante-hipertrofia');
  });

  it('intermediario + hipertrofia → intermediario-hipertrofia', () => {
    expect(classifyProfile({ ...base, goal: 'hipertrofia', training_level: 'intermediario' })).toBe('intermediario-hipertrofia');
  });

  it('avancado + hipertrofia → avancado-hipertrofia', () => {
    expect(classifyProfile({ ...base, goal: 'hipertrofia', training_level: 'avancado' })).toBe('avancado-hipertrofia');
  });

  it('saude_geral + iniciante → saude-geral (ignora nível)', () => {
    expect(classifyProfile({ ...base, goal: 'saude_geral', training_level: 'iniciante' })).toBe('saude-geral');
  });

  it('saude_geral + intermediario → saude-geral (ignora nível)', () => {
    expect(classifyProfile({ ...base, goal: 'saude_geral', training_level: 'intermediario' })).toBe('saude-geral');
  });

  it('saude_geral + avancado → saude-geral (ignora nível)', () => {
    expect(classifyProfile({ ...base, goal: 'saude_geral', training_level: 'avancado' })).toBe('saude-geral');
  });

  it('qualidade_sono → qualidade-sono (bonus type, ignora nível)', () => {
    expect(classifyProfile({ ...base, goal: 'qualidade_sono', training_level: 'avancado' })).toBe('qualidade-sono');
  });

  it('é pura — chamadas repetidas com mesmo input retornam mesmo resultado', () => {
    const input: ClassifyInput = { goal: 'hipertrofia', training_level: 'intermediario', days_per_week: 5, age: 28 };
    expect(classifyProfile(input)).toBe(classifyProfile(input));
  });
});
