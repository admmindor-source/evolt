#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SRC = ['src'];
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist', 'build', 'tests', 'scripts']);
const EXCLUDE_FILES = new Set([
  'src/lib/logger.ts',           // logger itself references PII_KEYS
]);
const EXTS = new Set(['.ts', '.tsx', '.mjs', '.js']);

// Match: console.<level>(...args...) where any arg textually references a PII identifier.
// PII identifiers: email, e_mail, whatsapp, phone, telefone, password, senha, token (NOT just any "token" — restrict to access_token / refresh_token to avoid false positives on UI tokens)
const PII_IDENT = /\b(email|e_mail|whatsapp|phone|telefone|password|senha|access_token|refresh_token)\b/i;
const CONSOLE_CALL = /console\.(log|info|warn|error|debug)\s*\(([^;]*?)\)/g;

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      walk(full);
    } else {
      const rel = relative(ROOT, full).split(sep).join('/');
      if (EXCLUDE_FILES.has(rel)) continue;
      const ext = '.' + entry.split('.').pop();
      if (!EXTS.has(ext)) continue;
      check(full, rel);
    }
  }
}

function check(absPath, relPath) {
  const content = readFileSync(absPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const reg = new RegExp(CONSOLE_CALL.source, 'g');
    let m;
    while ((m = reg.exec(line)) !== null) {
      const args = m[2];
      if (PII_IDENT.test(args)) {
        violations.push(`${relPath}:${i + 1}: ${line.trim()}`);
      }
    }
  }
}

for (const root of SRC) {
  try { walk(join(ROOT, root)); } catch (e) { /* dir missing — ignore */ }
}

if (violations.length > 0) {
  console.error('PII in logs detected (SEC-03 violation):');
  for (const v of violations) console.error('  ' + v);
  console.error('Use logger.info/warn/error from @/lib/logger instead — it redacts PII automatically.');
  process.exit(1);
}
console.log('OK: no PII references found in console.* calls.');
