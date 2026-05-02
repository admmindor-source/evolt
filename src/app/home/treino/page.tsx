import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { getWorkoutDetail } from '@/lib/routine/templates';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

export const dynamic = 'force-dynamic';

export default async function TreinoDetailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home/treino');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_type, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding/1');
  if (!profile?.profile_type) redirect('/onboarding/1');

  const workout = getWorkoutDetail(profile.profile_type as ProfileType);

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <main className="flex flex-col gap-5 px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div>
          <Link
            href="/home"
            className="text-xs text-[color:var(--color-evolt-muted)] mb-3 inline-block"
          >
            ← Voltar
          </Link>
          <p className="text-[color:var(--color-evolt-orange)] text-sm font-medium mb-0.5">
            Treino do dia
          </p>
          <h1 className="text-2xl font-semibold">{workout.title}</h1>
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            {workout.duration} · {workout.focus}
          </p>
        </div>

        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
            Exercícios
          </p>
          <div className="flex flex-col gap-4">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[color:var(--color-evolt-orange)] text-black text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                  <p className="text-xs text-[color:var(--color-evolt-muted)] mt-0.5">
                    {ex.sets > 1 ? `${ex.sets} séries` : '1 série'} × {ex.reps}
                    {ex.rest !== '—' && (
                      <span className="ml-2">· descanso: {ex.rest}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
            Dica do treino
          </p>
          <p className="text-sm text-white leading-relaxed">
            Mantenha a técnica em primeiro lugar. Prefira menos carga com movimento correto a mais carga com risco de lesão.
          </p>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
