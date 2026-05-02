# ROADMAP: EVOLT APP

**Created:** 2026-05-01
**Granularity:** Standard (5 phases)
**Total v1 Requirements:** 59
**Coverage:** 59/59 mapped (100%)

## Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Foundation: Infra, Auth & QR Activation | Usuário escaneia QR Code do produto, cria conta segura e fica autenticado com SKU registrado; base mobile-first + PWA configurada | ACT-01, ACT-02, ACT-03, ACT-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, MOB-01, MOB-02, MOB-03, MOB-04, MOB-05, SEC-01, SEC-02, SEC-03, SEC-04 | In Progress (2/5 plans) |
| 2 | Onboarding & Profile Classification | Usuário completa onboarding rápido, é classificado em perfil e vê resumo + rotina inicial sem tela vazia; tela de perfil editável disponível | ONB-01, ONB-02, ONB-03, ONB-04, ONB-05, ONB-06, PROF-01, PROF-02, PROF-03 | Pending |
| 3 | Home "Seu dia hoje" + Routine & Checklist | Usuário abre o app e sabe exatamente o que fazer hoje, marca itens do checklist e vê detalhe de cada bloco | HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07, HOME-08, ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, ROUT-06 | Pending |
| 4 | Progress Tracking + Catalog + Recommendation Engine | Usuário registra evolução (peso/fotos), navega pelo catálogo de produtos e recebe recomendações contextuais via rule engine declarativo | PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, LOJA-01, LOJA-02, REC-01, REC-02, REC-03, REC-04, REC-05, REC-06 | Pending |
| 5 | Analytics & Admin Panel | Sistema registra eventos de jornada e admin visualiza funil, ativações por SKU e interações com recomendações | ANL-01, ANL-02, ANL-03, ANL-04, ANL-05, ANL-06, ADM-01, ADM-02, ADM-03, ADM-04, ADM-05 | Pending |

---

## Phase 1: Foundation: Infra, Auth & QR Activation

**Goal:** Usuário escaneia o QR Code da embalagem EVOLT, cria uma conta segura e entra autenticado no app com seu SKU de origem registrado, pronto para o onboarding.
**UI hint:** yes
**Requirements:** ACT-01, ACT-02, ACT-03, ACT-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, MOB-01, MOB-02, MOB-03, MOB-04, MOB-05, SEC-01, SEC-02, SEC-03, SEC-04

### Success Criteria

1. Usuário acessa o app via QR Code da embalagem (com token contendo SKU + campanha) e o sistema captura esses parâmetros mesmo antes do login.
2. Usuário consegue inserir código manualmente como fallback caso o scan falhe.
3. Usuário cria conta com nome, e-mail e WhatsApp, faz login com e-mail/senha, mantém sessão entre visitas e consegue fazer logout.
4. Cada usuário acessa apenas seus próprios dados (RLS ativo no Supabase) e fotos de progresso ficam em bucket privado.
5. App não expõe e-mail/WhatsApp em logs e a linguagem do produto não usa termos médicos ou clínicos.
6. Todas as telas renderizam corretamente em viewport 360–430px; todos os elementos interativos têm touch target ≥44×44px; manifest.json está configurado para instalação como PWA.

### Phase Scope

Provisionamento de infra (Next.js + Supabase + Vercel), schema inicial do Postgres com tabelas core (users, products, product_activations), políticas RLS, bucket Storage privado, fluxo de QR scan (deep link com token), parser de SKU/campanha, fluxo de cadastro/login/logout via Supabase Auth, persistência de sessão, guardrails de privacidade/linguagem desde o dia 1, configuração mobile-first no Tailwind (breakpoints, touch targets, viewport meta), manifest.json e ícones para PWA. Esta fase entrega a porta de entrada autenticada com rastreamento de origem e base mobile-first consolidada.
### Plans

**Plans:** 5 plans (3 waves)

- [x] 01-01-PLAN.md (wave 1) — Bootstrap Next 16 + Supabase clients + Tailwind v4 mobile-first + manifest PWA + test harness (MOB-01..05) **[COMPLETE]**
- [x] 01-02-PLAN.md (wave 1) — Supabase migrations: schema (products, user_profiles, product_activations) + RLS policies + private Storage bucket + 6 SKUs seed + db push (SEC-01, SEC-02) **[COMPLETE — 4 migrations aplicadas, 8 testes passando]**
- [ ] 01-03-PLAN.md (wave 2) — QR landing /p/[sku] + manual code /ativar + pending cookie HTTP-only + UI primitives Button/Input/Card (ACT-01..04)
- [ ] 01-04-PLAN.md (wave 2) — Signup + Login + Logout via Server Actions + materializeActivation + email callback + open-redirect prevention (AUTH-01..04, ACT-02)
- [ ] 01-05-PLAN.md (wave 3) — Logger redaction + forbidden-terms list + check-pii-logs + check-forbidden-terms scripts + Husky pre-commit (SEC-03, SEC-04)


---

## Phase 2: Onboarding & Profile Classification

**Goal:** Usuário recém-cadastrado completa um onboarding curto, é classificado em um perfil inicial e cai imediatamente em uma tela com resumo + rotina do dia + primeiras recomendações — sem nunca ver estado vazio. Tela de perfil editável disponível desde o início.
**UI hint:** yes
**Requirements:** ONB-01, ONB-02, ONB-03, ONB-04, ONB-05, ONB-06, PROF-01, PROF-02, PROF-03

### Success Criteria

1. Usuário informa idade, sexo, peso (kg), altura (cm), objetivo, nível de treino, dias/semana, minutos/dia e suplementos atuais em fluxo guiado.
2. SKU comprado é vinculado ao perfil no início da jornada (sem precisar informar de novo).
3. Sistema classifica o usuário em um perfil inicial (ex.: "iniciante emagrecimento", "hipertrofia intermediário", "saúde geral") com base nos dados do onboarding.
4. Ao concluir o onboarding, usuário vê uma tela com resumo do perfil, rotina inicial do dia e primeiras recomendações (zero tela vazia).
5. Usuário pode acessar tela de perfil com nome, e-mail, objetivo atual, SKU e progresso geral.
6. Usuário pode atualizar peso atual e objetivo principal diretamente na tela de perfil.
7. Tela de perfil oferece acesso a configurações básicas (ajuda, sobre o app) e botão de logout.

### Phase Scope

Telas de onboarding multi-step (objetivo, dados físicos, contexto de treino, suplementos atuais), persistência em user_profiles, vinculação ao product_activation criado na Fase 1, lógica de classificação determinística por regras (objetivo + nível + dias + idade), geração imediata da primeira daily_routine + primeiras recommendations para evitar estado vazio pós-cadastro. Tela de perfil editável com campos de peso e objetivo, acesso a configurações e logout.

---

## Phase 3: Home "Seu dia hoje" + Routine & Checklist

**Goal:** Usuário abre o app e em uma única tela sabe exatamente o que precisa fazer hoje (suplementação, treino, alimentação, hidratação), marca itens conforme conclui e pode aprofundar em cada bloco.
**UI hint:** yes
**Requirements:** HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07, HOME-08, ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, ROUT-06

### Success Criteria

1. Home exibe nome do usuário, objetivo, SKU comprado, dia da jornada e os blocos: suplemento do dia, treino do dia, orientação alimentar, meta de hidratação, progresso recente e até 4 recomendações contextuais.
2. Checklist marcável aparece visível na home cobrindo suplementação, treino, alimentação e hidratação — usuário marca itens individualmente e o estado persiste após reload.
3. Sistema aceita conclusão parcial (não exige completar tudo para o dia ser válido).
4. Usuário pode abrir detalhe completo do suplemento do dia (como usar, benefícios, dica) e do treino do dia (exercícios, séries, reps).

### Phase Scope

Tela principal "Seu dia hoje" em dark mode + acento laranja, geração diária da daily_routine baseada no perfil + SKU + dia da jornada, motor simples de templates de treino por objetivo/nível, persistência de routine_items com estado de conclusão, telas de detalhe de suplemento e treino, integração com bloco de progresso recente (placeholder até Fase 4) e bloco de recomendações (placeholder até Fase 4 — versão final na próxima fase).

---

## Phase 4: Progress Tracking + Catalog + Recommendation Engine

**Goal:** Usuário registra sua evolução (peso e fotos privadas), visualiza histórico/comparativo, navega pelo catálogo de produtos EVOLT e recebe recomendações contextualizadas geradas por um rule engine declarativo que respeita as regras de negócio de cada SKU.
**UI hint:** yes
**Requirements:** PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, LOJA-01, LOJA-02, REC-01, REC-02, REC-03, REC-04, REC-05, REC-06

### Success Criteria

1. Usuário registra peso com data/hora e adiciona fotos de progresso (armazenadas em bucket privado com URLs protegidas).
2. Usuário visualiza histórico de peso em gráfico simples com tendência e compara fotos antes/depois lado a lado.
3. Quando não há registros, a home incentiva o primeiro registro (sem mostrar bloco vazio).
4. Tela de catálogo exibe os 6 SKUs EVOLT com nome, foto, descrição curta e preço; cada produto tem botão que redireciona ao site EVOLT para compra.
5. Recomendações são geradas por rule engine declarativo (SKU comprado × objetivo × sinais de perfil), exibem reason_text contextual, respeitam o limite de 4 por tela e seguem regras-chave: pré-treino não é prioritário para quem não treina; articulações só aparece com contexto (dor, sobrepeso, impacto, idade).
6. Sistema registra impressão (recommendation_shown) e clique (recommendation_clicked) em cada recomendação exibida.

### Phase Scope

Tela de evolução (peso + fotos), upload com signed URLs no Supabase Storage, gráfico de tendência simples, comparador antes/depois, tela de catálogo (Loja) com os 6 SKUs + links externos para o site EVOLT, tabela rules + recommendations, implementação do rule engine declarativo (SKU × objetivo × sinais), reason_text por regra, integração da geração de recomendações com a home da Fase 3 (substitui o placeholder), e os dois primeiros eventos de analytics ligados a recomendações (shown/clicked) — eventos completos vêm na Fase 5.

---

## Phase 5: Analytics & Admin Panel

**Goal:** Toda jornada do usuário emite eventos rastreáveis e o admin tem um painel autenticado para acompanhar funil, ativações por SKU, taxa de onboarding e interação com recomendações.
**UI hint:** yes
**Requirements:** ANL-01, ANL-02, ANL-03, ANL-04, ANL-05, ANL-06, ADM-01, ADM-02, ADM-03, ADM-04, ADM-05

### Success Criteria

1. Sistema registra eventos completos da jornada: qr_scanned, signup_started, signup_completed, onboarding_completed, home_viewed, checklist_item_completed, daily_checklist_completed e progress_logged (peso ou foto).
2. Admin acessa uma área autenticada separada do fluxo do usuário final.
3. Admin vê lista de usuários filtrável por SKU de entrada, objetivo e período de ativação.
4. Admin vê o funil de conversão (scans → cadastros → onboarding → ativos → com progresso) e o volume de ativações por SKU.
5. Admin vê a taxa de clique em recomendações segmentada por SKU/objetivo.

### Phase Scope

Tabela engagement_events e instrumentação dos eventos restantes nos pontos da jornada (Fase 1-4), dashboard admin separado (rota /admin com role check), telas de listagem/filtragem de usuários, queries agregadas para funil e ativações por SKU, métricas de recomendação (CTR por SKU/objetivo) consumindo os eventos shown/clicked já registrados na Fase 4. Esta fase fecha o loop de validação do MVP, dando visibilidade completa do produto.

---

*Roadmap created: 2026-05-01 from Master Blueprint EVOLT v1*
