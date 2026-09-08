# GATEVIA V1 Contract Baseline — Single Source of Truth (SSOT)

This repository-local `gatevia-docs/` directory is the **authoritative Single Source of Truth (SSOT)** for the GATEVIA V1 platform, governing all requirements, core business contracts, technical architectures, acceptance criteria, deployment guidelines, and implementation prompts.

---

## 1. Canonical Governance Principles

1. **Self-Contained & Authoritative**: All architectural specifications, functional/non-functional requirements, data schemas, API contracts, and implementation prompts are canonically contained in this directory.
2. **Direction of Synchronization**: Any external distribution archive, review pack, or backup must be generated **from** this directory. External archives are historical snapshots and must **never** overwrite repository-local contracts.
3. **Master Prompt Integration**: `GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md` is housed directly inside `gatevia-docs/` as the canonical master prompt. An exact synchronized mirror is also preserved at the repository root (`/GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md`) for developer convenience and tooling shortcuts.

---

## 2. Document Inventory (29 Canonical Files)

### Root Governance & Prompt (2 files)
- [`README.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/README.md) — Contract baseline, governance rules, and complete index (this document).
- [`GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md) — End-to-end master implementation prompt locking the stack, execution stages, and architectural contracts.

### Category 1: Requirements (`1-requirements/` — 4 files)
- [`00_GATEVIA_PROJECT_OVERVIEW_DRAFT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/1-requirements/00_GATEVIA_PROJECT_OVERVIEW_DRAFT.md) — Strategic vision, corporate positioning, target audiences, and primary service pillars.
- [`01_GATEVIA_FUNCTIONAL_REQUIREMENTS_DRAFT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/1-requirements/01_GATEVIA_FUNCTIONAL_REQUIREMENTS_DRAFT.md) — Functional specifications across CMS, lead intake, multilingual routing, and role-based administration.
- [`02_GATEVIA_NON_FUNCTIONAL_REQUIREMENTS_DRAFT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/1-requirements/02_GATEVIA_NON_FUNCTIONAL_REQUIREMENTS_DRAFT.md) — Performance, security, accessibility, zero-flash dual-theme requirements (NFR-THEME-001/002/003).
- [`README.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/1-requirements/README.md) — Requirements pack review index.

### Category 2: Core Domain Specifications (`2-core/` — 11 files)
- [`04_SCOPE_AND_BOUNDARIES.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/04_SCOPE_AND_BOUNDARIES.md) — Scope definition, V1 inclusions, out-of-scope boundaries, and deferred V2 features.
- [`05_SITEMAP_INFORMATION_ARCHITECTURE.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/05_SITEMAP_INFORMATION_ARCHITECTURE.md) — Complete 24-route public hierarchy, taxonomy, and URL structure.
- [`06_CONTENT_STRATEGY_PAGE_TEMPLATES.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/06_CONTENT_STRATEGY_PAGE_TEMPLATES.md) — Section-level page templates, block schemas, and collection relationships.
- [`07_TRUST_ECOSYSTEM_SPEC.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/07_TRUST_ECOSYSTEM_SPEC.md) — Trust badges, partner networks, client logos, case studies, and brand portfolio models.
- [`08_MULTILINGUAL_I18N_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/08_MULTILINGUAL_I18N_CONTRACT.md) — Dynamic language architecture, RTL/LTR bi-directional UI, fallback logic, and locale routing.
- [`09_MEDIA_LIBRARY_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/09_MEDIA_LIBRARY_CONTRACT.md) — S3/R2 direct uploads, asynchronous Sharp transformations, variants, and archival integrity rules.
- [`10_CMS_CONTENT_MODEL.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/10_CMS_CONTENT_MODEL.md) — Relational schema definitions for polymorphic content, pages, services, and taxonomies.
- [`11_LEADS_CRM_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/11_LEADS_CRM_CONTRACT.md) — Lead capture, multi-step assessment schemas, idempotency deduplication, and CRM lifecycle events.
- [`12_ADMIN_PANEL_SPEC.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/12_ADMIN_PANEL_SPEC.md) — Admin UI specification, layout shells, permission-scoped navigation, and editors.
- [`13_BRAND_DESIGN_SYSTEM.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/13_BRAND_DESIGN_SYSTEM.md) — Dual-theme design system (Light Mode + Dark Mode), semantic color tokens, typography, and motion standards.
- [`README.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/2-core/README.md) — Core spec pack review index.

### Category 3: Technical Implementation Contracts (`3-technical/` — 12 files)
- [`14_TECHNICAL_ARCHITECTURE.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/14_TECHNICAL_ARCHITECTURE.md) — Monorepo topology, Next.js web/admin apps, NestJS API, BullMQ worker, and shared packages.
- [`15_DATABASE_SCHEMA_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/15_DATABASE_SCHEMA_CONTRACT.md) — PostgreSQL Prisma schema rules, naming conventions, indexes, constraints, and audit trails.
- [`16_API_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/16_API_CONTRACT.md) — RESTful endpoint conventions, DTO contracts, validation pipes, and error response envelopes.
- [`17_FRONTEND_IMPLEMENTATION_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/17_FRONTEND_IMPLEMENTATION_CONTRACT.md) — Tailwind CSS tokenized themes, SSR hydration safety, responsive design, and `@gatevia/ui` component specs.
- [`18_SECURITY_PRIVACY_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/18_SECURITY_PRIVACY_CONTRACT.md) — Cookie security, CSRF protection, RBAC guards, rate limiting, and PDPL compliance.
- [`19_INFRASTRUCTURE_DEPLOYMENT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/19_INFRASTRUCTURE_DEPLOYMENT.md) — Coolify/Docker production orchestration, Redis queues, R2 storage, environment configurations, and cookie domain topology.
- [`20_SEED_INITIAL_DATA_CONTRACT.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/20_SEED_INITIAL_DATA_CONTRACT.md) — Deterministic database seeding for languages, default admin users, roles, settings, and baseline content.
- [`21_TESTING_ACCEPTANCE_PLAN.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/21_TESTING_ACCEPTANCE_PLAN.md) — Comprehensive test strategy: Unit, Integration, E2E (Playwright), Theme contrast, and Accessibility.
- [`22_IMPLEMENTATION_ROADMAP.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/22_IMPLEMENTATION_ROADMAP.md) — Execution waves (W0–W11) from setup to final production sealing.
- [`23_AGENT_EXECUTION_RULES.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/23_AGENT_EXECUTION_RULES.md) — Strict agent behavioral constraints, contract preservation rules, and execution discipline.
- [`24_DEFINITION_OF_DONE.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/24_DEFINITION_OF_DONE.md) — Definitive quality gates, release checklist, and final closure contract.
- [`README.md`](file:///c:/Users/Smart%20Academy/Desktop/Projects/GATEVIA_PROJECT/gatevia-docs/3-technical/README.md) — Technical spec pack review index.

---

## 3. Reconciliation of Legacy Comparison Audit

A prior external comparison against older distributed zip drafts noted:
- **20 identical files**
- **7 different files**
- **1 repository-only file**
- **1 external-only file**

### Root Cause & Resolution:
1. **The 7 Different Files**: The 7 modified files (`00`, `01`, `02`, `13`, `17`, `21`, `24`) in `gatevia-docs/` are the **newer, ratified specifications** that formally incorporated **Full Light Mode + Dark Mode (Dual-Theme)** requirements into brand, frontend, testing, and Definition of Done. The repository version is canonical and strictly superior to older single-mode drafts.
2. **The 1 Repository-Only File**: This was `gatevia-docs/README.md`, which serves as the central documentation index for the repository.
3. **The 1 External-Only File / Master Prompt**: `GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md` previously existed only in the external pack root and monorepo root. It is now housed directly within `gatevia-docs/GATEVIA_MASTER_IMPLEMENTATION_PROMPT.md`, unifying the entire documentation corpus under `gatevia-docs/`.

With this reconciliation, `gatevia-docs/` achieves **100% complete unification** as the single, authoritative source of truth.
