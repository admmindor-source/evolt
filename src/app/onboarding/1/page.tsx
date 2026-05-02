import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step1Form } from './form';

export const dynamic = 'force-dynamic';

export default async function OnboardingStep1Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding/1');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('age, sex, weight_kg, height_cm, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) redirect('/home');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-[color:var(--color-evolt-muted)] mb-1">Passo 1 de 3</p>
        <div className="flex gap-1 mb-6">
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-surface)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-surface)]" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Seus dados físicos</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">Nos ajude a personalizar sua rotina.</p>
      </div>
      <Step1Form
        defaultValues={{
          age: profile?.age ?? undefined,
          sex: (profile?.sex as 'masculino' | 'feminino' | 'outro' | undefined) ?? undefined,
          weight_kg: profile?.weight_kg !== null && profile?.weight_kg !== undefined ? Number(profile.weight_kg) : undefined,
          height_cm: profile?.height_cm ?? undefined,
        }}
      />
    </div>
  );
}
