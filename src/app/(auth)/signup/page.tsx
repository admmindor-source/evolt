import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SignupForm } from './form';

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card>
          <h1 className="mb-1 text-2xl font-semibold">Criar conta EVOLT</h1>
          <p className="mb-6 text-sm text-[color:var(--color-evolt-muted)]">
            Comece sua jornada agora.
          </p>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-[color:var(--color-evolt-muted)]">
            Ja tem conta?{' '}
            <Link href="/login" className="text-[color:var(--color-evolt-orange)] underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
