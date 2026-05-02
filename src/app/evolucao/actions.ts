'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { emitEvent } from '@/lib/analytics/emit';

const LogWeightSchema = z.object({
  weight_kg: z.coerce.number().min(30).max(400),
  measured_at: z.string().optional(),
});

export type LogWeightState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function logWeightAction(
  _prev: LogWeightState | null,
  formData: FormData,
): Promise<LogWeightState> {
  const parsed = LogWeightSchema.safeParse({
    weight_kg: formData.get('weight_kg'),
    measured_at: formData.get('measured_at') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, errors: { _form: ['Não autenticado.'] } };

  const { error } = await supabase.from('weight_logs').insert({
    user_id: user.id,
    weight_kg: parsed.data.weight_kg,
    measured_at: parsed.data.measured_at ?? new Date().toISOString(),
  });

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] } };
  }

  void emitEvent(user.id, 'progress_logged', { type: 'weight', weight_kg: parsed.data.weight_kg });
  revalidatePath('/evolucao');
  revalidatePath('/home');
  return { ok: true };
}

export async function getPhotoUploadUrlAction(
  filename: string,
  contentType: string,
): Promise<{ uploadUrl: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado.' };

  const ext = filename.split('.').pop() ?? 'jpg';
  const path = `progress/${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('progress-photos')
    .createSignedUploadUrl(path);

  if (error || !data) return { error: 'Erro ao gerar URL de upload.' };

  return { uploadUrl: data.signedUrl, path };
}

export async function recordPhotoAction(storagePath: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('progress_photos').insert({
    user_id: user.id,
    storage_path: storagePath,
    photo_type: 'progress',
    taken_at: new Date().toISOString(),
  });

  revalidatePath('/evolucao');
}

export async function deletePhotoAction(photoId: string, storagePath: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('progress_photos').delete().eq('id', photoId).eq('user_id', user.id);
  await supabase.storage.from('progress-photos').remove([storagePath]);

  revalidatePath('/evolucao');
}

export async function recordRecommendationClickedAction(
  sku: string,
  context: Record<string, string>,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('recommendation_events').insert({
    user_id: user.id,
    sku,
    event_type: 'clicked',
    context,
  });
}
