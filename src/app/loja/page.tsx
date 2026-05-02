import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/nav/BottomNav';

export const dynamic = 'force-dynamic';

type Product = {
  sku: string;
  name: string;
  description: string;
  price: string;
  externalUrl: string;
};

const CATALOG: Product[] = [
  {
    sku: 'WHEY01',
    name: 'Proteína Whey',
    description: 'Suplemento proteico de alta absorção para recuperação e ganho muscular. 25g de proteína por dose.',
    price: 'A partir de R$ 89,90',
    externalUrl: 'https://evolt.com.br/produtos/whey',
  },
  {
    sku: 'CREA01',
    name: 'Creatina',
    description: 'Monohidrato de creatina pura para ganho de força, potência e massa muscular. 5g por dose.',
    price: 'A partir de R$ 49,90',
    externalUrl: 'https://evolt.com.br/produtos/creatina',
  },
  {
    sku: 'MULT01',
    name: 'Multivitamínico',
    description: 'Complexo vitamínico e mineral completo para cobertura diária de micronutrientes essenciais.',
    price: 'A partir de R$ 39,90',
    externalUrl: 'https://evolt.com.br/produtos/multivitaminico',
  },
  {
    sku: 'OMEG01',
    name: 'Ômega 3',
    description: 'Ácidos graxos EPA e DHA para saúde cardiovascular, anti-inflamatório e bem-estar geral.',
    price: 'A partir de R$ 44,90',
    externalUrl: 'https://evolt.com.br/produtos/omega3',
  },
  {
    sku: 'PRET01',
    name: 'Pré-treino',
    description: 'Fórmula com cafeína, beta-alanina e L-citrulina para energia e foco máximos no treino.',
    price: 'A partir de R$ 59,90',
    externalUrl: 'https://evolt.com.br/produtos/pre-treino',
  },
  {
    sku: 'JOIN01',
    name: 'Colágeno Articular',
    description: 'Colágeno tipo II com vitamina C para saúde de articulações, tendões e ligamentos.',
    price: 'A partir de R$ 54,90',
    externalUrl: 'https://evolt.com.br/produtos/colageno',
  },
];

export default async function LojaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/loja');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  const { data: activation } = await supabase
    .from('product_activations')
    .select('sku')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <main className="flex flex-col gap-5 px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div>
          <p className="text-[color:var(--color-evolt-orange)] text-sm font-medium mb-0.5">
            EVOLT
          </p>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-[color:var(--color-evolt-muted)] mt-1">
            Linha completa de suplementos EVOLT.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CATALOG.map((product) => (
            <Card key={product.sku}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white">{product.name}</p>
                    {activation?.sku === product.sku && (
                      <span className="text-xs bg-[color:var(--color-evolt-orange)] text-black font-medium px-2 py-0.5 rounded-full">
                        Seu produto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[color:var(--color-evolt-muted)]">{product.sku}</p>
                </div>
              </div>
              <p className="text-sm text-[color:var(--color-evolt-muted)] mb-3 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{product.price}</p>
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target text-xs text-[color:var(--color-evolt-orange)] font-medium"
                >
                  Comprar no site →
                </a>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
