# GATEVIA — Multilingual / i18n Contract
**Document ID:** GTV-I18N-001  
**Version:** v0.2 Draft  
**Status:** Technical Contract

---

## 1. Core Rule

النظام متعدد اللغات بصورة ديناميكية.

**ممنوع:**
```text
title_ar
title_en
description_ar
description_en
```

**المعتمد:**
```text
entity
entity_translations
locale
```

## 2. Language Entity

Fields:
- id.
- code.
- name.
- native_name.
- direction.
- is_active.
- is_default.
- sort_order.
- locale_format optional.
- date_locale optional.

Examples:
```text
ar-SA
en
fr
zh-CN
de
tr
```

## 3. Launch Languages

Proposed:
- `ar-SA`
- `en`

لكن البنية لا تفترض عددًا محددًا.

## 4. Direction

Each language:
- `rtl`
- `ltr`

Frontend components must not hardcode alignment.
Use logical CSS properties where possible:
- margin-inline.
- padding-inline.
- inset-inline.
- text-start / text-end.

## 5. URL Contract

Recommended:
```text
/{locale}/...
```

Examples:
```text
/ar-sa/services/...
/en/services/...
```

## 6. Localized Slugs

كل Translation يمكن أن يكون لها Slug مستقل.

Recommended uniqueness:
```text
(entity_id, locale)
(locale, slug)
```

## 7. Translation Completeness

Every translatable entity should expose:
- Missing.
- Partial.
- Complete.

Admin displays badges.

## 8. Fallback Policy

Recommended V1:
- **CMS public content:** لا يتم عمل fallback صامت للمحتوى الكامل.
- **UI strings:** يمكن fallback إلى اللغة الافتراضية.
- **Missing localized page:** تخفى أو تعرض حالة controlled unavailable حسب القرار المعتمد.

الهدف هو منع الصفحات المختلطة عربي/إنجليزي دون قصد.

## 9. Language Switcher

إذا كانت النسخة المقابلة موجودة:
- ينتقل إلى نفس المحتوى باللغة الجديدة.

إذا لم توجد:
- ينتقل إلى Locale Homepage أو Parent حسب السياسة المعتمدة.

## 10. UI Translation vs CMS Translation

### UI Translation
Static application keys:
```text
common.read_more
common.submit
common.back
forms.required
```

تدار عبر translation dictionaries.

### CMS Translation
Business content:
- Pages.
- Services.
- Industries.
- Articles.
- FAQs.
- SEO.
- Navigation.

تدار من قاعدة البيانات.

## 11. SEO Contract

Each locale supports:
- SEO Title.
- Meta Description.
- OG Title.
- OG Description.
- OG Image optional.
- Canonical.
- hreflang mappings.

## 12. Hreflang

لكل صفحة منشورة مترجمة:
- Output جميع اللغات المتوفرة.
- x-default إذا اعتمدت الاستراتيجية.

## 13. Date / Number / Currency Formatting

يستخدم locale-aware formatting لـ:
- Dates.
- Numbers.
- Percentages.
- Currencies.

ممنوع تنسيق التاريخ يدويًا داخل Components.

## 14. Search

- البحث داخل اللغة الحالية افتراضيًا.
- لا يتم خلط اللغات في النتائج إلا بقرار صريح.

## 15. Navigation

Menu items مترجمة بصورة مستقلة.
يمكن:
- مشاركة نفس الهيكل.
- تغيير Labels حسب اللغة.
- إخفاء عنصر بلغة معينة عند الحاجة.

## 16. Media Metadata

Alt Text وCaption يدعمان الترجمة.

## 17. Forms

- Field labels مترجمة.
- Validation messages مترجمة.
- Lead stores `preferred_locale` و`submission_locale`.

## 18. Slug Change

عند تغيير Slug لمحتوى منشور:
- إنشاء Redirect إذا كان Redirect Manager فعالًا.

## 19. Admin UX

Example:
```text
Arabic  ✓ Complete
English ✓ Complete
French  ⚠ Missing
```

## 20. Database Contract

Recommended:
```text
languages
services
service_translations
industries
industry_translations
pages
page_translations
articles
article_translations
```

Translation row should contain:
- entity_id.
- locale.
- translatable fields.

Unique:
```text
(entity_id, locale)
```

## 21. No Hardcoded Business Content

Frontend لا يحتوي على محتوى الشركة الرسمي مثل:
- Service descriptions.
- Team bios.
- Company mission.
- Contact details.

إلا كـsafe defaults مؤقتة أثناء التطوير وليس كبيانات إنتاج.

## 22. RTL QA Checklist

- [ ] Header.
- [ ] Mega Menu.
- [ ] Breadcrumb.
- [ ] Forms.
- [ ] Cards.
- [ ] Icons.
- [ ] Carousels.
- [ ] Tables.
- [ ] Pagination.
- [ ] Modals.
- [ ] Rich Text.
- [ ] Admin locale fields.

## 23. Client Decisions

- [ ] Default Locale.
- [ ] Initial Active Locales.
- [ ] Missing Translation Policy.
- [ ] Arabic Slugs أم Latin Slugs؟
- [ ] هل جميع اللغات تشارك نفس Navigation structure؟
