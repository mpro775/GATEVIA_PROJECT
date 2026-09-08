# GATEVIA V1 — FULL CODE COMPLETION & IMPLEMENTATION CLOSURE PASS

**Purpose:** Complete all remaining authored production code and product surfaces before any build, lint, typecheck, test, runtime verification, staging, or production work.  
**Execution Mode:** `READ CONTRACTS → AUDIT CURRENT CODE → IMPLEMENT ALL MISSING CODE → STATIC SELF-REVIEW ONLY → STOP`  
**Project:** GATEVIA V1  
**Current Phase:** CODE COMPLETION ONLY  
**Next Separate Phase:** INSTALL/SYNC → GENERATE → MIGRATE/BUILD → LINT/TYPECHECK → TEST → FIX → UAT → STAGING → PRODUCTION

---

# 0. المهمة

أنت وكيل التنفيذ الرئيسي لمشروع **GATEVIA V1**.

المستودع ليس مشروعًا فارغًا. يوجد تنفيذ سابق واسع، لكن التدقيق الأخير أثبت أن أجزاء مهمة ما تزال جزئية أو شكلية أو غير موصولة ببقية النظام. المطلوب في هذه الجولة هو:

> **إكمال كل الأكواد الإنتاجية المتبقية في GATEVIA V1 وفق العقود الحقيقية داخل `gatevia-docs/`، وإغلاق جميع فجوات W0–W10 كوديًا فقط، من دون تشغيل أي اختبار أو build أو lint أو typecheck أو Docker أو migrations أو خدمات خارجية.**

لا تبدأ المشروع من الصفر، ولا تعيد كتابة ما يعمل بلا سبب. افحص الموجود، احتفظ بالتنفيذ السليم، وأكمل/صحح الناقص.

هذه ليست جولة QA، وليست جولة Build، وليست جولة Production.

---

# 1. مصدر الحقيقة الإلزامي

قبل أي تعديل، اقرأ الملفات الأصلية مباشرة من:

```text
gatevia-docs/
```

وبالأخص كل ما تحت:

```text
gatevia-docs/1-requirements/
gatevia-docs/2-core/
gatevia-docs/3-technical/
```

اقرأ بالترتيب:

```text
gatevia-docs/1-requirements/00_GATEVIA_PROJECT_OVERVIEW_DRAFT.md
gatevia-docs/1-requirements/01_GATEVIA_FUNCTIONAL_REQUIREMENTS_DRAFT.md
gatevia-docs/1-requirements/02_GATEVIA_NON_FUNCTIONAL_REQUIREMENTS_DRAFT.md

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
```

## قواعد المصدر

- `gatevia-docs/` هو المرجع الأعلى للتنفيذ.
- لا تعدّل عقود `gatevia-docs/` في هذه الجولة.
- لا تعتمد على README أو تقرير سابق بدل العقد الأصلي.
- لا تعتبر قائمة المشاكل المؤكدة في هذا الملف قائمة حصرية؛ بعد إصلاحها يجب عمل **Contract Sweep** كاملًا والعثور على أي كود ناقص آخر.
- لا تخترع بيانات عميل أو claims أو testimonials أو clients أو partners أو certifications غير معتمدة.
- إذا كان المحتوى التجاري غير متاح، ابنِ الكود والـCMS والـempty/hidden behavior واترك البيانات غير المعتمدة فارغة.

---

# 2. حدود هذه الجولة — CODE ONLY

## مسموح

- قراءة الملفات والكود والـcontracts.
- البحث النصي داخل المستودع.
- إنشاء/تعديل ملفات production code.
- تعديل Prisma schema عند الحاجة وفق العقد.
- **كتابة ملفات migration SQL كمصدر فقط** دون تشغيلها.
- كتابة/تعديل seed source دون تشغيله.
- كتابة API controllers/services/DTOs/guards/decorators.
- كتابة queue/worker code.
- كتابة Admin UI كاملًا.
- كتابة Public Web UI كاملًا.
- كتابة shared packages/design system/api-client source/config.
- إضافة/تعديل dependencies داخل `package.json` إذا كانت ضرورية للكود.
- كتابة Docker/CI/env/configuration source إذا كان ناقصًا.
- كتابة Sentry/observability integration source.
- كتابة SEO/analytics source.
- تحديث التشغيل/documentation إذا كانت المواصفات تتطلب مصدرًا تشغيليًا.
- استخدام أوامر قراءة غير مغيرة مثل `find`, `grep`, `sed`, `cat`, `git status`, `git diff` لفهم المستودع فقط.

## ممنوع بالكامل في هذه الجولة

لا تشغّل:

```text
pnpm install
npm install
yarn install

pnpm build
npm run build
next build
nest build

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
cypress

prisma generate
prisma db push
prisma migrate dev
prisma migrate deploy
prisma migrate reset
prisma migrate diff
prisma studio

Docker build
Docker compose up/run
Coolify deploy

PostgreSQL runtime checks
Redis runtime checks
R2 runtime checks
email runtime checks
Sentry runtime checks
Lighthouse
curl smoke tests
browser/manual QA
```

## الاختبارات في هذه الجولة

- **لا تشغّل أي Tests.**
- **لا تستهلك الجولة في توسيع test suites أو E2E specs الآن.**
- إذا وجدت test موجودًا وقد أصبح قديمًا بسبب تغيير production contract، لا تحذفه ولا تركز على إصلاحه الآن إلا إذا كان يمنعك من فهم production code.
- كل كتابة/إصلاح/تشغيل الاختبارات ستكون في **Validation & Closure Pass مستقل بعد اكتمال الكود**.

## pnpm-lock.yaml

تم إنشاء `pnpm-lock.yaml` محليًا بعد `pnpm install`، لذلك **لا تعتبر غيابه blocker في هذه الجولة**.

- إذا كان موجودًا في working tree، احتفظ به.
- لا تحذفه.
- لا تعدّله يدويًا.
- إذا أضفت dependencies إلى `package.json` فلا تشغّل install الآن؛ مزامنة lockfile تتم في الجولة التالية.

---

# 3. قاعدة الإنجاز في هذه الجولة

لا تعتبر شيئًا مكتملًا فقط لأن:

- Prisma model موجود.
- route موجود.
- controller موجود.
- generic table موجود.
- component موجود.
- API field موجود.
- button ظاهر.

الميزة تعتبر **CODE COMPLETE** فقط إذا كان مسارها الإنتاجي مكتوبًا كاملًا عبر الطبقات المطلوبة، مثل:

```text
DB model/relation
→ migration source
→ backend validation/service/API
→ permissions/audit where required
→ admin CRUD/editor/relations/actions
→ public consumption where required
→ localization/SEO/media behavior where required
→ loading/empty/error UX where required
```

لا تحتاج لإثبات أنه يعمل الآن؛ الإثبات في الجولة التالية. لكن يجب أن يكون **الكود نفسه كاملًا منطقيًا**.

---

# 4. منهج التنفيذ الإلزامي

ابدأ مباشرة، ولا ترسل خطة نظرية مطولة.

نفّذ داخليًا بهذا التسلسل:

```text
A. Contract inventory
B. Current repository inventory
C. Gap matrix W0–W10
D. Implement production code continuously
E. Re-scan contracts against repository
F. Fix every remaining authored-code gap
G. Static diff/self-review only
H. Stop with CODE COMPLETION REPORT
```

لا تتوقف بعد كل Wave، ولا تنتظر موافقة بين المراحل.

---

# 5. P0 — DATABASE & MIGRATION SOURCE CLOSURE

التدقيق السابق أثبت أن `prisma/schema.prisma` واسع ويحتوي عشرات الـmodels، بينما migration الحالية لا تنشئ المنظومة كاملة.

## المطلوب

1. راجع `prisma/schema.prisma` مقابل `15_DATABASE_SCHEMA_CONTRACT.md` بالكامل.
2. صحح أي model/field/relation/index/unique/delete rule ناقص أو مخالف.
3. راجع جميع domains:
   - Identity & Access.
   - Localization.
   - Media.
   - Pages / Page Sections.
   - Services / Categories.
   - Industries.
   - Case Studies.
   - Insights / Categories / Tags.
   - FAQ.
   - Team.
   - Clients.
   - Partners.
   - Brands.
   - Products/Ventures.
   - Testimonials.
   - Certifications.
   - Trust Metrics.
   - Navigation.
   - Global Settings.
   - Redirects.
   - Leads / Notes / Activities / Assessments.
   - Audit.
   - Notification deliveries/job metadata where contracted.
4. أكمل migration source بحيث fresh database من الناحية النظرية يملك كل:
   - tables.
   - enums/types as needed.
   - extensions.
   - primary keys.
   - foreign keys.
   - unique constraints.
   - indexes.
   - referential actions.
5. لا تستخدم destructive shortcuts ولا تمسح history دون مبرر.
6. اجعل migration strategy مفهومة في `docs/MIGRATIONS.md` إن احتاج المصدر لذلك.
7. راجع seed source ليطابق العقود:
   - Languages.
   - Roles.
   - Permissions.
   - Role grants.
   - Service categories إذا كانت system-approved.
   - Navigation skeleton.
   - Global settings skeleton.
   - Lead statuses.
   - Admin bootstrap contract without insecure committed credentials.
8. لا تضف fake business/trust content.

**ممنوع تشغيل Prisma/DB. اكتب المصدر فقط.**

---

# 6. W1 — AUTH / RBAC / IDENTITY / AUDIT CODE COMPLETION

الأساس الحالي جيد، لذلك لا تعِد بناءه بلا سبب. أكمل فقط ما ينقص العقد.

راجع واكمل:

- login.
- logout.
- session refresh/expiration/revocation.
- forgot/reset password.
- invitation/bootstrap flow.
- secure password hashing.
- CSRF strategy.
- secure HttpOnly cookies.
- permission guard enforcement on every admin API.
- role grants alignment.
- frontend/admin action visibility aligned with permissions.
- unauthorized/forbidden UX.
- users list/detail/create/invite/edit/deactivate/reactivate where contract allows.
- roles list/detail and permission matrix UX.
- audit creation for required admin/security/content/media actions.
- audit detail/list filters and readable metadata.
- no insecure default admin credentials in repository.

لا تكتفِ بوجود APIs؛ أكمل **Admin Users/Roles/Audit UX** الفعلي.

---

# 7. W2 — MULTILINGUAL + CMS CORE FULL IMPLEMENTATION

## Languages

أكمل:

- dynamic languages admin CRUD/enable/disable/order/default behavior as contracted.
- locale code/direction/name fields.
- translation completeness calculation/UI.
- fallback policy.
- localized slugs.
- redirect behavior after localized slug changes where contracted.
- locale-aware date/number rendering helpers.
- language switcher يحافظ على الصفحة/الكيان المكافئ عندما توجد translation بدل إرجاع المستخدم دائمًا إلى root.
- `<html lang>` و`dir` الصحيحان على document root لكل locale.
- UI dictionary separation from CMS content.

## Pages & controlled Page Builder

أكمل **Page Builder حقيقيًا** وليس Page translation form فقط:

- Page list/create/edit.
- status: draft/published/archived.
- publish/unpublish/archive actions according to contract.
- preview behavior/source route.
- per-locale translation editor.
- SEO editor.
- page section list داخل الصفحة.
- add section.
- choose only allowed section types.
- section schema validation.
- section ordering/reordering.
- section enabled/visibility behavior.
- section translations.
- edit section data/content.
- delete/archive behavior safely.
- no arbitrary unsafe free-form page builder.
- page detail API returns everything Admin editor needs including sections and translations.

## Navigation Builder

أكمل:

- menu CRUD where contracted.
- nested items.
- ordering.
- external/internal links.
- localized labels.
- visibility.
- publish/active behavior.
- validation preventing invalid hierarchy/cycles if applicable.
- Admin navigation builder UX usable فعليًا.

## Global Settings

أكمل:

- grouped settings UX.
- safe key/value editing according to contract.
- localization where required.
- public settings API/consumption.
- contact/company/default SEO/social/config fields only where approved by contract.

## Redirects

أكمل:

- Admin list/create/edit/archive/delete behavior according to contract.
- source/target/status handling.
- collision/loop validation in code.
- public web redirect resolution integration.

---

# 8. W3 — MEDIA LIBRARY FULL IMPLEMENTATION

احتفظ بالـR2/worker implementation الجيد وأكمل جميع الطبقات الناقصة.

## Backend/API

أكمل:

- `GET /admin/media/:id` إذا كان مطلوبًا بالعقد.
- list/search/filter/pagination.
- folders CRUD/navigation.
- metadata update.
- media translations.
- alt text/caption/title where contracted.
- replace file flow.
- archive/delete flow.
- failed processing recovery/retry action source.
- usage references endpoint.
- safe delete enforcement.
- public/private handling.
- document/image/video metadata behavior.
- presigned upload security.
- processing status visibility.

## Usage references — يجب أن تكون شاملة

راجع جميع علاقات media وليس بعض الكيانات فقط. يجب أن يغطي usage resolver على الأقل كل موضع media فعلي في schema/contracts مثل:

- pages and localized SEO media.
- page sections/media IDs.
- services.
- industries.
- case studies + gallery.
- insights.
- team.
- clients.
- partners.
- brands.
- products/ventures.
- testimonials.
- certifications.
- navigation/settings إذا سمح العقد بmedia فيها.

## Admin Media Library

ابنِ UX كاملًا:

- folder sidebar/tree.
- upload zone.
- grid/list view as appropriate.
- search.
- type/status/folder filters.
- media detail drawer/page.
- thumbnail/preview.
- metadata editor.
- locale metadata editor.
- alt/caption completeness.
- variant/status display.
- usages list.
- replace.
- archive/delete confirmation.
- failed state + recover/retry action.
- reusable media picker component for CMS editors.

---

# 9. W4 — SERVICES & INDUSTRIES DOMAIN CLOSURE

أكمل العلاقات والـCRUD بدل generic primitive form.

## Service Categories

- list/create/edit/status/order.
- translations/slugs.
- category relation editor.
- public use where required.

## Services

Admin form يجب أن يدعم كامل contract، بما فيه:

- required category relation.
- translations.
- localized slug.
- short description/overview/content fields حسب العقد.
- hero/icon/media.
- industries relation multi-select.
- FAQs relations where supported.
- SEO.
- order/featured/status.
- publish/archive/preview.

Public:

- services listing.
- category grouping/filtering if contracted.
- full Service Detail template from `06_CONTENT_STRATEGY_PAGE_TEMPLATES.md`.
- hide empty optional blocks.
- related industries.
- relevant cases/insights/FAQs only when data exists.
- CTA.
- breadcrumbs.

## Industries

Admin:

- complete fields/translations/media/SEO/status/order.
- relations to services/cases/insights.

Public:

- listing.
- full detail template.
- related services/cases/insights.
- CTA.
- breadcrumbs.

---

# 10. W5 — INSIGHTS / CASE STUDIES / TRUST & ECOSYSTEM

## Insights

أكمل:

- categories.
- tags.
- translations.
- localized slugs.
- author/publish date/status if contracted.
- hero/OG media.
- rich content.
- relations to services/industries.
- SEO.
- Admin CRUD and relation pickers.
- public listing/detail template.
- category/tag/filter/search behavior according to scope.
- Article structured-data source hooks for W9.

## Case Studies

أكمل:

- translations.
- hero media.
- gallery/media relation.
- client relation only if taxonomy permits.
- services/industries relations.
- challenge/approach/results or exact contracted fields.
- visibility/status/featured/order.
- SEO.
- Admin relation editors.
- public listing/detail template.
- no invented metrics or claims.

## Trust taxonomy — لا تخلط الأنواع

أكمل كل كيان ككيان مستقل:

- Clients.
- Partners.
- Brands.
- Products/Ventures.
- Testimonials.
- Certifications.
- Trust Metrics.

لكل كيان حسب عقده:

- admin list/create/edit.
- translations where required.
- logo/cover/media picker.
- industry/relationship fields where contracted.
- external URL only when allowed.
- order/featured/status/visibility.
- public presentation.
- empty-state hiding.

لا تحول Client إلى Partner أو Brand إلى Product لتسهيل generic implementation.

---

# 11. W6 — CRM / LEADS / CONSULTATION / ASSESSMENT

## أصلح Idempotency hashing

التدقيق السابق أثبت أن hashing المبني على:

```ts
JSON.stringify(input, Object.keys(input).sort());
```

غير آمن للـnested assessment payload ويمكن أن يسقط nested keys ويولد نفس hash لطلبات مختلفة.

المطلوب:

- implement deterministic deep/stable serialization أو canonical JSON hashing.
- hash كامل payload recursively.
- same key + same payload => replay-safe behavior.
- same key + different payload => conflict behavior حسب API contract.

## Contact / Consultation / Assessment

أكمل production code لكل flow:

- Zod/input validation.
- locale.
- consent/privacy fields.
- lead source/type.
- duplicate detection signaling.
- rate limit hooks.
- idempotency.
- lead creation persistence.
- assessment persistence.
- notification job enqueue without tying lead persistence to email success.
- admin visibility.

## UTM continuity

أكمل التقاط وحفظ:

```text
utm_source
utm_medium
utm_campaign
utm_term
utm_content
```

مع policy واضحة لاستمرار attribution خلال navigation/forms، بدون إرسال PII إلى analytics.

Public forms يجب أن تمرر UTM للـAPI.

## Multi-step Assessment UX

نفذ UX حقيقي متعدد الخطوات وفق العقد، وليس form واحدة مسطحة.

يشمل الخطوات المعتمدة في `11_LEADS_CRM_CONTRACT.md` مثل:

- Company.
- Business/Industry/Current status حسب العقد.
- Objective.
- Timing/Timeline.
- Needs/Support needed.
- Contact.
- review/submit إذا كان template يطلبه.

مع:

- step state.
- validation per step.
- back/next.
- final submission.
- success/error states.
- mobile UX.
- RTL/LTR.

## Admin Lead UX

أكمل:

- dashboard counts where approved.
- leads list.
- server pagination.
- search.
- source/status/assignee/date filters.
- lead detail.
- assessment detail.
- assignment UI.
- status transition UI.
- internal notes.
- timeline/activity.
- notification/email delivery visibility where contracted.
- export action with correct permission if contract requires export.

---

# 12. W7 — ADMIN UX CLOSURE

هذه منطقة رئيسية. لا تعتمد على catch-all generic table كبديل لكل domain.

## Routing

أصلح protected admin routes بحيث كل زر `Open/Edit` يصل إلى شاشة حقيقية، خصوصًا:

- users.
- roles.
- audit.
- languages.
- navigation.
- settings.
- redirects.
- media.
- all CMS/trust/CRM entities.

لا تسمح بمسار detail يعيد نفس table دون editor.

## Tables

أكمل:

- server pagination.
- working search.
- working filters.
- sorting where contract supports.
- status chips.
- locale completeness.
- useful relationship columns.
- row actions.
- bulk actions فقط إذا كانت ضمن scope.
- empty state.
- loading state.
- API error state.

### مشكلة مؤكدة يجب إصلاحها

الـStatus filter الحالي ظاهر لكنه لا يطبق request فعليًا في بعض الـtables.

الـ`q` search الحالي يرسل من الواجهة بينما generic content list لا يستهلكه في بعض paths.

أكمل المسارين backend + frontend لكل resource مناسب.

## Forms

استبدل generic incomplete form حيث لا يغطي domain requirements بـdomain-aware editors أو configurable schema capable of:

- relations.
- required selects.
- multi-select.
- media picker.
- SEO.
- translations.
- publish controls.
- ordering.
- preview.

### مشكلة confirmed normalization

راجع `apps/api/src/content/admin-content.service.ts` وأي normalization مشابه.

لا ترسل إلى Prisma حقولًا alias غير معرفة بعد mapping مثل `title` مع `name` أو `excerpt` مع `shortDescription` إذا كان model لا يعرف alias.

استخدم explicit DTO/domain mappers بدل loose generic passthrough عند الحاجة.

## Responsive Admin

أصلح mobile navigation بالكامل.

الزر `☰` يجب أن يفتح drawer/menu حقيقي مع:

- navigation.
- close behavior.
- keyboard/focus behavior المناسب.
- permissions-aware items.
- theme toggle remains usable.

لا تخفِ sidebar وتترك المستخدم بلا navigation.

## Final Admin Navigation

نظم الأقسام وفق `12_ADMIN_PANEL_SPEC.md`:

- Dashboard.
- Content.
- Trust/Ecosystem.
- Leads/Sales.
- Media.
- Website/Settings.
- Users/Roles.
- Audit.

مع permission-aware visibility.

---

# 13. W8 — PUBLIC WEBSITE FULL UI

المطلوب ليس مجرد routes موجودة؛ نفذ page templates الفعلية من `06_CONTENT_STRATEGY_PAGE_TEMPLATES.md` وIA من `05_SITEMAP_INFORMATION_ARCHITECTURE.md`.

## الصفحات المطلوبة

أغلق كوديًا:

- Home.
- Saudi Market Entry.
- Services listing.
- Service detail.
- Industries listing.
- Industry detail.
- How We Work.
- Case Studies listing.
- Case Study detail.
- Insights listing.
- Insight detail.
- Ecosystem.
- About GATEVIA.
- Team.
- Partners.
- Clients / Trusted By.
- Brands.
- Products / Ventures.
- FAQ.
- Contact.
- Book Consultation.
- Market Entry Assessment.
- legal pages.
- 404.
- application error/not-found states.

## Homepage

طبّق sections contract الفعلي، مع data-driven rendering وhide-empty behavior:

- Hero.
- Trust Strip.
- Value Proposition.
- Three Pillars.
- Saudi Market Entry Journey.
- Featured Services.
- Why GATEVIA.
- Industries.
- Selected Case Studies.
- Ecosystem.
- Testimonials.
- Insights.
- Final CTA.

لا تملأ sections بclaims أو logos غير معتمدة.

## Controlled Page Section Renderer

المشكلة المؤكدة: بعض section types مثل grids تعرض heading/text فقط ولا تجلب عناصرها الفعلية.

أكمل renderer لكل allowed section schema بحيث IDs/config في section data تتحول إلى content فعلي، مثل:

- services grid.
- industries grid.
- case studies.
- insights.
- trust/logo sections.
- testimonials.
- FAQ.
- CTA.
- rich text/media sections.

كل section يجب أن يحترم:

- locale.
- status/public visibility.
- ordering.
- empty-state hiding.
- media.
- theme tokens.

## Header / Footer / Navigation

المشكلة المؤكدة: Header/Footer الحاليان يستخدمان links hardcoded رغم وجود CMS Navigation backend.

المطلوب:

- استهلاك public Navigation API/CMS data في header/footer/mobile navigation.
- menu hierarchy/mega menu according to IA.
- locale-aware links.
- active states.
- fallback آمن فقط إذا كانت بنية system navigation seed جزءًا من العقد، وليس hardcoded business copy متكرر.
- mobile navigation كاملة.

## Global Settings Public Consumption

استخدم global settings المعتمدة للمعلومات المشتركة بدل hardcoding:

- company/contact fields where contract allows.
- social links.
- default SEO data.
- footer utility data.

## Redirect integration

اجعل public web يطبق redirect records حسب contract قبل/أثناء route resolution بالأسلوب الأنسب لـNext architecture.

---

# 14. BRAND / DESIGN SYSTEM / LIGHT + DARK

التنفيذ الحالي يحتوي Light + Dark foundation؛ احتفظ به وأغلق التغطية.

المطلوب:

- semantic design tokens only.
- complete public light mode.
- complete public dark mode.
- complete admin light mode.
- complete admin dark mode.
- toggle on desktop public header.
- toggle on mobile navigation.
- toggle on admin shell.
- persistence عبر routes/locales/reload.
- first-visit system preference behavior مع fallback المحدد بالعقد.
- no hardcoded theme colors that break one mode.
- no logo automatic inversion.
- focus/hover/disabled/error/success states في الوضعين.
- responsive components.
- reduced motion source behavior.
- typography/spacing/grid/buttons/forms/cards/navigation/hero per brand contract.
- RTL layout rules لا تكون مجرد `direction: rtl` إذا كانت component ordering تحتاج معالجة.

لا تغير Brand Contract ولا تخترع final client assets غير المتاحة.

---

# 15. W9 — SEO / STRUCTURED DATA / ANALYTICS / ATTRIBUTION

## SEO Metadata

أكمل لكل page/resource مناسب:

- localized title.
- localized description.
- canonical.
- hreflang.
- OG title/description/image.
- locale-aware URLs.
- admin/preview noindex.

## Sitemap

أكمل sitemap ليشمل كل public published content المناسب، وليس subset فقط:

- static CMS pages.
- service details.
- industries.
- cases.
- insights.
- ecosystem/public taxonomy pages إذا كانت public حسب contract.
- localized alternates where architecture supports.

استبعد draft/archived/private/admin/preview.

## Robots

أكمل environment-aware robots behavior وحماية admin/preview routes.

## JSON-LD

أنشئ reusable structured-data source/components حسب المحتوى:

- Organization.
- Service.
- Article.
- FAQPage فقط عندما المحتوى مؤهل.
- BreadcrumbList.

لا تخترع ratings/reviews/claims.

## Analytics

الـanalytics loader وحده لا يكفي.

أكمل event wiring حسب contract، مثل:

```text
cta_click
contact_submit
consultation_submit
assessment_start
assessment_complete
report_download (only if a real report/download flow exists in approved scope)
language_switch
theme_switch
```

- GA4/GTM integration source.
- no PII in event payloads.
- consent/privacy behavior حسب العقد.
- UTM continuity shared with lead forms.
- لا ترسل raw email/phone/name/company free text إلى analytics.

---

# 16. W10 — SECURITY / OBSERVABILITY / PERFORMANCE SOURCE

## Security source closure

راجع وأكمل:

- Helmet/security headers.
- CSP compatible with actual analytics/fonts/media endpoints.
- strict CORS allowlist.
- CSRF.
- secure cookies.
- XSS/rich-text sanitization.
- SSRF protections where URL fetch/embed exists.
- upload MIME/size/type validation.
- rate limiting per public/admin sensitive routes.
- no stack traces in production responses.
- PII redaction in logs.
- secret/env validation.
- export permission.
- admin permission guards.

## Sentry / Error Monitoring

المشكلة المؤكدة: وجود `SENTRY_DSN` في env لا يعني integration مكتملة.

أكمل source integration المناسب للstack في:

- API.
- Web.
- Admin.
- Worker.

مع:

- environment/release config hooks.
- PII scrubbing/beforeSend policy.
- server/client boundaries.
- worker exceptions/job failures.

إذا احتجت dependencies، أضفها إلى package manifests فقط ولا تشغّل install الآن.

## Structured Logging

أكمل:

- request ID propagation.
- structured API logs.
- worker/job logs.
- job identifiers.
- email/notification failure observability.
- redaction.

## Health

أكمل source endpoints/logic لـ:

- liveness.
- readiness.
- dependencies representation according to architecture, دون تشغيل checks الآن.

## Performance authored-code cleanup

نفذ source-level improvements الواضحة من العقد فقط:

- server components by default.
- avoid unnecessary client components.
- dynamic/import strategy where needed.
- optimized image component usage.
- font configuration.
- controlled third-party scripts.
- avoid material layout shift from theme/source design.
- cache/revalidation source aligned with content publishing.

لا تشغّل Lighthouse أو profiling الآن.

---

# 17. API CONTRACT & TYPED CLIENT SOURCE CLOSURE

راجع كل endpoint في `16_API_CONTRACT.md` مقابل الكود الحالي.

أكمل أي endpoint/verb/filter/pagination/error shape ناقص في:

- public content.
- public forms.
- auth.
- admin CMS.
- translations.
- media.
- leads.
- users/roles.
- languages.
- audit.
- settings.
- health.

## DTO / validation

- استخدم explicit input DTOs/Zod/class validation وفق architecture الحالية.
- لا تمرر body الخام مباشرة إلى Prisma عندما fields تختلف بين domains.
- وحّد list response/pagination/error models حسب العقد.

## OpenAPI

أكمل authored source اللازم لكي OpenAPI يعكس كل contract:

- decorators.
- DTO schemas.
- response schemas.
- auth definitions.
- error/pagination definitions.

**لا تشغّل OpenAPI generation الآن.**

## `packages/api-client`

أكمل source/configuration/wrappers اللازمة لاستهلاك API بشكل مركزي بدل scattered ad-hoc fetch logic.

إذا كان جزء generated من OpenAPI مطلوبًا، جهّز generator config/import boundaries والـsource حوله، لكن **لا تولد artifact الآن**؛ generation تتم في Validation Pass.

لا تحاول تزوير generated artifact يدويًا لمجرد إغلاق checklist.

---

# 18. SEARCH / FILTERING / PAGINATION

أغلق behavior كوديًا end-to-end حيث يطلب العقد:

## Admin

- `q` search يعمل فعليًا في backend والfrontend للكيانات المناسبة.
- status filters.
- locale completeness filters إذا كانت في spec.
- relation filters where useful/contracted.
- server pagination.
- sort normalization/allowlist.

## Public

نفذ public search فقط ضمن الحدود المعتمدة في IA/architecture.

لا توسع V1 إلى Elasticsearch أو advanced search إذا كان خارج scope.

---

# 19. ERROR / LOADING / EMPTY STATES

في كل Public/Admin surface رئيسي، اكتب production UX لـ:

- initial loading where client interaction needs it.
- empty content.
- recoverable API error.
- forbidden.
- not found.
- form field errors.
- submission error.
- submission success.
- media failed processing.

لا تجعل `safe()` أو silent fallback يخفي backend failure ويحوّل الخطأ دائمًا إلى قائمة فارغة بلا دلالة عندما يجب إظهار error state.

وفي public optional marketing sections: **empty approved content => hide section** حسب العقد، وليس fake placeholders.

---

# 20. STATIC CONTRACT SWEEP — لا تتوقف عند المشاكل المذكورة

بعد تنفيذ كل ما سبق، أعد قراءة العقود وامسح المستودع كوديًا للبحث عن أي فجوة أخرى.

أنشئ داخليًا matrix لكل بند mandatory في `24_DEFINITION_OF_DONE.md` وصنفه:

```text
A = authored production code required now
B = generated/build/test/runtime evidence deferred
C = client content/approval deferred
D = staging/production operational deferred
```

في هذه الجولة يجب إغلاق **كل A** من W0–W10.

لا تحاول إغلاق B/C/D الآن.

أمثلة B المؤجلة:

- formatted proof.
- lint proof.
- typecheck proof.
- builds proof.
- generated OpenAPI artifact.
- generated typed client artifact if generated at validation time.
- fresh migration proof.
- seed runtime proof.
- unit/integration/E2E evidence.
- browser QA.
- Lighthouse.
- security scans.

أمثلة C المؤجلة:

- approved client copy.
- real trust logos.
- testimonials approval.
- case-study claims approval.
- final legal wording approval.

أمثلة D المؤجلة:

- staging deploy.
- production deploy.
- DNS/TLS finalization.
- live providers.
- backup/restore execution.
- UAT.
- monitoring production verification.

---

# 21. لا تنفذ W11 الآن

**W11 — Staging UAT & Production Closure خارج هذه الجولة بالكامل.**

لا:

- تنشر staging.
- تنشر production.
- تشغل Coolify.
- تغيّر DNS.
- تستعمل production secrets.
- تشغّل migrations.
- تستورد client content الحقيقي.
- تعمل UAT.
- تعمل smoke tests.
- تنشئ release tag.

يمكن فقط تحديث source configuration/documentation إذا كان ناقصًا ككود/ملف، لكن لا تنفذ العمليات.

---

# 22. لا توسع Scope

التزم بـV1 فقط.

لا تضف:

- client portal.
- invoices/payments/financial systems.
- advanced CRM automation.
- government integrations.
- mobile apps.
- AI features.
- e-commerce.
- arbitrary page builder.
- unapproved business modules.

إذا وجدت فكرة مستقبلية، لا تنفذها.

---

# 23. Git / Change Discipline

- لا تمسح تنفيذًا صحيحًا فقط لأنه ليس أسلوبك المفضل.
- لا تعمل rewrite واسع بلا داعٍ.
- لا تعدّل `gatevia-docs/`.
- لا تضع secrets.
- لا تضع fake production data.
- لا تعدّل lockfile يدويًا.
- احتفظ بالمونوروبو والمعمارية المعتمدة.
- لا تعمل commits صغيرة بعد كل ملف إذا كان ذلك يقطع التنفيذ؛ أنجز الكود أولًا.
- لا push/merge/rebase/tag/deploy في هذه الجولة ما لم يكن صاحب المشروع قد أعطى أمرًا منفصلًا صريحًا بذلك.

---

# 24. ترتيب الأولوية داخل الجولة

نفّذ بهذا الترتيب حتى لا تبني UI على contract ناقص:

```text
P0  Schema + migration source + seed source
P1  API correctness / DTOs / relations / auth/RBAC/audit
P2  CMS core + Page Builder + Navigation + Settings + Redirects
P3  Media backend closure + Media Admin/Picker
P4  Services + Industries full admin/public
P5  Insights + Case Studies + Trust ecosystem full admin/public
P6  Leads + UTM + idempotency + multi-step assessment + admin CRM
P7  Admin routing/tables/filters/forms/responsive closure
P8  Public IA/templates/sections/header/footer/settings/redirects
P9  Multilingual/RTL/LTR/theme completeness
P10 SEO + structured data + analytics
P11 Security + Sentry + logging + performance authored source
P12 API/OpenAPI source + centralized typed-client source
P13 Full W0–W10 contract sweep and remaining production-code gaps
```

هذا ترتيب تنفيذ داخل **جولة واحدة متصلة**، وليس Waves تتوقف بينها للاختبار.

---

# 25. ماذا تفعل إذا وجدت كودًا جزئيًا

استخدم القاعدة التالية:

### موجود وصحيح

احتفظ به.

### موجود لكن غير موصول

اربطه بالطبقات المستهلكة.

### موجود شكليًا

أكمل behavior الحقيقي.

### generic implementation لا يغطي domain

حوّله إلى domain-aware implementation دون نسخ غير ضروري.

### contract لا يطلبه

لا توسعه.

### يحتاج client content غير موجود

ابنِ model/editor/renderer/hidden-state واترك البيانات فارغة.

### يحتاج secret/provider حي

اكتب integration/config source فقط واترك runtime للجولة التالية.

---

# 26. قواعد لمنع الإغلاق الوهمي

ممنوع في التقرير النهائي استخدام عبارات مثل:

```text
"implemented because route exists"
"completed because schema exists"
"covered by generic editor"
"ready because UI renders"
```

إذا كانت relation required غير قابلة للتحرير من Admin، فالـCRUD غير مكتمل.

إذا CMS Navigation لا يغير Header/Footer، فالNavigation غير مكتمل.

إذا UTM موجود في DB ولا يصل من forms، فالUTM غير مكتمل.

إذا theme toggle موجود لكن mobile nav لا يعمل، فالAdmin/Public UX غير مكتمل بحسب الموضع.

إذا media usage لا يرى كل references، فالsafe delete غير مكتمل.

إذا section schema موجود لكن renderer لا يعرض البيانات الفعلية، فالPage Builder غير مكتمل.

إذا `SENTRY_DSN` موجود بلا SDK/source integration، فالObservability غير مكتمل.

---

# 27. STOP CONDITION لهذه الجولة

توقف فقط عندما يصبح تقييمك:

```text
GATEVIA V1 — AUTHORED PRODUCTION CODE COMPLETE FOR W0–W10
VALIDATION NOT YET RUN
W11 NOT STARTED
```

أي:

- كل production code المتطلب في العقود مكتوب.
- كل required domain relations مكتوبة ومستخدمة.
- Admin surfaces مكتملة كوديًا.
- Public surfaces/templates مكتملة كوديًا.
- integration source مكتملة.
- no known authored-code blocker remains.
- لم يتم تنفيذ أي validation gate.

لا تقل:

```text
PRODUCTION READY
TESTED
VERIFIED
CLOSED
```

لأن ذلك سيكون في الجولة التالية فقط.

---

# 28. التقرير المطلوب منك بعد إنهاء الكود

بعد الانتهاء، أرسل تقريرًا **مختصرًا ومفيدًا** فقط، ولا تشغّل أدوات للتحقق من أجل التقرير.

استخدم هذا الشكل:

```text
# GATEVIA V1 — CODE COMPLETION PASS REPORT

Status:
GATEVIA V1 — AUTHORED PRODUCTION CODE COMPLETE FOR W0–W10
VALIDATION NOT YET RUN
W11 NOT STARTED

## 1. Major production areas completed
- ...

## 2. Main files/modules changed
- ...

## 3. Database / migration source changes
- ...

## 4. API / Admin / Public / Worker changes
- ...

## 5. Dependencies added to manifests but not installed
- ...

## 6. Generated/runtime items intentionally deferred
- lockfile sync if manifests changed
- Prisma generate/migrate
- OpenAPI generation
- typed-client generation
- build/lint/typecheck/format
- tests
- runtime providers
- staging/UAT/production

## 7. Client-content items intentionally left empty
- ...

## 8. Remaining authored-code blockers
NONE

## 9. Commands executed
Only read/search/static repository inspection commands.
No install/build/lint/typecheck/test/prisma/docker/runtime/deploy commands executed.
```

إذا بقي authored-code blocker فعلي لا يتطلب business decision، **لا تتوقف وتكتبه كمتبقي؛ أصلحه أولًا**.

---

# 29. الرسالة التنفيذية النهائية للوكيل

نفذ الآن مباشرة:

> اقرأ جميع عقود `gatevia-docs/` من مساراتها الحقيقية، وافحص المستودع الحالي باعتباره تنفيذًا جزئيًا يجب إكماله لا إعادة بنائه. نفذ كامل محتوى هذا الملف `GATEVIA_CODE_COMPLETION_PASS.md`، وأغلق كوديًا جميع فجوات W0–W10 وكل البنود التي تحتاج authored production code. لا تشغّل install أو build أو lint أو format أو typecheck أو tests أو Prisma commands أو Docker أو قواعد البيانات أو Redis أو R2 أو email أو Sentry runtime أو Lighthouse أو أي deploy/UAT. لا تنفذ W11. لا تكتفِ بالمشاكل المذكورة؛ اعمل contract sweep نهائيًا وأصلح أي production-code gap آخر تجده. لا تسألني عن موافقة بين الوحدات ولا تعطِ خطة نظرية؛ ابدأ بالتنفيذ واستمر حتى تصبح جميع أكواد V1 المطلوبة مكتملة، ثم أرسل فقط CODE COMPLETION PASS REPORT وفق الصيغة المحددة، مع التصريح بوضوح أن validation لم يُشغّل بعد.

---

# 30. المرحلة التالية — ليست للتنفيذ الآن

بعد قبول هذا التقرير فقط سننشئ Pass منفصلًا بعنوان مقترح:

```text
GATEVIA_VALIDATION_BUILD_TEST_AND_RELEASE_CLOSURE.md
```

ويكون مسؤولًا عن:

```text
sync/install dependencies + lockfile
→ Prisma generate
→ migration generation/verification as applicable
→ fresh DB migration
→ seed verification
→ OpenAPI generation
→ generated API client
→ format
→ lint
→ typecheck
→ builds
→ unit tests
→ integration tests
→ E2E
→ security checks
→ browser/theme/i18n/accessibility QA
→ performance/Lighthouse
→ fix loop until green
→ staging
→ UAT
→ production readiness
→ deployment/monitoring/backup
→ final closure evidence
```

**لا تنفذ أي جزء من هذه المرحلة الآن.**
