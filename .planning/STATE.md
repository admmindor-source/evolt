# STATE: EVOLT APP

## Current Status

- **Active Phase:** Phase 1 — Foundation: Infra, Auth & QR Activation
- **Current Plan:** 01-04 COMPLETE → Next: 01-05
- **Completed Phases:** 0 of 5
- **Last Updated:** 2026-05-02

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-01)

**Core value:** O usuario abre o app e sabe exatamente o que precisa fazer hoje — com base no produto que comprou e no objetivo que quer alcançar.
**Current focus:** Plan 01-04 executed; full auth flow (signup, login, logout, callback, /home) with Server Actions + Zod + materializeActivation

## Phase Progress

| Phase | Status | Plans | Started | Completed |
|-------|--------|-------|---------|-----------|
| 1. Foundation: Infra, Auth & QR Activation | In Progress | 5 plans (3 waves) | 2026-05-02 | - |
| 2. Onboarding & Profile Classification | Not started | - | - | - |
| 3. Home "Seu dia hoje" + Routine & Checklist | Not started | - | - | - |
| 4. Progress Tracking + Catalog + Recommendation Engine | Not started | - | - | - |
| 5. Analytics & Admin Panel | Not started | - | - | - |

## Plan Progress

| Plan | Tasks | Status | Key Commits |
|------|-------|--------|-------------|
| 01-01 | 4 (T4 checkpoint approved) | COMPLETE | 5379db4, ded035c, ce16614 |
| 01-02 | 3 | COMPLETE | 91f4cb6, 3d22a51, 3e645c9 |
| 01-03 | 3 | COMPLETE | 52bfcf0, c01d701 |
| 01-04 | 3 | COMPLETE | bbcc5e8, 041b629, 6f025e5 |
| 01-05 | - | Pending | - |

## Decisions Recorded

- Serwist em vez de next-pwa (App Router compat, manutencao ativa)
- Tailwind v4 CSS-based config via @theme
- Next 16 proxy.ts com export proxy() — middleware.ts deprecated no Next 16
- sw.ts excluido do tsconfig.json (webworker types incompativeis com pipeline Next)
- Zod validate explicit via Env.parse({...}) — nao Env.parse(process.env)
- manifest purpose: 'maskable' (nao 'any maskable') — tipo TS MetadataRoute.Manifest
- manual_code como coluna em products (nao tabela separada) — WHEY01..JOINT01
- Migration history repair: 13 migrations remotas do schema anterior marcadas como reverted antes do push
- supabase gen types gera tipos do schema completo do projeto remoto (inclui outras tabelas pre-existentes)
- Server Actions para signup/login (CSRF built-in) — nao Route Handlers
- isSafeNextPath compartilhado entre loginAction e /auth/callback (fonte unica)
- Mensagens genericas em signup/login para evitar user enumeration (T-04-02)
- mailer_autoconfirm=true no remote Supabase para dev/E2E — revert para false em PROD

## Coverage Snapshot

- v1 requirements: 59 total
- Plan 01-01: MOB-01, MOB-02, MOB-03, MOB-04, MOB-05 (base config + stubs)
- Plan 01-02: SEC-01, SEC-02 (RLS + storage bucket)
- Plan 01-04: AUTH-01, AUTH-02, AUTH-03, AUTH-04, ACT-02
- Remaining: 47

## Blockers

None currently.

## Last Session

- **Timestamp:** 2026-05-02T04:35:25Z
- **Stopped At:** Plan 01-04 COMPLETE — 3 tasks done, 19 unit tests + npm build + 7 E2E tests passing
- **Resume File:** .planning/phases/01-foundation-infra-auth-qr-activation/01-05-PLAN.md

---
*State updated: 2026-05-02 after plan 01-04 execution (all tasks complete)*
