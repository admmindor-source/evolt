import { describe, it, expect } from 'vitest';
import { FORBIDDEN_TERMS, FORBIDDEN_PHRASES } from '@/lib/language/forbidden-terms';

describe('FORBIDDEN_TERMS (SEC-04)', () => {
  const required = [
    'tratamento','cura','diagnostico','prescricao',
    'terapeutico','clinico','remedio','medicamento',
    'sintoma','doenca','paciente','prescrever',
    'tratar','curar','diagnosticar',
  ];

  it.each(required)('contains required term %s', (term) => {
    expect(FORBIDDEN_TERMS).toContain(term);
  });

  it('all entries are lowercase, length >= 3, no spaces', () => {
    for (const t of FORBIDDEN_TERMS) {
      expect(t).toBe(t.toLowerCase());
      expect(t.length).toBeGreaterThanOrEqual(3);
      expect(t).not.toMatch(/\s/);
    }
  });

  it('phrases are also lowercase', () => {
    for (const p of FORBIDDEN_PHRASES) {
      expect(p).toBe(p.toLowerCase());
    }
  });
});
