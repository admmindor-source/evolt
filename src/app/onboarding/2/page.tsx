import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Step2Form } from './form';

export const dynamic = 'force-dynamic';

export default async function OnboardingStep2Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding/2');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('goal, training_level, days_per_week, minutes_per_day, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) redirect('/home');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-[color:var(--color-evolt-muted)] mb-1">Passo 2 de 3</p>
        <div className="flex gap-1 mb-6">
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-orange)]" />
          <div className="h-1 flex-1 rounded-full bg-[color:var(--color-evolt-surface)]" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Contexto de treino</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">Vamos adaptar sua rotina ao seu ritmo.</p>
      </div>
      <Step2Form
        defaultValues={{
          goal: (profile?.goal as 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono' | undefined) ?? undefined,
          training_level: (profile?.training_level as 'iniciante' | 'intermediario' | 'avancado' | undefined) ?? undefined,
          days_per_week: profile?.days_per_week ?? undefined,
          minutes_per_day: profile?.minutes_per_day ?? undefined,
        }}
      />
    </div>
  );
}
