import { AtivarForm } from './form';

export default async function AtivarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === 'invalid'
      ? 'O link do QR Code parece invalido. Digite o codigo manual abaixo.'
      : error === 'not-found'
        ? 'Produto nao encontrado. Verifique o codigo no rotulo.'
        : null;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <AtivarForm initialError={initialError} />
      </div>
    </main>
  );
}
