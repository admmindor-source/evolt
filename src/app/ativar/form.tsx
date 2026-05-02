'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { submitManualCodeAction, type SubmitManualCodeState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Validando...' : 'Continuar'}
    </Button>
  );
}

export function AtivarForm({ initialError }: { initialError: string | null }) {
  const [state, formAction] = useActionState<SubmitManualCodeState | null, FormData>(
    submitManualCodeAction,
    null,
  );
  const error = state && state.ok === false ? state.error : initialError;

  return (
    <Card>
      <h1 className="mb-1 text-2xl font-semibold">Ativar produto</h1>
      <p className="mb-6 text-sm text-[color:var(--color-evolt-muted)]">
        Digite o codigo de 6 caracteres que esta no rotulo do produto (ex: WHEY01).
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Codigo do produto"
          name="code"
          placeholder="WHEY01"
          autoComplete="off"
          autoCapitalize="characters"
          inputMode="text"
          required
          minLength={3}
          maxLength={20}
          error={error ?? undefined}
        />
        <SubmitButton />
      </form>
    </Card>
  );
}
