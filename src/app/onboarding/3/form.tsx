'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { step3Action, type Step3State } from './actions';

type SupplementOption = { sku: string; label: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Concluindo...' : 'Concluir onboarding'}
    </Button>
  );
}

export function Step3Form({
  supplementOptions,
  defaultSelected,
}: {
  supplementOptions: readonly SupplementOption[];
  defaultSelected: string[];
}) {
  const [state, formAction] = useActionState<Step3State | null, FormData>(step3Action, null);
  const formError = state && !state.ok ? state.errors._form?.[0] : undefined;

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {supplementOptions.map((opt) => (
            <label
              key={opt.sku}
              className="flex items-center gap-3 tap-target cursor-pointer"
            >
              <input
                type="checkbox"
                name="current_supplements"
                value={opt.sku}
                defaultChecked={defaultSelected.includes(opt.sku)}
                className="h-5 w-5 rounded accent-[color:var(--color-evolt-orange)]"
              />
              <span className="text-sm text-white">{opt.label}</span>
            </label>
          ))}
        </div>

        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
