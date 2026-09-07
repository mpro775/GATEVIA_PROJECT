# GATEVIA — Trust, Brands, Products, Clients & Ecosystem Specification
**Document ID:** GTV-TRUST-001  
**Version:** v0.2 Draft  
**Status:** Client Review Required

---

## 1. Objective

بناء طبقة ثقة واضحة دون خلط العلاقات التجارية.

الكيانات:
- Clients.
- Partners.
- Brands.
- Products.
- Ventures.
- Testimonials.
- Case Studies.
- Certifications / Accreditations.
- Trust Metrics.

## 2. Relationship Taxonomy

### Client
جهة اشترت أو استفادت فعليًا من خدمة GATEVIA.

### Partner
جهة لديها شراكة أو تعاون رسمي.

### Brand
علامة تجارية مملوكة أو مدارة من GATEVIA.

### Product
منتج أو منصة مملوكة أو مطورة ضمن المنظومة.

### Venture
شركة/مشروع استثماري أو مشروع ناشئ تابع أو مشارك.

### Case Study
قصة عمل/نتيجة موثقة.

### Testimonial
شهادة رأي حقيقية مصرح بنشرها.

## 3. Mandatory Separation

- Partner ≠ Client.
- Brand ≠ Client.
- Product ≠ Partner.

إذا انطبق أكثر من نوع على جهة واحدة فيجب توضيح العلاقة صراحة.

## 4. Clients Model

- Name.
- Slug optional.
- Logo.
- Website.
- Industry.
- Country.
- Relationship Summary.
- Featured.
- Public Visibility.
- Related Case Studies.
- Related Testimonial.
- Sort Order.

## 5. Partners Model

- Name.
- Logo.
- Partner Type.
- Short Description.
- Website.
- Country.
- Start Date optional.
- Featured.
- Sort Order.
- Public Visibility.

Partner Types:
- Strategic.
- Delivery.
- Technology.
- Research.
- Government / Ecosystem.
- Other.

## 6. Brands Model

- Name.
- Slug.
- Logo.
- Cover.
- Short Description.
- Full Description.
- Industry.
- Country.
- Relationship Type.
- Website.
- Featured.
- Status.
- SEO.
- Translations.

Relationship Types:
- Owned.
- Subsidiary.
- Managed.
- Affiliate.
- Investment.
- Other.

## 7. Products / Ventures Model

- Name.
- Slug.
- Logo.
- Gallery.
- Product Type.
- Industry.
- Short Description.
- Full Description.
- Key Features.
- Website.
- Launch Status.
- Ownership Relation.
- Featured.
- SEO.
- Translations.

Statuses:
- Concept.
- Building.
- Active.
- Private Beta.
- Public.
- Paused.
- Archived.

## 8. Testimonials Model

- Person Name.
- Job Title.
- Company.
- Company Logo.
- Country.
- Quote.
- Related Client.
- Related Case Study.
- Featured.
- Consent Confirmed.
- Sort Order.

Rule: لا تنشر شهادة دون تأكيد الإذن.

## 9. Case Study Trust Contract

يجب أن توضح:
- What was done.
- Scope.
- Outcome.
- Evidence type when relevant.

Metrics can include only documented values.

## 10. Certifications / Accreditations

- Name.
- Issuer.
- Logo.
- Certificate Number optional.
- Valid From / Until.
- Verification URL optional.
- Public Visibility.

## 11. Trust Metrics

Examples:
- Markets Studied.
- Industries Served.
- Countries Served.
- Market Entry Projects.
- Partner Network Size.

Each metric:
- Label.
- Value.
- Suffix.
- Internal Evidence Note.
- Public Visibility.

## 12. Homepage Trust Order

Recommended:
1. Client Logos.
2. Case Studies.
3. Ecosystem.
4. Testimonials.
5. Partners.
6. Certifications.
7. Metrics.

لا يلزم إظهار قسم لا توجد له بيانات حقيقية.

## 13. Admin UX

```text
Trust & Ecosystem
├── Clients
├── Partners
├── Brands
├── Products & Ventures
├── Case Studies
├── Testimonials
├── Certifications
└── Trust Metrics
```

## 14. Visibility Rules

- Draft.
- Published.
- Archived.
- Featured.
- Sort Order.
- Public Visibility.

## 15. Client Review Questions

- [ ] ما العملاء المسموح بعرض شعاراتهم؟
- [ ] ما الشركاء الرسميون؟
- [ ] ما البراندات المملوكة؟
- [ ] ما المنتجات؟
- [ ] ما Ventures؟
- [ ] هل توجد Testimonials؟
- [ ] هل توجد اعتمادات؟
- [ ] ما الأرقام التي يمكن توثيقها؟
