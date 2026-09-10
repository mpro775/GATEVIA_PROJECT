# GATEVIA — PREMIUM WEB DESIGN REBUILD
**Document ID:** GTV-WEB-DESIGN-REBUILD-001  
**Version:** v1.0 — Implementation Ready  
**Status:** APPROVED EXECUTION PLAN / SOURCE-ALIGNED  
**Scope:** `apps/web` + shared public-facing primitives in `packages/ui`  
**Primary Goal:** Rebuild the public website presentation layer into a distinctive, premium, modern B2B experience without breaking the existing CMS, API, routing, localization, SEO, analytics, or backend architecture.

---

# 0. AGENT MANDATE

You are working on the existing GATEVIA monorepo.

This is **not** a greenfield rebuild and **not** permission to replace the current architecture.

Your job is to perform a **complete premium visual rebuild of the public web application** while preserving the current backend and content contracts.

The current site is functionally acceptable as an MVP but visually too generic and under-designed. The target is a production-grade brand experience appropriate for a premium Saudi market-entry, strategy, execution, and growth company.

The design must communicate:

> **Confidence → Market Intelligence → Precision → Access → Movement → Growth**

The signature brand concept is:

> **Gateway → Path → Market → Growth**

The final result must feel:

- Premium.
- Strategic.
- Modern.
- Saudi-market aware.
- International in execution quality.
- Editorial rather than template-like.
- Precise rather than playful.
- Strong in both Arabic RTL and English LTR.
- Equally intentional in Light Mode and Dark Mode.

Do **not** merely recolor the current UI.

Do **not** solve this by buying/importing a generic theme.

Do **not** turn the site into a typical SaaS landing page.

Do **not** replace the CMS with hardcoded content.

---

# 1. SOURCE OF TRUTH — READ BEFORE EDITING

Read and respect these files before implementation:

## Core product/design documents

```text
gatevia-docs/2-core/04_SCOPE_AND_BOUNDARIES.md
gatevia-docs/2-core/05_SITEMAP_INFORMATION_ARCHITECTURE.md
gatevia-docs/2-core/06_CONTENT_STRATEGY_PAGE_TEMPLATES.md
gatevia-docs/2-core/07_TRUST_ECOSYSTEM_SPEC.md
gatevia-docs/2-core/08_MULTILINGUAL_I18N_CONTRACT.md
gatevia-docs/2-core/09_MEDIA_LIBRARY_CONTRACT.md
gatevia-docs/2-core/10_CMS_CONTENT_MODEL.md
gatevia-docs/2-core/11_LEADS_CRM_CONTRACT.md
gatevia-docs/2-core/13_BRAND_DESIGN_SYSTEM.md
```

## Technical contracts

```text
gatevia-docs/3-technical/14_TECHNICAL_ARCHITECTURE.md
gatevia-docs/3-technical/16_API_CONTRACT.md
gatevia-docs/3-technical/17_FRONTEND_IMPLEMENTATION_CONTRACT.md
gatevia-docs/3-technical/18_SECURITY_PRIVACY_CONTRACT.md
gatevia-docs/3-technical/21_TESTING_ACCEPTANCE_PLAN.md
gatevia-docs/3-technical/23_AGENT_EXECUTION_RULES.md
gatevia-docs/3-technical/24_DEFINITION_OF_DONE.md
```

## Current implementation

```text
apps/web/app/layout.tsx
apps/web/app/[locale]/layout.tsx
apps/web/app/[locale]/page.tsx
apps/web/app/[locale]/[...segments]/page.tsx
apps/web/app/globals.css

apps/web/components/header.tsx
apps/web/components/footer.tsx
apps/web/components/content.tsx
apps/web/components/lead-form.tsx
apps/web/components/analytics.tsx

apps/web/lib/api.ts
apps/web/lib/content.ts
apps/web/lib/seo.tsx
apps/web/lib/ui-copy.ts

packages/ui/src/primitives.tsx
packages/ui/src/theme-toggle.tsx
packages/ui/src/theme.css
packages/ui/src/index.ts

packages/contracts/src/sections.ts
```

---

# 2. VERIFIED AS-IS AUDIT

The existing implementation already has valuable foundations:

- Next.js App Router.
- Server Components by default.
- Localized routes.
- CMS-driven content.
- Controlled page-builder section types.
- API client integration.
- SEO metadata generation.
- JSON-LD.
- analytics hooks.
- Light/Dark token architecture.
- theme cookie.
- RTL/LTR direction support.
- shared `packages/ui`.
- responsive baseline.
- lead/assessment forms.
- Media references available in CMS responses.

These foundations **must be retained**.

However, the public web presentation layer is visually underdeveloped.

## 2.1 Current visual weaknesses confirmed from source

### A. Generic card architecture

`apps/web/components/content.tsx` uses a generic `ContentGrid` for multiple resources.

The same visual pattern is used for:

- services,
- industries,
- case studies,
- insights,
- and related-content grids.

This removes the visual identity of each content type.

A service card should not look like an article card.  
An industry card should not look like a case study.  
A case study should emphasize proof/results.  
An insight should feel editorial.

### B. CMS media is underused

The existing CMS can carry media, but generic content cards primarily render:

- eyebrow,
- title,
- excerpt,
- text link.

The premium redesign must use actual CMS media where available.

### C. Hero is too primitive

The fallback visual is currently a simple `.portal` made from rectangular borders.

The concept is directionally correct but not sufficiently developed to become a recognizable GATEVIA brand device.

### D. Page-detail layouts are text-stack driven

Service, Industry, Case Study, Insight, and generic CMS content commonly resolve into repeated patterns of:

```text
<section>
  <h2 />
  <p />
  <list />
</section>
```

This is semantically fine but visually weak.

### E. Header/navigation is MVP-level

Desktop nested navigation uses `<details>`.

Mobile navigation is a basic fixed panel.

The redesign needs:

- controlled premium mega menu,
- better active states,
- more refined language switching,
- strong consultation CTA,
- improved mobile navigation,
- deliberate scroll behavior,
- accessible keyboard behavior.

### F. Footer is too generic

Footer presentation is currently functional but does not provide a strong brand closing experience.

### G. Icons are not a coherent icon system

Examples currently use characters such as:

```text
☼
◐
◇
!
☰
→
▰
```

Replace these with one consistent icon family or internal SVG icon set.

### H. Responsive system is too shallow

The current global web stylesheet relies mainly on:

```text
900px
600px
```

The new design must account for large desktop, desktop, laptop, tablet, small tablet, and mobile compositions.

### I. Some used classes have incomplete/no meaningful visual implementation

Classes currently referenced by web components include examples such as:

```text
section--accent
faq-list
faq-item
panel
table-wrap
cell-meta
sr-only
step-progress
```

The redesign must close every such presentation gap.

### J. `globals.css` is overloaded

The current single global stylesheet handles:

- layout,
- header,
- navigation,
- hero,
- cards,
- content,
- forms,
- footer,
- responsive rules.

This should be decomposed into a maintainable web presentation architecture.

---

# 3. NON-NEGOTIABLE ARCHITECTURE RULES

## 3.1 Preserve the monorepo

Do not split repositories.

Retain:

```text
apps/web
apps/admin
apps/api
apps/worker
packages/ui
packages/api-client
packages/contracts
```

## 3.2 Preserve API authority

The frontend must not duplicate backend business logic.

All writes continue through API contracts.

## 3.3 Preserve controlled CMS rendering

Current controlled section types in:

```text
packages/contracts/src/sections.ts
```

include:

```text
hero
rich_text
text_image
stats
services_grid
industries_grid
process
timeline
testimonials
case_studies
logo_cloud
faq
cta
insights
ecosystem
form
```

These are enough to build a premium experience.

Do not introduce arbitrary HTML page-builder content.

## 3.4 Do not modify Prisma/API just for visual convenience

No schema migration, Prisma mutation, or API contract change is allowed merely because the frontend implementation is easier that way.

If an unavoidable presentation-data gap is proven, document it separately before changing a shared contract.

Prefer deriving presentation from:

- section type,
- page/resource context,
- current content,
- media already returned by API,
- existing ordering,
- existing relationships.

## 3.5 Preserve CMS dynamic behavior

Titles, descriptions, CTAs, media, service relationships, industries, insights, case studies, FAQs, logos, and forms must remain CMS/API driven.

Do not hardcode production business content into React components.

## 3.6 Preserve routing

Do not break localized route behavior.

Keep existing route strategy under:

```text
apps/web/app/[locale]/
```

## 3.7 Preserve SEO

Do not regress:

- metadata,
- canonical handling,
- localized alternates,
- sitemap,
- robots,
- JSON-LD,
- article metadata,
- indexing behavior.

## 3.8 Preserve analytics

Do not remove current analytics events or identifiers.

Any new CTA interaction should use existing tracking patterns where appropriate.

---

# 4. DESIGN TARGET

The public web experience should look like a bespoke digital brand system, not a component library demo.

## 4.1 Creative direction

Use a visual language inspired by:

- gateways,
- directional movement,
- architectural planes,
- perspective,
- market pathways,
- structured intelligence,
- Saudi economic/business context,
- premium editorial layouts.

Avoid literal overuse of maps or flags.

Saudi context should feel sophisticated and natural, not decorative.

## 4.2 Brand signature device — “Gateway System”

Create a reusable visual grammar based on:

1. Frame.
2. Offset frame.
3. Perspective path.
4. Direction line.
5. Market point.
6. Layer/plane.
7. Numeric/index marker.

The system can appear in:

- homepage hero,
- section separators,
- CTA backgrounds,
- case-study covers,
- empty editorial backgrounds,
- menu accent states,
- footer visual,
- loading/skeleton accents.

It should be subtle.

Do not use it identically everywhere.

---

# 5. COLOR / THEME SYSTEM

`packages/ui/src/theme.css` already contains semantic tokens.

Retain semantic-token architecture and expand it.

## 5.1 Both themes are first-class

Required:

```text
Light Mode
Dark Mode
```

Neither may look like an inverted version of the other.

## 5.2 Keep semantic colors

Components must consume semantic roles, not scattered raw values.

Expand tokens approximately into:

```css
--color-bg-canvas
--color-bg-canvas-subtle
--color-bg-surface
--color-bg-surface-hover
--color-bg-elevated
--color-bg-inverse
--color-bg-accent-subtle

--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse
--color-text-accent

--color-border-subtle
--color-border-default
--color-border-strong
--color-border-inverse

--color-accent
--color-accent-hover
--color-accent-active
--color-accent-foreground

--color-success
--color-warning
--color-danger
--color-info

--color-overlay

--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

Do not let accent green dominate major page surfaces.

## 5.3 Theme behavior

Keep:

- cookie persistence,
- `data-theme`,
- no route reload on toggle,
- system preference only for first-time preference resolution,
- `color-scheme`,
- theme continuity across locale/navigation.

Improve any visible wrong-theme flash if found.

Do not use `suppressHydrationWarning` as a substitute for correct state resolution.

---

# 6. TYPOGRAPHY

Typography is a major part of this rebuild.

## 6.1 Requirements

Arabic and Latin must each feel intentionally designed.

Do not let Arabic simply inherit Latin metrics.

Typography must support:

```text
display-xl
display-lg
display-md
h1
h2
h3
h4
body-xl
body-lg
body
body-sm
caption
label
overline
```

## 6.2 Implementation

Use `next/font` where licensing and source permit.

If official brand fonts are not available, use a high-quality temporary production-safe Arabic/Latin pairing and keep font variables centralized so the pair can be replaced later.

Do not scatter font-family declarations across components.

Create semantic variables similar to:

```css
--font-display
--font-body
--font-arabic
--font-latin
```

Use language-aware styling where necessary:

```css
:lang(ar)
:lang(en)
```

## 6.3 Heading rules

Large display headings:

- controlled line length,
- strong hierarchy,
- no oversized headings that destroy mobile layout,
- no excessive negative tracking in Arabic.

---

# 7. SPACING / GRID / CONTAINERS

Replace arbitrary spacing with a systematic scale.

Suggested foundation:

```text
4
8
12
16
20
24
32
40
48
64
80
96
128
160
```

Create variables.

## Container system

Use multiple container roles:

```text
container-wide     ~ 1440 visual maximum
container          ~ 1240 content maximum
container-reading  ~ 760–820 prose maximum
container-narrow   ~ 640 forms/small content
```

Do not make every section use the same width.

## Grid

Desktop:
- 12-column logic.

Tablet:
- 8-column logic.

Mobile:
- 4-column logic.

The implementation does not need a runtime grid framework, but composition must respect these principles.

---

# 8. RESPONSIVE STRATEGY

Do not rely on only 900px and 600px.

Design/test at least:

```text
1536+  large desktop
1440   desktop
1280   compact desktop
1024   laptop/tablet landscape
834    tablet
768    tablet portrait
430    large phone
390    common phone
360    narrow phone
```

Use intrinsic CSS where possible:

- `minmax()`
- `clamp()`
- `auto-fit`
- `auto-fill`
- container-aware sizing when beneficial.

Avoid excessive breakpoint-specific hacks.

---

# 9. MOTION SYSTEM

Motion must support the brand but never dominate it.

Allowed:

- fade/translate reveals,
- subtle stagger,
- path-line progress,
- portal depth shift,
- image mask reveal,
- navigation indicator transition,
- card media scale of very small amplitude,
- icon directional motion,
- numeric emphasis.

Avoid:

- heavy parallax,
- persistent floating elements,
- bouncing UI,
- long intro animations,
- animation that blocks interaction.

All animations must respect:

```css
@media (prefers-reduced-motion: reduce)
```

Do not require a large animation dependency unless its value is proven.

Prefer CSS and lightweight React behavior.

---

# 10. ICONOGRAPHY

Replace Unicode UI icons with one consistent system.

Preferred approach:

- use a lightweight geometric SVG icon library if already accepted by repository policy, or
- implement a small internal icon wrapper with tree-shakeable SVG icons.

Required examples:

```text
Arrow
Chevron
Menu
Close
Sun
Moon
Globe
ExternalLink
Check
Plus
Minus
Search
Mail
Phone
LinkedIn
Quote
Play
Calendar
Clock
MapPin
```

Directional icons must respect RTL where semantically necessary.

Do not mirror non-directional icons.

---

# 11. CSS / PRESENTATION ARCHITECTURE

The existing `apps/web/app/globals.css` should stop being a giant single implementation file.

Keep it as the public app CSS entry point, but split implementation.

Suggested structure:

```text
apps/web/styles/
├── foundations.css
├── typography.css
├── layout.css
├── utilities.css
├── motion.css
├── shell.css
├── sections.css
├── cards.css
├── editorial.css
├── forms.css
└── responsive.css
```

Then:

```css
/* apps/web/app/globals.css */
@import '@gatevia/ui/theme.css';
@import '../styles/foundations.css';
@import '../styles/typography.css';
@import '../styles/layout.css';
@import '../styles/utilities.css';
@import '../styles/motion.css';
@import '../styles/shell.css';
@import '../styles/sections.css';
@import '../styles/cards.css';
@import '../styles/editorial.css';
@import '../styles/forms.css';
@import '../styles/responsive.css';
```

The exact split may differ, but responsibilities must remain clear.

Do not reintroduce one massive unstructured stylesheet.

---

# 12. SHARED UI PACKAGE REBUILD

Current shared primitives are too small for the target.

Expand:

```text
packages/ui/src/
```

## Required primitives

At minimum:

```text
Button
IconButton
Card
Badge
Field
Input
Textarea
Select
Checkbox
Radio
Accordion
Dialog
Dropdown
Tabs
Pagination
Skeleton
EmptyState
ErrorState
ThemeToggle
```

If a primitive is public-web-specific and contains GATEVIA business presentation, keep it in `apps/web`, not `packages/ui`.

`packages/ui` remains **generic primitives + tokens**, not CMS/business content.

## Button variants

Support:

```text
primary
secondary
tertiary
inverse
ghost
```

And sizes:

```text
sm
md
lg
```

States:

- hover,
- active,
- focus-visible,
- disabled,
- loading.

Do not make every button pill-shaped.

---

# 13. NEW PUBLIC WEB COMPONENT ARCHITECTURE

Decompose `apps/web/components/content.tsx`.

The current file owns too many responsibilities.

Target:

```text
apps/web/components/
├── shell/
│   ├── site-header.tsx
│   ├── desktop-navigation.tsx
│   ├── mobile-navigation.tsx
│   ├── locale-switcher.tsx
│   └── site-footer.tsx
│
├── brand/
│   ├── gateway-visual.tsx
│   ├── market-path.tsx
│   ├── section-eyebrow.tsx
│   ├── section-heading.tsx
│   └── media-frame.tsx
│
├── sections/
│   ├── section-renderer.tsx
│   ├── hero-section.tsx
│   ├── rich-text-section.tsx
│   ├── text-image-section.tsx
│   ├── stats-section.tsx
│   ├── services-section.tsx
│   ├── industries-section.tsx
│   ├── process-section.tsx
│   ├── timeline-section.tsx
│   ├── testimonials-section.tsx
│   ├── case-studies-section.tsx
│   ├── logo-cloud-section.tsx
│   ├── faq-section.tsx
│   ├── cta-section.tsx
│   ├── insights-section.tsx
│   ├── ecosystem-section.tsx
│   └── form-section.tsx
│
├── cards/
│   ├── service-card.tsx
│   ├── industry-card.tsx
│   ├── case-study-card.tsx
│   ├── insight-card.tsx
│   ├── ecosystem-card.tsx
│   ├── person-card.tsx
│   └── testimonial-card.tsx
│
├── editorial/
│   ├── breadcrumbs.tsx
│   ├── article-meta.tsx
│   ├── content-blocks.tsx
│   ├── pull-quote.tsx
│   ├── data-table.tsx
│   └── related-content.tsx
│
└── forms/
    ├── lead-form.tsx
    ├── assessment-progress.tsx
    └── form-success.tsx
```

Names may be adapted to current conventions.

The key requirement is **separation of responsibilities**.

---

# 14. SECTION RENDERER CONTRACT

Keep the controlled CMS section types.

Do not create one generic card/section for all.

Map each CMS type to a dedicated visual renderer.

## 14.1 `hero`

Premium layout with:

- optional eyebrow,
- clear H1,
- body,
- 1 primary CTA,
- optional secondary CTA,
- media or Gateway visual,
- optional trust cue derived only from available data.

Hero variants should be derived from route/page context rather than arbitrary hardcoded content hacks.

Homepage hero is the most expressive.

Inner-page hero is more compact.

Article/case-study detail hero should use editorial composition.

## 14.2 `rich_text`

Render rich structured content with excellent reading typography.

Support existing safe blocks only.

No arbitrary HTML.

## 14.3 `text_image`

Build multiple responsive compositions using the existing `mediaPosition`.

Use:

- proper aspect ratio,
- premium media frame,
- caption/alt behavior if available,
- asymmetrical desktop composition where appropriate.

## 14.4 `stats`

Replace the basic equal boxes with branded metrics.

Use:

- large number,
- restrained accent,
- separators,
- accessible labels,
- responsive composition.

Do not animate numbers if that creates false values or unnecessary complexity.

## 14.5 `services_grid`

Render `ServiceCard`, not generic `ContentGrid`.

Card should emphasize:

- service title,
- short description,
- category/pillar if available,
- media if available,
- directional affordance,
- strong hover/focus.

## 14.6 `industries_grid`

Render `IndustryCard`.

Prefer larger image-led or typographic cards.

Industry must visually differ from service.

## 14.7 `process`

Use a horizontal/vertical structured process.

Potential style:

```text
01 — Discover
02 — Validate
03 — Enter
04 — Execute
05 — Grow
```

Connect stages visually using the Market Path language.

## 14.8 `timeline`

Use a deliberate timeline with markers.

Respect RTL ordering while retaining chronological logic.

## 14.9 `testimonials`

Do not use a generic grid if content is limited.

Preferred:

- featured quote,
- client/person attribution,
- logo where available,
- optional secondary testimonials.

Avoid auto-playing carousel by default.

## 14.10 `case_studies`

Use `CaseStudyCard`.

Emphasize:

- image,
- sector/industry,
- problem/result,
- metrics if provided,
- editorial case-study feel.

## 14.11 `logo_cloud`

Build a premium trust strip/logo wall.

Do not put every logo in identical boxed cards unless necessary for contrast.

Handle mixed light/dark logos with safe surface treatment.

## 14.12 `faq`

Accessible accordion.

Must support:

- keyboard,
- visible focus,
- large click target,
- Plus/Minus or Chevron icon,
- responsive typography.

## 14.13 `cta`

Build at least 3 internal visual compositions selected by route/position logic:

```text
standard
split
inverse/gateway
```

Do not use inline `style={{ textAlign: 'center' }}`.

## 14.14 `insights`

Use editorial cards.

Featured insight should be visually distinguishable if ordering/content permits.

## 14.15 `ecosystem`

Brands/products/ventures need a visual language different from client logos and services.

Use:

- identity/logo,
- name,
- sector/category,
- description where available,
- optional external link.

## 14.16 `form`

Render a premium form shell based on:

```text
contact
consultation
assessment
```

Each type can share primitives but should have appropriate layout.

---

# 15. HOMEPAGE — REQUIRED COMPOSITION

Follow `06_CONTENT_STRATEGY_PAGE_TEMPLATES.md`.

The homepage should visually support this sequence where content exists:

```text
01 Hero
02 Trust Strip
03 Value Proposition
04 Three Pillars
05 Saudi Market Entry Journey
06 Featured Services
07 Why GATEVIA
08 Industries
09 Selected Case Studies
10 Ecosystem
11 Testimonials
12 Insights
13 Final CTA
```

Do not display empty optional sections.

## 15.1 Hero concept

Target composition:

Left/text side:

```text
Eyebrow
H1
Short supporting text
Primary CTA
Secondary CTA
Small proof/trust cue if actual data exists
```

Visual side:

A proprietary Gateway visual.

Possible visual anatomy:

```text
Outer Gate Frame
   ↓
Offset Layer
   ↓
Directional Path
   ↓
Market Node
   ↓
Subtle coordinates/index labels
```

No fake data.

No decorative chart values pretending to be market statistics.

## 15.2 Trust strip

Immediately after hero.

Possible:

- selected client logos,
- partner logos,
- certification identities,
- real trust metric.

Do not invent claims.

## 15.3 Value proposition

Use a large editorial statement rather than another small card section.

Strong use of whitespace.

## 15.4 Three pillars

Visually establish:

```text
01 Market Access
02 Execution
03 Growth
```

Use large blocks/columns and directional relationship.

Do not make them ordinary dashboard cards.

## 15.5 Saudi Market Entry Journey

This should become a signature component.

Potential journey:

```text
Understand → Validate → Enter → Establish → Operate → Grow
```

Only display steps supported by CMS content.

The direction should adapt properly for RTL.

## 15.6 Featured services

Use varied but consistent service cards.

## 15.7 Why GATEVIA

Use proof-oriented layout, not marketing fluff.

Can combine:

- metrics,
- differentiators,
- market expertise,
- operating model.

Only from actual CMS content.

## 15.8 Industries

Image/visual-led section.

## 15.9 Case studies

Use one featured case study + supporting cards where content count permits.

## 15.10 Ecosystem

Brands/products/ventures as a connected ecosystem.

## 15.11 Testimonials

Strong editorial quote composition.

## 15.12 Insights

Magazine/editorial treatment.

## 15.13 Final CTA

Large memorable closing section.

It may use an intentionally dark premium composition even while site theme is light, if contrast and theme semantics remain correct.

---

# 16. HEADER / NAVIGATION REBUILD

Refactor:

```text
apps/web/components/header.tsx
```

## Desktop behavior

Target:

- clean brand area,
- primary navigation,
- optional mega menu for meaningful grouped navigation,
- language selector,
- theme toggle,
- primary CTA.

### Scroll behavior

At page top:
- visually light/transparent integration with hero if safe.

After scroll:
- elevated/background state,
- subtle border/shadow.

Do not use distracting size jumps.

## Active navigation

Show active current route.

Handle nested items correctly.

## Mega menu

Use only if navigation structure benefits.

Can include:

- grouped service links,
- pillar labels,
- one contextual CTA,
- optional small description.

Do not build a giant marketing mega menu if CMS navigation has only a few links.

## Accessibility

Must support:

- keyboard navigation,
- `Escape`,
- outside click,
- focus visibility,
- correct `aria-expanded`,
- correct role semantics.

Avoid depending on `<details>` for the full premium desktop navigation experience.

---

# 17. MOBILE NAVIGATION

Replace the basic mobile panel with a deliberate mobile menu.

Preferred:

- full-height drawer/full-screen layer,
- clear main navigation,
- expandable nested groups,
- language switch,
- theme control,
- consultation CTA,
- scroll lock,
- close button,
- route-close behavior.

Must fit 360px width.

Do not hide essential controls below inaccessible overflow.

---

# 18. FOOTER REBUILD

Refactor:

```text
apps/web/components/footer.tsx
```

Target:

- strong brand block,
- CMS-driven grouped navigation,
- contact information,
- LinkedIn/social,
- legal row,
- optional Gateway brand visual,
- theme-safe treatment.

Footer should visually feel like the completion of the site story.

## Important CMS/navigation handling

Do not assume only one structural shape.

Support:

- top-level items with children,
- flat items,
- fallback when CMS navigation is missing.

Review the existing footer navigation lookup and seeded menu keys. If there is a confirmed mismatch between requested key and actual seed, fix it at the correct source without creating a frontend hardcoded workaround.

---

# 19. RESOURCE-SPECIFIC CARDS

Delete the idea that all resources share the same visual card.

A shared base shell is allowed, but final renderers must differ.

## ServiceCard

Possible anatomy:

```text
Index / category
Title
Short description
Optional supporting media
Arrow
```

## IndustryCard

Possible anatomy:

```text
Large media area
Industry name
Short context
Optional service count if real data exists
```

## CaseStudyCard

Possible anatomy:

```text
Cover media
Industry tag
Title
Short outcome/result
Metrics if real
Read case study
```

## InsightCard

Possible anatomy:

```text
Media
Content type/category
Date
Title
Excerpt
Read time only if real/provided
```

## EcosystemCard

Possible anatomy:

```text
Logo/identity
Name
Type
Description
External link
```

Never invent missing values.

---

# 20. SERVICE LISTING / DETAIL

## Services listing

Create:

- premium intro,
- service pillar/category grouping if actual taxonomy exists,
- visual hierarchy,
- filter/navigation only if useful,
- clear conversion CTA.

## Service detail layout

Replace repetitive plain sections with a deliberate composition.

Recommended sequence:

```text
Hero
Overview
Who this is for
Problems / opportunity
Deliverables
Process
Benefits
Timeline
Related industries
Relevant case studies
Relevant insights
FAQ
Final CTA
```

Use the existing fields already fetched.

Visual rules:

- overview can be large editorial text,
- who-for can be structured profiles/list,
- deliverables can use a precise feature grid,
- process gets branded path/timeline,
- benefits should not look identical to deliverables,
- related content uses resource-specific cards.

---

# 21. INDUSTRIES LISTING / DETAIL

Industry pages should feel market-focused.

Detail structure can include:

```text
Hero
Industry overview
Market context
Relevant services
Case studies
Insights
CTA
```

Only render content that exists.

Use visual texture/media to differentiate industry pages from services.

---

# 22. CASE STUDY EXPERIENCE

Case studies are a primary trust mechanism.

## Listing

Use:

- featured case study where suitable,
- filters only if real taxonomy/data supports them,
- strong imagery,
- proof-oriented excerpts.

## Detail

Recommended composition:

```text
Editorial Hero
Context
Challenge
Objectives
Solution
Process
Results
Metrics
Gallery
Services involved
Industries
Final CTA
```

Metrics should be visually prominent.

Gallery must use consistent aspect ratios and responsive media treatment.

Do not use inline image styling.

---

# 23. INSIGHTS / EDITORIAL EXPERIENCE

The Insights area should look like a publication, not a services grid.

## Listing

Support:

- featured article,
- standard article cards,
- date/type,
- editorial spacing,
- search/filter if existing functionality supports it.

## Detail

Use a reading layout with:

```text
Article title
Metadata
Hero media if available
Lead/excerpt
Rich content
Quotes
Images
Tables
Related insights
CTA
```

Reading width must remain controlled.

Tables must be horizontally accessible on mobile.

Links, quotes, lists, headings, and media require complete typography styles.

---

# 24. RICH CONTENT RENDERING

Refactor `RichBlocks`.

Every supported block needs intentional styling.

Examples:

- paragraph,
- heading,
- list,
- quote,
- media,
- panel/callout,
- table,
- link,
- divider if supported.

Do not allow unsupported arbitrary HTML.

Complete styling for existing classes such as:

```text
panel
table-wrap
cell-meta
```

If `RichBlocks` uses a class, that class must be visually complete and responsive.

---

# 25. MEDIA SYSTEM

Use actual CMS media properly.

## Requirements

- Prefer `next/image` where remote configuration/contracts permit.
- If remote image constraints make this impossible without risky config changes, handle explicitly and safely.
- Correct `alt`.
- Stable aspect ratio.
- responsive sizing.
- lazy-load below-the-fold media.
- priority only for true hero/LCP media.
- avoid layout shifts.
- consistent crops.
- preserve source quality.

## Media frame variants

Implement reusable treatments such as:

```text
landscape
portrait
square
editorial
logo
hero
```

These are presentation treatments, not new CMS entities.

## Photography direction

Preferred:

- Saudi business context,
- infrastructure,
- architecture,
- workshops,
- strategy,
- market activity,
- authentic executive/business scenes.

Avoid generic handshake stock.

---

# 26. FORMS / CONVERSION UX

Refactor:

```text
apps/web/components/lead-form.tsx
```

Maintain backend payload behavior.

Do not change lead semantics just for design.

## Form states

Design all:

```text
idle
focus
filled
validation error
server error
rate limited
submitting
success
disabled
```

## Consultation/contact

Use a strong two-column layout on desktop where useful:

```text
Context / trust / response expectation
Form
```

Single column on mobile.

## Assessment

The multi-step assessment needs a real step system.

Complete:

```text
step-progress
step navigation
current step
completed step
back/next
review
submit
success
```

Do not represent progress only through text.

Must remain accessible.

---

# 27. LIGHT / DARK QUALITY BAR

Every major component must be visually reviewed in both modes:

```text
Header
Mega menu
Mobile navigation
Hero
Cards
Media frames
Stats
Process
Timeline
FAQ
Forms
Tables
Footer
CTA
Article
Case study
Empty/error states
```

Do not approve a component if one theme looks like an afterthought.

---

# 28. RTL / LTR QUALITY BAR

Arabic is not simply English with `dir="rtl"`.

Verify:

- heading rhythm,
- line lengths,
- navigation hierarchy,
- arrows,
- breadcrumbs,
- form label alignment,
- icon direction,
- media/text composition,
- timeline/path direction,
- list markers,
- article metadata,
- mobile drawer,
- CTA alignment.

Use logical CSS:

```text
margin-inline
padding-inline
inset-inline
border-inline
text-align: start
```

Avoid unnecessary left/right properties.

---

# 29. ACCESSIBILITY

Target WCAG 2.2 AA behavior.

Required:

- skip link works,
- focus-visible everywhere,
- semantic headings,
- keyboard navigation,
- adequate contrast,
- form labels,
- field error association,
- `aria-live` where needed,
- no interaction dependent only on hover,
- reduced motion,
- usable at zoom,
- mobile tap targets,
- meaningful alt text,
- decorative SVG/media hidden appropriately.

---

# 30. PERFORMANCE

A premium site must remain fast.

Do not solve visual quality by shipping excessive JS.

## Rules

- Server Components by default.
- Client Components only when interaction requires them.
- No heavy carousel library unless justified.
- No heavy animation package unless justified.
- optimize LCP hero.
- minimize layout shift.
- lazy load noncritical media.
- preserve tree shaking.
- no huge client-side CMS renderer.
- no client-side data refetch if server already has data.

Aim to keep the redesign primarily CSS/server-rendered.

---

# 31. SEO / STRUCTURED DATA SAFETY

Re-run through:

```text
apps/web/lib/seo.tsx
apps/web/app/[locale]/[...segments]/page.tsx
apps/web/app/sitemap.ts
apps/web/app/robots.ts
```

Visual changes must not:

- remove H1,
- duplicate H1 unnecessarily,
- break canonical,
- break localized alternate URLs,
- break JSON-LD,
- hide meaningful content from SSR,
- move all content into client-only rendering.

---

# 32. ERROR / EMPTY / LOADING STATES

Redesign shared states.

Current diamond/exclamation visual should become branded but understated.

Need:

```text
404
global error
empty list
API-safe fallback
skeleton/loading where used
form error
form success
```

No Unicode icon dependency.

---

# 33. PAGE-SPECIFIC VISUAL TEMPLATES

Do not make all pages use one generic `PageHero + Grid`.

## Required distinct families

### A. Landing/marketing
Examples:
- Home
- Saudi Market Entry
- How We Work
- About

### B. Listing
Examples:
- Services
- Industries
- Case Studies
- Insights
- Team
- Partners
- Clients
- Brands
- Products

### C. Detail
Examples:
- Service
- Industry
- Case Study
- Insight

### D. Conversion
Examples:
- Contact
- Book Consultation
- Market Entry Assessment

### E. Legal
Examples:
- Privacy
- Terms
- Cookie Policy

Each family should share design logic but not become identical.

---

# 34. VISUAL COMPOSITION RULES

Use variation intentionally.

Across a long page, alternate between:

- wide editorial text,
- split media/text,
- structured grid,
- metrics,
- journey/process,
- featured card,
- trust/logo band,
- inverse CTA.

Avoid:

```text
Section header
3 same cards
Section header
3 same cards
Section header
3 same cards
```

That pattern is a key source of the current generic feel.

---

# 35. MICROINTERACTIONS

Required where appropriate:

- nav underline/indicator,
- card arrow movement,
- subtle media zoom,
- button icon movement,
- accordion transition,
- menu reveal,
- theme icon transition,
- focus feedback.

Do not make interactions feel playful or bouncy.

---

# 36. CONTENT INTEGRITY

Do not alter business claims to improve layout.

Do not create fake:

- client names,
- metrics,
- testimonials,
- case-study results,
- certifications,
- awards,
- market statistics.

If content is absent:

- hide optional block,
- use non-deceptive visual treatment,
- never fabricate proof.

---

# 37. FILE-BY-FILE IMPLEMENTATION TARGET

## Existing files to refactor

```text
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/app/[locale]/layout.tsx
apps/web/app/[locale]/page.tsx
apps/web/app/[locale]/[...segments]/page.tsx

apps/web/components/content.tsx
apps/web/components/header.tsx
apps/web/components/footer.tsx
apps/web/components/lead-form.tsx

packages/ui/src/primitives.tsx
packages/ui/src/theme-toggle.tsx
packages/ui/src/theme.css
packages/ui/src/index.ts
```

## Expected new files

The exact names can vary, but expect creation of structured files under:

```text
apps/web/components/shell/
apps/web/components/brand/
apps/web/components/sections/
apps/web/components/cards/
apps/web/components/editorial/
apps/web/components/forms/
apps/web/styles/
```

## Do not unnecessarily edit

```text
apps/api/**
apps/admin/**
apps/worker/**
prisma/**
packages/api-client/**
packages/contracts/**
```

unless a verified blocking issue requires it.

---

# 38. IMPLEMENTATION PHASES

The agent must execute in the following order.

---

## PASS 1 — FOUNDATION

Implement:

- token expansion,
- typography,
- spacing,
- containers,
- grid,
- radius/shadow,
- theme completeness,
- responsive foundations,
- icon system,
- CSS architecture.

Do not stop to run the full build yet.

Perform only local sanity checks if required to continue coding.

---

## PASS 2 — SHARED PRIMITIVES

Implement/refactor:

- Button,
- IconButton,
- form primitives,
- Card foundation,
- Badge,
- Accordion,
- Dialog/menu primitives if needed,
- ThemeToggle,
- state components.

Do not redesign admin business UI in this pass.

Shared tokens/primitives must remain safe for admin consumers.

---

## PASS 3 — SITE SHELL

Rebuild:

- Header,
- Desktop nav,
- Mega menu where meaningful,
- Locale selector,
- Theme toggle presentation,
- Mobile navigation,
- Footer.

Close responsive and keyboard behavior.

---

## PASS 4 — BRAND COMPONENTS

Build:

```text
GatewayVisual
MarketPath
SectionEyebrow
SectionHeading
MediaFrame
TrustStrip
Metric
```

Only introduce components that are actually used.

Avoid abstract component over-engineering.

---

## PASS 5 — SECTION RENDERERS

Decompose and replace the current monolithic renderer.

Implement all controlled section types.

At the end of this pass, every current CMS section type must render correctly.

---

## PASS 6 — RESOURCE CARDS

Implement distinct cards for:

- service,
- industry,
- case study,
- insight,
- ecosystem,
- people/testimonial where appropriate.

Remove dependence on one generic visual card.

---

## PASS 7 — HOMEPAGE

Implement the complete premium homepage.

This is the primary visual reference for the rest of the project.

It must work:

```text
Desktop Light
Desktop Dark
Mobile Light
Mobile Dark
Arabic RTL
English LTR
```

---

## PASS 8 — LISTING PAGES

Redesign:

- Services,
- Industries,
- Case Studies,
- Insights,
- Team,
- Partners,
- Clients,
- Brands,
- Products/Ventures,
- FAQs if standalone.

Use the current route/data model.

---

## PASS 9 — DETAIL PAGES

Redesign:

- Service detail,
- Industry detail,
- Case Study detail,
- Insight detail.

Use editorial compositions and related-content cards.

---

## PASS 10 — CONVERSION PAGES

Redesign:

- Contact,
- Book Consultation,
- Market Entry Assessment.

Close all form states.

---

## PASS 11 — LEGAL / UTILITY / STATES

Close:

- legal reading pages,
- 404,
- error state,
- empty states,
- loading states,
- responsive tables,
- rich blocks.

---

## PASS 12 — FULL QA / BUILD / FIX

Only after the implementation passes above are substantially complete, run the complete technical verification.

Required order:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm test:e2e
pnpm format:check
```

Also run narrower package commands as needed when debugging.

Fix all regressions caused by this rebuild.

Do not weaken tests to obtain a pass.

---

# 39. WORKING STYLE — TOKEN EFFICIENCY

The owner explicitly wants implementation tokens spent on actual code before repetitive build cycles.

Therefore:

1. Inspect.
2. Implement the complete coherent pass.
3. Continue through the visual rebuild.
4. Only use narrow checks when a compiler/API uncertainty blocks progress.
5. Run the full build/test suite after implementation is materially complete.
6. Fix all failures.
7. Re-run final gates.

Do **not** run expensive full builds after every CSS/component edit.

---

# 40. NO-DESTRUCTIVE-GIT RULES

Unless explicitly instructed by the owner:

Do not:

```text
push
merge
rebase
force push
reset --hard
delete unrelated files
rewrite unrelated history
```

Do not discard existing user changes.

Stage only relevant files if staging is required.

---

# 41. VISUAL QA MATRIX

At minimum manually/automatically inspect these states.

## Homepage

```text
EN LTR — Light — 1440
EN LTR — Dark  — 1440
AR RTL — Light — 1440
AR RTL — Dark  — 1440

EN LTR — Light — 390
EN LTR — Dark  — 390
AR RTL — Light — 390
AR RTL — Dark  — 390
```

## Required representative pages

Also inspect:

```text
Services listing
Service detail
Industries listing
Industry detail
Case Studies listing
Case Study detail
Insights listing
Insight detail
Contact
Book Consultation
Assessment
Legal page
404
```

At least desktop + mobile, and at least one Arabic/one English pass per family.

---

# 42. VISUAL ACCEPTANCE GATES

The rebuild is not complete if any of these are true:

- Homepage still looks like a generic template.
- All cards still look nearly identical.
- Hero still relies on the old primitive rectangle portal.
- Service detail is still a plain stack of headings and paragraphs.
- Insights still look like services.
- Case studies do not emphasize outcomes/proof.
- CMS images remain mostly unused.
- Mobile navigation feels like a developer dropdown.
- Arabic appears visually secondary to English.
- Light theme appears as simple inverse colors.
- There are visible unstyled classes.
- Unicode characters are still used as core UI icons.
- Inline layout styles remain where a reusable class/component should exist.
- only 2 responsive breakpoints effectively control the entire website.
- long pages consist mainly of repetitive three-card grids.
- the new design requires fabricated content.

---

# 43. TECHNICAL ACCEPTANCE GATES

All must pass:

```text
TypeScript
ESLint
Next production build
Unit/integration tests
E2E tests
Formatting check
Existing SEO behavior
Existing analytics behavior
Existing locale routes
Existing theme persistence
Existing lead submission behavior
Existing CMS-driven content
```

No new console/runtime errors.

---

# 44. ACCESSIBILITY ACCEPTANCE GATES

Verify:

- keyboard-accessible desktop navigation,
- keyboard-accessible mobile navigation,
- focus trapping for modal/drawer if used,
- Escape closes menus/drawers,
- focus-visible for all interactive items,
- theme toggle has accessible label,
- language selector is accessible,
- form validation is announced,
- FAQ controls are accessible,
- no low-contrast text in both themes,
- reduced motion is honored,
- images have correct alt behavior,
- logical tab order.

---

# 45. PERFORMANCE ACCEPTANCE GATES

The redesign must not become a JS-heavy application.

Check:

- no unnecessary `"use client"` on static sections,
- hero LCP is optimized,
- no avoidable layout shift,
- below-fold images lazy-load,
- no giant icon bundle,
- no giant animation dependency,
- no unnecessary client fetching,
- no hydration mismatch introduced by theme/navigation changes.

---

# 46. CMS COMPATIBILITY GATE

All existing controlled section types must still be editable through the current CMS/admin flow.

The public frontend must continue consuming the same source of truth.

Do not require content editors to know frontend CSS classes.

Do not store raw presentation markup inside CMS content.

---

# 47. DESIGN SYSTEM DOCUMENT UPDATE

After implementation stabilizes, update:

```text
gatevia-docs/2-core/13_BRAND_DESIGN_SYSTEM.md
gatevia-docs/3-technical/17_FRONTEND_IMPLEMENTATION_CONTRACT.md
```

only where the implementation has introduced a now-approved concrete convention.

Examples:

- finalized token names,
- chosen font pair,
- responsive rules,
- component conventions,
- icon family,
- approved Gateway visual grammar.

Do not change product requirements silently.

---

# 48. REQUIRED FINAL AGENT REPORT

At completion, return a concise closure report with this exact structure:

```markdown
# GATEVIA WEB PREMIUM DESIGN REBUILD — FINAL REPORT

STATUS: PASS / PARTIAL / FAIL

## 1. Baseline
- Branch:
- Starting SHA:
- Final SHA:
- Tree status:

## 2. Architecture
- Backend changed: Yes/No
- Prisma changed: Yes/No
- API contract changed: Yes/No
- CMS contract changed: Yes/No
- Public routes changed: Yes/No

## 3. Visual System
- Light mode:
- Dark mode:
- Arabic RTL:
- English LTR:
- Typography:
- Tokens:
- Icons:
- Motion:
- Responsive system:

## 4. Shell
- Header:
- Desktop nav:
- Mobile nav:
- Language:
- Theme toggle:
- Footer:

## 5. Section Renderers
- hero:
- rich_text:
- text_image:
- stats:
- services_grid:
- industries_grid:
- process:
- timeline:
- testimonials:
- case_studies:
- logo_cloud:
- faq:
- cta:
- insights:
- ecosystem:
- form:

## 6. Resource Experiences
- Homepage:
- Services:
- Industries:
- Case Studies:
- Insights:
- About/Company:
- Ecosystem:
- Contact:
- Consultation:
- Assessment:

## 7. Media
- CMS media integrated:
- next/image / image strategy:
- LCP treatment:
- lazy loading:
- alt text:

## 8. Accessibility
- Keyboard:
- Focus:
- Contrast:
- Reduced motion:
- Forms:
- Navigation:

## 9. Verification
Commands actually executed:
- ...
Results:
- typecheck:
- lint:
- build:
- test:
- e2e:
- format:

## 10. Files
- Created:
- Modified:
- Deleted:

## 11. Confirmed remaining issues
Only list real unresolved blockers or important non-blocking items.
Do not invent future work merely to avoid closure.

## 12. Final verdict
State whether the premium public web redesign is production-ready.
```

---

# 49. DEFINITION OF DONE

This task is CLOSED only when:

- the public website has a coherent bespoke visual identity,
- homepage establishes a strong premium design direction,
- all primary page families inherit that direction,
- every controlled CMS section has intentional styling,
- resource cards are distinct,
- CMS media is actually used where available,
- header/mobile/footer are production grade,
- Light and Dark are both polished,
- Arabic and English are both polished,
- responsive behavior is deliberate,
- forms are professional,
- accessibility is complete enough for production,
- no backend/CMS contract has been casually broken,
- build and tests pass,
- there are no known critical visual/runtime regressions.

---

# 50. FINAL DESIGN STANDARD

The question at the end is not:

> “Does the website work?”

It already largely works.

The question is:

> “Does this look and behave like a premium, high-confidence company capable of guiding an international business into the Saudi market?”

If the answer is not an immediate **yes**, the visual rebuild is not finished.

The final web experience must move GATEVIA from:

> **Functional Corporate MVP**

to:

> **Distinctive Premium Market-Entry Brand Experience**

while preserving the strong technical foundation already present.
