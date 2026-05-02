'use server';

import { redirect } from 'next/navigation';
import { isValidManualCodeFormat, normalizeManualCode } from '@/lib/qr/parse';
import { setPendingActivation } from '@/lib/qr/pending';
import { createClient } from '@/lib/supabase/server';

export type SubmitManualCodeState =
  | { ok: true }
  | { ok: false; error: string };

export async function submitManualCodeAction(
  _prev: SubmitManualCodeState | null,
  formData: FormData,
): Promise<SubmitManualCodeState> {
  const raw = String(formData.get('code') ?? '');
  const code = normalizeManualCode(raw);

  if (!isValidManualCodeFormat(code)) {
    return { ok: false, error: 'Codigo invalido. Verifique e tente de novo.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('sku')
    .eq('manual_code', code)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: 'Codigo nao encontrado.' };
  }

  await setPendingActivation({ sku: data.sku });
  redirect('/signup');
}
