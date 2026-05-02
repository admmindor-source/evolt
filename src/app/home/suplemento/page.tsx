import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { getSupplementDetail } from '@/lib/routine/templates';

export const dynamic = 'force-dynamic';

export default async function SuplementoDetailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home/suplemento');

  const [{ data: activation }, { data: profile }, { data: todayCompletion }] = await Promise.all([
    supabase
      .from('product_activations')
      .select('sku')
      .eq('user_id', user.id)
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('checklist_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('category', 'supplement')
      .maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  const sku = activation?.sku ?? '';
  const detail = getSupplementDetail(sku);
  const isConcluido = !!todayCompletion;

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

          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Suplementação</p>
          <h1 className="text-2xl font-bold text-white">{detail.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm" style={{ color: 'var(--color-evolt-muted)' }}>Pós-treino • 1 dose (30g)</p>
            {isConcluido && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                Concluído ✓
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 px-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-evolt-orange)' }}>Como usar</p>
            <p className="text-sm text-white leading-relaxed">{detail.howToUse}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-evolt-orange)' }}>Benefícios</p>
            <p className="text-sm text-white leading-relaxed">{detail.benefits}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-evolt-orange)' }}>Dica</p>
            <p className="text-sm text-white leading-relaxed">{detail.tip}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-4">
          <Link
            href="/rotina"
            className="block w-full text-center py-4 rounded-2xl text-sm font-bold"
            style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
          >
            {isConcluido ? 'VER CHECKLIST COMPLETO' : 'MARCAR COMO CONCLUÍDO'}
          </Link>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
