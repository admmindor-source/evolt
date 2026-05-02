import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { getDailyBlocks, getDayNumber } from '@/lib/routine/templates';
import { generateRecommendations } from '@/lib/recommendations/engine';
import { emitEvent } from '@/lib/analytics/emit';
import type { ProfileType } from '@/lib/onboarding/classify-profile';

export const dynamic = 'force-dynamic';

const GOAL_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Ganho de massa',
  saude_geral: 'Saúde geral',
  qualidade_sono: 'Qualidade do sono',
};

const SKU_NAMES: Record<string, string> = {
  WHEY01: 'Whey Protein',
  CREA01: 'Creatina',
  MULT01: 'Multivitamínico',
  OMEG01: 'Ômega 3',
  PRET01: 'Pré-treino',
  JOIN01: 'Colágeno Articular',
};

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const ITEM_LINKS: Record<string, string> = {
  supplement: '/home/suplemento',
  workout: '/home/treino',
  nutrition: '/rotina',
  hydration: '/rotina',
};

const ITEM_SUBTITLES: Record<string, string> = {
  supplement: 'Pós-treino • 1 dose',
  workout: 'Peito, costas e braços',
  nutrition: 'Refeições equilibradas',
  hydration: '0/2 litros',
};

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
  const completedCount = completedCategories.size;
  const totalItems = blocks.length + 1; // +1 for check-in

  void emitEvent(user.id, 'home_viewed', { day: dayNumber });

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

  if (recs.length > 0) {
    const context = { profile_type: profileType, goal: profile.goal ?? '', source_sku: activation?.sku ?? '' };
    void supabase.from('recommendation_events').insert(
      recs.map((rec) => ({ user_id: user.id, sku: rec.sku, event_type: 'shown' as const, context })),
    );
  }

  const firstName = profile.full_name?.split(' ')[0] ?? 'Olá';
  const weightLogs = lastWeight ?? [];
  const lastWeightEntry = weightLogs[0];

  const dayMessages = [
    'Bora evoluir hoje!',
    'Você está mandando bem!',
    'Cada dia conta. Vai fundo!',
    'Constância é tudo. Avante!',
  ];
  const dayMsg = dayMessages[dayNumber % dayMessages.length];

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col gap-4 px-4 pt-6 pb-4 max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {firstName}! 👋</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>
              Bora evoluir hoje?
            </p>
          </div>
          <Link href="/perfil" aria-label="Perfil">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
            >
              {firstName[0]?.toUpperCase()}
            </span>
          </Link>
        </div>

        {/* Stats cards row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Seu objetivo</p>
            <p className="text-sm font-semibold text-white">
              {GOAL_LABELS[profile.goal ?? ''] ?? 'Saúde geral'}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Produto principal</p>
            <p className="text-sm font-semibold text-white">
              {activation?.sku ? (SKU_NAMES[activation.sku] ?? activation.sku) : 'Não ativado'}
            </p>
          </div>
        </div>

        {/* Day card */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, var(--color-evolt-surface) 0%, rgba(255,120,20,0.12) 100%)' }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Dia da jornada</p>
            <p className="text-4xl font-bold text-white leading-none">{dayNumber}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-evolt-muted)' }}>{dayMsg}</p>
          </div>
          <span className="text-5xl">🔥</span>
        </div>

        {/* Progress weight */}
        {lastWeightEntry && (
          <Link href="/evolucao" className="block">
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: 'var(--color-evolt-surface)' }}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--color-evolt-muted)' }}>Peso atual</p>
                <p className="text-xl font-bold text-white">{Number(lastWeightEntry.weight_kg).toFixed(1)} kg</p>
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-evolt-orange)' }}>Ver evolução →</span>
            </div>
          </Link>
        )}

        {/* Daily items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-white">Seu dia hoje</p>
            <p className="text-xs" style={{ color: 'var(--color-evolt-muted)' }}>
              {completedCount}/{totalItems} concluídas
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-evolt-surface)' }}>
            {blocks.map((block, i) => (
              <Link key={block.category} href={ITEM_LINKS[block.category] ?? '/rotina'}>
                <div
                  className="flex items-center gap-3 px-4 py-3 active:opacity-70"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: completedCategories.has(block.category)
                        ? 'var(--color-evolt-orange)'
                        : 'rgba(255,255,255,0.06)',
                      color: completedCategories.has(block.category) ? 'black' : 'var(--color-evolt-orange)',
                    }}
                  >
                    <BlockIcon category={block.category} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{block.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>
                      {ITEM_SUBTITLES[block.category]}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-evolt-muted)', flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}

            {/* Check-in item */}
            <Link href="/rotina">
              <div className="flex items-center gap-3 px-4 py-3 active:opacity-70" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-evolt-orange)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Check-in diário</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>Conte como foi seu dia</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-evolt-muted)', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div>
            <p className="text-base font-semibold text-white mb-3">Recomendações</p>
            <p className="text-xs mb-3" style={{ color: 'var(--color-evolt-muted)' }}>
              Produtos que podem complementar sua rotina com base no seu objetivo.
            </p>
            <div className="flex flex-col gap-3">
              {recs.slice(0, 3).map((rec) => (
                <div key={rec.sku} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--color-evolt-surface)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{SKU_NAMES[rec.sku] ?? rec.sku}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>{rec.reason_text}</p>
                  </div>
                  <a
                    href={`https://evolt.com.br/produtos/${rec.sku.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold flex-shrink-0 px-3 py-1.5 rounded-lg"
                    style={{ color: 'var(--color-evolt-orange)', background: 'rgba(255,120,20,0.12)' }}
                  >
                    Ver produto
                  </a>
                </div>
              ))}
            </div>
            <Link href="/loja" className="block text-center text-xs mt-3 font-medium" style={{ color: 'var(--color-evolt-orange)' }}>
              Ver todos os produtos
            </Link>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}

function BlockIcon({ category }: { category: string }) {
  if (category === 'supplement') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h5" /><path d="M15 3h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5" />
      <path d="M3 9h18" /><rect x="3" y="9" width="18" height="12" rx="2" />
    </svg>
  );
  if (category === 'workout') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="2" /><circle cx="6" cy="6" r="2" />
      <path d="m6 8 1.5 1.5" /><path d="m10.5 13.5 1.5 1.5" />
      <path d="m13.5 10.5 1.5 1.5" /><path d="m7.5 7.5 9 9" />
      <circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" />
      <path d="m18 8-1.5 1.5" /><path d="m13.5 13.5-1.5 1.5" />
      <path d="m10.5 10.5-1.5 1.5" /><path d="m16.5 7.5-9 9" />
    </svg>
  );
  if (category === 'nutrition') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  );
  if (category === 'hydration') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
  return null;
}
