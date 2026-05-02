'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { logBodyMeasurementsAction, type LogMeasurementsState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Salvando...' : 'Registrar medidas'}
    </Button>
  );
}

export function MeasurementsForm() {
  const [state, formAction] = useActionState<LogMeasurementsState | null, FormData>(
    logBodyMeasurementsAction,
    null,
  );
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;
  const saved = state?.ok === true;

  const todayLocal = new Date().toLocaleDateString('sv-SE');

  return (
    <Card>
      <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
        Registrar medidas
      </p>
      <form action={formAction} className="flex flex-col gap-3">
        <Input
          label="Data"
          name="measured_at"
          type="date"
          defaultValue={todayLocal}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cintura (cm)"
            name="cintura_cm"
            type="number"
            inputMode="decimal"
            min={30}
            max={300}
            step={0.1}
            placeholder="Ex: 80.0"
          />
          <Input
            label="Quadril (cm)"
            name="quadril_cm"
            type="number"
            inputMode="decimal"
            min={30}
            max={300}
            step={0.1}
            placeholder="Ex: 95.0"
          />
          <Input
            label="Peito (cm)"
            name="peito_cm"
            type="number"
            inputMode="decimal"
            min={30}
            max={300}
            step={0.1}
            placeholder="Ex: 100.0"
          />
          <Input
            label="Braço (cm)"
            name="braco_cm"
            type="number"
            inputMode="decimal"
            min={10}
            max={100}
            step={0.1}
            placeholder="Ex: 35.0"
          />
        </div>
        {saved && (
          <p role="status" className="text-sm text-green-400">
            Medidas registradas com sucesso.
          </p>
        )}
        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
