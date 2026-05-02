import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { ChecklistItem } from '@/app/home/checklist';
import { getDailyBlocks, getWorkoutDetail, getSupplementDetail, getHydrationGoalLiters } from '@/lib/routine/templates';
import type { ProfileType } from '@/lib/onboarding/classify-profile';
import { HydrationTracker } from './hydration-tracker';

export const dynamic = 'force-dynamic';

function todayDateString(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

const CATEGORY_SUBTITLES: Record<string, (timing: string, workout: string) => string> = {
  supplement: (timing) => timing,
  workout: (_, workout) => workout,
  nutrition: () => 'Refeições equilibradas',
  hydration: () => '',
};

const DAY_TIPS = [
  'A constância é o resultado amanhã. Não pare!',
  'Cada treino conta. Você está evoluindo!',
  'Pequenos passos levam a grandes conquistas.',
  'Disciplina hoje, resultados amanhã.',
  'Você já deu o primeiro passo. Continue!',
];

export default async function RotinaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/rotina');

  const todayDate = todayDateString();

  const [{ data: profile }, { data: activation }, { data: completions }, { data: hydrationLogs }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('profile_type, onboarding_completed')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('product_activations')
      .select('sku, activated_at')
      .eq('user_id', user.id)
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('checklist_completions')
      .select('category')
      .eq('user_id', user.id)
      .eq('date', todayDate),
    supabase
      .from('hydration_logs')
      .select('ml_added')
      .eq('user_id', user.id)
      .eq('log_date', todayDate),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');
  if (!profile?.profile_type) redirect('/onboarding/1');

  const profileType = profile.profile_type as ProfileType;
  const blocks = getDailyBlocks(profileType);
  const completedCategories = new Set((completions ?? []).map((c) => c.category));
  const workout = getWorkoutDetail(profileType);
  const supplementDetail = getSupplementDetail(activation?.sku ?? '');

  const today = todayLabel();
  const [weekday, ...rest] = today.split(', ');
  const dateStr = rest.join(', ');
  const tipIndex = new Date().getDate() % DAY_TIPS.length;

  const completedCount = completedCategories.size;
  const total = blocks.length;

  const totalHydrationMl = (hydrationLogs ?? []).reduce((sum, l) => sum + (l.ml_added ?? 0), 0);
  const hydrationGoalLiters = getHydrationGoalLiters(profileType);

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col px-4 pt-6 pb-4 max-w-lg mx-auto w-full gap-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Seu dia hoje</h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: 'var(--color-evolt-muted)' }}>
            {weekday}{dateStr ? ` • ${dateStr}` : ''}
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs" style={{ color: 'var(--color-evolt-muted)' }}>Progresso de hoje</p>
            <p className="text-xs font-medium text-white">{completedCount}/{total}</p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: total > 0 ? `${(completedCount / total) * 100}%` : '0%',
                background: 'var(--color-evolt-orange)',
              }}
            />
          </div>
        </div>

        {/* Checklist (sem hydration — tem tracker separado abaixo) */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-evolt-surface)' }}>
          {blocks.filter((b) => b.category !== 'hydration').map((block, i) => {
            const subtitleFn = CATEGORY_SUBTITLES[block.category];
            const subtitle = subtitleFn
              ? subtitleFn(block.category === 'supplement' ? supplementDetail.timing : '', workout.title)
              : block.description;

            return (
              <div key={block.category} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }} className="px-4">
                <ChecklistItem
                  category={block.category}
                  label={block.title}
                  subtitle={subtitle}
                  completed={completedCategories.has(block.category)}
                  todayDate={todayDate}
                />
              </div>
            );
          })}
        </div>

        {/* Hydration tracker */}
        <HydrationTracker
          goalLiters={hydrationGoalLiters}
          totalMl={totalHydrationMl}
          todayDate={todayDate}
        />

        {/* Dica do dia */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,120,20,0.08)', border: '1px solid rgba(255,120,20,0.2)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-evolt-orange)' }}>
            Dica do dia
          </p>
          <p className="text-sm text-white">{DAY_TIPS[tipIndex]}</p>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
