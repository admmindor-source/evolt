import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

const ROUTINE_STUB: Record<string, { supplement: string; workout: string; nutrition: string; hydration: string }> = {
  'iniciante-emagrecimento': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino leve de 30-40 min — foco na técnica, não na carga',
    nutrition: 'Priorize proteína e vegetais. Reduza calorias de forma gradual.',
    hydration: 'Meta: 2,5L de água hoje',
  },
  'intermediario-emagrecimento': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino moderado de 45-60 min — combine força e cardio',
    nutrition: 'Controle de porções. Proteína em cada refeição.',
    hydration: 'Meta: 3L de água hoje',
  },
  'avancado-emagrecimento': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino intenso de 60-75 min — alta intensidade',
    nutrition: 'Déficit calórico controlado. Proteína alta para preservar músculo.',
    hydration: 'Meta: 3,5L de água hoje',
  },
  'iniciante-hipertrofia': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino de força de 40-50 min — aprenda os movimentos básicos',
    nutrition: 'Coma um pouco acima do seu gasto. Proteína é prioridade.',
    hydration: 'Meta: 2,5L de água hoje',
  },
  'intermediario-hipertrofia': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino de força de 50-70 min — aumente a carga progressivamente',
    nutrition: 'Superávit calórico moderado. Distribua a proteína ao longo do dia.',
    hydration: 'Meta: 3L de água hoje',
  },
  'avancado-hipertrofia': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: 'Treino de força de 60-80 min — volume e intensidade elevados',
    nutrition: 'Alimentação precisa. Carboidratos estratégicos pré e pós-treino.',
    hydration: 'Meta: 3,5L de água hoje',
  },
  'saude-geral': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: '30-45 min de atividade moderada — caminhada, yoga ou musculação leve',
    nutrition: 'Alimentação variada e equilibrada. Menos processados.',
    hydration: 'Meta: 2L de água hoje',
  },
  'qualidade-sono': {
    supplement: 'Tome seu suplemento principal hoje',
    workout: '30 min de atividade leve — evite exercícios intensos à noite',
    nutrition: 'Evite cafeína após as 14h. Jantar leve.',
    hydration: 'Meta: 2L de água hoje — reduza líquidos nas últimas 2h antes de dormir',
  },
};

const GOAL_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Ganho de massa',
  saude_geral: 'Saúde geral',
  qualidade_sono: 'Qualidade do sono',
};

const PROFILE_LABELS: Record<string, string> = {
  'iniciante-emagrecimento': 'Iniciante em Emagrecimento',
  'intermediario-emagrecimento': 'Intermediário em Emagrecimento',
  'avancado-emagrecimento': 'Avançado em Emagrecimento',
  'iniciante-hipertrofia': 'Iniciante em Hipertrofia',
  'intermediario-hipertrofia': 'Intermediário em Hipertrofia',
  'avancado-hipertrofia': 'Avançado em Hipertrofia',
  'saude-geral': 'Saúde Geral',
  'qualidade-sono': 'Qualidade do Sono',
};

export default async function OnboardingConclusaoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: activation }, { data: recsRow }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, goal, profile_type')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('product_activations')
      .select('sku')
      .eq('user_id', user.id)
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_initial_recs')
      .select('recs')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (!profile?.profile_type) redirect('/onboarding/1');

  const routine = ROUTINE_STUB[profile.profile_type] ?? ROUTINE_STUB['saude-geral'];
  const recs = (recsRow?.recs as Array<{ sku: string; reason_text: string; priority: number }> | null) ?? [];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <p className="text-[color:var(--color-evolt-orange)] text-sm font-medium mb-1">Onboarding concluído</p>
        <h1 className="text-2xl font-semibold">Seu perfil está pronto!</h1>
      </div>

      <Card>
        <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">Seu perfil</p>
        <p className="font-semibold text-lg mb-1">{profile.full_name}</p>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">
          {PROFILE_LABELS[profile.profile_type] ?? profile.profile_type}
        </p>
        {profile.goal && (
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            Objetivo: {GOAL_LABELS[profile.goal] ?? profile.goal}
          </p>
        )}
        {activation?.sku && (
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            Produto ativado: {activation.sku}
          </p>
        )}
      </Card>

      <section>
        <h2 className="text-base font-semibold mb-3">Sua rotina de hoje</h2>
        <div className="flex flex-col gap-3">
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">Suplementação</p>
            <p className="text-sm text-white">{routine.supplement}</p>
          </Card>
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">Treino</p>
            <p className="text-sm text-white">{routine.workout}</p>
          </Card>
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">Alimentação</p>
            <p className="text-sm text-white">{routine.nutrition}</p>
          </Card>
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-1">Hidratação</p>
            <p className="text-sm text-white">{routine.hydration}</p>
          </Card>
        </div>
      </section>

      {recs.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Produtos para complementar sua rotina</h2>
          <div className="flex flex-col gap-3">
            {recs.slice(0, 4).map((rec) => (
              <Card key={rec.sku}>
                <p className="font-medium text-sm mb-1">{rec.sku}</p>
                <p className="text-sm text-[color:var(--color-evolt-muted)]">{rec.reason_text}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/home"
        className="tap-target rounded-2xl bg-[color:var(--color-evolt-orange)] text-black font-semibold text-center py-4 active:opacity-80"
      >
        Começar minha jornada
      </Link>
    </div>
  );
}
