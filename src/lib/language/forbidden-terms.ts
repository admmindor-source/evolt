// Canonical list of forbidden clinical/medical terms (SEC-04).
// Lowercase, no accents preferred but accents allowed where natural.
// Single tokens only — bigrams handled by `compoundForbiddenPhrases` if needed later.
export const FORBIDDEN_TERMS: readonly string[] = [
  'tratamento',
  'tratar',
  'cura',
  'curar',
  'curado',
  'curada',
  'diagnostico',
  'diagnosticar',
  'diagnosticado',
  'prescricao',
  'prescrever',
  'prescrito',
  'prescrita',
  'terapeutico',
  'terapeutica',
  'clinico',
  'clinica',
  'clinicamente',
  'remedio',
  'medicamento',
  'medicamentoso',
  'farmaco',
  'sintoma',
  'sintomas',
  'doenca',
  'doente',
  'paciente',
  'enfermidade',
  'patologia',
  'sindrome',
  'medico',
  'medica',
  'farmaceutico',
] as const;

// Multi-word phrases handled separately (substring match).
export const FORBIDDEN_PHRASES: readonly string[] = [
  'dose terapeutica',
  'efeito colateral',
  'contraindicacao',
] as const;

// Whitelist of files that legitimately reference these terms (e.g. the list itself, the
// script that scans, this file's tests, and the threat model in the README).
export const FORBIDDEN_TERMS_WHITELIST: readonly string[] = [
  'src/lib/language/forbidden-terms.ts',
  'scripts/check-forbidden-terms.mjs',
  'tests/unit/forbidden-terms-list.test.ts',
  'tests/unit/lint-scripts.test.ts',
];
