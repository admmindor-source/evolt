'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginSchema, isSafeNextPath, DEFAULT_AUTHENTICATED_LANDING } from '@/lib/validation/login';
import { materializeActivation } from '@/lib/activation/materialize';

export type LoginState =
  | { ok: true }
  | { ok: false; error: string };

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, error: 'Verifique e-mail e senha.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Generic message (T-04-02 — avoid user enumeration).
    return { ok: false, error: 'E-mail ou senha incorretos.' };
  }

  // Late activation: if user scanned QR before signing up, materialize now.
  await materializeActivation(data.user.id);

  const rawNext = formData.get('next');
  const safeNext = typeof rawNext === 'string' && isSafeNextPath(rawNext) ? rawNext : DEFAULT_AUTHENTICATED_LANDING;
  redirect(safeNext);
}
