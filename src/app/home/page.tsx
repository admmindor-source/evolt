import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card>
          <h1 className="mb-2 text-2xl font-semibold">Bem-vindo a EVOLT</h1>
          <p className="text-sm text-[color:var(--color-evolt-muted)]">
            Sua conta esta pronta. O onboarding chega em breve.
          </p>
          <form action="/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-5 text-sm text-white active:opacity-80"
            >
              Sair
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
