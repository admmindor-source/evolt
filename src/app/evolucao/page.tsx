import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';
import { WeightForm } from './weight-form';
import { PhotoUpload } from './photo-upload';

export const dynamic = 'force-dynamic';

function trendArrow(logs: Array<{ weight_kg: number }>): string {
  if (logs.length < 2) return '';
  const last = logs[0].weight_kg;
  const prev = logs[1].weight_kg;
  if (last < prev) return '↓';
  if (last > prev) return '↑';
  return '→';
}

export default async function EvolucaoPage() {
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

  // Generate signed URLs for photos
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
  const firstPhoto = allPhotos[allPhotos.length - 1];
  const lastPhoto = allPhotos[0];
  const hasBeforeAfter = allPhotos.length >= 2 && firstPhoto !== lastPhoto;

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <main className="flex flex-col gap-5 px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div>
          <p className="text-[color:var(--color-evolt-orange)] text-sm font-medium mb-0.5">
            EVOLT
          </p>
          <h1 className="text-2xl font-semibold">Evolução</h1>
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            Acompanhe seu progresso ao longo do tempo.
          </p>
        </div>

        {/* Weight log form */}
        <WeightForm />

        {/* Weight history */}
        {logs.length === 0 ? (
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-2">
              Histórico de peso
            </p>
            <p className="text-sm text-[color:var(--color-evolt-muted)]">
              Nenhum registro ainda. Adicione o primeiro acima!
            </p>
          </Card>
        ) : (
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
              Histórico de peso {trend && <span className="ml-1 text-[color:var(--color-evolt-orange)]">{trend}</span>}
            </p>
            <div className="flex flex-col gap-2">
              {logs.slice(0, 10).map((log) => {
                const date = new Date(log.measured_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                });
                return (
                  <div key={log.id} className="flex justify-between items-center text-sm">
                    <span className="text-[color:var(--color-evolt-muted)]">{date}</span>
                    <span className="font-semibold text-white">{Number(log.weight_kg).toFixed(1)} kg</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Photo upload */}
        <PhotoUpload />

        {/* Before/after comparison */}
        {hasBeforeAfter && (
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
              Antes e depois
            </p>
            <div className="grid grid-cols-2 gap-3">
              {photoUrls[firstPhoto.storage_path] && (
                <div>
                  <p className="text-xs text-[color:var(--color-evolt-muted)] mb-1">Antes</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrls[firstPhoto.storage_path]}
                    alt="Foto inicial"
                    className="w-full rounded-xl object-cover aspect-[3/4]"
                  />
                </div>
              )}
              {photoUrls[lastPhoto.storage_path] && (
                <div>
                  <p className="text-xs text-[color:var(--color-evolt-muted)] mb-1">Agora</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrls[lastPhoto.storage_path]}
                    alt="Foto mais recente"
                    className="w-full rounded-xl object-cover aspect-[3/4]"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* All photos grid */}
        {allPhotos.length > 0 && (
          <Card>
            <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
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
          </Card>
        )}

        <Link href="/home" className="text-xs text-[color:var(--color-evolt-muted)] text-center">
          ← Voltar para o início
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
