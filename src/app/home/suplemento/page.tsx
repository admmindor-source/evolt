import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { getSupplementDetail } from '@/lib/routine/templates';

export const dynamic = 'force-dynamic';

export default async function SuplementoDetailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home/suplemento');

  const { data: activation } = await supabase
    .from('product_activations')
    .select('sku')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  const sku = activation?.sku ?? '';
  const detail = getSupplementDetail(sku);

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
            Suplemento do dia
          </p>
          <h1 className="text-2xl font-semibold">{detail.name}</h1>
          {sku && (
            <p className="text-xs text-[color:var(--color-evolt-muted)] mt-1">
              {sku}
            </p>
          )}
        </div>

        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
            Como usar
          </p>
          <p className="text-sm text-white leading-relaxed">{detail.howToUse}</p>
        </Card>

        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
            Benefícios
          </p>
          <p className="text-sm text-white leading-relaxed">{detail.benefits}</p>
        </Card>

        <Card>
          <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
            Dica
          </p>
          <p className="text-sm text-white leading-relaxed">{detail.tip}</p>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
