# GATEVIA — Implementation Roadmap
**Document ID:** GTV-ROADMAP-001  
**Version:** v0.3 Draft  
**Status:** Execution Plan

---

## Guiding Rule

لا يتم تنفيذ المشروع ككتلة واحدة.  
كل Wave يجب أن تُغلق قبل الانتقال لما يعتمد عليها.

---

# W0 — Repository & Foundation

### Deliverables
- monorepo.
- pnpm/Turborepo.
- web/admin/api/worker apps.
- shared configs.
- Docker dev baseline.
- environment example.
- CI skeleton.
- lint/format/typecheck/build green.

### Exit
- all apps build.
- no business modules yet.

---

# W1 — Database, Auth & RBAC

### Deliverables
- Prisma.
- PostgreSQL schema foundation.
- migrations.
- users/roles/permissions.
- sessions.
- login/logout/reset.
- seed roles/permissions.
- API guards.
- audit foundation.

### Exit
- RBAC integration tests green.
- migrations from empty DB green.
- seed idempotent.

---

# W2 — Languages & CMS Core

### Deliverables
- languages.
- dynamic locale management.
- pages.
- controlled page sections.
- translations.
- navigation.
- global settings.
- preview/publish/archive.

### Exit
- third-language test passes.
- no `*_ar/*_en` schema.
- localized page public route works.

---

# W3 — Media Library

### Deliverables
- R2 abstraction.
- presigned upload.
- media DB.
- folders.
- metadata.
- image worker.
- variants.
- media picker.
- usage references.
- safe delete.

### Exit
- upload → processing → ready verified.
- referenced media protection verified.

---

# W4 — Services & Industries

### Deliverables
- categories.
- services.
- industries.
- relations.
- public listing/detail.
- admin CRUD.
- SEO fields.

### Exit
- Arabic/English service and industry publish flow passes.

---

# W5 — Insights, Case Studies & Trust Ecosystem

### Deliverables
- insights/categories/tags.
- case studies.
- clients.
- partners.
- brands.
- products/ventures.
- testimonials.
- certifications.
- trust metrics.
- public/admin screens.

### Exit
- relation taxonomy preserved.
- no fake trust data.

---

# W6 — Leads, Consultation & Assessment

### Deliverables
- leads.
- statuses.
- assignment.
- notes.
- timeline.
- contact form.
- consultation.
- assessment.
- UTM.
- idempotency.
- rate limit.
- email jobs.

### Exit
- failed email does not lose lead.
- all three lead flows visible in admin.

---

# W7 — Admin UX Closure

### Deliverables
- dashboard.
- final navigation.
- filters.
- tables.
- locale completeness.
- publish actions.
- settings.
- users/roles UX.
- audit UX.

### Exit
- role-specific UAT green.

---

# W8 — Public Website Full UI

### Deliverables
- Home.
- Saudi Market Entry.
- Services.
- Industries.
- How We Work.
- Case Studies.
- Insights.
- Ecosystem.
- About.
- FAQ.
- Contact.
- Consultation.
- Assessment.
- legal pages.
- responsive states.

### Exit
- Arabic RTL and English LTR reference pages approved.

---

# W9 — SEO, Analytics & Conversion Tracking

### Deliverables
- metadata.
- canonical.
- hreflang.
- sitemap.
- robots.
- JSON-LD.
- GA4/GTM.
- events.
- UTM continuity.

### Exit
- SEO acceptance suite green.

---

# W10 — Security, Performance & Observability

### Deliverables
- security headers.
- CSP.
- rate limits.
- upload hardening.
- CORS.
- Sentry.
- health checks.
- logs.
- performance cleanup.
- accessibility fixes.

### Exit
- security/QA blockers closed.

---

# W11 — Staging UAT & Production Closure

### Deliverables
- staging deploy.
- approved content import.
- client UAT.
- production backup.
- production deploy.
- smoke suite.
- monitoring.
- handover docs.

### Exit
- Definition of Done satisfied.
- closure report produced.

---

# Dependency Graph

```text
W0
 ↓
W1
 ↓
W2 ───→ W3
 ↓       ↓
W4 ──────┘
 ↓
W5
 ↓
W6
 ↓
W7
 ↓
W8
 ↓
W9
 ↓
W10
 ↓
W11
```

---

# Per-Wave Closure Report

Every wave must report:
- baseline SHA.
- final SHA.
- commits.
- files changed summary.
- migrations added.
- API contract changes.
- tests run/results.
- lint/typecheck/build.
- decisions/deviations.
- open blockers.
- whether scope stayed within contract.

---

# Stop Conditions

Agent must stop and ask for decision if:
- business approval is required.
- specs conflict materially.
- requested feature is explicitly out of scope.
- migration requires destructive production data loss.
- secret/credential is required but unavailable.
- brand/legal claim cannot be verified.
