import type { ProfileType } from '@/lib/onboarding/classify-profile';

export type Recommendation = {
  sku: string;
  reason_text: string;
  priority: number;
  rule_id: string;
};

type ProfileSignals = {
  profileType: ProfileType;
  activatedSku: string;
  goal: string;
  training_level: string;
  days_per_week: number;
  age: number;
  weight_kg: number | null;
  current_supplements: string[];
};

type RecommendationRule = {
  id: string;
  sku: string;
  priority: number;
  reason_text: string;
  condition: (signals: ProfileSignals) => boolean;
};

const RULES: RecommendationRule[] = [
  // CREA01 — creatine: highest priority for training goals
  {
    id: 'R-CREA-TRAINING',
    sku: 'CREA01',
    priority: 1,
    reason_text: 'Creatina é um dos suplementos mais estudados para ganho de força e massa muscular.',
    condition: (s) => s.goal === 'hipertrofia' || s.goal === 'emagrecimento',
  },
  {
    id: 'R-CREA-HEALTH',
    sku: 'CREA01',
    priority: 3,
    reason_text: 'Complemento para quem pratica atividade física regularmente.',
    condition: (s) => s.goal === 'saude_geral' && s.days_per_week >= 2,
  },

  // JOIN01 — joint support listed BEFORE PRET01 at same priority so context-based
  // signals (age, weight, level) get preference over pre-workout (REC-05)
  {
    id: 'R-JOIN-ADVANCED',
    sku: 'JOIN01',
    priority: 2,
    reason_text: 'Suporte para articulações durante treinos de alta frequência e carga elevada.',
    condition: (s) => s.training_level === 'avancado',
  },
  {
    id: 'R-JOIN-AGE',
    sku: 'JOIN01',
    priority: 2,
    reason_text: 'Cuidado com as articulações — faz diferença especialmente a partir dos 40 anos.',
    condition: (s) => s.age >= 40,
  },
  {
    id: 'R-JOIN-WEIGHT',
    sku: 'JOIN01',
    priority: 2,
    reason_text: 'Suporte articular recomendado para quem carrega maior carga corporal nos treinos.',
    condition: (s) => s.weight_kg !== null && s.weight_kg > 90,
  },

  // PRET01 — pre-workout: only for active trainers (REC-04 — never for non-trainers)
  {
    id: 'R-PRET-ACTIVE',
    sku: 'PRET01',
    priority: 2,
    reason_text: 'Energia e foco para tirar o máximo das suas sessões de treino.',
    condition: (s) => s.days_per_week >= 2 && (s.goal === 'hipertrofia' || s.goal === 'emagrecimento'),
  },

  // MULT01 — multivitamin
  {
    id: 'R-MULT-BASE',
    sku: 'MULT01',
    priority: 2,
    reason_text: 'Base de micronutrientes essenciais para apoiar seu estilo de vida ativo.',
    condition: (s) => s.goal === 'saude_geral' || s.goal === 'qualidade_sono',
  },
  {
    id: 'R-MULT-TRAINING',
    sku: 'MULT01',
    priority: 3,
    reason_text: 'Garante os micronutrientes essenciais para recuperação e bem-estar.',
    condition: (s) => s.training_level === 'iniciante',
  },

  // OMEG01 — omega 3: broad wellbeing, lower priority
  {
    id: 'R-OMEG-SLEEP',
    sku: 'OMEG01',
    priority: 2,
    reason_text: 'Contribui para o bem-estar geral e qualidade do descanso noturno.',
    condition: (s) => s.goal === 'qualidade_sono',
  },
  {
    id: 'R-OMEG-GENERAL',
    sku: 'OMEG01',
    priority: 4,
    reason_text: 'Apoia a saúde cardiovascular, recuperação muscular e bem-estar geral.',
    condition: (_s) => true,
  },
];

export function generateRecommendations(signals: ProfileSignals): Recommendation[] {
  const skusSeen = new Set<string>();
  const results: Recommendation[] = [];

  // Always exclude the activated SKU
  skusSeen.add(signals.activatedSku);

  // Exclude SKUs user already has as supplements
  for (const sku of signals.current_supplements) {
    skusSeen.add(sku);
  }

  // Apply rules in priority order
  const matchingRules = RULES
    .filter((rule) => !skusSeen.has(rule.sku) && rule.condition(signals))
    .sort((a, b) => a.priority - b.priority);

  for (const rule of matchingRules) {
    if (skusSeen.has(rule.sku)) continue;
    skusSeen.add(rule.sku);
    results.push({
      sku: rule.sku,
      reason_text: rule.reason_text,
      priority: rule.priority,
      rule_id: rule.id,
    });
    if (results.length >= 4) break;
  }

  return results;
}
