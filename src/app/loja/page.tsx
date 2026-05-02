import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/nav/BottomNav';
import { LojaClient } from './loja-client';

export const dynamic = 'force-dynamic';

export type Product = {
  sku: string;
  name: string;
  description: string;
  price: string;
  priceNum: number;
  category: 'proteinas' | 'performance' | 'saude';
  externalUrl: string;
};

const CATALOG: Product[] = [
  {
    sku: 'WHEY01',
    name: 'Proteína Whey',
    description: 'Alta absorção para recuperação e ganho muscular. 25g de proteína por dose.',
    price: 'R$ 159,90',
    priceNum: 15990,
    category: 'proteinas',
    externalUrl: 'https://evolt.com.br/produtos/whey',
  },
  {
    sku: 'CREA01',
    name: 'Creatina',
    description: 'Monohidrato puro para mais força, potência e massa muscular.',
    price: 'R$ 99,90',
    priceNum: 9990,
    category: 'performance',
    externalUrl: 'https://evolt.com.br/produtos/creatina',
  },
  {
    sku: 'MULT01',
    name: 'Multivitamínico',
    description: 'Complexo vitamínico completo para cobertura diária de micronutrientes.',
    price: 'R$ 69,90',
    priceNum: 6990,
    category: 'saude',
    externalUrl: 'https://evolt.com.br/produtos/multivitaminico',
  },
  {
    sku: 'OMEG01',
    name: 'Ômega 3',
    description: 'EPA e DHA para saúde cardiovascular e recuperação muscular.',
    price: 'R$ 89,90',
    priceNum: 8990,
    category: 'saude',
    externalUrl: 'https://evolt.com.br/produtos/omega3',
  },
  {
    sku: 'PRET01',
    name: 'Pré-treino',
    description: 'Cafeína, beta-alanina e L-citrulina para energia e foco máximos.',
    price: 'R$ 129,90',
    priceNum: 12990,
    category: 'performance',
    externalUrl: 'https://evolt.com.br/produtos/pre-treino',
  },
  {
    sku: 'JOIN01',
    name: 'Colágeno Articular',
    description: 'Colágeno tipo II + vitamina C para articulações e tendões.',
    price: 'R$ 109,90',
    priceNum: 10990,
    category: 'saude',
    externalUrl: 'https://evolt.com.br/produtos/colageno',
  },
];

export default async function LojaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/loja');

  const [{ data: profile }, { data: activation }] = await Promise.all([
    supabase.from('user_profiles').select('onboarding_completed').eq('user_id', user.id).single(),
    supabase
      .from('product_activations')
      .select('sku')
      .eq('user_id', user.id)
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding/1');

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <main className="flex flex-col max-w-lg mx-auto w-full">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-white">Loja</h1>
        </div>
        <LojaClient catalog={CATALOG} activatedSku={activation?.sku ?? null} />
      </main>
      <BottomNav />
    </div>
  );
}
