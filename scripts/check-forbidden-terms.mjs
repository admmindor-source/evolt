#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const ROOTS = ['src', 'supabase/migrations', 'public'];
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist', 'build', 'tests', 'scripts']);
const EXTS = new Set(['.ts', '.tsx', '.md', '.sql', '.json', '.webmanifest']);

// Load canonical list. Use TS file via dynamic regex parse (avoid TS toolchain in this script).
function loadTerms() {
  const src = readFileSync(join(ROOT, 'src/lib/language/forbidden-terms.ts'), 'utf8');

  function extractArray(name) {
    const re = new RegExp(`${name}\\s*:\\s*readonly\\s+string\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s+const`);
    const m = re.exec(src);
    if (!m) return [];
    return [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => (x[1] ?? x[2]).toLowerCase());
  }

  return {
    terms: extractArray('FORBIDDEN_TERMS'),
    phrases: extractArray('FORBIDDEN_PHRASES'),
    whitelist: extractArray('FORBIDDEN_TERMS_WHITELIST'),
  };
}

const { terms, phrases, whitelist } = loadTerms();
if (terms.length === 0) {
  console.error('Could not parse FORBIDDEN_TERMS list from src/lib/language/forbidden-terms.ts');
  process.exit(2);
}
const whitelistSet = new Set(whitelist);

// Word-boundary match — terms are tokens. Build single regex (case-insensitive).
const tokenAlt = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const tokenRe = new RegExp(`\\b(${tokenAlt})\\b`, 'i');
const phraseRes = phrases.map((p) => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

const violations = [];

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      walk(full);
    } else {
      const rel = relative(ROOT, full).split(sep).join('/');
      if (whitelistSet.has(rel)) continue;
      const dot = entry.lastIndexOf('.');
      const ext = dot >= 0 ? entry.slice(dot) : '';
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
    if (tokenRe.test(line)) {
      const m = line.match(tokenRe);
      violations.push(`${relPath}:${i + 1}: term="${m?.[1]}": ${line.trim()}`);
    }
    for (const re of phraseRes) {
      if (re.test(line)) {
        violations.push(`${relPath}:${i + 1}: phrase: ${line.trim()}`);
      }
    }
  }
}

for (const root of ROOTS) walk(join(ROOT, root));

if (violations.length > 0) {
  console.error('Forbidden clinical/medical language detected (SEC-04 violation):');
  for (const v of violations) console.error('  ' + v);
  console.error('Rephrase using non-clinical wording (e.g. "rotina", "orientacao", "suporte").');
  process.exit(1);
}
console.log(`OK: no forbidden terms found (scanned ${terms.length} terms + ${phrases.length} phrases).`);
