import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { WeightForm } from './weight-form';
import { PhotoUpload } from './photo-upload';

export const dynamic = 'force-dynamic';

function trendArrow(logs: Array<{ weight_kg: number }>): { arrow: string; color: string } {
  if (logs.length < 2) return { arrow: '', color: '' };
  const last = logs[0].weight_kg;
  const prev = logs[1].weight_kg;
  if (last < prev) return { arrow: '↓', color: '#4ade80' };
  if (last > prev) return { arrow: '↑', color: '#f87171' };
  return { arrow: '→', color: 'var(--color-evolt-muted)' };
}

function WeightChart({ logs }: { logs: Array<{ weight_kg: number; measured_at: string }> }) {
  if (logs.length < 2) return null;

  const ordered = [...logs].reverse();
  const weights = ordered.map((l) => Number(l.weight_kg));
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const W = 300;
  const H = 80;
  const pad = 8;
  const points = ordered.map((_, i) => {
    const x = pad + (i / (ordered.length - 1)) * (W - pad * 2);
    const y = H - pad - ((weights[i] - minW) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${pad},${H - pad} L ${points.join(' L ')} L ${W - pad},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-evolt-orange)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-evolt-orange)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="var(--color-evolt-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="4"
          fill="var(--color-evolt-orange)"
        />
      )}
    </svg>
  );
}

export default async function EvolucaoPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'fotos' ? 'fotos' : 'peso';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/evolucao');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  const [{ data: weightLogs }, { data: photos }] = await Promise.all([
    supabase
      .from('weight_logs')
      .select('id, weight_kg, measured_at')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(20),
    supabase
      .from('progress_photos')
      .select('id, storage_path, taken_at')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(20),
  ]);

  const photoUrls: Record<string, string> = {};
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path);
    const { data: signedUrls } = await supabase.storage
      .from('progress-photos')
      .createSignedUrls(paths, 3600);

    if (signedUrls) {
      for (const su of signedUrls) {
        if (su.signedUrl && su.path) photoUrls[su.path] = su.signedUrl;
      }
    }
  }

  const logs = weightLogs ?? [];
  const allPhotos = photos ?? [];
  const trend = trendArrow(logs);
  const currentWeight = logs[0] ? Number(logs[0].weight_kg) : null;
  const firstWeight = logs[logs.length - 1] ? Number(logs[logs.length - 1].weight_kg) : null;
  const weightDiff = currentWeight !== null && firstWeight !== null ? currentWeight - firstWeight : null;

  const firstPhoto = allPhotos[allPhotos.length - 1];
  const lastPhoto = allPhotos[0];
  const hasBeforeAfter = allPhotos.length >= 2 && firstPhoto !== lastPhoto;

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-white">Evolução</h1>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1 mb-4">
          {(['peso', 'fotos'] as const).map((t) => (
            <a
              key={t}
              href={t === 'peso' ? '/evolucao' : '/evolucao?tab=fotos'}
              className="flex-1 text-center py-2 rounded-xl text-sm font-semibold transition-colors"
              style={
                tab === t
                  ? { background: 'var(--color-evolt-orange)', color: 'black' }
                  : { background: 'var(--color-evolt-surface)', color: 'var(--color-evolt-muted)' }
              }
            >
              {t === 'peso' ? 'Peso' : 'Fotos'}
            </a>
          ))}
        </div>

        {tab === 'peso' && (
          <div className="flex flex-col gap-4 px-4">
            {/* Current weight card */}
            {currentWeight !== null && (
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>Peso atual</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-white">{currentWeight.toFixed(1)} kg</p>
                  {weightDiff !== null && (
                    <p className="text-sm font-medium mb-1" style={{ color: trend.color }}>
                      {trend.arrow} {Math.abs(weightDiff).toFixed(1)} kg desde o início
                    </p>
                  )}
                </div>
                {logs.length >= 2 && (
                  <div className="mt-3">
                    <WeightChart logs={logs} />
                  </div>
                )}
              </div>
            )}

            {/* Register weight */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-evolt-muted)' }}>Registrar peso</p>
              <WeightForm />
            </div>

            {/* History */}
            {logs.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-xs font-semibold px-4 pt-4 pb-2" style={{ color: 'var(--color-evolt-muted)' }}>Histórico</p>
                {logs.slice(0, 10).map((log, i) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center px-4 py-3 text-sm"
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}
                  >
                    <span style={{ color: 'var(--color-evolt-muted)' }}>
                      {new Date(log.measured_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="font-semibold text-white">{Number(log.weight_kg).toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            )}

            {logs.length === 0 && (
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-sm" style={{ color: 'var(--color-evolt-muted)' }}>
                  Nenhum registro ainda. Adicione o primeiro acima!
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'fotos' && (
          <div className="flex flex-col gap-4 px-4">
            {/* Before/after */}
            {hasBeforeAfter && (
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-evolt-muted)' }}>Antes e depois</p>
                <div className="grid grid-cols-2 gap-3">
                  {photoUrls[firstPhoto.storage_path] && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>
                        Antes — {new Date(firstPhoto.taken_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrls[firstPhoto.storage_path]} alt="Foto inicial" className="w-full rounded-xl object-cover aspect-[3/4]" />
                    </div>
                  )}
                  {photoUrls[lastPhoto.storage_path] && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-evolt-muted)' }}>
                        Atual — {new Date(lastPhoto.taken_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrls[lastPhoto.storage_path]} alt="Foto recente" className="w-full rounded-xl object-cover aspect-[3/4]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add photo */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-evolt-muted)' }}>Adicionar foto</p>
              <PhotoUpload />
            </div>

            {/* All photos grid */}
            {allPhotos.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-evolt-muted)' }}>
                  Todas as fotos ({allPhotos.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {allPhotos.map((photo) =>
                    photoUrls[photo.storage_path] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo.id}
                        src={photoUrls[photo.storage_path]}
                        alt={`Progresso ${new Date(photo.taken_at).toLocaleDateString('pt-BR')}`}
                        className="w-full rounded-lg object-cover aspect-square"
                      />
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {allPhotos.length === 0 && (
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--color-evolt-surface)' }}>
                <p className="text-sm" style={{ color: 'var(--color-evolt-muted)' }}>
                  Nenhuma foto ainda. Adicione a primeira acima!
                </p>
              </div>
            )}
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
