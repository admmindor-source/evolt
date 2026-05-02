import { createClient } from '@/lib/supabase/server';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; goal?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('user_profiles')
    .select(`
      user_id,
      full_name,
      whatsapp,
      goal,
      profile_type,
      onboarding_completed,
      created_at,
      product_activations (sku, activated_at)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.goal) {
    query = query.eq('goal', params.goal);
  }

  const { data: profiles } = await query;

  const filteredProfiles = (profiles ?? []).filter((p) => {
    const activations = (p.product_activations as Array<{ sku: string; activated_at: string }>) ?? [];

    if (params.sku && !activations.some((a) => a.sku === params.sku)) return false;

    if (params.from || params.to) {
      const hasActivation = activations.some((a) => {
        const d = a.activated_at;
        if (params.from && d < params.from) return false;
        if (params.to && d > params.to + 'T23:59:59') return false;
        return true;
      });
      if (!hasActivation) return false;
    }

    return true;
  });

  const userIds = filteredProfiles.map((p) => p.user_id);

  let lastSeenMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: events } = await supabase
      .from('engagement_events')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (events) {
      for (const ev of events) {
        if (!lastSeenMap[ev.user_id]) {
          lastSeenMap[ev.user_id] = ev.created_at;
        }
      }
    }
  }

  const GOAL_LABELS: Record<string, string> = {
    emagrecimento: 'Emagrecimento',
    hipertrofia: 'Hipertrofia',
    performance: 'Performance',
    definicao_muscular: 'Definição muscular',
    saude_geral: 'Saúde e bem-estar',
    qualidade_sono: 'Qualidade do sono',
    suporte_articular: 'Suporte articular',
  };

  const SKU_OPTIONS = ['WHEY01', 'CREA01', 'MULT01', 'OMEG01', 'PRET01', 'JOIN01'];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Usuários</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">
          {filteredProfiles.length} usuário(s) encontrado(s)
        </p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <select
          name="sku"
          defaultValue={params.sku ?? ''}
          className="rounded-xl bg-[color:var(--color-evolt-surface)] px-3 py-2 text-sm text-white border border-white/10"
        >
          <option value="">Todos os SKUs</option>
          {SKU_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          name="goal"
          defaultValue={params.goal ?? ''}
          className="rounded-xl bg-[color:var(--color-evolt-surface)] px-3 py-2 text-sm text-white border border-white/10"
        >
          <option value="">Todos os objetivos</option>
          {Object.entries(GOAL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={params.from ?? ''}
          className="rounded-xl bg-[color:var(--color-evolt-surface)] px-3 py-2 text-sm text-white border border-white/10"
          placeholder="De"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to ?? ''}
          className="rounded-xl bg-[color:var(--color-evolt-surface)] px-3 py-2 text-sm text-white border border-white/10"
          placeholder="Até"
        />
        <button
          type="submit"
          className="tap-target rounded-xl bg-[color:var(--color-evolt-orange)] text-black text-sm font-medium px-4"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[color:var(--color-evolt-muted)] text-xs uppercase tracking-wide border-b border-white/10">
              <th className="pb-2 pr-4">Nome</th>
              <th className="pb-2 pr-4">WhatsApp</th>
              <th className="pb-2 pr-4">Objetivo</th>
              <th className="pb-2 pr-4">Perfil</th>
              <th className="pb-2 pr-4">SKU</th>
              <th className="pb-2 pr-4">Ativado em</th>
              <th className="pb-2 pr-4">Último acesso</th>
              <th className="pb-2">Onboarding</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.map((p) => {
              const activations = (p.product_activations as Array<{ sku: string; activated_at: string }>) ?? [];
              const activation = activations[0];
              const lastSeen = lastSeenMap[p.user_id];
              return (
                <tr key={p.user_id} className="border-b border-white/5 py-2">
                  <td className="py-2 pr-4 font-medium text-white">{p.full_name}</td>
                  <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">
                    {p.whatsapp || '—'}
                  </td>
                  <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">
                    {p.goal ? (GOAL_LABELS[p.goal] ?? p.goal) : '—'}
                  </td>
                  <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">
                    {p.profile_type ?? '—'}
                  </td>
                  <td className="py-2 pr-4">
                    {activation?.sku ? (
                      <span className="bg-[color:var(--color-evolt-orange)] text-black text-xs font-medium px-2 py-0.5 rounded-full">
                        {activation.sku}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">
                    {activation?.activated_at
                      ? new Date(activation.activated_at).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="py-2 pr-4 text-[color:var(--color-evolt-muted)]">
                    {lastSeen
                      ? new Date(lastSeen).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-2">
                    {p.onboarding_completed ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProfiles.length === 0 && (
          <p className="text-sm text-[color:var(--color-evolt-muted)] text-center py-8">
            Nenhum usuário encontrado com os filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
}
