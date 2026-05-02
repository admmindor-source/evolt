'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step3Schema } from '@/lib/onboarding/schemas';
import { classifyProfile } from '@/lib/onboarding/classify-profile';
import { getInitialRecommendations } from '@/lib/onboarding/initial-recs';

export type Step3State =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function step3Action(
  _prev: Step3State | null,
  formData: FormData,
): Promise<Step3State> {
  const parsed = Step3Schema.safeParse({
    current_supplements: formData.getAll('current_supplements'),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('age, goal, training_level, days_per_week')
    .eq('user_id', user.id)
    .single();

  if (!profile?.goal || !profile?.training_level || !profile?.age) {
    redirect('/onboarding/1');
  }

  const profileType = classifyProfile({
    goal: profile.goal as 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono',
    training_level: profile.training_level as 'iniciante' | 'intermediario' | 'avancado',
    days_per_week: profile.days_per_week ?? 3,
    age: profile.age,
  });

  const { data: activation } = await supabase
    .from('product_activations')
    .select('sku')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const recs = getInitialRecommendations(profileType, activation?.sku ?? '');

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      current_supplements: parsed.data.current_supplements,
      profile_type: profileType,
      onboarding_completed: true,
    })
    .eq('user_id', user.id);

  if (updateError) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] as string[] } };
  }

  if (recs.length > 0) {
    await supabase
      .from('user_initial_recs')
      .upsert({ user_id: user.id, recs });
  }

  redirect('/onboarding/conclusao');
}
