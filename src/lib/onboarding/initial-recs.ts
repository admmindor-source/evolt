import type { ProfileType } from './classify-profile';

export type InitialRec = {
  sku: string;
  reason_text: string;
  priority: number;
};

const RECS_BY_PROFILE: Record<ProfileType, InitialRec[]> = {
  'iniciante-emagrecimento': [
    { sku: 'CREA01', reason_text: 'Ajuda a manter sua força mesmo em períodos de alimentação com menos calorias', priority: 1 },
    { sku: 'MULT01', reason_text: 'Garante os micronutrientes essenciais quando você está ajustando a alimentação', priority: 2 },
    { sku: 'OMEG01', reason_text: 'Apoia o bem-estar geral durante o processo de mudança de hábitos', priority: 3 },
  ],
  'intermediario-emagrecimento': [
    { sku: 'CREA01', reason_text: 'Potencializa a força e a recuperação em treinos de maior volume', priority: 1 },
    { sku: 'PRET01', reason_text: 'Energia e disposição para treinos de alta intensidade', priority: 2 },
    { sku: 'OMEG01', reason_text: 'Auxilia na recuperação e no bem-estar entre os treinos', priority: 3 },
  ],
  'avancado-emagrecimento': [
    { sku: 'CREA01', reason_text: 'Preserva força e massa muscular em treinos de alta frequência', priority: 1 },
    { sku: 'PRET01', reason_text: 'Desempenho máximo em sessões intensas de treino', priority: 2 },
    { sku: 'JOIN01', reason_text: 'Suporte para articulações durante volume de treino elevado', priority: 3 },
    { sku: 'OMEG01', reason_text: 'Bem-estar e recuperação entre sessões intensas', priority: 4 },
  ],
  'iniciante-hipertrofia': [
    { sku: 'CREA01', reason_text: 'Um dos suplementos mais estudados para ganho de força e volume muscular', priority: 1 },
    { sku: 'MULT01', reason_text: 'Base de micronutrientes para apoiar os treinos de ganho de massa', priority: 2 },
    { sku: 'OMEG01', reason_text: 'Bem-estar geral e suporte à saúde durante o treino', priority: 3 },
  ],
  'intermediario-hipertrofia': [
    { sku: 'CREA01', reason_text: 'Ganhos de força e volume comprovados em treinos intermediários', priority: 1 },
    { sku: 'PRET01', reason_text: 'Foco e disposição para tirar o máximo de cada treino', priority: 2 },
    { sku: 'OMEG01', reason_text: 'Recuperação e bem-estar entre as sessões', priority: 3 },
  ],
  'avancado-hipertrofia': [
    { sku: 'CREA01', reason_text: 'Potencializa os ganhos de força em treinos avançados', priority: 1 },
    { sku: 'PRET01', reason_text: 'Energia máxima para sessões de alta intensidade', priority: 2 },
    { sku: 'JOIN01', reason_text: 'Cuidado com as articulações em cargas elevadas', priority: 3 },
    { sku: 'OMEG01', reason_text: 'Recuperação e saúde geral em longo prazo', priority: 4 },
  ],
  'saude-geral': [
    { sku: 'MULT01', reason_text: 'Base nutricional completa para quem quer cuidar da saúde de forma consistente', priority: 1 },
    { sku: 'OMEG01', reason_text: 'Bem-estar cardiovascular e saúde geral', priority: 2 },
    { sku: 'CREA01', reason_text: 'Complemento para quem pratica atividade física regularmente', priority: 3 },
  ],
  'qualidade-sono': [
    { sku: 'MULT01', reason_text: 'Micronutrientes que apoiam o relaxamento e o descanso noturno', priority: 1 },
    { sku: 'OMEG01', reason_text: 'Bem-estar geral que contribui para noites mais tranquilas', priority: 2 },
  ],
  'suporte-articular': [
    { sku: 'JOIN01', reason_text: 'Suporte direto para articulações, tendões e ligamentos', priority: 1 },
    { sku: 'OMEG01', reason_text: 'Ácidos graxos anti-inflamatórios para reduzir o desconforto articular', priority: 2 },
    { sku: 'MULT01', reason_text: 'Vitaminas e minerais essenciais para a saúde das articulações', priority: 3 },
  ],
};

export function getInitialRecommendations(
  profileType: ProfileType,
  activatedSku: string,
): InitialRec[] {
  const recs = RECS_BY_PROFILE[profileType] ?? [];
  return recs.filter((r) => r.sku !== activatedSku).slice(0, 4);
}
