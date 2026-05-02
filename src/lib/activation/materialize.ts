import { createClient } from '@/lib/supabase/server';
import { getPendingActivation, clearPendingActivation } from '@/lib/qr/pending';

export type MaterializeResult =
  | { ok: true; activated: boolean }
  | { ok: false; error: string };

export async function materializeActivation(userId: string): Promise<MaterializeResult> {
  const pending = await getPendingActivation();
  if (!pending) return { ok: true, activated: false };

  const supabase = await createClient();
  const { error } = await supabase.from('product_activations').insert({
    user_id: userId,
    sku: pending.sku,
    campaign: pending.campaign ?? null,
  });

  if (error) {
    // Don't leak details to caller; cookie stays so user can retry on next login.
    return { ok: false, error: 'activation_insert_failed' };
  }

  await clearPendingActivation();
  return { ok: true, activated: true };
}
