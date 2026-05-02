import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { PerfilForm } from './form';

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

function MenuItem({ label, icon, href }: { label: string; icon: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 active:opacity-70"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span style={{ color: 'var(--color-evolt-muted)' }}>{icon}</span>
      <span className="flex-1 text-sm text-white">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-evolt-muted)' }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/perfil');

  const [{ data: profile }, { data: activation }, { data: weightLogs }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, goal, weight_kg, height_cm, profile_type, onboarding_completed')
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
      .from('weight_logs')
      .select('weight_kg')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(1),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  const firstName = profile?.full_name?.split(' ')[0] ?? '?';
  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const currentWeight = weightLogs?.[0] ? Number(weightLogs[0].weight_kg) : null;

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-white">Perfil</h1>
        </div>

        {/* Avatar + info */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <span
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
            >
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base leading-tight">{profile?.full_name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-evolt-muted)' }}>{user.email}</p>
              {profile?.goal && (
                <span
                  className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,120,20,0.15)', color: 'var(--color-evolt-orange)' }}
                >
                  {GOAL_LABELS[profile.goal] ?? profile.goal}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 px-4 mb-4">
          {[
            { label: 'Produto', value: activation?.sku ? (SKU_NAMES[activation.sku] ?? activation.sku) : '—' },
            { label: 'Peso atual', value: currentWeight ? `${currentWeight.toFixed(1)} kg` : '—' },
            { label: 'Altura', value: profile?.height_cm ? `${profile.height_cm} cm` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-evolt-surface)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--color-evolt-muted)' }}>{label}</p>
              <p className="text-xs font-bold text-white leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Atualizar dados */}
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-evolt-muted)' }}>Atualizar dados</p>
            <PerfilForm
              defaultValues={{
                weight_kg: profile?.weight_kg !== null && profile?.weight_kg !== undefined ? Number(profile.weight_kg) : undefined,
                goal: (profile?.goal as 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono' | undefined) ?? undefined,
              }}
            />
          </div>
        </div>

        {/* Menu */}
        <div className="mx-4 rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--color-evolt-surface)' }}>
          <p className="px-4 pt-4 pb-2 text-xs font-semibold" style={{ color: 'var(--color-evolt-muted)' }}>
            Configurações
          </p>
          <MenuItem
            label="Meus dados"
            href="/perfil"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <MenuItem
            label="Evolução"
            href="/evolucao"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
          <MenuItem
            label="Ajuda e suporte"
            href="https://evolt.com.br/ajuda"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          />
          <MenuItem
            label="Sobre o app"
            href="https://evolt.com.br/sobre"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <form action="/logout" method="post">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
            >
              Sair da conta
            </button>
          </form>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
