# GATEVIA — Testing & Acceptance Plan
**Document ID:** GTV-QA-001  
**Version:** v0.4 Draft  
**Status:** Quality Contract

---

## 1. Goal

إثبات أن النظام يعمل وظيفيًا وتقنيًا، وليس فقط أن `build` ينجح.

---

# 2. Test Layers

## Unit
For:
- permission decisions.
- slug normalization.
- translation completeness.
- lead status transitions.
- media validation.
- UTM parsing.
- schema validation.

## Integration
For:
- API + PostgreSQL.
- auth/session.
- RBAC.
- migrations.
- form submission.
- lead persistence.
- media finalize.
- publish flows.

## E2E
Playwright:
- public website.
- admin.
- locale routing.
- forms.
- CMS publish.
- media.
- leads.

---

# 3. Static Quality Gates

Required:
```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```

Also:
- Prisma validate.
- OpenAPI generation.
- generated client drift check.

---

# 4. Database Tests

Verify:
- fresh migration from empty DB.
- production migration path from previous head.
- seed idempotency.
- unique localized slug.
- FK restrictions.
- translation uniqueness.
- role/permission grants.

---

# 5. Auth / RBAC Matrix

Test users:
- Super Admin.
- Content Manager.
- Marketing.
- Sales.
- Viewer.

Examples:
- Viewer cannot publish.
- Sales cannot edit pages.
- Content Manager cannot manage roles.
- unauthorized API returns 401/403 correctly.
- UI and API permission behavior align.

---

# 6. Multilingual Acceptance

Manual + automated:
- add third language.
- activate it.
- edit translation.
- localized route resolves.
- RTL/LTR correct.
- switcher moves to equivalent translation.
- missing translation follows policy.
- localized slug uniqueness works.
- hreflang correct.
- sitemap includes published translations only.

---

# 7. CMS Acceptance

For each core content type:
1. create draft.
2. add translations.
3. attach media.
4. preview.
5. publish.
6. public page appears.
7. edit.
8. revalidation occurs.
9. archive.
10. public page disappears/redirects as expected.

---

# 8. Media Acceptance

- upload image.
- upload multiple.
- reject oversized/disallowed type.
- finalize.
- variants generated.
- picker selects media.
- alt text localized.
- usages shown.
- delete referenced media blocked/warned.
- archive behavior correct.

---

# 9. Lead Acceptance

Contact:
- valid submission creates one lead.
- invalid fields return 422.
- rate limit works.
- idempotency prevents duplicate.
- UTM saved.
- email failure does not remove lead.

Consultation:
- source correct.
- service/timeline stored.

Assessment:
- multi-step UX.
- answers stored.
- linked lead exists.
- Admin renders answers human-readably.

---

# 10. Admin Acceptance

- dashboard loads.
- tables paginate server-side.
- filters persist appropriately.
- locale editor clear.
- publish confirmation works.
- audit log records sensitive actions.
- lead assignment/status works.
- export permission if enabled.

---

# 11. SEO Acceptance

Check representative:
- Home.
- Service.
- Industry.
- Case Study.
- Insight.

Verify:
- title.
- description.
- canonical.
- hreflang.
- Open Graph.
- structured data.
- sitemap.
- robots.
- noindex for preview/admin.

---

# 12. Accessibility Acceptance

Automated:
- axe/Playwright critical routes.

Manual:
- keyboard header/menu.
- form navigation.
- focus visibility in both Light and Dark.
- contrast checked in both Light and Dark.
- modal focus.
- screen-reader-friendly labels.
- RTL semantics.

No critical/serious accessibility violations on reference flows.

---

# 13. Responsive Acceptance

Widths:
- small mobile.
- large mobile.
- tablet.
- laptop.
- desktop.

Reference pages:
- Home.
- Service.
- Insight.
- Contact.
- Assessment.
- Admin Lead detail.

---

# 14. Theme Acceptance

Automated + manual:
- `apps/web` supports Light and Dark.
- `apps/admin` supports Light and Dark.
- public Desktop Header exposes Theme Toggle.
- public Mobile Navigation exposes Theme Toggle.
- admin App Shell exposes Theme Toggle.
- first visit with no saved preference follows `prefers-color-scheme`; dark fallback works.
- explicit selection persists after reload.
- explicit selection persists across locale switches and route navigation.
- persisted user selection overrides a later OS theme change.
- switching does not trigger full page reload.
- no obvious wrong-theme flash / FOUC on cold load.
- no theme-related hydration mismatch or console error.
- browser/native controls use appropriate `color-scheme`.
- focus, hover, active, disabled, validation, loading, empty and error states are readable in both modes.
- representative charts/tooltips are readable in both modes if charts exist.
- customer/partner logos are not distorted by automatic inversion.

Reference matrix must cover both themes for:
- Home.
- Service Detail.
- Insight Detail.
- Contact / Form states.
- Assessment.
- Admin Lead Detail.
- Admin Content Form.
- Arabic RTL.
- English LTR.

Theme is a **release-blocking acceptance area**, not a cosmetic follow-up.

---

# 15. Browser Acceptance

Latest stable:
- Chrome.
- Edge.
- Firefox.
- Safari.

Mobile:
- iOS Safari.
- Android Chrome.

---

# 16. Security Acceptance

- auth brute-force throttled.
- CSRF strategy verified.
- RBAC negative tests.
- XSS content sanitized.
- upload attacks rejected.
- secrets not bundled.
- stack traces hidden.
- headers reviewed.
- CORS allowlist.
- export permission.

---

# 17. Performance Acceptance

Reference public pages:
- Home.
- Service detail.
- Insight detail.

Goals:
- optimized images.
- no obvious layout shift.
- no unnecessary admin code.
- acceptable Lighthouse/Core Web Vitals on staging/production-like network.

Suggested CI target (not absolute business SLA):
- Accessibility ≥ 90.
- SEO ≥ 95.
- Best Practices ≥ 90.
- Performance target ≥ 85 mobile on reference pages.

Any environment-caused variance must be documented.

---

# 18. Deployment Acceptance

Staging:
- migrations.
- seed.
- health.
- smoke.
- E2E critical path.

Production:
- backup confirmed.
- deploy.
- migration head checked.
- health green.
- home/locale/admin login/form smoke.
- Sentry monitoring.

---

# 19. UAT Checklist

Client reviews:
- [ ] Home content.
- [ ] Arabic.
- [ ] English.
- [ ] services.
- [ ] industries.
- [ ] trust logos.
- [ ] brands/products.
- [ ] case studies.
- [ ] forms.
- [ ] contact details.
- [ ] legal pages.
- [ ] SEO snippets.
- [ ] mobile behavior.
- [ ] Light Mode visual approval.
- [ ] Dark Mode visual approval.
- [ ] Theme Toggle and persistence.

---

# 20. Release Blockers

Release blocked by:
- migration failure.
- auth/RBAC critical bug.
- data-loss risk.
- broken lead forms.
- broken primary locale.
- Light or Dark mode missing/broken on reference flows.
- theme preference not persistent or causes material FOUC/hydration errors.
- critical XSS/auth issue.
- production secrets exposed.
- public trust claims unapproved.
- backup unavailable.
