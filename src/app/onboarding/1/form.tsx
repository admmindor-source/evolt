'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { step1Action, type Step1State } from './actions';

type DefaultValues = {
  age?: number;
  sex?: 'masculino' | 'feminino' | 'outro';
  weight_kg?: number;
  height_cm?: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Salvando...' : 'Continuar'}
    </Button>
  );
}

function fieldError(state: Step1State | null, field: string): string | undefined {
  if (!state || state.ok) return undefined;
  return state.errors[field]?.[0];
}

export function Step1Form({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction] = useActionState<Step1State | null, FormData>(step1Action, null);
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Idade"
          name="age"
          type="number"
          inputMode="numeric"
          min={13}
          max={120}
          required
          defaultValue={defaultValues.age?.toString()}
          error={fieldError(state, 'age')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Sexo</label>
          <select
            name="sex"
            defaultValue={defaultValues.sex ?? ''}
            required
            className="tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-4 text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-evolt-orange)]"
          >
            <option value="" disabled>Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Prefiro não informar</option>
          </select>
          {fieldError(state, 'sex') && (
            <p className="text-sm text-red-400">{fieldError(state, 'sex')}</p>
          )}
        </div>

        <Input
          label="Peso (kg)"
          name="weight_kg"
          type="number"
          inputMode="decimal"
          min={30}
          max={400}
          step={0.1}
          required
          defaultValue={defaultValues.weight_kg?.toString()}
          error={fieldError(state, 'weight_kg')}
          hint="Ex: 75.5"
        />

        <Input
          label="Altura (cm)"
          name="height_cm"
          type="number"
          inputMode="numeric"
          min={100}
          max={250}
          required
          defaultValue={defaultValues.height_cm?.toString()}
          error={fieldError(state, 'height_cm')}
          hint="Ex: 175"
        />

        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
