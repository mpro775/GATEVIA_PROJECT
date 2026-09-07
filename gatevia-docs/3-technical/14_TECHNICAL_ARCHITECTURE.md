# GATEVIA — Technical Architecture
**Document ID:** GTV-TECH-001  
**Version:** v0.3 Draft  
**Status:** Technical Contract — Ready for implementation after client/business approvals

---

## 1. الهدف

هذه الوثيقة تقفل البنية التقنية الأساسية لمشروع GATEVIA V1 حتى لا يختار وكيل التنفيذ تقنيات أو أنماطًا مختلفة أثناء البرمجة.

النظام المستهدف:

> **Multilingual Public Website + Admin CMS + Media Library + Lead Management API**

---

## 2. القرارات التقنية الأساسية

| الطبقة | القرار |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Public Frontend | Next.js + TypeScript |
| Admin Frontend | Next.js + TypeScript |
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL |
| ORM / Migrations | Prisma |
| Cache / Queue | Redis + BullMQ |
| Media Processing | Sharp worker |
| Object Storage | Cloudflare R2 / S3-compatible |
| Email | Transactional email provider abstraction; Resend مناسب كبداية |
| API Contract | REST + OpenAPI |
| Public i18n | next-intl أو abstraction مكافئ يدعم App Router والـlocales الديناميكية |
| Validation | Zod في الواجهات + class-validator أو Zod-compatible validation في API |
| Admin Data Fetching | Typed API client + TanStack Query عند الحاجة |
| E2E | Playwright |
| Monitoring | Sentry أو مزود مكافئ |
| Analytics | GA4 + GTM |
| Deployment | Docker + Coolify-compatible |
| Edge / CDN / DNS | Cloudflare |

---

## 3. Monorepo Structure

```text
gatevia/
├── apps/
│   ├── web/                 # Public website
│   ├── admin/               # Admin panel
│   ├── api/                 # NestJS API
│   └── worker/              # BullMQ workers / media / email jobs
│
├── packages/
│   ├── ui/                  # Shared design-system primitives
│   ├── api-client/          # Generated/typed client from OpenAPI
│   ├── contracts/           # Shared enums and safe transport contracts only
│   ├── eslint-config/
│   ├── typescript-config/
│   └── tooling/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── docs/
├── docker/
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### قواعد
- لا يتم تكرار الـbusiness logic في `web` أو `admin`.
- الـAPI هو المصدر الرسمي للـbusiness rules والبيانات.
- `packages/contracts` لا يحتوي على ORM models أو Nest decorators.
- أنواع الـAPI في الواجهة تأتي من OpenAPI generation قدر الإمكان.

---

## 4. Runtime Architecture

```text
Browser
  │
  ├── gatevia.sa
  │      │
  │      ▼
  │   Next.js Web
  │      │
  │      ▼
  │    NestJS API
  │
  └── admin.gatevia.sa
         │
         ▼
      Next.js Admin
         │
         ▼
       NestJS API

NestJS API
  ├── PostgreSQL
  ├── Redis
  ├── R2
  ├── Email Provider
  └── BullMQ

Worker
  ├── Redis/BullMQ
  ├── R2
  └── Email / Image Processing
```

---

## 5. Domain Boundaries

### Identity & Access
- Admin users.
- Roles.
- Permissions.
- Sessions.
- Password reset.
- Optional MFA extension point.

### Localization
- Languages.
- Locale state.
- Translation completeness.
- Locale-aware content.

### CMS
- Pages.
- Page Sections.
- Services.
- Industries.
- Insights.
- FAQs.
- Team.
- Navigation.
- Settings.

### Trust & Ecosystem
- Clients.
- Partners.
- Brands.
- Products/Ventures.
- Testimonials.
- Certifications.
- Trust Metrics.
- Case Studies.

### Media
- Media records.
- Folders.
- Translations.
- Upload lifecycle.
- Variants.
- Usage references.

### CRM
- Leads.
- Consultation Requests.
- Assessments.
- Notes.
- Activities.
- Assignment.

### Platform
- Redirects.
- SEO.
- Audit.
- Health.
- Jobs.
- Notifications.

---

## 6. Public Web Rendering

### المبادئ
- Server Components افتراضيًا.
- Client Components فقط عند الحاجة للتفاعل.
- محتوى الصفحات العامة يأتي من API/CMS.
- لا يُسمح بـhardcoded business content.
- الصفحات التسويقية تستخدم SSR/ISR/Cache حسب طبيعتها.
- عند Publish/Update يتم invalidation/revalidation للمحتوى المتأثر.

### Public content caching
- الـAPI يمكنه استخدام HTTP caching للقراءات العامة المناسبة.
- Next.js يحتفظ بـroute/data cache حسب المحتوى.
- لا يتم caching للـlead forms أو الـadmin writes.

---

## 7. Admin Architecture

الـAdmin تطبيق مستقل لأسباب:
- فصل صلاحيات ومسارات الإدارة.
- تقليل JavaScript في الموقع العام.
- سهولة حماية domain منفصل.
- إمكانية تطويره لاحقًا دون التأثير على الواجهة العامة.

### Admin behavior
- Authenticated only.
- Server-side permission checks + API permission checks.
- API is final authority.
- كل Mutation يعاد التحقق منها في الـAPI حتى لو أخفت الواجهة الزر.

---

## 8. API Architecture

### Style
- REST.
- Base: `/api/v1`.
- OpenAPI generated from backend.
- JSON UTF-8.
- Standard error model based on Problem Details.

### Modules
```text
auth
users
roles
permissions
languages
pages
services
industries
case-studies
insights
faqs
team
trust
media
navigation
settings
redirects
leads
assessments
analytics-events (server-side optional)
audit
health
```

---

## 9. Database Architecture

- PostgreSQL is canonical datastore.
- UUIDs as primary keys.
- Timestamps in UTC.
- Locale stored as normalized string, e.g. `ar-SA`, `en`.
- Strict foreign keys.
- Unique constraints for localized slugs.
- Soft archive rather than hard delete for published content.
- JSONB only for flexible, controlled structures; not as replacement for relational design.

---

## 10. Queue / Worker Architecture

Redis + BullMQ used for asynchronous work:

### Initial job types
- transactional-email.
- media-image-process.
- media-cleanup.
- cache-revalidation-webhook optional.
- export-leads optional.

### Rule
الـLead يجب أن يُحفظ في PostgreSQL قبل enqueue البريد.  
فشل البريد لا يفقد الـLead.

---

## 11. Media Flow

### Upload
1. Admin requests upload session.
2. API validates intended file metadata.
3. API returns presigned upload URL.
4. Browser uploads to R2 directly.
5. Admin calls finalize endpoint.
6. API verifies object and creates media record.
7. Image job queued.
8. Worker creates variants.
9. Media becomes `ready`.

### Statuses
```text
pending_upload
processing
ready
failed
archived
```

---

## 12. Authentication Strategy

### V1
- Admin-only authentication.
- Secure HttpOnly session/refresh cookie.
- Short-lived access context.
- Refresh/session record stored server-side and revocable.
- Password hashes via Argon2id or another approved strong password-hashing algorithm.
- CSRF protection when cookie-authenticated mutations are browser-originated.
- Secure, SameSite cookies.
- Brute-force/rate-limit controls.

### Future
Client accounts are not included in V1 but schema must not prevent adding them.

---

## 13. Authorization

RBAC:
```text
Super Admin
Content Manager
Marketing
Sales
Viewer
```

Permissions are atomic:
```text
pages.read
pages.create
pages.update
pages.publish
leads.read
leads.assign
leads.update_status
media.upload
settings.manage
...
```

Authorization is enforced in API guards/policies.

---

## 14. Search

### V1 Public
- Insights search at minimum.
- PostgreSQL search capability is sufficient initially.
- No Elasticsearch/OpenSearch in V1.

### Admin
- indexed text filters on name/email/title where needed.

---

## 15. SEO Architecture

Generated server-side:
- metadata.
- canonical.
- hreflang.
- Open Graph.
- JSON-LD.
- sitemap.
- robots.txt.

Published translations only appear in sitemap/hreflang.

---

## 16. Observability

Minimum production:
- structured logs.
- request correlation ID.
- Sentry/error monitoring.
- health endpoint.
- job failure monitoring.
- DB/Redis connectivity checks.
- email failure logging.

PII must not be indiscriminately logged.

---

## 17. Configuration

Environment-based:
- DATABASE_URL.
- REDIS_URL.
- R2 credentials.
- Email provider credentials.
- Auth/session secrets.
- Sentry DSN.
- GA/GTM identifiers.
- public domains.
- CORS/allowed origins.
- upload limits.

No secrets committed to Git.

---

## 18. Dependency Policy

- Prefer maintained packages.
- Avoid unnecessary abstractions.
- Avoid duplicating capabilities already provided by framework.
- Every new runtime dependency must have a concrete use.
- No dependency may change the locked architecture without updating this document.

---

## 19. Architecture Non-Goals

V1 does not introduce:
- microservices.
- Kafka.
- Elasticsearch.
- Kubernetes.
- GraphQL.
- event sourcing.
- CQRS framework.
- multi-tenancy.

The architecture should remain modular but operationally simple.

---

## 20. Architecture Acceptance

Before implementation begins, the following are locked:
- [x] Next.js public web.
- [x] Next.js admin.
- [x] NestJS API.
- [x] PostgreSQL.
- [x] Prisma.
- [x] R2/S3 storage.
- [x] Redis/BullMQ.
- [x] REST/OpenAPI.
- [x] Docker/Coolify-compatible deployment.

Open business decisions do not authorize changing these foundation choices.
