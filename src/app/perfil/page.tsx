import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { PerfilForm } from './form';

export const dynamic = 'force-dynamic';

const GOAL_LABELS: Record<string, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Ganho de massa',
  saude_geral: 'Saúde geral',
  qualidade_sono: 'Qualidade do sono',
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/perfil');

  const [{ data: profile }, { data: activation }] = await Promise.all([
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
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  return (
    <div className="flex flex-col min-h-dvh pb-20">
    <main className="flex flex-col px-6 py-8 max-w-lg mx-auto gap-6 w-full">
      <div>
        <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-widest mb-1">EVOLT</p>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
      </div>

      <Card>
        <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">Dados da conta</p>
        <p className="font-semibold text-lg mb-1">{profile?.full_name}</p>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">{user.email}</p>
        {profile?.goal && (
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-2">
            Objetivo: {GOAL_LABELS[profile.goal] ?? profile.goal}
          </p>
        )}
        {activation?.sku && (
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            Produto ativado: {activation.sku}
          </p>
        )}
        <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
          Progresso: em breve
        </p>
      </Card>

      <section>
        <h2 className="text-base font-semibold mb-3">Atualizar dados</h2>
        <PerfilForm
          defaultValues={{
            weight_kg: profile?.weight_kg !== null && profile?.weight_kg !== undefined ? Number(profile.weight_kg) : undefined,
            goal: (profile?.goal as 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono' | undefined) ?? undefined,
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide">Configurações</p>
        <Link
          href="https://evolt.com.br/ajuda"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target flex items-center text-sm text-white"
        >
          Ajuda
        </Link>
        <Link
          href="https://evolt.com.br/sobre"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target flex items-center text-sm text-white"
        >
          Sobre o app
        </Link>
        <form action="/logout" method="post">
          <button
            type="submit"
            className="tap-target text-sm text-red-400 active:opacity-80"
          >
            Sair da conta
          </button>
        </form>
      </section>
    </main>
    <BottomNav />
    </div>
  );
}
