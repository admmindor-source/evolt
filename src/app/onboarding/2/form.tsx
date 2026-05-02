'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { step2Action, type Step2State } from './actions';

type DefaultValues = {
  goal?: 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono';
  training_level?: 'iniciante' | 'intermediario' | 'avancado';
  days_per_week?: number;
  minutes_per_day?: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Salvando...' : 'Continuar'}
    </Button>
  );
}

function fieldError(state: Step2State | null, field: string): string | undefined {
  if (!state || state.ok) return undefined;
  return state.errors[field]?.[0];
}

export function Step2Form({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction] = useActionState<Step2State | null, FormData>(step2Action, null);
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Objetivo principal</label>
          <select
            name="goal"
            defaultValue={defaultValues.goal ?? ''}
            required
            className="tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-4 text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-evolt-orange)]"
          >
            <option value="" disabled>Selecione...</option>
            <option value="emagrecimento">Emagrecimento</option>
            <option value="hipertrofia">Ganho de massa</option>
            <option value="saude_geral">Saúde geral</option>
            <option value="qualidade_sono">Qualidade do sono</option>
          </select>
          {fieldError(state, 'goal') && (
            <p className="text-sm text-red-400">{fieldError(state, 'goal')}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Nível de treino</label>
          <select
            name="training_level"
            defaultValue={defaultValues.training_level ?? ''}
            required
            className="tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-4 text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-evolt-orange)]"
          >
            <option value="" disabled>Selecione...</option>
            <option value="iniciante">Iniciante (menos de 1 ano de treino)</option>
            <option value="intermediario">Intermediário (1 a 3 anos)</option>
            <option value="avancado">Avançado (mais de 3 anos)</option>
          </select>
          {fieldError(state, 'training_level') && (
            <p className="text-sm text-red-400">{fieldError(state, 'training_level')}</p>
          )}
        </div>

        <Input
          label="Dias de treino por semana"
          name="days_per_week"
          type="number"
          inputMode="numeric"
          min={1}
          max={7}
          required
          defaultValue={defaultValues.days_per_week?.toString()}
          error={fieldError(state, 'days_per_week')}
          hint="De 1 a 7 dias"
        />

        <Input
          label="Minutos por sessão"
          name="minutes_per_day"
          type="number"
          inputMode="numeric"
          min={15}
          max={240}
          required
          defaultValue={defaultValues.minutes_per_day?.toString()}
          error={fieldError(state, 'minutes_per_day')}
          hint="Ex: 60 minutos"
        />

        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
