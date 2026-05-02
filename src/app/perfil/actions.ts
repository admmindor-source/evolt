'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpdateProfileSchema } from '@/lib/onboarding/schemas';

export type UpdateProfileState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function updateProfileAction(
  _prev: UpdateProfileState | null,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = UpdateProfileSchema.safeParse({
    weight_kg: formData.get('weight_kg') || undefined,
    goal: formData.get('goal') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/perfil');

  const updateData: Record<string, unknown> = {};
  if (parsed.data.weight_kg !== undefined) updateData.weight_kg = parsed.data.weight_kg;
  if (parsed.data.goal !== undefined) updateData.goal = parsed.data.goal;

  if (Object.keys(updateData).length === 0) {
    redirect('/perfil');
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] as string[] } };
  }

  redirect('/perfil');
}
