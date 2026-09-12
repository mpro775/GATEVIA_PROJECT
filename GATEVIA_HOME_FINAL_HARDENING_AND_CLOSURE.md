# GATEVIA_HOME_FINAL_HARDENING_AND_CLOSURE

## Status
**FINAL HARDENING / CLOSURE CONTRACT**

## Purpose

This file is the final closure pass for the GATEVIA homepage after the complete premium redesign.

This is **not another design phase**.

Do not redesign sections again.

Do not invent new compositions.

Do not add new visual concepts.

The homepage architecture is now considered approved. This pass exists only to close verified correctness, accessibility, content-governance, ordering, CSS, and regression gaps found in the current source.

---

# 1. VERIFIED BASELINE

The current source already contains the approved Home-specific architecture, including:

- premium Navbar + Motion System
- Home Hero
- Strategic Pillars
- Journey
- Services Showcase
- Sector Explorer
- Evidence Ledger
- FAQ
- Consultation Gateway
- Case Studies
- Testimonials
- Clients / Partners
- Ecosystem
- Insights
- Gateway Footer

The Home renderer is already isolated from generic internal-page rendering through:

```tsx
<SectionRenderer
  sections={page.sections}
  locale={locale}
  variant="home"
/>
```

This architecture must be preserved.

Do not collapse the Home-specific components back into generic cards/renderers.

---

# 2. CURRENT CLOSURE STATUS

Current source assessment:

```text
Design Architecture       PASS
Home-specific Rendering   PASS
CMS Integration           PASS with minor gaps
Motion System             PASS
RTL / Light / Dark        PASS architecturally
Trust / Demo Governance   PARTIAL
Accessibility Hardening   PARTIAL
Regression Test Coverage  PARTIAL
Final Closure             NOT YET CLOSED
```

This file contains the remaining confirmed closure work.

---

# 3. NON-GOALS

Do NOT:

- redesign Hero
- redesign Navbar
- redesign Pillars
- redesign Journey
- redesign Services
- redesign FAQ
- redesign Evidence
- redesign Sectors
- redesign CTA
- redesign Case Studies
- redesign Testimonials
- redesign Network
- redesign Ecosystem
- redesign Insights
- redesign Footer
- add Framer Motion
- add GSAP
- change backend contracts without a proven blocker
- hardcode CMS business content
- introduce frontend-only section reordering
- weaken TypeScript/lint/tests
- remove demo disclosure
- replace current CMS/API source-of-truth model

Only close the issues listed in this contract.

---

# 4. P0 — HOMEPAGE SECTION ORDER

## 4.1 Confirmed current order

Current base content seed creates:

```text
10  hero
20  process
30  timeline
40  services_grid
50  faq
60  cta
```

Current demo seed additionally inserts:

```text
45  industries_grid
47  stats
100 case_studies
110 testimonials
120 logo_cloud
130 ecosystem
140 insights
```

Therefore the effective homepage order is currently:

```text
Hero
Strategic Pillars
Journey
Services
Sectors
Evidence
FAQ
Consultation CTA
Case Studies
Testimonials
Clients / Partners
Ecosystem
Insights
```

This is incorrect for the approved narrative because the primary closing CTA appears before a large part of the trust/editorial content.

---

# 5. CANONICAL TARGET ORDER

The homepage must resolve to:

```text
10  hero
20  process
30  timeline
40  services_grid
50  industries_grid
60  stats
70  case_studies
80  testimonials
90  logo_cloud
100 ecosystem
110 insights
120 faq
130 cta
```

Equivalent human-readable sequence:

```text
01 Hero
02 Strategic Pillars
03 Market Entry Journey
04 Service Architecture
05 Sector Explorer
06 Evidence Ledger
07 Case Studies
08 Client Voice
09 Clients / Partners Network
10 Ecosystem
11 Insights
12 Decision FAQ
13 Consultation Gateway
14 Footer
```

The Footer is outside `page_sections` and naturally follows the page.

---

# 6. SECTION ORDER — IMPLEMENTATION RULE

Do **not** implement:

```tsx
sections.sort(...)
```

inside React based on hardcoded type priorities.

Do not reorder after fetching.

The order belongs to the content source.

Fix the canonical order in:

```text
prisma/seed/content.ts
prisma/seed/demo.ts
```

and provide a safe data correction for already-deployed databases.

---

# 7. SECTION ORDER — DATABASE SAFETY

The Prisma model contains:

```prisma
@@unique([pageId, sortOrder])
```

Therefore naive updates such as:

```text
FAQ 50 → 120
Logo Cloud 120 → 90
```

can collide during the transition.

The deployed-data correction must use a **two-phase transaction**.

Required pattern:

```text
Phase 1:
move all managed Home sections to temporary collision-free sort orders

Phase 2:
assign final canonical sort orders
```

Example temporary range:

```text
1010+
```

The exact range is implementation-defined, but it must be safely outside normal Home sort values.

---

# 8. SECTION ORDER — SAFE DATA CORRECTION

Implement one deterministic, idempotent mechanism suitable for the repository.

Preferred options:

```text
A. dedicated Prisma data-correction script
or
B. an established repository seed-repair mechanism
```

Do not create a schema migration merely to change content ordering unless the repository already uses migrations for data corrections.

Suggested script concept:

```text
prisma/scripts/reorder-home-sections.ts
```

or the equivalent repository-consistent location.

Requirements:

1. resolve the Home page ID safely;
2. fetch managed Home sections;
3. identify them by `sectionType`;
4. start a transaction;
5. move the managed set to temporary unique sort orders;
6. assign canonical target orders;
7. leave unknown/custom sections untouched unless they conflict;
8. be safe to run more than once;
9. print before/after order;
10. fail clearly if duplicate managed section types create ambiguity.

Do not silently delete sections.

---

# 9. SECTION ORDER — SEED CORRECTION

Update future seeds so new environments are correct from first creation.

## `prisma/seed/content.ts`

Home base sections should create canonical sort slots equivalent to:

```text
hero          10
process       20
timeline      30
services_grid 40
faq           120
cta           130
```

Do not rely only on array index if this makes future ordering fragile.

Use a clear target sort order per section where practical.

## `prisma/seed/demo.ts`

Demo Home sections should use:

```text
industries_grid 50
stats           60
case_studies    70
testimonials    80
logo_cloud      90
ecosystem       100
insights        110
```

The demo seed must remain idempotent.

---

# 10. P0 — GENERIC CASE STUDY CARD FIELD BUG

## Confirmed issue

Current generic:

```text
apps/web/components/cards/resource-cards.tsx
```

contains:

```tsx
<p>{text(tr.shortDescription ?? tr.excerpt)}</p>
```

for `CaseStudyCard`.

The real case-study contract uses fields such as:

```text
title
clientLabel
context
challenge
objectives
solution
process
results
metrics
testimonialText
```

`shortDescription` / `excerpt` are not the correct Case Study summary source.

---

# 11. CASE STUDY CARD FIX

Change generic Case Study summary priority to use actual fields.

Preferred:

```tsx
text(tr.context ?? tr.challenge)
```

A fallback may include another **real** case-study contract field if needed.

Do not invent new translation properties.

Do not redesign the generic Case Study listing page.

This is a correctness-only fix.

Verify:

```text
/case-studies
/case-studies/[slug]
```

remain stable.

---

# 12. P0 — DEMO GOVERNANCE GAP IN EVIDENCE

## Confirmed issue

`SectionRenderer` correctly computes:

```ts
const demo = settings?.demo === true;
```

and already passes it to:

```text
HomeCaseStudies
HomeTestimonials
HomeInsights
HomeNetworkRegistry
HomeEcosystemAtlas
```

However current Home Evidence rendering is:

```tsx
<HomeEvidenceLedger
  content={content}
/>
```

and does not receive `demo`.

The demo seed currently creates the stats section with:

```ts
settings: { demo: true }
```

Therefore Demo status is not structurally represented by the premium Evidence component.

---

# 13. EVIDENCE DEMO FIX

Change the component contract to:

```tsx
<HomeEvidenceLedger
  content={content}
  demo={demo}
  locale={locale}
/>
```

or an equivalent clean interface.

When:

```text
demo === true
```

show the same approved restrained Demo/Illustrative disclosure pattern already used by the other Home trust sections.

Use centralized localized copy.

Do not rely only on the current Arabic/English title containing the word "demo".

Do not hide the numbers merely because they are demo unless existing content governance explicitly requires hiding them.

Do not make them appear verified.

---

# 14. P0 — DEMO GOVERNANCE GAP IN SECTOR EXPLORER

## Confirmed issue

Current Home Industries rendering calls:

```tsx
<HomeSectorExplorer
  content={content}
  items={items}
  locale={locale}
/>
```

without `demo`.

The demo Home `industries_grid` section is seeded with:

```ts
settings: { demo: true }
```

Therefore its demo state is not represented structurally in the premium component.

---

# 15. SECTOR DEMO FIX

Pass:

```text
demo
```

from `SectionRenderer` into `HomeSectorExplorer`.

Show the existing approved localized Demo/Illustrative disclosure when the section is marked demo.

Do not label real production sectors as demo when:

```text
settings.demo !== true
```

Do not infer demo status from names.

Use the section settings flag only.

---

# 16. P0 — ECOSYSTEM FEATURED MEDIA MODE

## Confirmed issue

Current:

```text
apps/web/components/home/home-ecosystem-atlas.tsx
```

chooses media using:

```ts
kind === 'brand'
  ? [item.coverMediaId, item.logoMediaId]
  : [item.logoMediaId]
```

The chosen media is rendered in the same featured media surface.

Current CSS may apply cover-style behavior to both real cover images and logos.

Result:

- a logo can be enlarged/cropped like photography;
- product featured identity may use a logo as if it were a cover image;
- the visual may look broken or unprofessional.

---

# 17. ECOSYSTEM MEDIA FIX

The media resolver must return both:

```text
media record
presentation mode
```

Example concept:

```ts
{
  media,
  mode: 'cover' | 'logo'
}
```

Rules:

```text
brand.coverMediaId exists  → cover
otherwise logoMediaId      → logo
product logoMediaId        → logo
```

Render distinct class/state:

```text
home-ecosystem__identity--cover
home-ecosystem__identity--logo
```

or equivalent.

### Cover behavior

```css
object-fit: cover;
```

### Logo behavior

```css
object-fit: contain;
```

with:

- safe identity surface
- intentional padding
- no destructive crop
- adequate Light/Dark contrast

If no media exists:

keep the current intentional fallback identity treatment.

---

# 18. P0 — MOBILE NAVIGATION FOCUS TRAP

## Confirmed issue

Current selector:

```ts
const FOCUSABLE =
  'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
```

The mobile backdrop is:

```tsx
<button
  ...
  tabIndex={-1}
/>
```

but still matches:

```css
button:not([disabled])
```

Therefore the focus-trap query can include the backdrop even though it is explicitly removed from sequential keyboard navigation.

---

# 19. MOBILE FOCUS SELECTOR FIX

Use a selector that excludes disabled buttons **and** negative tabindex.

For example:

```ts
const FOCUSABLE =
  'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), summary:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
```

Equivalent robust logic is acceptable.

Verify:

- opening drawer focuses close button;
- Tab cycles inside drawer;
- Shift+Tab cycles inside drawer;
- backdrop is not selected as first/last focusable;
- Escape closes drawer;
- closing returns focus to the menu trigger;
- route navigation still closes drawer;
- body scroll restores correctly.

Do not remove the existing return-focus behavior.

---

# 20. P1 — STRATEGIC PILLARS TAB ORDER

## Confirmed issue

Current:

```tsx
<li
  className="strategic-pillar"
  tabIndex={0}
>
```

The Pillars are informational content.

They do not currently expose a user action that requires keyboard activation.

Adding all Pillars to sequential tab order creates unnecessary keyboard stops.

---

# 21. PILLARS ACCESSIBILITY FIX

Remove:

```tsx
tabIndex={0}
```

from informational Pillar list items unless an actual interactive behavior is introduced.

Do not convert them to buttons.

Keep:

```text
<ol>
<li>
```

semantic structure.

If hover-only decoration exists, keyboard users do not need to focus non-interactive content merely to reproduce decoration.

---

# 22. P1 — SECTOR EXPLORER ARIA MODEL

## Confirmed issue

Current Sector Explorer uses:

```text
role="tablist"
role="tab"
role="tabpanel"
```

but only one dynamic panel is rendered.

Non-selected tabs do not always maintain a stable owned tabpanel relationship.

The current experience works visually, but the accessibility model should be simplified or made canonical.

---

# 23. SECTOR EXPLORER ACCESSIBILITY FIX

Preferred closure approach:

### Option A — Simple selector buttons

Use normal buttons:

```tsx
<button
  type="button"
  aria-pressed={selected}
>
```

and treat the preview as a normal labelled region.

This is preferred because the component is a visual selector, not a traditional document tab interface.

All sector buttons may remain keyboard reachable.

Arrow-key enhancement is optional.

### OR

### Option B — Fully canonical ARIA tabs

If retaining tabs:

- every tab must have a stable `aria-controls`;
- every panel relationship must remain valid;
- keyboard behavior must fully follow ARIA tab conventions.

Do not keep a partial tab pattern.

Preferred closure choice: **Option A** unless there is a strong reason to keep Tabs.

---

# 24. SECTOR EXPLORER — LOCALIZED MICROCOPY

Current component contains direct logic similar to:

```text
القطاع النشط / Active sector
استكشف القطاع / Explore sector
SECTORS
```

Move user-facing/localizable text into the centralized UI copy system.

Do not scatter language checks such as:

```ts
locale.startsWith('ar') ? '...' : '...'
```

when the project already has:

```text
apps/web/lib/ui-copy.ts
```

Decorative brand folio text such as:

```text
GATEVIA / EVIDENCE
```

may remain intentionally brand/editorial if it is not meaningful accessibility content.

---

# 25. P1 — HEADER ACCESSIBILITY COPY

## Confirmed issue

Current Desktop navigation contains:

```tsx
aria-label="Main navigation"
```

and Header Brand contains a label concept equivalent to:

```text
{identity.name} home
```

These are user-facing accessibility strings and should respect locale.

---

# 26. HEADER COPY FIX

Use centralized localized UI copy for:

```text
Main navigation
Home
```

and any equivalent remaining header accessibility labels.

Do not alter visual Header design.

Do not replace existing localized menu/close/language labels that already work.

---

# 27. P1 — CSS `transform-origin` COMPATIBILITY

## Confirmed issue

Current:

```text
apps/web/styles/home.css
```

contains:

```css
transform-origin: inline-start center;
```

in at least:

- Services motif
- Evidence rule

`transform-origin` logical keywords such as `inline-start` are not a safe cross-browser choice for this project.

---

# 28. TRANSFORM ORIGIN FIX

Replace with broadly supported physical values plus RTL handling where visual direction matters.

Example concept:

```css
transform-origin: left center;

html[dir='rtl'] ... {
  transform-origin: right center;
}
```

Use actual selectors needed by the visual.

Verify:

- English direction correct
- Arabic direction correct
- reveal animation still starts from the intended logical edge

Do not change the visual language.

---

# 29. P1 — FOOTER CSS CLEANUP

## Confirmed issue

`apps/web/styles/shell.css` still contains legacy Footer rules such as:

```text
.footer-grid
.footer-links
.footer-path
.legal-row
```

followed later by the new Gateway Footer rules:

```text
.footer-gateway
.footer-layout
.footer-nav
.footer-contact
.footer-legal-row
```

The new Footer works, but the stylesheet retains obsolete/duplicate Footer design layers.

---

# 30. FOOTER CSS CLEANUP

Remove only confirmed dead legacy Footer styles that are no longer referenced by the current Footer component.

Before deleting:

search the complete repository for every class.

Do not remove a class still used by another page/component.

Keep:

```text
.site-footer
```

base rules required by current design.

Consolidate duplicate `.site-footer`, `.footer-brand`, `.footer-logo` declarations where safe.

Goal:

```text
one canonical Footer style system
```

No visual redesign.

---

# 31. P1 — FOOTER LOGO OPTIMIZATION

## Confirmed issue

Current Footer CMS logo rendering forces:

```tsx
unoptimized
```

while Header already uses conditional logic:

```tsx
unoptimized={!identity.logoUrl || markSrc.endsWith('.svg')}
```

The Footer should not unnecessarily disable Next image optimization for raster CMS assets.

---

# 32. FOOTER IMAGE FIX

Mirror the proven safe pattern from Header.

Requirements:

- bundled SVG / unsupported asset may remain unoptimized;
- CMS raster asset should use normal Next optimization where supported;
- preserve intrinsic sizing / aspect;
- keep logo surface contrast behavior;
- no broken external media behavior.

Do not change the CMS logo source-of-truth.

---

# 33. P1 — HOME SECTION IDENTIFIABILITY FOR TESTING

Add stable non-visual identifiers to Home sections where useful.

Preferred:

```html
data-home-section="hero"
data-home-section="pillars"
data-home-section="journey"
data-home-section="services"
data-home-section="sectors"
data-home-section="evidence"
data-home-section="case-studies"
data-home-section="testimonials"
data-home-section="network"
data-home-section="ecosystem"
data-home-section="insights"
data-home-section="faq"
data-home-section="consultation"
```

These are not styling hooks unless necessary.

Purpose:

- deterministic regression testing;
- section order assertion;
- easier QA.

Do not use localized text as the only e2e selector.

---

# 34. P1 — DEMO BADGE CONSISTENCY

Use one consistent Home demo disclosure component or class.

Current trust sections already use:

```text
home-demo-badge
```

Do not create separate incompatible badge designs for Evidence/Sectors.

If useful, extract:

```tsx
<HomeDemoBadge />
```

but only if this reduces duplication.

Do not over-componentize.

---

# 35. P2 — SMALL CODE QUALITY CLEANUP

After all confirmed fixes:

- remove unused imports introduced by previous phases;
- remove dead old CSS only after repository-wide search;
- avoid duplicate locale branching;
- avoid duplicate demo badge copy;
- preserve current component boundaries;
- do not perform unrelated broad refactors.

This is closure, not architectural experimentation.

---

# 36. TEST COVERAGE — REQUIRED

The current Web package has very limited targeted component coverage.

Add practical regression coverage without building a giant new testing framework.

Use the existing:

```text
Vitest
Playwright
```

infrastructure.

---

# 37. E2E — HOMEPAGE ORDER

Extend:

```text
tests/e2e/public.spec.ts
```

or create a focused Home e2e spec.

Using stable:

```text
data-home-section
```

selectors, assert the DOM order is:

```text
hero
pillars
journey
services
sectors
evidence
case-studies
testimonials
network
ecosystem
insights
faq
consultation
```

When demo sections are intentionally unavailable in a non-demo environment, the test must adapt to the environment contract rather than failing because optional trust content is absent.

If the tested environment contains the demo Home sections, assert the full sequence.

---

# 38. E2E — DEMO DISCLOSURE

When demo Home sections are present and have:

```text
settings.demo === true
```

assert demo disclosure is visible for at minimum:

```text
Evidence
Sectors
Case Studies
Testimonials
Network
Ecosystem
Insights
```

Do not hardcode exact English text if the test is running Arabic unless using localized expected copy.

---

# 39. E2E — MOBILE NAV FOCUS

Add or extend a Playwright test:

1. set mobile viewport;
2. focus/click menu trigger;
3. verify drawer opens;
4. verify close button receives focus;
5. Tab through focusable elements;
6. verify backdrop never receives focus;
7. Shift+Tab wraps correctly;
8. press Escape;
9. verify menu trigger regains focus.

This directly closes the focus-trap regression.

---

# 40. E2E — SECTOR SELECTOR

On desktop:

- sector selector buttons are keyboard reachable;
- selecting/focusing a different sector updates the preview;
- active state is exposed accessibly;
- valid "Explore sector" link changes with selected item where available.

On mobile:

- no hover dependency;
- interaction still works via click/tap/keyboard.

---

# 41. E2E — THEME / RTL REGRESSION

Preserve existing:

```text
tests/e2e/theme.spec.ts
```

and extend only if necessary.

Verify Home in:

```text
ar-SA + dark
ar-SA + light
en + dark
en + light
```

At least one desktop and one mobile viewport should be included across the suite.

No horizontal overflow.

---

# 42. GENERIC CASE STUDY REGRESSION

Add a lightweight test at the most appropriate layer proving generic CaseStudyCard summary uses:

```text
context
```

or another real contract field.

If component unit setup would require excessive new infrastructure, cover the Case Studies listing via Playwright instead.

Do not add a large testing dependency merely for one component.

---

# 43. DATA ORDER VERIFICATION

The data correction must expose a simple verification command or script output.

Expected final order:

```text
hero            10
process         20
timeline        30
services_grid   40
industries_grid 50
stats           60
case_studies    70
testimonials    80
logo_cloud      90
ecosystem       100
insights        110
faq             120
cta             130
```

No duplicate `sortOrder`.

No managed Home section missing.

---

# 44. SEED IDEMPOTENCY VERIFICATION

Verify:

```bash
pnpm seed:content
```

is safe to run repeatedly in the intended environment.

For demo/disposable environments, verify the repository-established demo command remains safe/idempotent.

Do not run production demo seed without the repository's explicit production guard/authorization.

The existing guard around:

```text
ALLOW_DEMO_SEED_IN_PRODUCTION
```

must remain intact.

---

# 45. BUILD / VALIDATION ORDER

Do not repeatedly build after every edit.

Complete all P0/P1 implementation first.

Then run:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
pnpm turbo build --filter=@gatevia/web
pnpm test:e2e
git diff --check
```

If full monorepo test/build is practical, also run:

```bash
pnpm build
```

Do not skip the Web-specific build.

Use the actual installed package-manager version defined by the repository.

---

# 46. MANUAL HOME QA MATRIX

Manually inspect:

```text
Arabic / Dark / Desktop
Arabic / Light / Desktop
English / Dark / Desktop
English / Light / Desktop

Arabic / Dark / Mobile
Arabic / Light / Mobile
English / Dark / Mobile
English / Light / Mobile
```

Suggested widths:

```text
390px
768px
1280px
1440px+
```

---

# 47. MANUAL ORDER QA

Confirm visually:

```text
Sector Explorer
Evidence
Case Studies
Testimonials
Network
Ecosystem
Insights
FAQ
Consultation Gateway
Footer
```

The Consultation Gateway must be the last major homepage conversion section before Footer.

No major trust/editorial section should appear after it.

---

# 48. MANUAL DEMO QA

When using current demo data:

- Evidence shows demo/illustrative disclosure;
- Sectors shows demo/illustrative disclosure;
- Case Studies disclosure remains;
- Testimonials disclosure remains;
- Network disclosure remains;
- Ecosystem disclosure remains;
- Insights disclosure remains.

No demo item should appear as verified client proof.

---

# 49. MANUAL ECOSYSTEM MEDIA QA

Test at least:

```text
brand with coverMediaId
brand with logo only
product with logo
entity with no media
```

Expected:

```text
cover → crop/cover presentation
logo → contain presentation
no media → intentional fallback
```

No logo must be cropped like photography.

---

# 50. MANUAL MOBILE NAV QA

Verify:

- backdrop does not enter focus cycle;
- close button initially focused;
- Tab/Shift+Tab trapped correctly;
- Escape works;
- route click works;
- language selection works;
- ThemeToggle remains reachable;
- focus returns to menu trigger.

---

# 51. MANUAL SECTOR ACCESSIBILITY QA

Verify:

- active item is exposed correctly;
- no incomplete ARIA tab relationship;
- keyboard user can change selection;
- preview content is readable;
- CTA/link corresponds to active sector;
- Arabic and English interaction directions remain natural.

---

# 52. MANUAL FOOTER QA

Verify:

- CMS logo still loads;
- raster CMS logo is not unnecessarily `unoptimized`;
- SVG fallback remains safe;
- no duplicate/legacy Footer style regression;
- grouped navigation still works;
- contact/social/legal remain correct;
- responsive layout remains unchanged visually.

---

# 53. REGRESSION SURFACES

Explicitly verify no unintended changes to:

```text
Header / Navbar
Desktop navigation
Mobile navigation
Language switching
Theme switching

Home Hero
Strategic Pillars
Journey
Services
FAQ
Consultation Gateway
Case Studies
Testimonials
Network
Ecosystem
Insights

Services listing/detail
Industries listing/detail
Case Studies listing/detail
Insights listing/detail
Partners
Ecosystem
Team

Footer
CMS navigation
Admin CMS
API contracts
SEO metadata
Analytics
```

---

# 54. P0 ACCEPTANCE CRITERIA

The closure cannot pass unless all are true:

- [ ] Home canonical section order is fixed at the content/data source.
- [ ] Existing deployed Home section order can be corrected safely.
- [ ] Correction handles unique `(pageId, sortOrder)` without collision.
- [ ] No frontend hardcoded reorder is introduced.
- [ ] Generic CaseStudyCard uses real case-study fields.
- [ ] Evidence receives and exposes Demo state.
- [ ] Sector Explorer receives and exposes Demo state.
- [ ] Ecosystem featured logo/cover presentation is differentiated.
- [ ] Mobile backdrop is excluded from focus-trap cycle.

---

# 55. P1 ACCEPTANCE CRITERIA

- [ ] Strategic Pillars no longer add informational list items to tab order.
- [ ] Sector Explorer uses a correct accessibility interaction model.
- [ ] Sector microcopy is centralized/localized.
- [ ] Desktop Navigation accessibility label is localized.
- [ ] Header Brand Home accessibility label is localized.
- [ ] Unsupported logical `transform-origin` usage is removed.
- [ ] RTL transform origin remains visually correct.
- [ ] dead legacy Footer CSS is removed safely.
- [ ] Footer image optimization is conditional and correct.
- [ ] stable Home section test selectors exist.
- [ ] demo disclosure styling is consistent.

---

# 56. TEST / VALIDATION ACCEPTANCE

- [ ] format check passes.
- [ ] lint passes.
- [ ] typecheck passes.
- [ ] unit tests pass.
- [ ] Prisma validation passes.
- [ ] Web build passes.
- [ ] Playwright tests pass.
- [ ] Home order regression test passes.
- [ ] Mobile focus-trap test passes.
- [ ] Theme/RTL tests pass.
- [ ] `git diff --check` passes.

If a check cannot run because of an external environment problem, report:

```text
BLOCKED BY ENVIRONMENT
```

with the exact command and exact failure.

Do not report PASS without execution.

---

# 57. SOURCE CONTROL RULES

Do not:

- reset unrelated user changes;
- revert previous approved Home redesign work;
- perform force push;
- rewrite history;
- merge unrelated branches;
- change dependency versions without need.

Keep the diff tightly scoped to closure.

---

# 58. FINAL CLOSURE DEFINITION

The Home phase is considered:

```text
CLOSED
```

only when:

```text
P0 = PASS
P1 = PASS
Validation = PASS
Regression = PASS
No confirmed functional blockers remain
```

Do not hold closure for subjective micro-polish that has no functional, accessibility, content-governance, visual-integrity, or production impact.

Do not introduce a new redesign cycle during closure.

---

# 59. FINAL IMPLEMENTATION REPORT

Return exactly this structure:

```md
# GATEVIA HOME FINAL HARDENING & CLOSURE REPORT

## Status
CLOSED / PARTIAL / BLOCKED

## Baseline
- branch:
- baseline SHA:
- final SHA:
- working tree:

## P0 — Homepage Order
- source order:
- canonical target:
- seed changes:
- deployed-data correction:
- idempotency:
- DB unique-order safety:
- result:

## P0 — Case Study Contract
- generic card field before:
- field after:
- listing regression:
- detail regression:

## P0 — Demo Governance
- Evidence:
- Sectors:
- existing trust sections:
- production/demo behavior:

## P0 — Ecosystem Media
- cover handling:
- logo handling:
- fallback:
- Light/Dark:

## P0 — Mobile Navigation Focus
- selector fix:
- initial focus:
- trap:
- Escape:
- return focus:

## P1 — Accessibility
- Strategic Pillars:
- Sector Explorer:
- Header labels:
- locale copy:

## P1 — CSS / Footer Cleanup
- transform-origin:
- legacy Footer CSS:
- Footer image optimization:

## Test Coverage Added
- Home order:
- Demo disclosure:
- Mobile focus:
- Sector interaction:
- Case-study regression:

## Theme / Locale
- Arabic RTL Dark:
- Arabic RTL Light:
- English LTR Dark:
- English LTR Light:
- Mobile:
- Desktop:

## Regression Verification
- Navbar:
- Hero/Pillars:
- Journey/Services:
- Sectors/Evidence:
- Case Studies/Testimonials:
- Network/Ecosystem:
- Insights/FAQ/CTA:
- internal resource pages:
- Footer:
- CMS/API:

## Validation
- format:check:
- lint:
- typecheck:
- tests:
- prisma:validate:
- web build:
- e2e:
- full build:
- git diff --check:

## Files Changed
- ...

## Remaining Issues
- None

## Closure Decision
CLOSED / NOT CLOSED
```

---

# 60. FINAL DIRECTIVE TO THE IMPLEMENTATION AGENT

Read this file completely before editing.

Then:

1. inspect the actual current working tree;
2. confirm each listed issue against current code;
3. do not re-open design decisions already approved;
4. implement every confirmed P0 item;
5. implement every confirmed P1 hardening item;
6. add targeted regression coverage;
7. apply the canonical Home order at the content/data source;
8. safely correct existing deployed ordering;
9. validate only after implementation is complete;
10. fix regressions caused by this pass;
11. return the exact final closure report.

If a listed issue has already been fixed in the working tree, verify it and mark it as already closed rather than reimplementing it.

Do not invent new blockers.

Do not hold final closure for cosmetic preferences that do not affect production quality.

The intended outcome of this pass is:

```text
GATEVIA HOMEPAGE — CLOSED
```
