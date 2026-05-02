import { createClient } from '@/lib/supabase/server';

export default async function AdminSkusPage() {
  const supabase = await createClient();

  const { data: activations } = await supabase
    .from('product_activations')
    .select('sku, activated_at');

  const { count: totalProfiles } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: completedOnboarding } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('onboarding_completed', true);

  // Aggregate activations by SKU
  const skuMap: Record<string, number> = {};
  for (const act of activations ?? []) {
    skuMap[act.sku] = (skuMap[act.sku] ?? 0) + 1;
  }

  const skuRows = Object.entries(skuMap)
    .sort(([, a], [, b]) => b - a)
    .map(([sku, count]) => ({ sku, count }));

  const total = activations?.length ?? 0;
  const onboardingRate =
    totalProfiles && totalProfiles > 0
      ? Math.round(((completedOnboarding ?? 0) / totalProfiles) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Ativações por SKU</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">
          Taxa de onboarding concluído:{' '}
          <span className="text-white font-medium">{onboardingRate}%</span>
          {' '}({completedOnboarding ?? 0}/{totalProfiles ?? 0} usuários)
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {skuRows.length === 0 ? (
          <p className="text-sm text-[color:var(--color-evolt-muted)]">Nenhuma ativação registrada ainda.</p>
        ) : (
          skuRows.map(({ sku, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={sku} className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-white">{sku}</span>
                  <span className="text-sm text-[color:var(--color-evolt-muted)]">
                    {count} ativação{count !== 1 ? 'ões' : ''} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-[color:var(--color-evolt-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--color-evolt-orange)] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
