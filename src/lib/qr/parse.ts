import { z } from 'zod';

export const PENDING_COOKIE_NAME = 'evolt_pending_activation';

const TokenSchema = z.object({
  sku: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  campaign: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

export type ActivationToken = z.infer<typeof TokenSchema>;

export function parseToken(input: {
  sku?: string | null;
  c?: string | null;
}): ActivationToken | null {
  const candidate: { sku?: string; campaign?: string } = {};
  if (typeof input.sku === 'string' && input.sku.length > 0) candidate.sku = input.sku;
  if (typeof input.c === 'string' && input.c.length > 0) candidate.campaign = input.c;
  const parsed = TokenSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

const ManualCodeSchema = z.string().min(3).max(20).regex(/^[A-Z0-9]+$/);

export function normalizeManualCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidManualCodeFormat(input: string): boolean {
  return ManualCodeSchema.safeParse(input).success;
}
