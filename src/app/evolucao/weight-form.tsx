'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { logWeightAction, type LogWeightState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Salvando...' : 'Registrar peso'}
    </Button>
  );
}

export function WeightForm() {
  const [state, formAction] = useActionState<LogWeightState | null, FormData>(logWeightAction, null);
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;
  const weightError = state && !state.ok ? state.errors.weight_kg?.[0] : undefined;
  const saved = state?.ok === true;

  const todayLocal = new Date().toLocaleDateString('sv-SE');

  return (
    <Card>
      <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
        Registrar peso
      </p>
      <form action={formAction} className="flex flex-col gap-3">
        <Input
          label="Peso (kg)"
          name="weight_kg"
          type="number"
          inputMode="decimal"
          min={30}
          max={400}
          step={0.1}
          placeholder="Ex: 80.5"
          error={weightError}
        />
        <Input
          label="Data"
          name="measured_at"
          type="date"
          defaultValue={todayLocal}
        />
        {saved && (
          <p role="status" className="text-sm text-green-400">
            Peso registrado com sucesso.
          </p>
        )}
        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
