# GATEVIA — CMS Content Model
**Document ID:** GTV-CMS-001  
**Version:** v0.2 Draft  
**Status:** Technical Contract

---

## 1. Objective

تعريف أنواع المحتوى وعلاقاتها قبل بناء قاعدة البيانات والـAPI.

## 2. Core Entities

```text
Language
Page
PageSection
ServiceCategory
Service
Industry
CaseStudy
Insight
InsightCategory
Tag
FAQ
TeamMember
Testimonial
Client
Partner
Brand
ProductVenture
Certification
TrustMetric
NavigationMenu
NavigationItem
Media
MediaFolder
Redirect
GlobalSetting
SEORecord
```

## 3. Common Content Fields

Where applicable:
- id.
- status.
- featured.
- sort_order.
- published_at.
- created_at.
- updated_at.
- created_by.
- updated_by.

## 4. Status Model

Recommended:
- draft.
- review.
- published.
- archived.

Optional:
- scheduled.

## 5. Page

Fields:
- id.
- page_type.
- template_key.
- status.
- featured.
- published_at.

Translation:
- title.
- slug.
- excerpt.
- body optional.
- SEO fields.

Relations:
- sections.
- media.
- redirects.

## 6. PageSection

Fields:
- id.
- page_id.
- section_type.
- sort_order.
- is_visible.
- settings JSONB.

Preferred approach:
- structured section data.
- explicit translatable fields where reusable.

## 7. ServiceCategory

Examples:
- Market Access.
- Execution.
- Growth.

Fields:
- icon.
- sort_order.
- status.

Translation:
- name.
- slug.
- description.

## 8. Service

Fields:
- category_id.
- hero_media_id.
- icon_media_id.
- featured.
- sort_order.
- status.

Translation:
- title.
- slug.
- short_description.
- overview.
- who_for.
- problems.
- deliverables.
- process.
- benefits.
- timeline_text.
- CTA text.
- SEO.

Relations:
- industries M:N.
- case studies M:N.
- insights M:N.
- FAQs M:N.

## 9. Industry

Fields:
- hero_media_id.
- featured.
- sort_order.

Translation:
- name.
- slug.
- short_description.
- overview.
- challenges.
- opportunities.
- CTA.
- SEO.

Relations:
- services.
- case studies.
- insights.

## 10. CaseStudy

Fields:
- client_id optional.
- anonymized.
- country.
- hero_media_id.
- featured.
- status.

Translation:
- title.
- slug.
- client_label.
- context.
- challenge.
- objectives.
- solution.
- process.
- results.
- testimonial_text optional.
- SEO.

Relations:
- services M:N.
- industries M:N.
- gallery media.

## 11. Insight

Type enum:
- article.
- guide.
- report.

Fields:
- type.
- category_id.
- author_id optional.
- cover_media_id.
- downloadable_media_id optional.
- published_at.
- featured.

Translation:
- title.
- slug.
- excerpt.
- content.
- SEO.

Relations:
- tags.
- services.
- industries.

## 12. FAQ

Fields:
- category optional.
- sort_order.
- status.

Translation:
- question.
- answer.

Relations optional:
- services.
- pages.

## 13. TeamMember

Fields:
- photo_media_id.
- linkedin_url.
- sort_order.
- status.

Translation:
- name.
- position.
- bio.

## 14. Testimonial

Fields:
- client_id optional.
- person_name.
- person_role.
- company_name.
- logo_media_id.
- country.
- consent_confirmed.
- featured.

Translation:
- quote.

## 15. Client

Fields:
- logo_media_id.
- website.
- industry_id optional.
- country.
- featured.
- public_visibility.

Translation:
- name.
- short_description.

## 16. Partner

Fields:
- partner_type.
- logo_media_id.
- website.
- country.
- featured.

Translation:
- name.
- description.

## 17. Brand

Fields:
- logo_media_id.
- cover_media_id.
- industry_id optional.
- website.
- relationship_type.
- featured.

Translation:
- name.
- slug.
- short_description.
- full_description.
- SEO.

## 18. ProductVenture

Fields:
- logo_media_id.
- product_type.
- industry_id optional.
- website.
- launch_status.
- relationship_type.
- featured.

Translation:
- name.
- slug.
- short_description.
- full_description.
- key_features.
- SEO.

## 19. Certification

Fields:
- logo_media_id.
- issuer.
- certificate_number optional.
- valid_from.
- valid_until.
- verification_url.
- public_visibility.

Translation:
- name.
- description.

## 20. TrustMetric

Fields:
- value.
- suffix.
- sort_order.
- public_visibility.
- evidence_note_internal.

Translation:
- label.

## 21. NavigationMenu

Fields:
- key.
- location.
- status.

Examples:
- main.
- footer_services.
- footer_company.

## 22. NavigationItem

Fields:
- menu_id.
- parent_id optional.
- item_type.
- internal_target optional.
- external_url optional.
- sort_order.
- visible.

Translation:
- label.

## 23. Redirect

Fields:
- source_path.
- destination_path.
- status_code.
- locale optional.
- active.

## 24. GlobalSetting

Categories:
- company.
- contact.
- social.
- seo.
- analytics.
- branding.

Use typed keys; avoid uncontrolled arbitrary settings for critical configuration.

## 25. SEO Strategy

Recommendation:
- Keep SEO fields with translation where they are locale-specific.

## 26. Controlled Page Builder

Allowed `section_type` values:
- hero.
- rich_text.
- text_image.
- stats.
- services_grid.
- industries_grid.
- process.
- timeline.
- testimonials.
- case_studies.
- logo_cloud.
- faq.
- cta.
- form.

No arbitrary HTML builder.

## 27. Rich Text

- Structured editor output.
- Sanitize on render.
- No unsafe raw HTML by default.

## 28. Deletion Policy

Published entities:
- Archive / Soft Delete preferred.

Hard Delete:
- Restricted.
- Blocked when referenced where appropriate.

## 29. Versioning

Content version history optional V1.
Audit Log separate.

## 30. Client Decisions

- [ ] Scheduled Publishing؟
- [ ] Content Review Workflow؟
- [ ] Product Detail Pages؟
- [ ] Brand Detail Pages؟
- [ ] Full Content Versioning؟
