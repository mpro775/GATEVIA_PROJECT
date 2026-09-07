# GATEVIA — Sitemap & Information Architecture
**Document ID:** GTV-IA-001  
**Version:** v0.2 Draft  
**Status:** Client Review Required

---

## 1. Information Architecture Principle

تبنى بنية الموقع حول رحلة الزائر:

> **Discover → Understand → Trust → Evaluate → Convert**

مع إبقاء Navigation واضحة وقابلة للتوسع إلى خدمات وقطاعات ولغات جديدة.

## 2. Primary Sitemap

```text
/
├── Home
├── Saudi Market Entry
├── Services
│   ├── Market Access
│   │   ├── Market Research
│   │   ├── Feasibility Study
│   │   ├── Competitor Analysis
│   │   ├── Market Sizing
│   │   └── Market Entry Strategy
│   ├── Execution
│   │   ├── Company Formation Support
│   │   ├── Licensing Support
│   │   ├── Local Partner Search
│   │   ├── Vendor & Supplier Sourcing
│   │   └── Operational Setup
│   └── Growth
│       ├── Go-To-Market Strategy
│       ├── Business Development
│       ├── Partnerships
│       ├── Distribution Strategy
│       └── Growth Consulting
├── Industries
│   └── [Industry Detail]
├── How We Work
├── Case Studies
│   └── [Case Study Detail]
├── Insights
│   ├── Articles
│   ├── Guides
│   ├── Reports
│   └── [Insight Detail]
├── Ecosystem
│   ├── Brands
│   ├── Products & Ventures
│   └── [Entity Detail — optional]
├── About
│   ├── About GATEVIA
│   ├── Team
│   └── Partners
├── Trusted By / Clients
├── FAQ
├── Contact
├── Book a Consultation
├── Market Entry Assessment
├── Privacy Policy
├── Terms & Conditions
└── Cookie Policy
```

## 3. Recommended Main Navigation

### Desktop
```text
Services
Saudi Market Entry
Industries
Case Studies
Insights
About
[Book a Consultation]
```

### Services Mega Menu
- Market Access.
- Execution.
- Growth.
- Featured CTA.
- Optional featured case study.

### About Menu
- About GATEVIA.
- Team.
- Partners.
- Ecosystem.

## 4. Mobile Navigation

يجب أن:
- تدعم nested items.
- تحتوي Language Switcher.
- تحتوي CTA واضح.
- لا تعتمد على Hover.
- تكون قابلة للإغلاق بوضوح.

## 5. URL Strategy

```text
/{locale}/
/{locale}/services
/{locale}/services/{service-slug}
/{locale}/industries/{industry-slug}
/{locale}/case-studies/{case-study-slug}
/{locale}/insights/{insight-slug}
/{locale}/brands/{brand-slug}
/{locale}/products/{product-slug}
```

Examples:
```text
/en/services/market-entry-strategy
/ar-sa/services/استراتيجية-دخول-السوق
```

## 6. Breadcrumbs

للصفحات العميقة:
```text
Home > Services > Market Access > Market Research
```

ويجب أن تكون مترجمة ومتوافقة مع Breadcrumb Schema.

## 7. Page Hierarchy Rules

- كل Service ترتبط بفئة Service Category.
- Industry يمكن أن ترتبط بعدة Services.
- Case Study يمكن أن ترتبط بخدمات وقطاعات وعميل اختياري.
- Insights يمكن أن ترتبط بخدمات وقطاعات وتصنيفات وTags.
- Brand وProduct/Venture لا يعاملان كـClient أوPartner.

## 8. Homepage IA

```text
Hero
Trust Logos
Value Proposition
3 Pillars
Saudi Market Entry Journey
Selected Services
Why GATEVIA
Industries
Selected Case Studies
Ecosystem
Testimonials
Insights
Final CTA
```

## 9. Conversion Paths

### Foreign Company
```text
Home → Saudi Market Entry → Service → Case Study → Book Consultation
```

### Research-Oriented Visitor
```text
Search Engine → Insight → Related Service → Assessment
```

### Trust Validation
```text
Home → Clients / Partners / Ecosystem → Case Studies → Contact
```

## 10. Footer IA

### Services
- Market Access.
- Execution.
- Growth.

### Company
- About.
- Team.
- Partners.
- Ecosystem.

### Resources
- Case Studies.
- Insights.
- FAQ.

### Contact
- Email / Phone / Address / LinkedIn / Consultation CTA.

### Bottom
- Privacy.
- Terms.
- Cookies.
- Copyright.

## 11. Public Search

V1 Minimum:
- Insights.

Optional expansion:
- Services.
- Industries.

## 12. 404 Behavior

- رسالة واضحة.
- Home link.
- Search أو اقتراحات.
- Services links.
- عدم كشف تفاصيل تقنية.

## 13. Utility Routes

```text
/admin
/api/*
/sitemap.xml
/robots.txt
/health
```

## 14. Approval Decisions

- [ ] هل Ecosystem عنصر مستقل في القائمة؟
- [ ] هل Clients صفحة مستقلة؟
- [ ] هل Partners ضمن About؟
- [ ] هل Products لها Detail Pages؟
- [ ] هل Insights Listing موحد؟
- [ ] هل Assessment يظهر في Main Nav؟
- [ ] هل Saudi Market Entry يسبق Services؟
