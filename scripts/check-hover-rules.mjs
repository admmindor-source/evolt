import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src'];
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (['.css', '.scss', '.tsx', '.ts'].includes(extname(full))) check(full);
  }
}

function check(file) {
  const content = readFileSync(file, 'utf8');
  // Allow: hover: inside a className AND a global @media (hover: hover) wrapper exists in same file OR global guard
  // For MVP we just check that .css files have no bare :hover { ... } outside @media (hover: hover)
  if (!file.endsWith('.css')) return;
  const lines = content.split('\n');
  let mediaDepth = 0;
  let mediaIsHoverGuard = false;
  let braceDepth = 0;
  for (const line of lines) {
    if (/@media\s*\(hover:\s*hover\)/.test(line)) {
      mediaIsHoverGuard = true;
      mediaDepth = braceDepth + 1;
    }
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') {
        braceDepth--;
        if (braceDepth < mediaDepth) { mediaIsHoverGuard = false; mediaDepth = 0; }
      }
    }
    if (/:hover\s*\{/.test(line) && !mediaIsHoverGuard) {
      violations.push(`${file}: ${line.trim()}`);
    }
  }
}

for (const root of ROOTS) walk(root);

if (violations.length) {
  console.error('Unguarded :hover rules found (MOB-04 violation):');
  violations.forEach((v) => console.error('  ' + v));
  process.exit(1);
}
console.log('OK: no unguarded :hover rules.');
