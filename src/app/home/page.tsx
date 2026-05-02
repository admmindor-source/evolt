import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { ChecklistItem } from './checklist';
import { getDailyBlocks, getDayNumber } from '@/lib/routine/templates';
import { generateRecommendations } from '@/lib/recommendations/engine';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

export const dynamic = 'force-dynamic';

const GOAL_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Ganho de massa',
  saude_geral: 'Saúde geral',
  qualidade_sono: 'Qualidade do sono',
};

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home');

  const todayDate = todayDateString();

  const [
    { data: profile },
    { data: activation },
    { data: completions },
    { data: lastWeight },
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, goal, profile_type, onboarding_completed, training_level, days_per_week, age, weight_kg, current_supplements')
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
      .from('weight_logs')
      .select('weight_kg, measured_at')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(2),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');
  if (!profile?.profile_type) redirect('/onboarding/1');

  const profileType = profile.profile_type as ProfileType;
  const blocks = getDailyBlocks(profileType);
  const completedCategories = new Set((completions ?? []).map((c) => c.category));
  const dayNumber = activation?.activated_at ? getDayNumber(activation.activated_at) : 1;

  // Real recommendations from engine
  const recs = generateRecommendations({
    profileType,
    activatedSku: activation?.sku ?? '',
    goal: profile.goal ?? 'saude_geral',
    training_level: profile.training_level ?? 'iniciante',
    days_per_week: profile.days_per_week ?? 1,
    age: profile.age ?? 25,
    weight_kg: profile.weight_kg ?? null,
    current_supplements: (profile.current_supplements as string[]) ?? [],
  });

  // Record recommendation_shown events (fire-and-forget — don't block render)
  if (recs.length > 0) {
    const context = {
      profile_type: profileType,
      goal: profile.goal ?? '',
      source_sku: activation?.sku ?? '',
    };
    void supabase.from('recommendation_events').insert(
      recs.map((rec) => ({
        user_id: user.id,
        sku: rec.sku,
        event_type: 'shown' as const,
        context,
      })),
    );
  }

  const firstName = profile.full_name?.split(' ')[0] ?? 'Olá';
  const weightLogs = lastWeight ?? [];
  const hasWeightLog = weightLogs.length > 0;
  const lastWeightEntry = weightLogs[0];
  const weightTrend =
    weightLogs.length >= 2
      ? weightLogs[0].weight_kg < weightLogs[1].weight_kg
        ? '↓'
        : weightLogs[0].weight_kg > weightLogs[1].weight_kg
          ? '↑'
          : '→'
      : null;

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <main className="flex flex-col gap-5 px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
        {/* Header */}
        <div>
          <p className="text-[color:var(--color-evolt-orange)] text-sm font-medium mb-0.5">
            Dia {dayNumber} da sua jornada
          </p>
          <h1 className="text-2xl font-semibold">Olá, {firstName}</h1>
          {profile.goal && (
            <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
              Objetivo: {GOAL_LABELS[profile.goal] ?? profile.goal}
              {activation?.sku && (
                <span className="ml-2 opacity-60">· {activation.sku}</span>
              )}
            </p>
          )}
        </div>

        {/* Daily blocks */}
        {blocks.map((block) => (
          <Card key={block.category}>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">
              {block.title}
            </p>
            <p className="text-sm text-white mb-3">{block.description}</p>
            {block.category === 'supplement' && activation?.sku && (
              <Link
                href="/home/suplemento"
                className="text-xs text-[color:var(--color-evolt-orange)] font-medium"
              >
                Ver detalhes do suplemento →
              </Link>
            )}
            {block.category === 'workout' && (
              <Link
                href="/home/treino"
                className="text-xs text-[color:var(--color-evolt-orange)] font-medium"
              >
                Ver treino completo →
              </Link>
            )}
          </Card>
        ))}

        {/* Checklist */}
        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
            Checklist de hoje
          </p>
          <div className="flex flex-col gap-3">
            {blocks.map((block) => (
              <ChecklistItem
                key={block.category}
                category={block.category}
                label={block.title}
                completed={completedCategories.has(block.category)}
                todayDate={todayDate}
              />
            ))}
          </div>
          <p className="text-xs text-[color:var(--color-evolt-muted)] mt-3">
            {completedCategories.size}/{blocks.length} itens concluídos hoje
          </p>
        </Card>

        {/* Progress block — shows last weight log or CTA */}
        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
            Progresso recente
          </p>
          {hasWeightLog && lastWeightEntry ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-white">
                  {Number(lastWeightEntry.weight_kg).toFixed(1)} kg
                  {weightTrend && (
                    <span className="ml-2 text-base text-[color:var(--color-evolt-orange)]">
                      {weightTrend}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[color:var(--color-evolt-muted)]">
                  Registrado em{' '}
                  {new Date(lastWeightEntry.measured_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Link
                href="/evolucao"
                className="text-xs text-[color:var(--color-evolt-orange)] font-medium"
              >
                Ver histórico →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[color:var(--color-evolt-muted)]">
                Registre seu primeiro peso para acompanhar o progresso.
              </p>
              <Link
                href="/evolucao"
                className="text-xs text-[color:var(--color-evolt-orange)] font-medium ml-3 flex-shrink-0"
              >
                Registrar →
              </Link>
            </div>
          )}
        </Card>

        {/* Recommendations */}
        {recs.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-3">Produtos recomendados</h2>
            <div className="flex flex-col gap-3">
              {recs.slice(0, 4).map((rec) => (
                <Card key={rec.sku}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{rec.sku}</p>
                      <p className="text-sm text-[color:var(--color-evolt-muted)]">{rec.reason_text}</p>
                    </div>
                    <a
                      href={`https://evolt.com.br/produtos/${rec.sku.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap-target text-xs text-[color:var(--color-evolt-orange)] font-medium flex-shrink-0"
                      aria-label={`Ver ${rec.sku} no site EVOLT`}
                    >
                      Ver →
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
