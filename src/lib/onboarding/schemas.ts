import { z } from 'zod';

export const Step1Schema = z.object({
  age: z.coerce.number().int().min(13).max(120),
  sex: z.enum(['masculino', 'feminino', 'outro']),
  weight_kg: z.coerce.number().min(30).max(400),
  height_cm: z.coerce.number().int().min(100).max(250),
});

export const Step2Schema = z.object({
  goal: z.enum(['emagrecimento', 'hipertrofia', 'saude_geral', 'qualidade_sono', 'performance', 'definicao_muscular', 'suporte_articular']),
  training_level: z.enum(['iniciante', 'intermediario', 'avancado']),
  days_per_week: z.coerce.number().int().min(1).max(7),
  minutes_per_day: z.coerce.number().int().min(15).max(240),
});

export const Step3Schema = z.object({
  current_supplements: z.array(z.string()).default([]),
});

export const UpdateProfileSchema = z.object({
  weight_kg: z.coerce.number().min(30).max(400).optional(),
  goal: z.enum(['emagrecimento', 'hipertrofia', 'saude_geral', 'qualidade_sono', 'performance', 'definicao_muscular', 'suporte_articular']).optional(),
});

export type Step1Input = z.infer<typeof Step1Schema>;
export type Step2Input = z.infer<typeof Step2Schema>;
export type Step3Input = z.infer<typeof Step3Schema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
