'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step2Schema } from '@/lib/onboarding/schemas';

export type Step2State =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function step2Action(
  _prev: Step2State | null,
  formData: FormData,
): Promise<Step2State> {
  const parsed = Step2Schema.safeParse({
    goal: formData.get('goal'),
    training_level: formData.get('training_level'),
    days_per_week: formData.get('days_per_week'),
    minutes_per_day: formData.get('minutes_per_day'),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding/2');

  const { error } = await supabase
    .from('user_profiles')
    .update({
      goal: parsed.data.goal,
      training_level: parsed.data.training_level,
      days_per_week: parsed.data.days_per_week,
      minutes_per_day: parsed.data.minutes_per_day,
    })
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] as string[] } };
  }

  redirect('/onboarding/3');
}
