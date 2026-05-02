'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignupSchema } from '@/lib/validation/signup';
import { materializeActivation } from '@/lib/activation/materialize';

export type SignupState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> };

export async function signupAction(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const parsed = SignupSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    whatsapp: formData.get('whatsapp'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        whatsapp: parsed.data.whatsapp,
      },
    },
  });

  if (error) {
    // Generic message — do not leak whether email exists (T-04-02).
    return {
      ok: false,
      errors: { _form: ['Nao foi possivel criar a conta. Tente novamente.'] as string[] },
    };
  }

  // If email confirmations are ON, data.user may be null until user confirms.
  if (data.user) {
    await materializeActivation(data.user.id);
  }

  redirect('/onboarding');
}
