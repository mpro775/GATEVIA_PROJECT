# GATEVIA — Definition of Done
**Document ID:** GTV-DOD-001  
**Version:** v0.4  
**Status:** Final Closure Contract

---

## 1. Meaning of Done

“Done” means production-ready according to approved V1 scope.

It does **not** mean:
- code exists.
- build passes.
- pages visually look complete.
- happy-path demo works.

---

# 2. Repository

- [ ] Monorepo structure matches architecture.
- [ ] Lockfile committed.
- [ ] no secrets committed.
- [ ] README/runbook available.
- [ ] env example documented.
- [ ] code formatted.
- [ ] lint clean.
- [ ] typecheck clean.
- [ ] builds clean.

---

# 3. Database

- [ ] schema matches contract or approved deviations.
- [ ] all migrations committed.
- [ ] fresh migration passes.
- [ ] staging/production migration path passes.
- [ ] seed idempotent.
- [ ] constraints/indexes present.
- [ ] no destructive pending migration.
- [ ] migration head recorded.

---

# 4. Authentication & RBAC

- [ ] login/logout.
- [ ] password reset.
- [ ] session expiration/revocation.
- [ ] roles seeded.
- [ ] permissions seeded.
- [ ] permission matrix tested.
- [ ] API guards active.
- [ ] frontend route/action guards aligned.
- [ ] no default insecure admin credential.

---

# 5. Multilingual

- [ ] dynamic languages.
- [ ] Arabic/English launch locales configured if approved.
- [ ] third-language test proves extensibility.
- [ ] RTL.
- [ ] LTR.
- [ ] localized slugs.
- [ ] translation completeness UI.
- [ ] fallback policy implemented.
- [ ] localized SEO.
- [ ] hreflang.

---

# 6. CMS

- [ ] Pages.
- [ ] Page Sections.
- [ ] Services.
- [ ] Service Categories.
- [ ] Industries.
- [ ] Case Studies.
- [ ] Insights.
- [ ] FAQ.
- [ ] Team.
- [ ] Navigation.
- [ ] Global Settings.
- [ ] publish/archive/preview.
- [ ] controlled section schemas.
- [ ] no arbitrary unsafe page builder.

---

# 7. Trust & Ecosystem

- [ ] Clients.
- [ ] Partners.
- [ ] Brands.
- [ ] Products/Ventures.
- [ ] Testimonials.
- [ ] Certifications.
- [ ] Trust Metrics.
- [ ] relationship types are not mixed.
- [ ] no unapproved claims/data.

---

# 8. Media

- [ ] R2/S3 configured.
- [ ] presigned upload.
- [ ] folders.
- [ ] media picker.
- [ ] metadata.
- [ ] translations.
- [ ] image variants.
- [ ] upload restrictions.
- [ ] usage references.
- [ ] safe delete.
- [ ] failed processing visible/recoverable.

---

# 9. CRM / Forms

- [ ] Contact.
- [ ] Consultation.
- [ ] Assessment.
- [ ] lead created.
- [ ] status.
- [ ] assignment.
- [ ] notes.
- [ ] activity.
- [ ] UTM.
- [ ] idempotency.
- [ ] anti-spam/rate-limit.
- [ ] email job failure does not lose lead.
- [ ] privacy notice approved.

---

# 10. Admin

- [ ] Dashboard.
- [ ] content navigation.
- [ ] trust navigation.
- [ ] sales navigation.
- [ ] media.
- [ ] website settings.
- [ ] users/roles.
- [ ] audit.
- [ ] server pagination.
- [ ] usable filters.
- [ ] empty/error states.
- [ ] role-specific UX.

---

# 11. Public Website

- [ ] Home.
- [ ] Saudi Market Entry.
- [ ] Services listing/detail.
- [ ] Industries listing/detail.
- [ ] How We Work.
- [ ] Case Studies listing/detail.
- [ ] Insights listing/detail.
- [ ] Ecosystem.
- [ ] About.
- [ ] Team.
- [ ] Partners/Clients presentation.
- [ ] FAQ.
- [ ] Contact.
- [ ] Consultation.
- [ ] Assessment.
- [ ] legal pages.
- [ ] 404/error state.
- [ ] responsive.

Only approved/available sections must be shown; empty optional sections remain hidden.

---

# 12. Brand / UX

- [ ] semantic design tokens.
- [ ] Light Mode complete on public website.
- [ ] Dark Mode complete on public website.
- [ ] Light Mode complete on admin.
- [ ] Dark Mode complete on admin.
- [ ] Theme Toggle present on public Desktop Header.
- [ ] Theme Toggle present on public Mobile Navigation.
- [ ] Theme Toggle present on Admin App Shell.
- [ ] explicit theme preference persists across reload/routes/locales.
- [ ] first visit respects `prefers-color-scheme` with Dark fallback.
- [ ] no material wrong-theme flash / FOUC.
- [ ] no theme-related hydration mismatch.
- [ ] all core components/states reviewed in both themes.
- [ ] contrast/focus reviewed in both themes.
- [ ] no automatic inversion of customer/partner logos.
- [ ] approved brand colors.
- [ ] approved fonts.
- [ ] RTL reference screens.
- [ ] LTR reference screens.
- [ ] mobile home approved.
- [ ] service detail approved.
- [ ] no generic template remnants.
- [ ] reduced-motion support.

---

# 13. SEO

- [ ] titles/descriptions.
- [ ] canonical.
- [ ] hreflang.
- [ ] sitemap.
- [ ] robots.
- [ ] OG.
- [ ] Organization schema.
- [ ] Service schema where applicable.
- [ ] Article schema.
- [ ] FAQ schema when content qualifies.
- [ ] Breadcrumb schema.
- [ ] preview/admin noindex.

---

# 14. Analytics

- [ ] GA4 configured if approved.
- [ ] GTM configured if approved.
- [ ] conversion events.
- [ ] no PII sent.
- [ ] UTM continuity.

---

# 15. Security

- [ ] HTTPS.
- [ ] secure cookies.
- [ ] CSRF strategy.
- [ ] CORS allowlist.
- [ ] security headers.
- [ ] CSP.
- [ ] rate limiting.
- [ ] upload validation.
- [ ] XSS sanitization.
- [ ] no stack traces.
- [ ] secret scan clean.
- [ ] infra access protected.
- [ ] export permission tested.

---

# 16. Quality

- [ ] unit tests.
- [ ] integration tests.
- [ ] E2E critical flows.
- [ ] multilingual QA.
- [ ] accessibility QA in Light/Dark.
- [ ] theme behavior QA.
- [ ] responsive QA in Light/Dark.
- [ ] browser QA.
- [ ] SEO QA.
- [ ] no P0/P1 defects.

---

# 17. Performance

- [ ] optimized images.
- [ ] no excessive client JS.
- [ ] fonts optimized.
- [ ] third-party scripts controlled.
- [ ] reference-page Lighthouse reviewed.
- [ ] no major layout shift issue.
- [ ] theme switching causes no material layout shift or full-page reload.

---

# 18. Observability

- [ ] Sentry/error monitoring.
- [ ] structured logs.
- [ ] request IDs.
- [ ] health endpoints.
- [ ] worker/job monitoring.
- [ ] email failures observable.
- [ ] PII log redaction.

---

# 19. Infrastructure

- [ ] staging.
- [ ] production.
- [ ] DB persistence.
- [ ] Redis private.
- [ ] R2 buckets.
- [ ] email provider.
- [ ] DNS.
- [ ] TLS.
- [ ] backups.
- [ ] restore procedure.
- [ ] immutable deployment image/tag.
- [ ] rollback documented.

---

# 20. Content & Client Approval

- [ ] official company copy approved.
- [ ] services approved.
- [ ] industries approved.
- [ ] trust logos approved.
- [ ] brands/products approved.
- [ ] testimonials approved.
- [ ] case studies approved.
- [ ] contact data approved.
- [ ] legal pages supplied/approved.
- [ ] launch languages approved.

---

# 21. Handover

- [ ] admin accounts transferred securely.
- [ ] admin usage guide.
- [ ] deployment/runbook.
- [ ] backup/restore notes.
- [ ] environment inventory.
- [ ] provider ownership/access documented.
- [ ] known limitations documented.
- [ ] future-scope list documented.

---

# 22. Final Release Evidence

Final closure report must contain:
```text
Branch:
Final SHA:
Release tag:
Migration head:
OpenAPI artifact/version:
Production URLs:
Deployment timestamp:

Lint:
Format:
Typecheck:
Build:
Unit:
Integration:
E2E:
Security checks:
UAT:

Open defects:
Approved deviations:
Future scope:
```

---

# 23. Final Closure Rule

Project status can be marked:

```text
GATEVIA V1 — PRODUCTION CLOSED
```

only when:
- all mandatory DoD items are satisfied,
- client UAT is accepted,
- no P0/P1 defect remains,
- production backup/monitoring are active,
- all unimplemented items are explicitly recorded as future scope.
