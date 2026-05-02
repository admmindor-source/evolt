import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LoginForm } from './form';
import { isSafeNextPath, DEFAULT_AUTHENTICATED_LANDING } from '@/lib/validation/login';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && isSafeNextPath(next) ? next : DEFAULT_AUTHENTICATED_LANDING;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card>
          <h1 className="mb-1 text-2xl font-semibold">Entrar</h1>
          <p className="mb-6 text-sm text-[color:var(--color-evolt-muted)]">
            Acesse sua conta EVOLT.
          </p>
          <LoginForm next={safeNext} />
          <p className="mt-6 text-center text-sm text-[color:var(--color-evolt-muted)]">
            Ainda nao tem conta?{' '}
            <Link href="/signup" className="text-[color:var(--color-evolt-orange)] underline">
              Criar conta
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
