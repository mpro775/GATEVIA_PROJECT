# GATEVIA — AI Agent Execution Rules
**Document ID:** GTV-AGENT-001  
**Version:** v0.3  
**Status:** Mandatory Execution Contract

---

## 1. First Action

Before coding, agent must read all approved GATEVIA specification files.

It must not infer missing scope from generic industry patterns when the contract is explicit.

---

# 2. Source of Truth / Precedence

If documents conflict, use this precedence:

1. Explicit latest client-approved decision.
2. Scope & Boundaries.
3. Functional Requirements.
4. Non-Functional Requirements.
5. Security / i18n / Media contracts.
6. Technical Architecture.
7. Database Schema Contract.
8. API Contract.
9. Frontend Contract.
10. CMS/Admin/CRM/Design specs.
11. Roadmap.
12. Existing implementation, only if it does not conflict with higher contract.

Agent must document any detected conflict before changing behavior.

---

# 3. Locked Stack

Do not replace without explicit approval:
- Next.js.
- NestJS.
- PostgreSQL.
- Prisma.
- Redis/BullMQ.
- R2/S3.
- REST/OpenAPI.
- Docker/Coolify-compatible deployment.

No MongoDB.
No GraphQL.
No microservices.
No Kubernetes.

---

# 4. Scope Rule

Do not implement:
- Client Portal.
- payments.
- accounting.
- advanced CRM.
- AI chatbot.
- government integrations.
- mobile app.

unless a newer approved document adds them.

---

# 5. Multilingual Rule

Forbidden:
```text
title_ar
title_en
description_ar
description_en
```

Required:
- languages table.
- translation tables.
- locale-aware routes.
- RTL/LTR.
- translated SEO.
- dynamic active locale list.

---

# 6. Content Rule

Do not hardcode business content in frontend when it belongs in CMS.

Allowed hardcoded content:
- system/UI translation keys.
- technical labels/enums.
- safe empty-state system copy.

---

# 7. Trust Data Rule

Never invent:
- clients.
- partners.
- brands.
- case study results.
- certifications.
- trust metrics.
- testimonials.

Production seed must contain only approved data.

---

# 8. Media Rule

- do not store binary media in PostgreSQL.
- use R2/S3.
- use central Media Library.
- no one-off upload implementation per form.
- validate files.
- preserve usage references.

---

# 9. Database Rule

- migrations append-only after application.
- never edit a migration already applied to shared/staging/production environment.
- no `db push` as production migration strategy.
- no destructive reset.
- no drop table/column without explicit migration plan.
- add indexes and constraints.
- preserve relational integrity.

---

# 10. API Rule

- all business writes through API.
- API permission checks are authoritative.
- update OpenAPI with route changes.
- generated client must stay synchronized.
- use standard problem error responses.
- no internal stack trace leakage.

---

# 11. Security Rule

Agent may not weaken:
- auth.
- permissions.
- CSRF.
- rate limits.
- upload validation.
- CORS.
- secure cookies.

to make tests pass.

No secrets in code or docs.

---

# 12. Dependency Rule

Before adding dependency:
- confirm existing stack cannot reasonably provide capability.
- choose maintained package.
- avoid duplicate libraries for same purpose.
- document why runtime dependency is needed.

---

# 13. Frontend Rule

- Server Components default.
- client components only when needed.
- shared design system.
- no generic template overriding brand direction.
- RTL/LTR from first implementation, not later retrofit.
- accessible semantics.
- responsive behavior.

---

# 14. Admin Rule

Admin is not a raw CRUD dump.

Must include:
- usable navigation.
- filters.
- pagination.
- translation status.
- media picker.
- permission-aware actions.
- readable assessment/lead detail.

---

# 15. Test Rule

Agent must run the gates required by the current Wave.

It must not claim “complete” based only on:
```text
build passed
```

It must report exactly what was and was not tested.

---

# 16. Git Rule

Recommended:
- small coherent commits.
- no unrelated formatting sweep.
- no force push.
- no rewriting shared history.
- no committing secrets/build artifacts.
- commit message describes wave/change.

---

# 17. Formatting Rule

Do not reformat unrelated files.

Run:
- formatter on changed files/project.
- lint.
- typecheck.

---

# 18. Production Safety

Agent must never:
- run destructive seed in production.
- reset production DB.
- delete R2 bucket.
- rotate secrets without instruction.
- change DNS without instruction.
- send test emails to real customers unintentionally.

---

# 19. Decision Rule

If a client decision is open:
- use the documented technical default only if one exists.
- otherwise stop that specific decision-dependent part.
- continue independent work when safe.

Do not silently invent business policy.

---

# 20. Deviation Rule

Any deviation from contract requires:
```text
Deviation
Reason
Impact
Files
Migration/API impact
Approval status
```

No silent architecture drift.

---

# 21. Wave Closure Required Output

At the end of each wave:

```text
WAVE:
STATUS: PASS / BLOCKED

BASELINE SHA:
FINAL SHA:

COMMITS:
MIGRATIONS:
OPENAPI VERSION/DIFF:
FILES CHANGED:

GATES:
- lint:
- format:
- typecheck:
- build:
- unit:
- integration:
- e2e:

CONTRACT COMPLIANCE:
OPEN DECISIONS:
BLOCKERS:
NEXT WAVE READY: YES/NO
```

---

# 22. Final Closure

Agent may declare project complete only if `24_DEFINITION_OF_DONE.md` is satisfied and no P0/P1 blocker remains.
