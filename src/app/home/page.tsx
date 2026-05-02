import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { ChecklistItem } from './checklist';
import { getDailyBlocks, getDayNumber } from '@/lib/routine/templates';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

export const dynamic = 'force-dynamic';

const GOAL_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Ganho de massa',
  saude_geral: 'Saúde geral',
  qualidade_sono: 'Qualidade do sono',
};

function todayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
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
    { data: recs },
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, goal, profile_type, onboarding_completed')
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
      .from('user_initial_recs')
      .select('recs')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');
  if (!profile?.profile_type) redirect('/onboarding/1');

  const profileType = profile.profile_type as ProfileType;
  const blocks = getDailyBlocks(profileType);
  const completedCategories = new Set((completions ?? []).map((c) => c.category));
  const dayNumber = activation?.activated_at ? getDayNumber(activation.activated_at) : 1;
  const recsData = (recs?.recs as Array<{ sku: string; reason_text: string }> | null) ?? [];

  const firstName = profile.full_name?.split(' ')[0] ?? 'Olá';

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

        {/* Progress placeholder */}
        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">
            Progresso recente
          </p>
          <p className="text-sm text-[color:var(--color-evolt-muted)]">
            Registre seu progresso — disponível em breve.
          </p>
        </Card>

        {/* Recommendations */}
        {recsData.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-3">Produtos recomendados</h2>
            <div className="flex flex-col gap-3">
              {recsData.slice(0, 4).map((rec) => (
                <Card key={rec.sku}>
                  <p className="font-medium text-sm mb-1">{rec.sku}</p>
                  <p className="text-sm text-[color:var(--color-evolt-muted)]">{rec.reason_text}</p>
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
