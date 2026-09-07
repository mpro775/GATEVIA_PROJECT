# GATEVIA — MASTER IMPLEMENTATION PROMPT
**Purpose:** Full code-first implementation from scratch, followed only after code completion by build/fix/test/closure.  
**Execution Mode:** CODE FIRST → VALIDATE LATER  
**Project:** GATEVIA V1  
**Stack is LOCKED by the repository-local contracts under `gatevia-docs/`.**

---

أنت الآن وكيل التنفيذ الرئيسي لمشروع **GATEVIA V1**.

مهمتك ليست التخطيط أو كتابة تقرير أو اقتراح Architecture جديدة.  
مهمتك هي **تنفيذ المشروع كاملًا كوديًا من الصفر وفق جميع ملفات المواصفات الموجودة فعليًا تحت `gatevia-docs/`، ثم بعد اكتمال كتابة الكود بالكامل تنتقل إلى البناء والإصلاح والاختبار والإغلاق**.

---

# 0. قاعدة التنفيذ العليا

## المرحلة الأولى — CODE FIRST

في البداية:

> **اكتب المشروع كاملًا أولًا. لا تشغّل build أو lint أو format أو typecheck أو tests أو Docker أو database runtime checks أثناء مرحلة كتابة الكود.**

الهدف هو استغلال وقت التنفيذ والتوكن في **إنجاز أكبر قدر ممكن من الكود الفعلي أولًا** بدل التوقف بعد كل Module لتشغيل أدوات التحقق.

أثناء هذه المرحلة مسموح لك فقط بـ:

- قراءة ملفات المواصفات.
- فحص المستودع والملفات الحالية.
- إنشاء الملفات والمجلدات.
- كتابة وتعديل الأكواد.
- كتابة Prisma schema.
- كتابة migrations المطلوبة كمصدر.
- كتابة seed files.
- كتابة Dockerfiles وCI files.
- كتابة tests المطلوبة ككود، **لكن لا تشغّلها بعد**.
- كتابة OpenAPI decorators/contracts.
- كتابة الـfrontend والـadmin والـAPI والـworker.
- فحص الكود نصيًا والبحث داخل الملفات.
- إعادة هيكلة الكود أثناء الكتابة عند الحاجة.
- إضافة dependencies إلى `package.json` والـworkspace configuration.
- إنشاء `.env.example`.
- كتابة الوثائق التشغيلية المطلوبة.

## ممنوع أثناء المرحلة الأولى

لا تشغّل أيًا من التالي قبل الوصول إلى **CODE COMPLETE**:

```text
pnpm install
npm install
yarn install

pnpm build
npm run build

pnpm lint
eslint

pnpm format
prettier

pnpm typecheck
tsc

pnpm test
jest
vitest
playwright

prisma generate
prisma migrate
prisma migrate dev
prisma migrate deploy
prisma db push

docker build
docker compose up
docker compose run

database runtime tests
Redis runtime tests
R2 runtime tests
email provider tests
Lighthouse
Sentry tests
```

ولا تتوقف بعد كل Wave لتشغيل الاختبارات.

---

# 1. اقرأ العقود من مسارات `gatevia-docs` الحقيقية أولًا

قبل كتابة **أول ملف كود**، يجب عليك قراءة عقود GATEVIA مباشرة من ملفاتها الموجودة داخل المستودع، وليس من أسماء مختصرة في هذا البرومبت، وليس من ذاكرة سابقة، وليس من افتراض أن الملفات "مرفقة" خارجيًا.

## 1.1 تحديد جذر العقود

اعتبر أن جذر المشروع هو المجلد الذي يحتوي على:

```text
gatevia-docs/
```

ويُشار إليه في هذا البرومبت باسم:

```text
<GATEVIA_REPO_ROOT>
```

وجذر العقود الحقيقي هو:

```text
<GATEVIA_REPO_ROOT>/gatevia-docs
```

إذا كانت جلسة التنفيذ مفتوحة أصلًا داخل مجلد `gatevia-docs/` نفسه، فاستخدمه مباشرة كـ`GATEVIA_DOCS_ROOT` ولا تنشئ نسخة ثانية منه.

قبل التنفيذ تحقّق نصيًا من وجود شجرة الملفات، ثم اقرأ الملفات التالية **من هذه المسارات نفسها وبالترتيب التالي**:

## 1.2 Requirements — اقرأها أولًا

```text
gatevia-docs/1-requirements/00_GATEVIA_PROJECT_OVERVIEW_DRAFT.md
gatevia-docs/1-requirements/01_GATEVIA_FUNCTIONAL_REQUIREMENTS_DRAFT.md
gatevia-docs/1-requirements/02_GATEVIA_NON_FUNCTIONAL_REQUIREMENTS_DRAFT.md
gatevia-docs/1-requirements/README.md
```

## 1.3 Core Contracts

```text
gatevia-docs/2-core/04_SCOPE_AND_BOUNDARIES.md
gatevia-docs/2-core/05_SITEMAP_INFORMATION_ARCHITECTURE.md
gatevia-docs/2-core/06_CONTENT_STRATEGY_PAGE_TEMPLATES.md
gatevia-docs/2-core/07_TRUST_ECOSYSTEM_SPEC.md
gatevia-docs/2-core/08_MULTILINGUAL_I18N_CONTRACT.md
gatevia-docs/2-core/09_MEDIA_LIBRARY_CONTRACT.md
gatevia-docs/2-core/10_CMS_CONTENT_MODEL.md
gatevia-docs/2-core/11_LEADS_CRM_CONTRACT.md
gatevia-docs/2-core/12_ADMIN_PANEL_SPEC.md
gatevia-docs/2-core/13_BRAND_DESIGN_SYSTEM.md
gatevia-docs/2-core/README.md
```

## 1.4 Technical Contracts

```text
gatevia-docs/3-technical/14_TECHNICAL_ARCHITECTURE.md
gatevia-docs/3-technical/15_DATABASE_SCHEMA_CONTRACT.md
gatevia-docs/3-technical/16_API_CONTRACT.md
gatevia-docs/3-technical/17_FRONTEND_IMPLEMENTATION_CONTRACT.md
gatevia-docs/3-technical/18_SECURITY_PRIVACY_CONTRACT.md
gatevia-docs/3-technical/19_INFRASTRUCTURE_DEPLOYMENT.md
gatevia-docs/3-technical/20_SEED_INITIAL_DATA_CONTRACT.md
gatevia-docs/3-technical/21_TESTING_ACCEPTANCE_PLAN.md
gatevia-docs/3-technical/22_IMPLEMENTATION_ROADMAP.md
gatevia-docs/3-technical/23_AGENT_EXECUTION_RULES.md
gatevia-docs/3-technical/24_DEFINITION_OF_DONE.md
gatevia-docs/3-technical/README.md
```

## 1.5 قاعدة Path Contract الملزمة

- هذه المسارات هي **المصدر الحقيقي للمواصفات**.
- لا تعتمد على النسخ المقتبسة أو الملخصات إذا كان الملف الأصلي في `gatevia-docs/` متاحًا.
- لا تبحث عن ملف باسم تقريبي إذا كان المسار الصريح أعلاه موجودًا.
- لا تنقل ملفات العقود إلى `docs/` ولا تغيّر أسماءها بغرض التنفيذ.
- لا تعدّل عقود `gatevia-docs/` أثناء التنفيذ إلا إذا كان الطلب الحالي من صاحب المشروع يطلب تعديل عقد بعينه صراحةً.
- عندما تحتاج لاحقًا لحسم قرار أثناء البرمجة، **أعد فتح الملف الأصلي المناسب من مساره أعلاه** بدل الاعتماد على الذاكرة فقط.
- `gatevia-docs/` هو **input specification directory**، وليس جزءًا من runtime application ولا يجب نسخه إلى production image إلا إذا كان هناك سبب تشغيلي صريح.

## 1.6 Gate قبل CODE FIRST

قبل بدء إنشاء `apps/` أو `packages/` يجب أن تكون قد:

1. تحققت من وجود `gatevia-docs/`.
2. قرأت جميع الملفات المذكورة أعلاه.
3. استخرجت داخليًا القرارات المتعارضة إن وجدت وفق أولوية العقود في القسم التالي.
4. لم تشغّل build أو lint أو tests أو install.

بعد ذلك فقط ابدأ مرحلة **CODE FIRST** مباشرة دون أن تنتظر موافقة إضافية.

# 2. ترتيب أولوية العقود

عند وجود تعارض استخدم هذا الترتيب:

1. أحدث قرار صريح معتمد من صاحب المشروع.
2. Scope & Boundaries.
3. Functional Requirements.
4. Non-Functional Requirements.
5. Security / i18n / Media contracts.
6. Technical Architecture.
7. Database Schema Contract.
8. API Contract.
9. Frontend Implementation Contract.
10. CMS / CRM / Admin / Brand specifications.
11. Implementation Roadmap.
12. الكود الحالي، فقط إذا لم يخالف ما سبق.

لا تغيّر Contract معتمد بصمت.

---

# 3. لا تعطِ خطة جديدة

بعد قراءة الملفات:

- لا تكتب لي خطة تنفيذ جديدة.
- لا تعيد تلخيص المواصفات.
- لا تسألني هل تبدأ.
- لا تقسّم العمل إلى اقتراحات نظرية.
- لا تعطيني تقريرًا طويلًا في منتصف التنفيذ.

ابدأ التنفيذ مباشرة.

إذا كان المستودع فارغًا، أنشئ المشروع من الصفر وفق Architecture المعتمدة.

إذا كان به كود جزئي:
- افحصه.
- احتفظ فقط بما يطابق العقود.
- أكمل أو صحح المخالفات.
- لا تعيد بناء شيء صحيح بلا سبب.

---

# 4. الـStack مغلق

لا تغيّر هذه القرارات:

```text
Monorepo:
pnpm workspaces + Turborepo

Public Website:
Next.js + TypeScript

Admin:
Next.js + TypeScript

Backend:
NestJS + TypeScript

Database:
PostgreSQL

ORM:
Prisma

Queue:
Redis + BullMQ

Media:
Cloudflare R2 / S3-compatible
Sharp for image processing

API:
REST + OpenAPI

Deployment:
Docker + Coolify-compatible

Monitoring:
Sentry-compatible

Analytics:
GA4 + GTM
```

ممنوع استبدال PostgreSQL بـMongoDB.

ممنوع إدخال:
- GraphQL.
- microservices.
- Kafka.
- Kubernetes.
- Elasticsearch.
- أي بنية أعقد من العقود.

---

# 5. نفّذ المشروع كوديًا بالكامل في المرحلة الأولى

أنجز جميع Waves التالية **كتابةً** دون تشغيل validation بين المراحل.

---

## W0 — Repository & Foundation

أنشئ:

```text
apps/
  web/
  admin/
  api/
  worker/

packages/
  ui/
  api-client/
  contracts/
  eslint-config/
  typescript-config/
  tooling/

prisma/
docs/
docker/
```

وأغلق:

- pnpm workspace.
- Turborepo.
- TypeScript strict configuration.
- shared lint/format configs.
- root scripts.
- `.env.example`.
- Git ignore.
- Dockerfiles.
- CI workflow source.
- common package boundaries.

---

## W1 — PostgreSQL / Prisma / Auth / RBAC

اكتب بالكامل:

- Prisma schema.
- migrations.
- users.
- roles.
- permissions.
- user_roles.
- role_permissions.
- auth_sessions.
- password reset.
- login/logout/refresh/me.
- secure password hashing.
- CSRF architecture.
- API guards.
- decorators/policies.
- audit foundation.
- system roles/permissions seed.

نفّذ Permission model بصورة مركزية.

لا تستخدم frontend-only authorization.

---

## W2 — Dynamic Languages + CMS Core

نفّذ:

- languages.
- default language invariant.
- active/inactive languages.
- RTL/LTR.
- translation tables.
- dynamic locale routing.
- localized slugs.
- translation completeness.
- pages.
- page translations.
- controlled page sections.
- page section translations.
- navigation.
- navigation translations.
- global settings.
- redirects.
- preview/publish/archive.

### قاعدة صارمة

ممنوع إنشاء:

```text
title_ar
title_en
description_ar
description_en
```

يجب أن تبقى اللغات مفتوحة وديناميكية.

---

## W3 — Media Library

نفّذ كامل Media architecture:

- R2/S3 abstraction.
- presigned upload session.
- finalize upload.
- media states.
- folders.
- media translations.
- alt text.
- captions.
- variants.
- Sharp worker.
- thumbnail/small/medium/large.
- media picker API.
- usage references.
- safe delete/archive.
- replace flow.
- MIME/type/size validation.
- signed storage keys.
- CDN/public URL strategy.
- video embed normalization.
- direct video upload support فقط حسب العقد.

لا تخزن binary media داخل PostgreSQL.

---

## W4 — Services + Industries

نفّذ:

- service categories.
- service translations.
- service detail data.
- industries.
- industry translations.
- M:N relations.
- FAQs.
- related case studies.
- related insights.
- featured/sort/status.
- SEO fields.
- Admin CRUD.
- Public API.
- Public frontend listing/detail.

---

## W5 — Insights + Case Studies + Trust Ecosystem

نفّذ:

### Insights
- article.
- guide.
- report.
- categories.
- tags.
- relations.
- downloadable media.
- search/filter.
- listing/detail.

### Case Studies
- anonymized support.
- clients.
- industries.
- services.
- gallery.
- results.
- metrics representation.

### Trust & Ecosystem
- clients.
- partners.
- brands.
- products/ventures.
- testimonials.
- certifications.
- trust metrics.

### قاعدة الثقة

لا تخترع أي:

- client.
- partner.
- testimonial.
- certification.
- case study result.
- trust number.

ابنِ النظام كاملًا، لكن اترك بيانات الإنتاج غير المعتمدة فارغة.

---

## W6 — Leads / CRM / Forms

نفّذ:

### Contact
### Consultation
### Market Entry Assessment

ثم:

- leads.
- status.
- assignee.
- notes.
- activities.
- source.
- UTM.
- referrer.
- landing page.
- preferred locale.
- duplicate signaling.
- idempotency key.
- validation.
- rate limit architecture.
- anti-spam architecture.
- email queue.
- notification delivery tracking إذا كان ضمن العقد.
- human-readable assessment Admin view.

### قاعدة حرجة

```text
Save Lead in PostgreSQL
THEN queue notification
```

فشل Email لا يجوز أن يفقد الـLead.

---

## W7 — Admin Panel كامل

نفّذ لوحة الإدارة بصورة تشغيلية حقيقية:

```text
Dashboard

Content
  Pages
  Services
  Service Categories
  Industries
  Case Studies
  Insights
  FAQs
  Team

Trust & Ecosystem
  Clients
  Partners
  Brands
  Products & Ventures
  Testimonials
  Certifications
  Trust Metrics

Sales
  Leads
  Consultation Requests
  Assessments

Media
  Media Library

Website
  Navigation
  Languages
  SEO
  Redirects
  General Settings

System
  Users
  Roles & Permissions
  Audit Log
```

أضف:

- server pagination.
- filters.
- search.
- sorting.
- empty states.
- error states.
- permission-aware actions.
- locale tabs.
- translation completeness.
- publish/archive actions.
- Media Picker.
- Lead timeline.
- human-readable assessments.

لا تجعل Admin مجرد CRUD خام.

---

## W8 — Public Website كامل

نفّذ كل صفحات الموقع:

```text
Home
Saudi Market Entry
Services
Service Detail
Industries
Industry Detail
How We Work
Case Studies
Case Study Detail
Insights
Insight Detail
Ecosystem
Brands
Products/Ventures
About
Team
Partners
Clients / Trusted By
FAQ
Contact
Book Consultation
Market Entry Assessment
Privacy
Terms
Cookie Policy
404
Error states
```

### الصفحة الرئيسية

يجب أن تدعم:

```text
Hero
Trust Logos
Value Proposition
Market Access / Execution / Growth
Saudi Market Entry Journey
Featured Services
Why GATEVIA
Industries
Selected Case Studies
Ecosystem
Testimonials
Insights
Final CTA
```

إخفِ الأقسام الاختيارية تلقائيًا إذا لم توجد بيانات منشورة.

---

# 6. Brand & Design Implementation

طبّق Design System فعليًا.

لا تستخدم قالب SaaS عام جاهز.

اعتمد الاتجاه:

```text
Premium B2B
Dual Theme: Light + Dark
Dark: Navy / Black / Deep Neutrals
Light: White / Off-White / Light Neutrals
Electric Lime accent in both themes
Gateway / Entry / Direction / Growth
```

لكن:

- لا تخترع القيم النهائية للهوية إذا لم تكن معتمدة.
- اجعل الألوان Design Tokens قابلة للتحديث.
- استخدم الشعار والهوية المتاحة.
- اجعل النظام متماسكًا بصريًا.

نفّذ:

- Header.
- Mega Menu.
- Footer.
- Buttons.
- Forms.
- Cards.
- Stats.
- Timeline.
- Accordion.
- Tabs.
- Logo Cloud.
- CTA.
- Search.
- Filters.
- Pagination.
- Loading.
- Empty.
- Error states.

RTL/LTR من البداية.

### Light / Dark Mode — Mandatory Contract

**هذا مطلب إطلاق أساسي وليس تحسينًا اختياريًا.**

نفّذ Light Mode وDark Mode كاملين في:
- `apps/web`.
- `apps/admin`.

القواعد الملزمة:

```text
Allowed user-facing modes: light | dark
Priority: persisted explicit choice > OS prefers-color-scheme > dark fallback
Persist explicit choice in a server-readable cookie
Apply theme on document root
No full reload on toggle
No visible wrong-theme flash / FOUC
No theme-related hydration mismatch
Do not rely on localStorage-only post-hydration resolution
Do not implement Light Mode with automatic CSS inversion
```

ضع Theme Toggle في:
- Header للموقع العام Desktop.
- Mobile Navigation.
- Admin App Shell.

استخدم **Semantic Design Tokens** بحيث تستخدم Components نفس أسماء Tokens وتتغير القيم حسب Theme. يجب أن تشمل على الأقل backgrounds, surfaces, text, borders, accent, focus, status colors, shadows, form controls, overlays, charts/tooltips.

يجب أن يعمل كل Component وكل State في الوضعين، بما في ذلك:
- Header / Mega Menu / Footer.
- Hero / Sections / Cards.
- Forms / Dropdowns / Modals / Toasts.
- Tables / Filters / Search / Pagination.
- Hover / Active / Focus / Disabled.
- Loading / Skeleton / Empty / Error / Validation.

احفظ الاختيار عند تغيير اللغة والتنقل بين الصفحات. في أول زيارة فقط، إذا لم يوجد اختيار محفوظ، استخدم `prefers-color-scheme`، وإذا تعذر فـDark هو fallback.

لا تعكس شعارات العملاء أو الشركاء آليًا. استخدم variants أو surfaces مناسبة عند الحاجة.

**لا تعتبر الواجهة مكتملة إذا كان أحد الوضعين ناقصًا أو أقل جودة بصورة جوهرية من الآخر.**

---

# 7. SEO / Analytics

اكتب كامل implementation لـ:

- metadata.
- canonical.
- hreflang.
- sitemap.
- robots.
- Open Graph.
- Organization JSON-LD.
- Service JSON-LD.
- Article JSON-LD.
- FAQ schema where valid.
- Breadcrumb schema.
- GA4 abstraction/configuration.
- GTM.
- events.
- UTM continuity.

لا ترسل PII إلى analytics.

---

# 8. Security Implementation

اكتب جميع الحمايات في مرحلة الكود الأولى، لكن لا تشغّل اختبارات الأمان حتى المرحلة اللاحقة.

يشمل:

- secure cookies.
- CSRF.
- CORS allowlist.
- CSP.
- security headers.
- rate limits.
- password hashing.
- session revocation.
- validation.
- XSS sanitization.
- safe external links.
- upload restrictions.
- no arbitrary iframe.
- SSRF protection حيث يوجد fetch خارجي.
- secret handling.
- PII log redaction.
- audit.
- API errors without stack traces.

---

# 9. Infrastructure Code

اكتب:

- production Dockerfiles.
- Coolify-compatible configuration.
- health endpoints.
- CI workflows.
- staging/prod env examples.
- R2 configuration.
- Redis/BullMQ setup.
- Sentry integration.
- email provider abstraction.
- deployment docs.
- backup/runbook docs.
- migration deployment docs.
- rollback docs.

لا تشغّل Docker في المرحلة الأولى.

---

# 10. Seeds

اكتب:

### System seeds
- languages.
- roles.
- permissions.
- role grants.
- menus.
- controlled settings defaults.

### Business seeds
أنشئ infrastructure/code فقط للمحتوى المعتمد.

### ممنوع

لا تضع production fake data.

لا تنشئ:

```text
admin@example.com
password123
fake client
fake testimonial
fake case study
fake trust metrics
```

أنشئ secure bootstrap flow للـSuper Admin.

---

# 11. Tests — اكتبها الآن ولا تشغلها الآن

أثناء مرحلة Code First:

اكتب الاختبارات المطلوبة:

- Unit.
- Integration.
- E2E Playwright.
- RBAC matrix.
- i18n.
- media.
- CMS.
- lead flows.
- SEO.
- accessibility smoke.
- seed idempotency.
- migration expectations.

لكن لا تشغّلها حتى اكتمال الكود.

---

# 12. المرحلة الأولى تنتهي فقط عند CODE COMPLETE

لا تنتقل إلى build/test مبكرًا.

اعتبر Code Complete فقط عندما تكون جميع الوحدات المطلوبة موجودة كودياً:

```text
Repository
Database schema
Migrations
Seeds
Auth/RBAC
Languages
CMS
Media
Services
Industries
Insights
Case Studies
Trust
CRM
Forms
Admin
Public Web
SEO
Analytics
Security
Infrastructure source
Tests source
Docs
```

عندها فقط انتقل تلقائيًا إلى المرحلة الثانية.

لا تنتظر موافقتي.

---

# 13. المرحلة الثانية — INSTALL / GENERATE / FORMAT / LINT / TYPECHECK / BUILD

بعد Code Complete فقط:

ابدأ validation بهذا الترتيب:

## Step B1 — Dependencies

شغّل package installation باستخدام lockfile strategy الصحيحة.

أصلح:
- dependency versions.
- peer conflicts.
- missing imports.
- workspace wiring.

---

## Step B2 — Prisma Static/Generation

شغّل:

- Prisma format/validate.
- Prisma generate.

أصلح جميع أخطاء schema/types.

لا تستخدم `db push` بدل migrations.

---

## Step B3 — Formatting

شغّل formatter.

لا تعمل formatting sweep غير ضروري خارج المشروع.

---

## Step B4 — Lint

شغّل lint لكل workspace.

أصلح جميع errors.

لا تعطل rules لمجرد النجاح إلا بسبب موثق ومشروع.

---

## Step B5 — Typecheck

شغّل TypeScript typecheck لكل:

```text
web
admin
api
worker
packages
```

أصلح كل errors.

لا تستخدم `any` كحل عام.

---

## Step B6 — Build

ابنِ:

```text
packages
api
worker
admin
web
```

أصلح أخطاء البناء حتى تصبح كلها Green.

---

# 14. المرحلة الثالثة — DATABASE / RUNTIME VALIDATION

بعد نجاح Build:

أنشئ/استخدم بيئة اختبار محلية أو معزولة فقط.

ثم:

- PostgreSQL.
- Redis إذا مطلوب.
- Prisma migrations from empty DB.
- seed.
- migration head validation.
- API boot.
- worker boot.
- web/admin boot.

ممنوع استخدام Production.

---

# 15. المرحلة الرابعة — TESTING

بعد استقرار Build/Runtime فقط شغّل:

## Unit Tests
أصلح حتى Green.

## Integration Tests
أصلح حتى Green.

## RBAC Tests
اختبر:
- Super Admin.
- Content Manager.
- Marketing.
- Sales.
- Viewer.

## Multilingual Tests
اختبر إضافة لغة ثالثة فعلًا.

## Media Tests
اختبر flow كامل أو mock/provider-safe equivalent.

## Lead Tests
اختبر:
- Contact.
- Consultation.
- Assessment.
- idempotency.
- rate limit.
- email failure persistence.

## E2E
شغّل Playwright critical flows.

## Accessibility
شغّل critical accessibility checks.

## SEO
تحقق من representative routes.

---

# 16. سياسة الإصلاح بعد الاختبارات

عند ظهور فشل:

1. حدد root cause.
2. أصلح الكود الحقيقي.
3. لا تعدل الاختبار الصحيح فقط ليصبح Green.
4. لا تضع mock production behavior.
5. أعد تشغيل أقل مجموعة لازمة أولًا.
6. ثم أعد Gate الكامل في النهاية.

---

# 17. لا تضيّع التوكن في التقارير أثناء التنفيذ

خلال مرحلة Code First:

- لا تعطِ تقارير طويلة.
- لا تشرح كل ملف.
- لا تكرر المواصفات.
- لا تسرد كل كود كتبته.

استخدم وقتك وميزانية التوكن في التنفيذ.

يمكنك فقط إعطاء progress مختصر جدًا عند الحاجة مثل:

```text
CODE PHASE: W5 completed, continuing to W6.
```

ولا تتوقف.

---

# 18. لا تطلب قرارات إلا عند Hard Blocker

لا تسألني أسئلة يمكن حلها من العقود.

إذا كان قرار العميل غير محسوم ولكن يمكن بناء البنية دون البيانات:

> ابنِ الـfeature كاملاً واترك المحتوى غير المعتمد فارغًا.

اسأل فقط إذا كان هناك Blocker يمنع الكود نفسه، مثل:

- تعارض صريح بين عقدين لا يمكن حله بالأولوية.
- Credential مطلوب لاختبار خدمة خارجية في المرحلة الأخيرة.
- قرار قانوني/تجاري يغير نموذج البيانات جذريًا.
- destructive migration على بيانات موجودة.

---

# 19. Git

إذا Git متاح:

- اعمل على branch مناسب.
- لا force push.
- لا rebase shared history.
- استخدم commits منطقية.

لكن لا تجعل كثرة commits توقف تنفيذ الكود.

الأفضل:

```text
feat(gatevia): foundation and platform core
feat(gatevia): cms media and localization
feat(gatevia): trust crm and admin
feat(gatevia): public website and seo
fix(gatevia): build and validation closure
```

أو تقسيم منطقي مشابه.

---

# 20. ممنوعات نهائية

ممنوع:

- fake production content.
- hardcoded AR/EN DB columns.
- media binaries in PostgreSQL.
- auth token in localStorage.
- frontend-only RBAC.
- arbitrary HTML page builder.
- raw stack traces.
- unsafe file uploads.
- secrets in repository.
- DB reset in production.
- editing applied migrations.
- `prisma db push` كطريقة production.
- skipping failed tests in final closure.
- disabling TypeScript strictness to pass.
- `@ts-ignore` mass usage.
- TODO placeholders للوظائف الأساسية.
- mock API في النسخة النهائية بدل Backend حقيقي.
- Lorem Ipsum في production seeds.
- إدخال Features خارج Scope.

---

# 21. المرحلة الخامسة — FINAL FULL GATES

بعد إصلاح جميع المشاكل:

شغّل Full Gate نهائي:

```text
format check
lint
typecheck
build

Prisma validate/generate
fresh migrations
seed idempotency

unit tests
integration tests
RBAC matrix
E2E critical flows

security baseline
accessibility checks
SEO checks
```

إن تعذر Gate بسبب خدمة خارجية/Credential فقط:
- لا تخترع نجاحًا.
- وضح أنه External UAT Pending.
- أثبت أن الكود المحلي والعقد جاهزان.

---

# 22. Definition of Done

لا تعلن المشروع مكتملًا إلا بعد مراجعة:

```text
24_DEFINITION_OF_DONE.md
```

بندًا بندًا.

أي بند يحتاج بيانات العميل وليس كودًا يوضع:

```text
CLIENT CONTENT / UAT PENDING
```

ولا يعتبر Code Blocker إذا كانت المنصة مكتملة تقنيًا وتدعم إدخاله من Admin.

---

# 23. التقرير النهائي فقط

بعد إنهاء التنفيذ والإصلاح والاختبارات أعطني تقريرًا واحدًا نهائيًا، مختصرًا لكن دقيقًا، بالشكل التالي:

```text
# GATEVIA V1 — IMPLEMENTATION CLOSURE REPORT

STATUS:
CODE COMPLETE / TECHNICALLY CLOSED / UAT PENDING / BLOCKED

REPOSITORY:
Branch:
Baseline SHA:
Final SHA:

IMPLEMENTED:
- Foundation
- Auth/RBAC
- Multilingual
- CMS
- Media
- Services/Industries
- Insights/Case Studies
- Trust Ecosystem
- Leads/CRM
- Admin
- Public Website
- SEO/Analytics
- Security
- Infrastructure

DATABASE:
Migration count:
Migration head:
Seed status:

API:
OpenAPI status:
Public API:
Admin API:

GATES:
Install:
Format:
Lint:
Typecheck:
Build:
Prisma:
Migrations:
Seed:
Unit:
Integration:
RBAC:
E2E:
Accessibility:
SEO:

SECURITY:
...

OPEN CLIENT DATA:
- Official copy
- Approved clients/partners
- Brand assets
- Legal pages
- Credentials
...

DEVIATIONS:
...

BLOCKERS:
...

READY FOR STAGING:
YES / NO

READY FOR CLIENT UAT:
YES / NO
```

---

# 24. ابدأ الآن

ابدأ بهذه الآلية تحديدًا:

```text
1. اقرأ جميع ملفات المواصفات.
2. افحص المستودع الحالي.
3. نفّذ المشروع كاملًا كوديًا من W0 حتى W11 دون build/lint/typecheck/tests/runtime.
4. اكتب الاختبارات أثناء التنفيذ ولا تشغّلها.
5. عندما تصل CODE COMPLETE فقط:
   - install
   - generate
   - format
   - lint
   - typecheck
   - build
6. أصلح كل المشاكل.
7. شغّل database/runtime validation في بيئة معزولة.
8. شغّل الاختبارات.
9. أصلح failures.
10. شغّل Full Final Gates.
11. راجع Definition of Done.
12. أعطني Closure Report واحدًا نهائيًا.
```

**لا تتوقف لتطلب مني الإذن بين هذه المراحل.**  
**ابدأ بالتنفيذ الفعلي مباشرة، واستثمر المرحلة الأولى في كتابة المشروع كاملًا قبل استهلاك الوقت في البناء والاختبارات.**
