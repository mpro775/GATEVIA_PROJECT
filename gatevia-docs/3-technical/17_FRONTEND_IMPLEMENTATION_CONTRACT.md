# GATEVIA — Frontend Implementation Contract
**Document ID:** GTV-FE-001  
**Version:** v0.4 Draft  
**Status:** Technical Contract

---

## 1. Applications

Two Next.js applications:

```text
apps/web
apps/admin
```

Both use:
- TypeScript strict mode.
- App Router.
- shared `packages/ui`.
- shared design tokens.
- generated `packages/api-client`.

---

# 2. Public Web Responsibilities

- render public CMS content.
- localized routing.
- SEO metadata.
- structured data.
- forms UI.
- responsive design.
- accessibility.
- analytics events.
- no business writes except through API.

---

# 3. Admin Responsibilities

- content CRUD UX.
- translation editing.
- media management.
- lead operations.
- user/role management.
- settings.
- audit viewing according to permissions.

API remains final authority.

---

# 4. Routing

Public:
```text
app/[locale]/
app/[locale]/services/
app/[locale]/services/[slug]/
...
```

Utility:
```text
app/sitemap.xml
app/robots.txt
```

Admin:
```text
/login
/content/pages
/content/services
/trust/clients
/sales/leads
/media
/website/languages
/system/users
...
```

---

# 5. i18n

- UI translations stored in locale dictionaries.
- CMS translations fetched from API.
- locale validated against active language list.
- RTL/LTR set on document root.
- logical CSS properties used.

No hardcoded business-language pairs.

---

# 6. Rendering Strategy

### Server Components by default
Use for:
- page content.
- services.
- industries.
- case studies.
- insights.
- trust sections.

### Client Components only for:
- interactive navigation.
- forms.
- carousels if needed.
- tabs/filter UI.
- multi-step assessment.
- admin interactive tables/forms.

---

# 7. Caching / Revalidation

Public published data:
- cacheable.
- revalidated by time or explicit publish invalidation.

Draft previews:
- no public cache.
- authenticated preview token/session.

Lead forms:
- no caching.

Admin:
- no stale caching of write-sensitive views.

---

# 8. API Client

Do not hand-write duplicate TypeScript response types if generated OpenAPI types exist.

`packages/api-client`:
- generated types.
- request wrappers.
- standardized error conversion.

---

# 9. Forms

Recommended:
- React Hook Form.
- Zod.
- server/API validation remains authoritative.

States:
- idle.
- submitting.
- success.
- validation error.
- server error.
- rate-limited.

All messages localized.

---

# 10. Design System

`packages/ui` contains primitives, not business content.

Suggested primitives:
- ThemeToggle.
- Button.
- Input.
- Select.
- Textarea.
- Checkbox.
- Radio.
- Dialog.
- Dropdown.
- Tabs.
- Accordion.
- Toast.
- Card.
- Badge.
- Pagination.
- Skeleton.

Use accessible primitive library only where it adds value.

Do not import a generic visual theme that overrides GATEVIA brand.

---

# 11. Styling & Theme Architecture

- Tailwind CSS + CSS custom properties/design tokens.
- **Light Mode and Dark Mode are both mandatory in `apps/web` and `apps/admin`.**
- semantic color tokens must keep the same names while values change by active theme.
- tokenized colors and spacing.
- no scattered brand hex values.
- no dark-only component implementations.
- intentional dark/light section variants may still exist inside either theme when design requires them.
- responsive utilities.
- logical direction-aware CSS.

Recommended root contract:
```html
<html data-theme="light">
<html data-theme="dark">
```
Equivalent class-based implementation is allowed if behavior is identical.

Required behavior:
- explicit UI toggle: `light <-> dark`.
- public toggle in Desktop Header and Mobile Navigation.
- admin toggle in the main App Shell controls.
- persisted explicit preference in a server-readable cookie (recommended name: `gatevia_theme`).
- on first visit with no preference: initialize from `prefers-color-scheme`; fallback to `dark`.
- persisted preference has priority over system preference.
- switching themes must not reload the page.
- preserve the active theme during locale changes and route navigation.
- apply `color-scheme` so native controls align with the active theme.

SSR / hydration requirements:
- the first meaningful paint should use the correct theme whenever the preference is known.
- no visible wrong-theme flash / FOUC.
- no hydration mismatch caused by theme resolution.
- `localStorage` may be supplemental, but localStorage-only post-hydration resolution is not acceptable if it causes flash.
- `suppressHydrationWarning` must not be used as the sole fix for an incorrect theme architecture.

Theme tokens must cover at minimum:
- canvas/surface/elevated/inverse backgrounds.
- primary/secondary/muted/inverse text.
- borders/dividers.
- accent + accent foreground/hover.
- focus ring.
- success/warning/danger/info.
- shadows.
- form controls.
- overlays/backdrops.
- charts/tooltips when used.

Asset behavior:
- use approved light/dark asset variants when required.
- never apply automatic inversion to client/partner logos.
- theme adaptation must not destroy photography or branded media.

---

# 12. Motion

Default:
- CSS transitions.

Use Motion library only for interactions that genuinely need it.

Must respect:
```css
prefers-reduced-motion
```

---

# 13. Images

- use Next.js image optimization where compatible.
- use R2/CDN URLs.
- responsive sizes.
- no original 4000px image in small cards.
- alt text from localized media/CMS.
- decorative images use empty alt.

---

# 14. Rich Content

Renderer supports approved blocks only:
- paragraphs.
- headings.
- lists.
- links.
- quotes.
- images.
- callouts.
- tables if approved.
- embeds from approved providers.

Sanitize untrusted content.

---

# 15. SEO

Each public route must provide:
- title.
- description.
- canonical.
- alternates/hreflang.
- Open Graph.
- robots.
- JSON-LD where applicable.

No index for:
- preview.
- admin.
- internal utility routes.

---

# 16. Structured Data

Components/builders:
- Organization.
- Service.
- Article.
- FAQPage.
- BreadcrumbList.

Structured data uses actual CMS values, not hardcoded claims.

---

# 17. Analytics

Events:
```text
cta_click
contact_submit
consultation_submit
assessment_start
assessment_complete
report_download
language_switch
theme_switch
```

Do not send sensitive form fields to analytics.

---

# 18. Accessibility

Required:
- semantic headings.
- skip link.
- keyboard navigation.
- focus visible.
- form labels.
- field error association.
- dialog focus management.
- sufficient contrast in both Light and Dark modes.
- theme toggle exposes accessible name and state.
- reduced motion.

---

# 19. Error Boundaries

Public:
- friendly 404.
- controlled server-error page.
- retry where meaningful.

Admin:
- actionable errors.
- request ID surfaced if useful.
- no raw stack trace.

---

# 20. Loading States

Use:
- server streaming/skeleton sparingly.
- table loading state.
- upload progress.
- form submitting state.

Avoid layout shifts.

---

# 21. Admin Tables

- server pagination.
- URL-synced filters where useful.
- sortable allowlisted columns.
- empty states.
- bulk actions only when safe.

---

# 22. Admin Translation Editor

Must show:
- locale tabs.
- completeness badge.
- missing-field indicators.
- unique slug validation.
- preview link if published.

---

# 23. Media Picker

Single shared component used across modules:
- browse.
- search.
- filter.
- select.
- upload.
- alt text preview.

---

# 24. Frontend Security

- never store secrets in browser.
- no auth token in localStorage.
- external links with safe rel where appropriate.
- sanitize rich content.
- no unsafe arbitrary iframe.
- CSP-compatible implementation.

---

# 25. Browser Support

Modern:
- Chrome.
- Edge.
- Firefox.
- Safari.
- iOS Safari.
- Android Chrome.

No IE support.

---

# 26. Performance Rules

- avoid unnecessary client JS.
- dynamic import heavy optional components.
- optimize fonts.
- avoid layout-shifting media.
- third-party scripts via controlled loading.
- do not load admin libraries into public bundle.

---

# 27. Frontend Quality Gates

Per app:
```text
lint
typecheck
build
unit/component tests where applicable
Playwright critical flows
```

Public web additionally:
- basic accessibility scan in Light and Dark.
- theme persistence / no-flash smoke check.
- no broken canonical/hreflang in key routes.

Both apps additionally:
- Light/Dark toggle smoke test.
- no theme-driven hydration mismatch in browser console.
- representative component states visually verified in both themes.
