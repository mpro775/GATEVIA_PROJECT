# GATEVIA — Seed & Initial Data Contract
**Document ID:** GTV-SEED-001  
**Version:** v0.3 Draft  
**Status:** Technical / Content Initialization Contract

---

## 1. Goal

تمييز:
1. **System Seed** — مطلوب لكي يعمل النظام.
2. **Business Seed** — محتوى أولي معتمد من العميل.
3. **Demo/Test Data** — ممنوع في production.

---

# 2. Seed Rules

- Seeds are idempotent.
- Running seed twice must not create duplicates.
- Production seed must never reset tables.
- No plaintext production passwords in code.
- No fake client/partner/testimonial/case-study data in production.
- Seed keys are stable.
- Use upsert for controlled system catalogs.

---

# 3. System Seed — Languages

Initial proposal:
```text
ar-SA
en
```

Fields:
- code.
- native name.
- direction.
- active.
- default.

Default locale requires client approval before production.

---

# 4. System Seed — Roles

```text
super_admin
content_manager
marketing
sales
viewer
```

---

# 5. System Seed — Permissions

Namespaces:

```text
dashboard.read

pages.read
pages.create
pages.update
pages.publish
pages.archive

services.read
services.create
services.update
services.publish
services.archive

industries.*
case_studies.*
insights.*
faqs.*
team.*

clients.*
partners.*
brands.*
products.*
testimonials.*
certifications.*
trust_metrics.*

media.read
media.upload
media.update
media.archive
media.delete_permanent

leads.read
leads.update_status
leads.assign
leads.note
leads.export

languages.read
languages.manage
navigation.read
navigation.manage
redirects.read
redirects.manage
settings.read
settings.manage

users.read
users.manage
roles.read
roles.manage
audit.read
```

Implementation should expand wildcard documentation into explicit permission rows.

---

# 6. Role Grants

### Super Admin
All permissions.

### Content Manager
CMS + media, not users/roles/leads export by default.

### Marketing
Content read/update/publish according to policy, SEO/navigation, analytics config limited.

### Sales
Lead read/update/assign/note; content read.

### Viewer
Read-only approved admin areas.

Final grant matrix must be generated in seed code and tested.

---

# 7. Service Category Seed

Proposed business seed:
```text
market-access
execution
growth
```

Names/translations only after client approval.

---

# 8. Navigation Seed

Create empty/structured menus:
```text
main
footer-services
footer-company
footer-resources
footer-legal
```

Business links are seeded only if target pages exist/are approved.

---

# 9. Global Settings Seed

Create typed defaults:
```text
company.name
company.legal_name
company.logo_media_id
contact.email
contact.phone
contact.address
social.linkedin
seo.default_title
seo.default_description
seo.default_og_media_id
analytics.ga4_id
analytics.gtm_id
forms.notification_recipients
```

Secrets are not stored here.

---

# 10. Lead Status Seed

If represented as lookup table:
```text
new
contacted
qualified
proposal
won
lost
```

If represented as enum, no DB seed needed.

---

# 11. Admin Bootstrap

Production Super Admin is created via secure one-time command or environment-driven bootstrap:

Example behavior:
```text
ADMIN_BOOTSTRAP_EMAIL
```

Password:
- prompted interactively or generated one-time.
- never committed.
- force password change if generated.

Do not create `admin@example.com/admin123`.

---

# 12. Business Content Seed

Allowed only from approved content package:
- Home page.
- About.
- Saudi Market Entry.
- Services.
- Industries.
- FAQ.
- Team.
- Legal pages.
- approved clients/partners/brands/products.
- approved case studies.

Each content seed has stable external key/source key.

---

# 13. Media Seed

Do not hardcode local developer paths.

For initial brand media:
- import through controlled bootstrap/import command.
- create media records after R2 upload.
- store source manifest with checksums if automated.

---

# 14. Demo Data

Separate command:
```text
seed:demo
```

Never executed in production.

Demo records clearly marked.

---

# 15. Seed Acceptance

Production seed execution must report:
- system rows created/updated.
- business rows created/updated.
- skipped unapproved datasets.
- no destructive changes.
