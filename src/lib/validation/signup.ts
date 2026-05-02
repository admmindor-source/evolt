import { z } from 'zod';

export const SignupSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  whatsapp: z.string().trim().regex(/^\+?\d{10,15}$/, 'WhatsApp invalido. Use formato +5511999999999.'),
  password: z.string().min(8).max(72),
});

export type SignupInput = z.infer<typeof SignupSchema>;
