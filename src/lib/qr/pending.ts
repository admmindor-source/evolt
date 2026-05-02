import { cookies } from 'next/headers';
import { PENDING_COOKIE_NAME, type ActivationToken } from './parse';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export async function setPendingActivation(token: ActivationToken): Promise<void> {
  const store = await cookies();
  store.set(PENDING_COOKIE_NAME, JSON.stringify(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function getPendingActivation(): Promise<ActivationToken | null> {
  const store = await cookies();
  const raw = store.get(PENDING_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { sku?: unknown; campaign?: unknown };
    if (typeof parsed.sku !== 'string') return null;
    const result: ActivationToken = { sku: parsed.sku };
    if (typeof parsed.campaign === 'string') result.campaign = parsed.campaign;
    return result;
  } catch {
    return null;
  }
}

export async function clearPendingActivation(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE_NAME);
}
