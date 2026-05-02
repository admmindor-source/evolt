import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Acesso restrito</p>
          <p className="text-sm text-[color:var(--color-evolt-muted)]">
            Esta área é exclusiva para administradores.
          </p>
          <Link href="/home" className="mt-4 inline-block text-sm text-[color:var(--color-evolt-orange)]">
            Voltar ao app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="bg-[color:var(--color-evolt-surface)] border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-[color:var(--color-evolt-orange)] uppercase tracking-widest mb-0.5">EVOLT</p>
            <p className="font-semibold">Painel Admin</p>
          </div>
          <nav className="flex gap-4 text-sm text-[color:var(--color-evolt-muted)]">
            <Link href="/admin" className="hover-safe active:opacity-80">Usuários</Link>
            <Link href="/admin/funil" className="hover-safe active:opacity-80">Funil</Link>
            <Link href="/admin/skus" className="hover-safe active:opacity-80">SKUs</Link>
            <Link href="/admin/recomendacoes" className="hover-safe active:opacity-80">Recs</Link>
            <Link href="/home" className="hover-safe active:opacity-80">← App</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
