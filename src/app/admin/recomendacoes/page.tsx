import { createClient } from '@/lib/supabase/server';

export default async function AdminRecomendacoesPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('recommendation_events')
    .select('sku, event_type, context');

  // Aggregate by SKU
  const skuStats: Record<string, { shown: number; clicked: number }> = {};
  for (const ev of events ?? []) {
    if (!skuStats[ev.sku]) skuStats[ev.sku] = { shown: 0, clicked: 0 };
    if (ev.event_type === 'shown') skuStats[ev.sku].shown++;
    if (ev.event_type === 'clicked') skuStats[ev.sku].clicked++;
  }

  const skuRows = Object.entries(skuStats)
    .map(([sku, { shown, clicked }]) => ({
      sku,
      shown,
      clicked,
      ctr: shown > 0 ? Math.round((clicked / shown) * 100) : 0,
    }))
    .sort((a, b) => b.shown - a.shown);

  // Aggregate by profile_type from context jsonb
  const profileStats: Record<string, { shown: number; clicked: number }> = {};
  for (const ev of events ?? []) {
    const ctx = ev.context as Record<string, string> | null;
    const profile = ctx?.profile_type ?? 'desconhecido';
    if (!profileStats[profile]) profileStats[profile] = { shown: 0, clicked: 0 };
    if (ev.event_type === 'shown') profileStats[profile].shown++;
    if (ev.event_type === 'clicked') profileStats[profile].clicked++;
  }

  const profileRows = Object.entries(profileStats)
    .map(([profile, { shown, clicked }]) => ({
      profile,
      shown,
      clicked,
      ctr: shown > 0 ? Math.round((clicked / shown) * 100) : 0,
    }))
    .sort((a, b) => b.shown - a.shown);

  const totalShown = skuRows.reduce((s, r) => s + r.shown, 0);
  const totalClicked = skuRows.reduce((s, r) => s + r.clicked, 0);
  const globalCtr = totalShown > 0 ? Math.round((totalClicked / totalShown) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Recomendações</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">
          CTR global:{' '}
          <span className="text-white font-medium">{globalCtr}%</span>
          {' '}({totalClicked} cliques / {totalShown} exibições)
        </p>
      </div>

      {skuRows.length === 0 ? (
        <p className="text-sm text-[color:var(--color-evolt-muted)]">Nenhum evento de recomendação registrado ainda.</p>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-medium text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">Por SKU</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[color:var(--color-evolt-muted)] text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="pb-2 pr-4">SKU</th>
                    <th className="pb-2 pr-4">Exibições</th>
                    <th className="pb-2 pr-4">Cliques</th>
                    <th className="pb-2">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {skuRows.map(({ sku, shown, clicked, ctr }) => (
                    <tr key={sku} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-medium text-white">{sku}</td>
                      <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">{shown}</td>
                      <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">{clicked}</td>
                      <td className="py-2">
                        <span className="text-[color:var(--color-evolt-orange)] font-semibold">{ctr}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">Por perfil</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[color:var(--color-evolt-muted)] text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="pb-2 pr-4">Perfil</th>
                    <th className="pb-2 pr-4">Exibições</th>
                    <th className="pb-2 pr-4">Cliques</th>
                    <th className="pb-2">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {profileRows.map(({ profile, shown, clicked, ctr }) => (
                    <tr key={profile} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-medium text-white">{profile}</td>
                      <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">{shown}</td>
                      <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">{clicked}</td>
                      <td className="py-2">
                        <span className="text-[color:var(--color-evolt-orange)] font-semibold">{ctr}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
