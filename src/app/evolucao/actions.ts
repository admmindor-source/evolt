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

const LogHydrationSchema = z.object({
  ml_added: z.coerce.number().int().min(50).max(2000),
  log_date: z.string().optional(),
});

export type LogHydrationState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function logHydrationAction(
  _prev: LogHydrationState | null,
  formData: FormData,
): Promise<LogHydrationState> {
  const parsed = LogHydrationSchema.safeParse({
    ml_added: formData.get('ml_added'),
    log_date: formData.get('log_date') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, errors: { _form: ['Não autenticado.'] } };

  const { error } = await supabase.from('hydration_logs').insert({
    user_id: user.id,
    ml_added: parsed.data.ml_added,
    log_date: parsed.data.log_date ?? new Date().toLocaleDateString('sv-SE'),
  });

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] } };
  }

  revalidatePath('/rotina');
  return { ok: true };
}

export async function deleteHydrationLogAction(logId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('hydration_logs').delete().eq('id', logId).eq('user_id', user.id);
  revalidatePath('/rotina');
}

const LogBodyMeasurementsSchema = z.object({
  measured_at: z.string().optional(),
  cintura_cm: z.coerce.number().min(30).max(300).optional(),
  quadril_cm: z.coerce.number().min(30).max(300).optional(),
  peito_cm: z.coerce.number().min(30).max(300).optional(),
  braco_cm: z.coerce.number().min(10).max(100).optional(),
});

export type LogMeasurementsState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function logBodyMeasurementsAction(
  _prev: LogMeasurementsState | null,
  formData: FormData,
): Promise<LogMeasurementsState> {
  const parsed = LogBodyMeasurementsSchema.safeParse({
    measured_at: formData.get('measured_at') || undefined,
    cintura_cm: formData.get('cintura_cm') || undefined,
    quadril_cm: formData.get('quadril_cm') || undefined,
    peito_cm: formData.get('peito_cm') || undefined,
    braco_cm: formData.get('braco_cm') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, errors: { _form: ['Não autenticado.'] } };

  const { error } = await supabase.from('body_measurements').insert({
    user_id: user.id,
    measured_at: parsed.data.measured_at ?? new Date().toLocaleDateString('sv-SE'),
    cintura_cm: parsed.data.cintura_cm ?? null,
    quadril_cm: parsed.data.quadril_cm ?? null,
    peito_cm: parsed.data.peito_cm ?? null,
    braco_cm: parsed.data.braco_cm ?? null,
  });

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] } };
  }

  revalidatePath('/evolucao');
  return { ok: true };
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
