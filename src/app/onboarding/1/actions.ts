'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step1Schema } from '@/lib/onboarding/schemas';

export type Step1State =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function step1Action(
  _prev: Step1State | null,
  formData: FormData,
): Promise<Step1State> {
  const parsed = Step1Schema.safeParse({
    age: formData.get('age'),
    sex: formData.get('sex'),
    weight_kg: formData.get('weight_kg'),
    height_cm: formData.get('height_cm'),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding/1');

  const { error } = await supabase
    .from('user_profiles')
    .update({
      age: parsed.data.age,
      sex: parsed.data.sex,
      weight_kg: parsed.data.weight_kg,
      height_cm: parsed.data.height_cm,
    })
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, errors: { _form: ['Erro ao salvar. Tente novamente.'] as string[] } };
  }

  redirect('/onboarding/2');
}
