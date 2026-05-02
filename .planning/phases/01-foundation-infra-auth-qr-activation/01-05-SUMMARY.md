---
phase: 01-foundation-infra-auth-qr-activation
plan: "05"
subsystem: security-guardrails
tags: [security, pii, logging, static-analysis, husky, pre-commit, sec-03, sec-04]
dependency_graph:
  requires: [01-01, 01-02, 01-03, 01-04]
  provides: [logger-pii-redaction, forbidden-terms-list, lint-pii-script, lint-forbidden-terms-script, husky-pre-commit]
  affects: [all-future-plans-that-log, all-future-plans-with-user-copy]
tech_stack:
  added: [husky@9.1.7]
  patterns: [recursive-pii-redaction, static-analysis-mjs, husky-posix-sh]
key_files:
  created:
    - src/lib/logger.ts
    - src/lib/language/forbidden-terms.ts
    - scripts/check-pii-logs.mjs
    - scripts/check-forbidden-terms.mjs
    - .husky/pre-commit
    - tests/unit/logger.test.ts
    - tests/unit/forbidden-terms-list.test.ts
    - tests/unit/lint-scripts.test.ts
  modified:
    - package.json (added prepare=husky; lint scripts were already present)
decisions:
  - Logger uses process.stdout/stderr (not console.*) to avoid self-detection by check-pii-logs.mjs
  - FORBIDDEN_TERMS_WHITELIST exported with 'as const' to enable regex parsing by check-forbidden-terms.mjs
  - lint-scripts.test.ts added to FORBIDDEN_TERMS_WHITELIST (test file legitimately references clinical terms)
  - check-forbidden-terms.mjs excludes tests/ dir via EXCLUDE_DIRS (belt+suspenders alongside whitelist)
metrics:
  duration: "~15 minutes"
  completed: "2026-05-02"
  tasks_completed: 3
  files_created: 8
---

# Phase 01 Plan 05: Security Guardrails (Logger + Forbidden Terms + Husky) Summary

SEC-03 logger with recursive PII redaction and SEC-04 static analysis scripts blocking clinical language, enforced at pre-commit via Husky.

## What Was Built

**Task 1 — Logger + Forbidden Terms + Unit Tests**

- `src/lib/logger.ts`: Wraps all log output through `redact()` before emitting to stdout/stderr as JSON lines. Uses `process.stdout/stderr.write` (not `console.*`) to avoid false positives in the PII lint script.
- `src/lib/language/forbidden-terms.ts`: Canonical list — **33 clinical terms** + **3 forbidden phrases** + **4 whitelisted files**. Single source of truth consumed by both the lint script and unit tests.
- 26 unit tests passing: 7 `redact()` tests, 2 logger output tests (stdout/stderr routing), 15 `FORBIDDEN_TERMS` completeness tests + 2 meta tests.

**Task 2 — Static Analysis Scripts + Husky**

- `scripts/check-pii-logs.mjs`: Scans `src/**/*.{ts,tsx,mjs,js}` for `console.(log|info|warn|error|debug)` calls whose arguments reference PII identifiers (`email`, `e_mail`, `whatsapp`, `phone`, `telefone`, `password`, `senha`, `access_token`, `refresh_token`). Excludes `tests/`, `scripts/`, and `src/lib/logger.ts` itself.
- `scripts/check-forbidden-terms.mjs`: Reads `FORBIDDEN_TERMS` and `FORBIDDEN_PHRASES` from `forbidden-terms.ts` via regex parsing (no TS compilation). Scans `src/**/*.{ts,tsx,md}` + `supabase/migrations/*.sql` + `public/`. Respects `FORBIDDEN_TERMS_WHITELIST`.
- `.husky/pre-commit`: POSIX sh hook running `lint:pii` + `lint:forbidden-terms` + `lint:hover-rules` in sequence; exits 1 on first failure.
- Husky confirmed working: both commits in this plan triggered the hook successfully.

**Task 3 — Negative Tests for Lint Scripts**

- `tests/unit/lint-scripts.test.ts`: 7 tests proving scripts detect real violations:
  - `check-pii-logs`: clean codebase → exits 0; `email` in console.log → exits 1; `whatsapp` in console.error → exits 1
  - `check-forbidden-terms`: clean → exits 0; "tratamento" in TSX → exits 1; "diagnostico" in SQL → exits 1; whitelist respected (no false positive on the list file itself)

## Canonical Forbidden Terms List

**33 single-token terms** (all lowercase, no spaces, length ≥ 3):

tratamento, tratar, cura, curar, curado, curada, diagnostico, diagnosticar, diagnosticado, prescricao, prescrever, prescrito, prescrita, terapeutico, terapeutica, clinico, clinica, clinicamente, remedio, medicamento, medicamentoso, farmaco, sintoma, sintomas, doenca, doente, paciente, enfermidade, patologia, sindrome, medico, medica, farmaceutico

**3 phrases** (substring match): dose terapeutica, efeito colateral, contraindicacao

**Inclusions decision:** All terms are unambiguous clinical/medical language that has no legitimate use in user-facing copy of a supplement/wellness app. Terms like `medico` and `clinica` were included because they always imply medical claims in Brazilian Portuguese UI context.

## PII_KEYS in Logger

```
email, e_mail, whatsapp, phone, telefone, password, senha, token, access_token, refresh_token, authorization
```

`redact()` is case-insensitive: `Email`, `EMAIL`, `e_mail` all match.

## How to Add New Terms

1. Edit `src/lib/language/forbidden-terms.ts` — add to `FORBIDDEN_TERMS` array (lowercase, no spaces)
2. Run `npm run lint:forbidden-terms` — confirm existing codebase is still clean
3. Run `npx vitest run tests/unit/forbidden-terms-list.test.ts` — add to `required` array in test if it should be mandatory
4. Commit (Husky will validate automatically)

## How to Add Exceptions (Whitelist)

1. Add the file path (forward-slash, relative to repo root) to `FORBIDDEN_TERMS_WHITELIST` in `forbidden-terms.ts`
2. Document WHY in the commit message (regulatory/technical reason)
3. Example: `tests/unit/lint-scripts.test.ts` is whitelisted because it legitimately references terms to test that the scanner works

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint:pii` | exit 0 |
| `npm run lint:forbidden-terms` | exit 0 |
| `npm run lint:hover-rules` | exit 0 |
| `npm run lint:all` | exit 0 |
| Unit tests (logger + forbidden-terms + lint-scripts) | 33/33 passing |
| Husky pre-commit hook | Active (triggered on both commits in this plan) |

## Violations Found in Prior Plans' Code

None. Codebase from plans 01-01 through 01-04 had zero `console.*` calls in `src/` and zero clinical terms in user-facing copy. The auth flow (signup, login, callback) was already designed without PII-leaking logs.

## Post-Deploy Checklist Note

**PROD Supabase config:** `mailer_autoconfirm` was set to `true` for dev/E2E testing (noted in STATE.md decisions). Before production launch, set `enable_confirmations = true` (i.e., disable auto-confirmation) in the Supabase project Auth settings so users must verify their email. This is a manual Supabase dashboard step, not a code change.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FORBIDDEN_TERMS_WHITELIST missing 'as const'**
- **Found during:** Task 2 verification — `npm run lint:forbidden-terms` exited 1 on the whitelist file itself
- **Issue:** The `FORBIDDEN_TERMS_WHITELIST` array was written without `as const` suffix; the regex parser in `check-forbidden-terms.mjs` requires `] as const` to match the array. The parser returned an empty whitelist, so the whitelist file was being scanned and found violations.
- **Fix:** Added `as const` to the `FORBIDDEN_TERMS_WHITELIST` declaration in `forbidden-terms.ts`
- **Files modified:** `src/lib/language/forbidden-terms.ts`
- **Commit:** d52a4bb (included with Task 2)

**2. [Rule 2 - Missing critical functionality] lint-scripts.test.ts added to FORBIDDEN_TERMS_WHITELIST**
- **Found during:** Task 3 planning — test file must reference clinical terms to test violations
- **Issue:** `tests/unit/lint-scripts.test.ts` writes strings like `"tratamento"` to temp files; if not whitelisted, the scan of the test file itself would fail
- **Fix:** Added `tests/unit/lint-scripts.test.ts` to `FORBIDDEN_TERMS_WHITELIST` (and `EXCLUDE_DIRS` already excludes `tests/` from the forbidden-terms scan)
- **Note:** The `tests/` directory is excluded via `EXCLUDE_DIRS` in `check-forbidden-terms.mjs` so the whitelist entry is belt-and-suspenders; confirmed no false positives

## Self-Check: PASSED

Files created:
- FOUND: src/lib/logger.ts
- FOUND: src/lib/language/forbidden-terms.ts
- FOUND: scripts/check-pii-logs.mjs
- FOUND: scripts/check-forbidden-terms.mjs
- FOUND: .husky/pre-commit
- FOUND: tests/unit/logger.test.ts
- FOUND: tests/unit/forbidden-terms-list.test.ts
- FOUND: tests/unit/lint-scripts.test.ts

Commits verified:
- ad96571: feat(01-05): logger with PII redaction + forbidden-terms canonical list + unit tests
- d52a4bb: feat(01-05): static analysis scripts + Husky pre-commit hook (SEC-03, SEC-04)
- 3171eda: test(01-05): negative tests proving lint scripts catch real violations
