export type ProfileType =
  | 'iniciante-emagrecimento'
  | 'iniciante-hipertrofia'
  | 'intermediario-emagrecimento'
  | 'intermediario-hipertrofia'
  | 'avancado-emagrecimento'
  | 'avancado-hipertrofia'
  | 'saude-geral'
  | 'qualidade-sono';

export type ClassifyInput = {
  goal: 'emagrecimento' | 'hipertrofia' | 'saude_geral' | 'qualidade_sono';
  training_level: 'iniciante' | 'intermediario' | 'avancado';
  days_per_week: number;
  age: number;
};

export function classifyProfile(input: ClassifyInput): ProfileType {
  const { goal, training_level } = input;

  if (goal === 'saude_geral') return 'saude-geral';
  if (goal === 'qualidade_sono') return 'qualidade-sono';

  return `${training_level}-${goal}` as ProfileType;
}
