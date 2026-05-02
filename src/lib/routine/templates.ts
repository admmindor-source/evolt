import type { ProfileType } from '@/lib/onboarding/classify-profile';

export type Category = 'supplement' | 'workout' | 'nutrition' | 'hydration';

export type DailyBlock = {
  category: Category;
  title: string;
  description: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
};

export type WorkoutDetail = {
  title: string;
  duration: string;
  focus: string;
  exercises: Exercise[];
};

export type SupplementDetail = {
  name: string;
  howToUse: string;
  benefits: string;
  tip: string;
};

// --- Supplement details by SKU ---
export const SUPPLEMENT_DETAILS: Record<string, SupplementDetail> = {
  WHEY01: {
    name: 'Proteína Whey',
    howToUse: 'Misture 1 scoop (30g) com 200ml de água ou leite. Consuma preferencialmente após o treino.',
    benefits: 'Apoia a recuperação muscular, fornece aminoácidos essenciais e auxilia no ganho de massa magra.',
    tip: 'Consuma dentro de 30 minutos após o treino para melhor absorção.',
  },
  CREA01: {
    name: 'Creatina',
    howToUse: 'Tome 5g por dia dissolvidos em água, suco ou misturados ao seu shake. Pode ser tomada a qualquer momento do dia.',
    benefits: 'Aumenta a força, potência e resistência muscular. Um dos suplementos mais estudados da ciência do esporte.',
    tip: 'A consistência diária é mais importante do que o horário. Tome todos os dias, mesmo nos dias sem treino.',
  },
  MULT01: {
    name: 'Multivitamínico',
    howToUse: 'Tome 1 cápsula pela manhã, preferencialmente com a primeira refeição do dia.',
    benefits: 'Garante a cobertura de micronutrientes essenciais, apoia a imunidade e contribui para o bem-estar geral.',
    tip: 'Tome com comida para melhorar a absorção das vitaminas lipossolúveis (A, D, E, K).',
  },
  OMEG01: {
    name: 'Ômega 3',
    howToUse: 'Tome 2 cápsulas ao dia, preferencialmente com as refeições. Pode dividir: 1 no almoço e 1 no jantar.',
    benefits: 'Apoia a saúde cardiovascular, reduz inflamação, melhora a recuperação muscular e contribui para o bem-estar geral.',
    tip: 'Guarde na geladeira após abrir para preservar a qualidade dos ácidos graxos.',
  },
  PRET01: {
    name: 'Pré-treino',
    howToUse: 'Tome 1 dose (10g) dissolvida em 200ml de água, 20 a 30 minutos antes do treino.',
    benefits: 'Aumenta o foco, a energia e o desempenho durante o treino. Retarda a fadiga em sessões intensas.',
    tip: 'Evite tomar após as 17h se você é sensível à cafeína. Comece com meia dose para avaliar sua tolerância.',
  },
  JOIN01: {
    name: 'Colágeno Articular',
    howToUse: 'Tome 1 dose diária dissolvida em água ou suco, de preferência em jejum ou junto com vitamina C.',
    benefits: 'Apoia a saúde das articulações, tendões e ligamentos, reduzindo o desconforto em treinos de alta intensidade.',
    tip: 'A vitamina C potencializa a síntese de colágeno. Tome com suco de laranja ou limão.',
  },
};

// --- Daily routine blocks by profile type ---
const DAILY_BLOCKS: Record<ProfileType, DailyBlock[]> = {
  'iniciante-emagrecimento': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino leve', description: '30–40 min de atividade moderada. Foco na técnica, não na carga.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Priorize proteína e vegetais. Reduza gradualmente calorias de fontes processadas.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 2,5 litros de água ao longo do dia.' },
  ],
  'intermediario-emagrecimento': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino moderado', description: '45–60 min combinando força e cardio. Intensidade crescente.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Controle de porções. Proteína em cada refeição principal.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 3 litros de água ao longo do dia.' },
  ],
  'avancado-emagrecimento': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino intenso', description: '60–75 min de alta intensidade. Combine força com intervalos de cardio.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Déficit calórico controlado. Proteína elevada para preservar massa muscular.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 3,5 litros de água ao longo do dia.' },
  ],
  'iniciante-hipertrofia': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino de força', description: '40–50 min de musculação. Aprenda os movimentos básicos com boa técnica.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Coma um pouco acima do seu gasto energético. Proteína é prioridade.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 2,5 litros de água ao longo do dia.' },
  ],
  'intermediario-hipertrofia': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino de força', description: '50–70 min de musculação. Aumente a carga progressivamente a cada semana.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Superávit calórico moderado. Distribua a proteína em 4–5 refeições ao longo do dia.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 3 litros de água ao longo do dia.' },
  ],
  'avancado-hipertrofia': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Treino avançado', description: '60–80 min de musculação com volume e intensidade elevados.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Alimentação estratégica: carboidratos pré e pós-treino, proteína alta ao longo do dia.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 3,5 litros de água ao longo do dia.' },
  ],
  'saude-geral': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Atividade física', description: '30–45 min de atividade moderada: caminhada, yoga ou musculação leve.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Alimentação variada e equilibrada. Reduza processados e aumente vegetais.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba pelo menos 2 litros de água ao longo do dia.' },
  ],
  'qualidade-sono': [
    { category: 'supplement', title: 'Suplemento do dia', description: 'Tome seu suplemento principal conforme indicado na embalagem.' },
    { category: 'workout', title: 'Atividade física', description: '30 min de atividade leve. Evite exercícios intensos nas últimas 3h antes de dormir.' },
    { category: 'nutrition', title: 'Alimentação de hoje', description: 'Evite cafeína após as 14h. Jantar leve e de fácil digestão.' },
    { category: 'hydration', title: 'Meta de hidratação', description: 'Beba 2 litros de água durante o dia. Reduza a ingestão nas últimas 2h antes de dormir.' },
  ],
};

// --- Workout detail templates by profile type ---
const WORKOUT_DETAILS: Record<ProfileType, WorkoutDetail> = {
  'iniciante-emagrecimento': {
    title: 'Treino Iniciante — Emagrecimento',
    duration: '30–40 min',
    focus: 'Movimentos básicos com boa técnica',
    exercises: [
      { name: 'Agachamento livre', sets: 3, reps: '12–15', rest: '60s' },
      { name: 'Flexão de braço', sets: 3, reps: '8–12', rest: '60s' },
      { name: 'Prancha abdominal', sets: 3, reps: '20–30s', rest: '45s' },
      { name: 'Caminhada na esteira', sets: 1, reps: '15 min', rest: '—' },
    ],
  },
  'intermediario-emagrecimento': {
    title: 'Treino Intermediário — Emagrecimento',
    duration: '45–60 min',
    focus: 'Força + cardio em circuito',
    exercises: [
      { name: 'Agachamento com barra', sets: 4, reps: '10–12', rest: '75s' },
      { name: 'Supino reto', sets: 4, reps: '10–12', rest: '75s' },
      { name: 'Remada curvada', sets: 3, reps: '12', rest: '60s' },
      { name: 'Burpee', sets: 3, reps: '10', rest: '60s' },
      { name: 'Cardio moderado', sets: 1, reps: '20 min', rest: '—' },
    ],
  },
  'avancado-emagrecimento': {
    title: 'Treino Avançado — Emagrecimento',
    duration: '60–75 min',
    focus: 'Alta intensidade + preservação muscular',
    exercises: [
      { name: 'Agachamento back squat', sets: 5, reps: '8–10', rest: '90s' },
      { name: 'Levantamento terra', sets: 4, reps: '8', rest: '90s' },
      { name: 'Supino inclinado', sets: 4, reps: '10', rest: '75s' },
      { name: 'Pull-up', sets: 4, reps: 'máx', rest: '75s' },
      { name: 'HIIT intervalado', sets: 1, reps: '15 min', rest: '—' },
    ],
  },
  'iniciante-hipertrofia': {
    title: 'Treino Iniciante — Hipertrofia',
    duration: '40–50 min',
    focus: 'Movimentos compostos + técnica',
    exercises: [
      { name: 'Agachamento livre', sets: 3, reps: '10–12', rest: '90s' },
      { name: 'Supino reto', sets: 3, reps: '10–12', rest: '90s' },
      { name: 'Remada unilateral', sets: 3, reps: '10–12', rest: '90s' },
      { name: 'Desenvolvimento ombro', sets: 3, reps: '12', rest: '75s' },
    ],
  },
  'intermediario-hipertrofia': {
    title: 'Treino Intermediário — Hipertrofia',
    duration: '50–70 min',
    focus: 'Sobrecarga progressiva',
    exercises: [
      { name: 'Agachamento com barra', sets: 4, reps: '8–10', rest: '2min' },
      { name: 'Levantamento terra romeno', sets: 4, reps: '10', rest: '2min' },
      { name: 'Supino inclinado', sets: 4, reps: '8–10', rest: '90s' },
      { name: 'Remada curvada', sets: 4, reps: '10', rest: '90s' },
      { name: 'Rosca direta', sets: 3, reps: '12', rest: '60s' },
    ],
  },
  'avancado-hipertrofia': {
    title: 'Treino Avançado — Hipertrofia',
    duration: '60–80 min',
    focus: 'Volume alto + intensidade máxima',
    exercises: [
      { name: 'Agachamento back squat', sets: 5, reps: '6–8', rest: '2min' },
      { name: 'Levantamento terra', sets: 4, reps: '5–6', rest: '3min' },
      { name: 'Supino reto com barra', sets: 5, reps: '6–8', rest: '2min' },
      { name: 'Pull-up lastrado', sets: 4, reps: '6–8', rest: '2min' },
      { name: 'Desenvolvimento militar', sets: 4, reps: '8', rest: '90s' },
      { name: 'Rosca direta', sets: 3, reps: '10', rest: '60s' },
    ],
  },
  'saude-geral': {
    title: 'Treino — Saúde Geral',
    duration: '30–45 min',
    focus: 'Condicionamento geral e mobilidade',
    exercises: [
      { name: 'Caminhada ou esteira', sets: 1, reps: '15 min', rest: '—' },
      { name: 'Agachamento livre', sets: 3, reps: '12–15', rest: '60s' },
      { name: 'Flexão de braço', sets: 3, reps: '8–12', rest: '60s' },
      { name: 'Alongamento global', sets: 1, reps: '10 min', rest: '—' },
    ],
  },
  'qualidade-sono': {
    title: 'Atividade Leve — Sono',
    duration: '30 min',
    focus: 'Relaxamento e redução de estresse',
    exercises: [
      { name: 'Caminhada tranquila', sets: 1, reps: '20 min', rest: '—' },
      { name: 'Respiração diafragmática', sets: 3, reps: '5 ciclos', rest: '30s' },
      { name: 'Alongamento de quadril', sets: 2, reps: '60s cada lado', rest: '30s' },
      { name: 'Yoga/mobilidade', sets: 1, reps: '10 min', rest: '—' },
    ],
  },
};

export function getDailyBlocks(profileType: ProfileType): DailyBlock[] {
  return DAILY_BLOCKS[profileType] ?? DAILY_BLOCKS['saude-geral'];
}

export function getWorkoutDetail(profileType: ProfileType): WorkoutDetail {
  return WORKOUT_DETAILS[profileType] ?? WORKOUT_DETAILS['saude-geral'];
}

export function getSupplementDetail(sku: string): SupplementDetail {
  return SUPPLEMENT_DETAILS[sku] ?? {
    name: sku,
    howToUse: 'Siga as instruções da embalagem do produto.',
    benefits: 'Consulte o rótulo do produto para informações completas.',
    tip: 'Mantenha a regularidade para melhores resultados.',
  };
}

export function getDayNumber(activatedAt: string): number {
  const activation = new Date(activatedAt);
  const now = new Date();
  const diffMs = now.getTime() - activation.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}
