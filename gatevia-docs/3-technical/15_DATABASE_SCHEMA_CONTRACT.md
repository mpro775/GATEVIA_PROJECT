# GATEVIA — Database Schema Contract
**Document ID:** GTV-DB-001  
**Version:** v0.3 Draft  
**Status:** Technical Contract  
**Database:** PostgreSQL  
**ORM:** Prisma

---

## 1. قواعد عامة

- Primary keys: UUID.
- All timestamps stored in UTC.
- `created_at`, `updated_at` on mutable entities.
- Soft/archive behavior for published business content.
- Foreign keys required.
- Cascades are explicit; no accidental cascading delete.
- Translated content uses translation tables.
- Slugs are unique per locale within their entity type.
- Emails normalized to lowercase for uniqueness/search.
- DB constraints protect invariants; application validation alone is not sufficient.

---

# 2. Identity & Access

## `users`
```text
id UUID PK
email CITEXT/normalized varchar UNIQUE NOT NULL
password_hash text NOT NULL
display_name varchar NOT NULL
status enum(active, suspended, invited)
last_login_at timestamptz NULL
created_at
updated_at
```

## `roles`
```text
id UUID PK
key varchar UNIQUE NOT NULL
name varchar NOT NULL
is_system boolean default false
created_at
updated_at
```

## `permissions`
```text
id UUID PK
key varchar UNIQUE NOT NULL
description text NULL
```

## `user_roles`
```text
user_id FK users
role_id FK roles
PRIMARY KEY(user_id, role_id)
```

## `role_permissions`
```text
role_id FK roles
permission_id FK permissions
PRIMARY KEY(role_id, permission_id)
```

## `auth_sessions`
```text
id UUID PK
user_id FK users
refresh_token_hash text NOT NULL
user_agent text NULL
ip_hash/text NULL
expires_at timestamptz NOT NULL
revoked_at timestamptz NULL
created_at
```

## `password_reset_tokens`
```text
id UUID PK
user_id FK users
token_hash text UNIQUE NOT NULL
expires_at
used_at NULL
created_at
```

---

# 3. Localization

## `languages`
```text
id UUID PK
code varchar UNIQUE NOT NULL         # ar-SA, en
name varchar NOT NULL
native_name varchar NOT NULL
direction enum(rtl,ltr) NOT NULL
is_active boolean default true
is_default boolean default false
sort_order integer default 0
created_at
updated_at
```

### Constraint
Only one active default language.  
Implement through transaction/application invariant plus partial unique index if migration tooling permits.

---

# 4. Media

## `media_folders`
```text
id UUID PK
parent_id UUID FK media_folders NULL
name varchar NOT NULL
created_at
updated_at
UNIQUE(parent_id, name)
```

## `media`
```text
id UUID PK
folder_id UUID FK media_folders NULL
storage_provider varchar NOT NULL
bucket varchar NOT NULL
storage_key text UNIQUE NOT NULL
original_filename text NOT NULL
mime_type varchar NOT NULL
extension varchar NULL
size_bytes bigint NOT NULL
width integer NULL
height integer NULL
duration_seconds numeric NULL
checksum varchar NULL
status enum(pending_upload, processing, ready, failed, archived)
uploaded_by UUID FK users
created_at
updated_at
```

## `media_translations`
```text
id UUID PK
media_id UUID FK media ON DELETE CASCADE
locale varchar FK languages.code
title text NULL
alt_text text NULL
caption text NULL
UNIQUE(media_id, locale)
```

## `media_variants`
```text
id UUID PK
media_id UUID FK media ON DELETE CASCADE
variant_key varchar NOT NULL          # thumb/small/medium/large
storage_key text UNIQUE NOT NULL
mime_type varchar NOT NULL
width integer
height integer
size_bytes bigint
created_at
UNIQUE(media_id, variant_key, mime_type)
```

---

# 5. CMS — Pages

## `pages`
```text
id UUID PK
page_type varchar NOT NULL
template_key varchar NOT NULL
status enum(draft, review, published, archived)
featured boolean default false
published_at timestamptz NULL
created_by FK users
updated_by FK users
created_at
updated_at
```

## `page_translations`
```text
id UUID PK
page_id FK pages ON DELETE CASCADE
locale FK languages.code
title text NOT NULL
slug text NOT NULL
excerpt text NULL
seo_title text NULL
seo_description text NULL
og_title text NULL
og_description text NULL
og_media_id FK media NULL
canonical_url text NULL
robots_index boolean default true
UNIQUE(page_id, locale)
UNIQUE(locale, slug)
```

## `page_sections`
```text
id UUID PK
page_id FK pages ON DELETE CASCADE
section_type varchar NOT NULL
sort_order integer NOT NULL
is_visible boolean default true
settings jsonb NOT NULL default '{}'
created_at
updated_at
UNIQUE(page_id, sort_order)
```

## `page_section_translations`
```text
id UUID PK
section_id FK page_sections ON DELETE CASCADE
locale FK languages.code
content jsonb NOT NULL
UNIQUE(section_id, locale)
```

> `content` is JSONB because each controlled section type has a typed schema. Arbitrary HTML is not allowed.

---

# 6. Services

## `service_categories`
```text
id UUID PK
icon_media_id FK media NULL
status
sort_order
created_at
updated_at
```

## `service_category_translations`
```text
id UUID PK
category_id FK service_categories CASCADE
locale
name
slug
description
UNIQUE(category_id, locale)
UNIQUE(locale, slug)
```

## `services`
```text
id UUID PK
category_id FK service_categories
hero_media_id FK media NULL
icon_media_id FK media NULL
status
featured boolean
sort_order integer
published_at NULL
created_by
updated_by
created_at
updated_at
```

## `service_translations`
```text
id UUID PK
service_id FK services CASCADE
locale
title
slug
short_description
overview
who_for jsonb
problems jsonb
deliverables jsonb
process jsonb
benefits jsonb
timeline_text NULL
cta_label NULL
seo_title NULL
seo_description NULL
og_media_id NULL
UNIQUE(service_id, locale)
UNIQUE(locale, slug)
```

---

# 7. Industries

## `industries`
```text
id UUID PK
hero_media_id FK media NULL
status
featured
sort_order
published_at
created_at
updated_at
```

## `industry_translations`
```text
id UUID PK
industry_id FK industries CASCADE
locale
name
slug
short_description
overview
challenges jsonb
opportunities jsonb
cta_label NULL
seo_title NULL
seo_description NULL
og_media_id NULL
UNIQUE(industry_id, locale)
UNIQUE(locale, slug)
```

## `service_industries`
```text
service_id FK services
industry_id FK industries
PRIMARY KEY(service_id, industry_id)
```

---

# 8. Case Studies

## `case_studies`
```text
id UUID PK
client_id FK clients NULL
anonymized boolean default false
country_code varchar NULL
hero_media_id FK media NULL
status
featured
published_at
created_at
updated_at
```

## `case_study_translations`
```text
id UUID PK
case_study_id FK case_studies CASCADE
locale
title
slug
client_label NULL
context text
challenge text
objectives jsonb
solution text
process jsonb
results jsonb
testimonial_text NULL
seo_title NULL
seo_description NULL
og_media_id NULL
UNIQUE(case_study_id, locale)
UNIQUE(locale, slug)
```

## `case_study_services`
```text
case_study_id
service_id
PRIMARY KEY(...)
```

## `case_study_industries`
```text
case_study_id
industry_id
PRIMARY KEY(...)
```

## `case_study_media`
```text
case_study_id
media_id
sort_order
PRIMARY KEY(case_study_id, media_id)
```

---

# 9. Insights

## `insight_categories`
```text
id UUID PK
status
sort_order
```

## `insight_category_translations`
```text
category_id
locale
name
slug
UNIQUE(category_id, locale)
UNIQUE(locale, slug)
```

## `insights`
```text
id UUID PK
type enum(article, guide, report)
category_id FK insight_categories NULL
author_user_id FK users NULL
cover_media_id FK media NULL
downloadable_media_id FK media NULL
status
featured
published_at
created_at
updated_at
```

## `insight_translations`
```text
id UUID PK
insight_id CASCADE
locale
title
slug
excerpt
content jsonb
seo_title
seo_description
og_media_id NULL
UNIQUE(insight_id, locale)
UNIQUE(locale, slug)
```

## `tags`
```text
id UUID PK
key varchar UNIQUE NOT NULL
```

## `tag_translations`
```text
tag_id
locale
name
slug
UNIQUE(tag_id, locale)
UNIQUE(locale, slug)
```

## `insight_tags`
```text
insight_id
tag_id
PRIMARY KEY(...)
```

## `insight_services`
```text
insight_id
service_id
PRIMARY KEY(...)
```

## `insight_industries`
```text
insight_id
industry_id
PRIMARY KEY(...)
```

---

# 10. FAQ

## `faqs`
```text
id UUID PK
category_key varchar NULL
status
sort_order
created_at
updated_at
```

## `faq_translations`
```text
faq_id
locale
question
answer
UNIQUE(faq_id, locale)
```

## `service_faqs`
```text
service_id
faq_id
PRIMARY KEY(...)
```

## `page_faqs`
```text
page_id
faq_id
PRIMARY KEY(...)
```

---

# 11. Team

## `team_members`
```text
id UUID PK
photo_media_id FK media NULL
linkedin_url text NULL
status
sort_order
created_at
updated_at
```

## `team_member_translations`
```text
member_id
locale
name
position
bio
UNIQUE(member_id, locale)
```

---

# 12. Trust & Ecosystem

## `clients`
```text
id UUID PK
logo_media_id FK media NULL
website text NULL
industry_id FK industries NULL
country_code varchar NULL
featured
public_visibility
sort_order
created_at
updated_at
```

## `client_translations`
```text
client_id
locale
name
short_description NULL
UNIQUE(client_id, locale)
```

## `partners`
```text
id UUID PK
partner_type varchar
logo_media_id FK media NULL
website text NULL
country_code NULL
featured
public_visibility
sort_order
```

## `partner_translations`
```text
partner_id
locale
name
description NULL
UNIQUE(partner_id, locale)
```

## `brands`
```text
id UUID PK
logo_media_id NULL
cover_media_id NULL
industry_id NULL
website NULL
relationship_type varchar
status
featured
sort_order
published_at
```

## `brand_translations`
```text
brand_id
locale
name
slug
short_description
full_description
seo_title
seo_description
UNIQUE(brand_id, locale)
UNIQUE(locale, slug)
```

## `product_ventures`
```text
id UUID PK
logo_media_id NULL
product_type varchar
industry_id NULL
website NULL
launch_status varchar
relationship_type varchar
status
featured
sort_order
published_at
```

## `product_venture_translations`
```text
product_venture_id
locale
name
slug
short_description
full_description
key_features jsonb
seo_title
seo_description
UNIQUE(product_venture_id, locale)
UNIQUE(locale, slug)
```

## `testimonials`
```text
id UUID PK
client_id FK clients NULL
logo_media_id FK media NULL
person_name varchar
person_role varchar NULL
company_name varchar NULL
country_code NULL
consent_confirmed boolean default false
featured
status
sort_order
```

## `testimonial_translations`
```text
testimonial_id
locale
quote
UNIQUE(testimonial_id, locale)
```

## `certifications`
```text
id UUID PK
logo_media_id NULL
issuer text
certificate_number text NULL
valid_from date NULL
valid_until date NULL
verification_url text NULL
public_visibility boolean
status
sort_order
```

## `certification_translations`
```text
certification_id
locale
name
description NULL
UNIQUE(certification_id, locale)
```

## `trust_metrics`
```text
id UUID PK
value numeric/text
suffix varchar NULL
evidence_note_internal text NULL
public_visibility
sort_order
status
```

## `trust_metric_translations`
```text
trust_metric_id
locale
label
UNIQUE(trust_metric_id, locale)
```

---

# 13. Navigation / Settings / Redirects

## `navigation_menus`
```text
id UUID PK
key varchar UNIQUE
location varchar
status
```

## `navigation_items`
```text
id UUID PK
menu_id FK navigation_menus
parent_id FK navigation_items NULL
item_type enum(internal, external)
internal_entity_type varchar NULL
internal_entity_id UUID NULL
external_url text NULL
sort_order
visible
```

## `navigation_item_translations`
```text
navigation_item_id
locale
label
UNIQUE(navigation_item_id, locale)
```

## `global_settings`
```text
id UUID PK
key varchar UNIQUE
category varchar
value jsonb
is_public boolean default false
updated_by
updated_at
```

## `redirects`
```text
id UUID PK
source_path text UNIQUE
destination_path text
status_code int CHECK IN (301,302,307,308)
locale varchar NULL
active boolean
created_at
updated_at
```

---

# 14. CRM

## `leads`
```text
id UUID PK
full_name varchar NOT NULL
company_name varchar NULL
email varchar NOT NULL
phone varchar NULL
country_code varchar NULL
preferred_locale varchar NULL
industry_id FK industries NULL
service_id FK services NULL
message text NULL
source_type varchar NOT NULL
source_page text NULL
source_url text NULL
submission_locale varchar NULL
status varchar NOT NULL
assigned_to_user_id FK users NULL
utm_source varchar NULL
utm_medium varchar NULL
utm_campaign varchar NULL
utm_term varchar NULL
utm_content varchar NULL
referrer text NULL
landing_page text NULL
created_at
updated_at
```

Indexes:
```text
(email)
(phone)
(status, created_at desc)
(assigned_to_user_id, status)
(source_type, created_at desc)
(service_id, created_at desc)
```

## `lead_notes`
```text
id UUID PK
lead_id FK leads CASCADE
author_user_id FK users
body text NOT NULL
created_at
updated_at
```

## `lead_activities`
```text
id UUID PK
lead_id FK leads CASCADE
actor_user_id FK users NULL
type varchar NOT NULL
payload jsonb
created_at
```

## `assessments`
```text
id UUID PK
lead_id FK leads
form_version varchar NOT NULL
answers jsonb NOT NULL
submitted_at timestamptz NOT NULL
created_at
```

---

# 15. Audit

## `audit_logs`
```text
id UUID PK
actor_user_id FK users NULL
action varchar NOT NULL
entity_type varchar NOT NULL
entity_id UUID/text NULL
summary jsonb NULL
request_id varchar NULL
created_at
```

Do not store secrets or full sensitive payloads.

---

# 16. Job Metadata (optional persistence)

BullMQ uses Redis.  
Only business-relevant delivery state should be persisted in PostgreSQL where needed.

Example:
## `notification_deliveries`
```text
id UUID PK
type varchar
recipient text
provider varchar
provider_message_id text NULL
status varchar
error_code varchar NULL
related_entity_type varchar NULL
related_entity_id UUID NULL
created_at
updated_at
```

---

# 17. Referential Delete Rules

### RESTRICT preferred
- service category with services.
- industry with linked published content.
- client referenced by case study.

### CASCADE acceptable
- translation rows.
- join rows.
- media variants.

### Never cascade
- user deletion into audit history.
- client deletion into case studies.
- lead deletion through unrelated entities.

---

# 18. Index Strategy

At minimum:
- localized slug unique indexes.
- published/status indexes.
- sort order where listing frequently.
- lead operational indexes.
- foreign-key indexes.
- text-search indexes for Insights if PostgreSQL full-text is enabled.

---

# 19. Migration Rules

- Append-only migrations.
- No editing already-applied production migration.
- `prisma migrate deploy` in production.
- Destructive changes require explicit migration plan.
- Backfill before setting newly required column NOT NULL.
- Add indexes concurrently/manual SQL where production size justifies it.
- Migration must be idempotently deployed once, not re-run custom SQL blindly.

---

# 20. Schema Acceptance

Before implementation of a module:
- table model approved.
- translation strategy defined.
- indexes defined.
- delete behavior defined.
- permission boundary defined.
