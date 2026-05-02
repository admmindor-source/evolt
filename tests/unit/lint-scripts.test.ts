import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function setupFakeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'evolt-lint-'));
  // Mirror minimal structure the scripts walk.
  mkdirSync(join(dir, 'src/lib/language'), { recursive: true });
  mkdirSync(join(dir, 'src/app'), { recursive: true });
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  // Copy real forbidden-terms list so the script can parse it.
  cpSync(join(process.cwd(), 'src/lib/language/forbidden-terms.ts'), join(dir, 'src/lib/language/forbidden-terms.ts'));
  // Copy the scripts under test.
  cpSync(join(process.cwd(), 'scripts/check-pii-logs.mjs'), join(dir, 'scripts/check-pii-logs.mjs'));
  cpSync(join(process.cwd(), 'scripts/check-forbidden-terms.mjs'), join(dir, 'scripts/check-forbidden-terms.mjs'));
  return dir;
}

function runScript(cwd: string, scriptRel: string): { code: number; stdout: string; stderr: string } {
  const res = spawnSync(process.execPath, [scriptRel], { cwd, encoding: 'utf8' });
  return { code: res.status ?? 0, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
}

describe('check-pii-logs.mjs (SEC-03 enforcement)', () => {
  it('exits 0 on clean codebase', () => {
    const dir = setupFakeRepo();
    try {
      writeFileSync(join(dir, 'src/app/clean.ts'), `export const x = 1;\n// no console here\n`);
      const r = runScript(dir, 'scripts/check-pii-logs.mjs');
      expect(r.code).toBe(0);
      expect(r.stdout).toContain('OK');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('exits 1 when console.log references email', () => {
    const dir = setupFakeRepo();
    try {
      writeFileSync(join(dir, 'src/app/bad.ts'), `console.log("user", { email: 'a@b.com' });\n`);
      const r = runScript(dir, 'scripts/check-pii-logs.mjs');
      expect(r.code).toBe(1);
      expect(r.stderr).toMatch(/PII in logs detected/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('exits 1 when console.error references whatsapp', () => {
    const dir = setupFakeRepo();
    try {
      writeFileSync(join(dir, 'src/app/bad2.ts'), `console.error('boom', userObj.whatsapp);\n`);
      const r = runScript(dir, 'scripts/check-pii-logs.mjs');
      expect(r.code).toBe(1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('check-forbidden-terms.mjs (SEC-04 enforcement)', () => {
  it('exits 0 on clean codebase', () => {
    const dir = setupFakeRepo();
    try {
      writeFileSync(join(dir, 'src/app/clean.tsx'), `export default function P(){ return <p>Bem-vindo a EVOLT</p>; }\n`);
      const r = runScript(dir, 'scripts/check-forbidden-terms.mjs');
      expect(r.code).toBe(0);
      expect(r.stdout).toContain('OK');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('exits 1 when copy contains "tratamento"', () => {
    const dir = setupFakeRepo();
    try {
      writeFileSync(join(dir, 'src/app/bad.tsx'), `export default function P(){ return <p>Indicado para tratamento de dor</p>; }\n`);
      const r = runScript(dir, 'scripts/check-forbidden-terms.mjs');
      expect(r.code).toBe(1);
      expect(r.stderr).toMatch(/Forbidden clinical/i);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('exits 1 when migration file contains "diagnostico"', () => {
    const dir = setupFakeRepo();
    try {
      mkdirSync(join(dir, 'supabase/migrations'), { recursive: true });
      writeFileSync(join(dir, 'supabase/migrations/x.sql'), `-- coluna diagnostico\ncreate table foo();`);
      const r = runScript(dir, 'scripts/check-forbidden-terms.mjs');
      expect(r.code).toBe(1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('whitelisted file (the list itself) is ignored', () => {
    const dir = setupFakeRepo();
    try {
      // The forbidden-terms.ts file IS in the whitelist — no violation expected even though it contains all terms.
      const r = runScript(dir, 'scripts/check-forbidden-terms.mjs');
      expect(r.code).toBe(0);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
