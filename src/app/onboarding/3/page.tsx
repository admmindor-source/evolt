import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step3Form } from './form';

export const dynamic = 'force-dynamic';

const SUPPLEMENT_OPTIONS = [
  { sku: 'WHEY01', label: 'Whey Protein' },
  { sku: 'CREA01', label: 'Creatina' },
  { sku: 'PRET01', label: 'Pré-Treino' },
  { sku: 'MULT01', label: 'Multivitamínico' },
  { sku: 'OMEG01', label: 'Ômega-3' },
  { sku: 'JOIN01', label: 'Suporte Articular' },
] as const;

export default async function OnboardingStep3Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding/3');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_supplements, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) redirect('/home');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-[color:var(--color-evolt-muted)] mb-1">Passo 3 de 3</p>
        <div className="flex gap-1 mb-6">
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Suplementos atuais</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">Marque o que você já usa. Se não usa nenhum, é só avançar.</p>
      </div>
      <Step3Form
        supplementOptions={SUPPLEMENT_OPTIONS}
        defaultSelected={(profile?.current_supplements as string[] | null) ?? []}
      />
    </div>
  );
}
