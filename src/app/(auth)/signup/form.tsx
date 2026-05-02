'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signupAction, type SignupState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Criando conta...' : 'Criar conta'}
    </Button>
  );
}

function fieldError(state: SignupState | null, field: string): string | undefined {
  if (!state || state.ok) return undefined;
  const arr = state.errors[field];
  return arr?.[0];
}

export function SignupForm() {
  const [state, formAction] = useActionState<SignupState | null, FormData>(signupAction, null);
  const formError = state && state.ok === false ? state.errors._form?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nome completo"
        name="full_name"
        autoComplete="name"
        required
        minLength={2}
        maxLength={100}
        error={fieldError(state, 'full_name')}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={fieldError(state, 'email')}
      />
      <Input
        label="WhatsApp"
        name="whatsapp"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="+5511999999999"
        required
        error={fieldError(state, 'whatsapp')}
        hint="Inclua codigo do pais (+55)."
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        required
        error={fieldError(state, 'password')}
        hint="Pelo menos 8 caracteres."
      />
      {formError ? (
        <p role="alert" className="text-sm text-red-400">{formError}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
