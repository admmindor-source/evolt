'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { updateProfileAction, type UpdateProfileState } from './actions';

type DefaultValues = {
  weight_kg?: number;
  goal?: 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono';
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar alterações'}
    </Button>
  );
}

function fieldError(state: UpdateProfileState | null, field: string): string | undefined {
  if (!state || state.ok) return undefined;
  return state.errors[field]?.[0];
}

export function PerfilForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction] = useActionState<UpdateProfileState | null, FormData>(updateProfileAction, null);
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;
  const saved = state?.ok === true;

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Peso atual (kg)"
          name="weight_kg"
          type="number"
          inputMode="decimal"
          min={30}
          max={400}
          step={0.1}
          defaultValue={defaultValues.weight_kg?.toString()}
          error={fieldError(state, 'weight_kg')}
          hint="Deixe em branco para não alterar"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Objetivo principal</label>
          <select
            name="goal"
            defaultValue={defaultValues.goal ?? ''}
            className="tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-4 text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-evolt-orange)]"
          >
            <option value="">Manter objetivo atual</option>
            <option value="emagrecimento">Emagrecimento</option>
            <option value="hipertrofia">Ganho de massa</option>
            <option value="saude_geral">Saúde geral</option>
            <option value="qualidade_sono">Qualidade do sono</option>
          </select>
          {fieldError(state, 'goal') && (
            <p className="text-sm text-red-400">{fieldError(state, 'goal')}</p>
          )}
        </div>

        {saved && (
          <p role="status" className="text-sm text-green-400">Dados atualizados com sucesso.</p>
        )}
        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
