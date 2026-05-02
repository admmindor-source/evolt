import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { getWorkoutDetail } from '@/lib/routine/templates';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

export const dynamic = 'force-dynamic';

const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export default async function TreinoDetailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home/treino');

  const [{ data: profile }, { data: todayCompletion }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('profile_type, onboarding_completed, training_level')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('checklist_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('category', 'workout')
      .maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');
  if (!profile?.profile_type) redirect('/onboarding/1');

  const workout = getWorkoutDetail(profile.profile_type as ProfileType);
  const isConcluido = !!todayCompletion;
  const level = LEVEL_LABELS[profile.training_level ?? 'iniciante'] ?? 'Iniciante';

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <Link href="/home" className="flex items-center gap-1.5 text-sm mb-4" style={{ color: 'var(--color-evolt-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </Link>

          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Treino</p>
          <h1 className="text-2xl font-bold text-white">{workout.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>{workout.focus}</p>
        </div>

        {/* Stats chips */}
        <div className="flex gap-2 px-4 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white" style={{ background: 'var(--color-evolt-surface)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {workout.duration}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white" style={{ background: 'var(--color-evolt-surface)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {level}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white" style={{ background: 'var(--color-evolt-surface)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="2" /><circle cx="6" cy="6" r="2" />
              <path d="m6 8 1.5 1.5" /><path d="m10.5 13.5 1.5 1.5" />
              <rect x="5" y="9" width="14" height="6" rx="1" />
            </svg>
            Academia
          </div>
        </div>

        {/* Exercise list */}
        <div className="px-4 flex flex-col gap-3">
          <p className="text-base font-semibold text-white">Exercícios</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-evolt-surface)' }}>
            {workout.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>
                    {ex.sets > 1 ? `${ex.sets} séries` : '1 série'} × {ex.reps}
                    {ex.rest !== '—' && <span className="ml-2">• descanso: {ex.rest}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-4">
          <Link
            href="/rotina"
            className="block w-full text-center py-4 rounded-2xl text-sm font-bold"
            style={{ background: isConcluido ? 'rgba(255,255,255,0.1)' : 'var(--color-evolt-orange)', color: isConcluido ? 'white' : 'black' }}
          >
            {isConcluido ? 'TREINO CONCLUÍDO ✓' : 'MARCAR TREINO COMO CONCLUÍDO'}
          </Link>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
