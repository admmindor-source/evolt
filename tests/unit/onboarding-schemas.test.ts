import { describe, it, expect } from 'vitest';
import { Step1Schema, Step2Schema, Step3Schema, UpdateProfileSchema } from '@/lib/onboarding/schemas';

describe('Step1Schema (ONB-01)', () => {
  const valid = { age: 25, sex: 'masculino', weight_kg: 75.5, height_cm: 175 };

  it('accepts valid physical data', () => {
    expect(Step1Schema.safeParse(valid).success).toBe(true);
  });

  it('coerces string numbers from FormData', () => {
    expect(Step1Schema.safeParse({ age: '25', sex: 'feminino', weight_kg: '70', height_cm: '165' }).success).toBe(true);
  });

  it('rejects age below minimum (12)', () => {
    expect(Step1Schema.safeParse({ ...valid, age: 12 }).success).toBe(false);
  });

  it('rejects age above maximum (121)', () => {
    expect(Step1Schema.safeParse({ ...valid, age: 121 }).success).toBe(false);
  });

  it('rejects weight_kg below minimum (29)', () => {
    expect(Step1Schema.safeParse({ ...valid, weight_kg: 29 }).success).toBe(false);
  });

  it('rejects weight_kg above maximum (401)', () => {
    expect(Step1Schema.safeParse({ ...valid, weight_kg: 401 }).success).toBe(false);
  });

  it('rejects height_cm below minimum (99)', () => {
    expect(Step1Schema.safeParse({ ...valid, height_cm: 99 }).success).toBe(false);
  });

  it('rejects invalid sex value', () => {
    expect(Step1Schema.safeParse({ ...valid, sex: 'masculino-invalido' }).success).toBe(false);
  });

  it('accepts all sex enum values', () => {
    for (const sex of ['masculino', 'feminino', 'outro'] as const) {
      expect(Step1Schema.safeParse({ ...valid, sex }).success).toBe(true);
    }
  });
});

describe('Step2Schema (ONB-02)', () => {
  const valid = { goal: 'emagrecimento', training_level: 'iniciante', days_per_week: 3, minutes_per_day: 45 };

  it('accepts valid training context', () => {
    expect(Step2Schema.safeParse(valid).success).toBe(true);
  });

  it('coerces string numbers from FormData', () => {
    expect(Step2Schema.safeParse({ ...valid, days_per_week: '5', minutes_per_day: '60' }).success).toBe(true);
  });

  it('rejects invalid goal', () => {
    expect(Step2Schema.safeParse({ ...valid, goal: 'perder-peso' }).success).toBe(false);
  });

  it('rejects invalid training_level', () => {
    expect(Step2Schema.safeParse({ ...valid, training_level: 'expert' }).success).toBe(false);
  });

  it('rejects days_per_week = 0 (min is 1)', () => {
    expect(Step2Schema.safeParse({ ...valid, days_per_week: 0 }).success).toBe(false);
  });

  it('rejects days_per_week = 8 (max is 7)', () => {
    expect(Step2Schema.safeParse({ ...valid, days_per_week: 8 }).success).toBe(false);
  });

  it('rejects minutes_per_day = 14 (min is 15)', () => {
    expect(Step2Schema.safeParse({ ...valid, minutes_per_day: 14 }).success).toBe(false);
  });

  it('rejects minutes_per_day = 241 (max is 240)', () => {
    expect(Step2Schema.safeParse({ ...valid, minutes_per_day: 241 }).success).toBe(false);
  });

  it('accepts all goal values', () => {
    for (const goal of ['emagrecimento', 'hipertrofia', 'saude_geral', 'qualidade_sono'] as const) {
      expect(Step2Schema.safeParse({ ...valid, goal }).success).toBe(true);
    }
  });

  it('accepts all training_level values', () => {
    for (const training_level of ['iniciante', 'intermediario', 'avancado'] as const) {
      expect(Step2Schema.safeParse({ ...valid, training_level }).success).toBe(true);
    }
  });
});

describe('Step3Schema (ONB-03)', () => {
  it('accepts empty object (current_supplements defaults to [])', () => {
    const result = Step3Schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.current_supplements).toEqual([]);
    }
  });

  it('accepts array of supplement strings', () => {
    expect(Step3Schema.safeParse({ current_supplements: ['WHEY01', 'CREA01', 'MULT01'] }).success).toBe(true);
  });

  it('accepts explicitly empty array', () => {
    expect(Step3Schema.safeParse({ current_supplements: [] }).success).toBe(true);
  });
});

describe('UpdateProfileSchema (PROF-02)', () => {
  it('accepts both fields optional (empty object)', () => {
    expect(UpdateProfileSchema.safeParse({}).success).toBe(true);
  });

  it('accepts only weight_kg', () => {
    expect(UpdateProfileSchema.safeParse({ weight_kg: 80 }).success).toBe(true);
  });

  it('accepts only goal', () => {
    expect(UpdateProfileSchema.safeParse({ goal: 'hipertrofia' }).success).toBe(true);
  });

  it('coerces string weight_kg from FormData', () => {
    expect(UpdateProfileSchema.safeParse({ weight_kg: '82.5' }).success).toBe(true);
  });

  it('rejects weight_kg below 30', () => {
    expect(UpdateProfileSchema.safeParse({ weight_kg: 29 }).success).toBe(false);
  });

  it('rejects invalid goal', () => {
    expect(UpdateProfileSchema.safeParse({ goal: 'outro-invalido' }).success).toBe(false);
  });
});
