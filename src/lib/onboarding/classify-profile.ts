export type ProfileType =
  | 'iniciante-emagrecimento'
  | 'iniciante-hipertrofia'
  | 'intermediario-emagrecimento'
  | 'intermediario-hipertrofia'
  | 'avancado-emagrecimento'
  | 'avancado-hipertrofia'
  | 'saude-geral'
  | 'qualidade-sono'
  | 'suporte-articular';

export type GoalType =
  | 'emagrecimento'
  | 'hipertrofia'
  | 'saude_geral'
  | 'qualidade_sono'
  | 'performance'
  | 'definicao_muscular'
  | 'suporte_articular';

export type ClassifyInput = {
  goal: GoalType;
  training_level: 'iniciante' | 'intermediario' | 'avancado';
  days_per_week: number;
  age: number;
};

export function classifyProfile(input: ClassifyInput): ProfileType {
  const { goal, training_level } = input;

  if (goal === 'saude_geral') return 'saude-geral';
  if (goal === 'qualidade_sono') return 'qualidade-sono';
  if (goal === 'suporte_articular') return 'suporte-articular';
  if (goal === 'performance') return `${training_level}-hipertrofia` as ProfileType;
  if (goal === 'definicao_muscular') return `${training_level}-emagrecimento` as ProfileType;

  return `${training_level}-${goal}` as ProfileType;
}
