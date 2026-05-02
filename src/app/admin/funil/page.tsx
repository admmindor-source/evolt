import { createClient } from '@/lib/supabase/server';

export default async function AdminFunilPage() {
  const supabase = await createClient();

  const [
    { count: totalProfiles },
    { count: completedOnboarding },
    { count: withActivation },
    { count: withProgress },
    { count: signupEvents },
    { count: qrEvents },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
    supabase.from('product_activations').select('user_id', { count: 'exact', head: true }),
    supabase.from('weight_logs').select('user_id', { count: 'exact', head: true }),
    supabase.from('engagement_events').select('*', { count: 'exact', head: true }).eq('event_type', 'signup_completed'),
    supabase.from('engagement_events').select('*', { count: 'exact', head: true }).eq('event_type', 'qr_scanned'),
  ]);

  const steps = [
    { label: 'QR codes escaneados', value: qrEvents ?? 0, description: 'Eventos qr_scanned registrados' },
    { label: 'Cadastros concluídos', value: signupEvents ?? 0, description: 'Eventos signup_completed registrados' },
    { label: 'Total de usuários', value: totalProfiles ?? 0, description: 'Profiles criados' },
    { label: 'Com produto ativado', value: withActivation ?? 0, description: 'Têm product_activations' },
    { label: 'Onboarding completo', value: completedOnboarding ?? 0, description: 'onboarding_completed = true' },
    { label: 'Com progresso registrado', value: withProgress ?? 0, description: 'Têm pelo menos 1 weight_log' },
  ];

  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Funil de conversão</h1>
        <p className="text-sm text-[color:var(--color-evolt-muted)]">
          Jornada do usuário do primeiro scan até o progresso registrado.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((step, i) => {
          const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-white">{step.label}</span>
                <span className="text-lg font-semibold text-[color:var(--color-evolt-orange)]">
                  {step.value.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2 bg-[color:var(--color-evolt-surface)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-evolt-orange)] rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-[color:var(--color-evolt-muted)]">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
