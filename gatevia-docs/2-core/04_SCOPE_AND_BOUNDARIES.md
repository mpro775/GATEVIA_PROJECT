# GATEVIA — Scope & Boundaries
**Document ID:** GTV-SCOPE-001  
**Version:** v0.2 Draft  
**Status:** Client Review Required  
**Purpose:** إغلاق نطاق الإصدار الأول ومنع التوسع غير المنضبط أثناء التصميم والتنفيذ.

---

## 1. Purpose

تحدد هذه الوثيقة ما الذي سيتم بناؤه ضمن **GATEVIA Website V1** وما الذي لا يدخل ضمن النطاق الحالي، مع توضيح الحدود الوظيفية والتقنية بين الموقع العام، نظام إدارة المحتوى، إدارة الوسائط، إدارة العملاء المحتملين، لوحة الإدارة، والتكاملات الخارجية.

هذه الوثيقة هي المرجع عند الاختلاف على ما إذا كانت ميزة معينة ضمن المشروع أم خارجه.

## 2. Product Definition

GATEVIA V1 هو:

> **Multilingual Corporate Website + Headless CMS + Media Library + Lead Management Layer**

الغرض منه:
1. عرض خدمات GATEVIA بصورة احترافية.
2. دعم بناء الثقة والمصداقية.
3. استقطاب Leads مؤهلين.
4. تمكين فريق الشركة من إدارة المحتوى واللغات والوسائط دون الرجوع للمطور.
5. توفير أساس تقني قابل للتوسع لاحقًا إلى CRM أوسع أو Client Portal.

## 3. V1 — In Scope

### 3.1 Public Website
يشمل:
- Home.
- Saudi Market Entry.
- Services + Service Detail.
- Industries + Industry Detail.
- How We Work.
- Case Studies + Case Study Detail.
- Insights + Article/Guide/Report Detail.
- About.
- Team.
- Partners.
- Clients / Trusted By.
- Brands.
- Products / Ventures.
- Testimonials.
- FAQ.
- Contact.
- Book a Consultation.
- Market Entry Assessment.
- Legal Pages.
- 404 / 500 pages.

### 3.2 Multilingual
يشمل:
- عدد غير ثابت من اللغات.
- العربية والإنجليزية كلغتي إطلاق مقترحتين.
- RTL / LTR.
- ترجمة محتوى CMS.
- Slugs مترجمة.
- SEO مستقل لكل لغة.
- hreflang.
- Fallback policy.
- Language switcher.

### 3.3 CMS
يشمل إدارة:
- Pages.
- Services.
- Service Categories.
- Industries.
- Case Studies.
- Insights.
- Categories / Tags.
- FAQs.
- Team.
- Testimonials.
- Clients.
- Partners.
- Brands.
- Products / Ventures.
- Navigation.
- Footer.
- General Settings.
- SEO.
- Redirects.
- Languages.
- Media references.

### 3.4 Media Library
يشمل:
- Images / Logos / Icons.
- PDFs / Documents.
- Videos وفق السياسة المعتمدة.
- Folders.
- Search / Filters.
- Metadata.
- Alt Text / Captions.
- Reuse.
- Safe Delete.
- Image Variants.

### 3.5 Lead Management
يشمل:
- Contact submissions.
- Consultation requests.
- Market Entry Assessments.
- Lead records.
- Lead source.
- UTM data.
- Status.
- Assignment.
- Internal notes.
- Activity timeline.
- Basic filters.
- Export إذا اعتمد.
- Email notifications الأساسية.

### 3.6 Administration
يشمل:
- Admin Authentication.
- Users.
- Roles.
- Permissions.
- Dashboard.
- CMS management.
- Media.
- Leads.
- Settings.
- Audit Log بالمستوى المعتمد.

### 3.7 SEO / Analytics
يشمل:
- SEO Metadata.
- Sitemap.
- robots.txt.
- Canonical.
- hreflang.
- Open Graph.
- Schema.org Structured Data.
- GA4.
- GTM.
- Search Console readiness.
- UTM capture.
- Conversion events الأساسية.

## 4. V1 — Explicitly Out of Scope

الآتي **ليس ضمن V1** ما لم يُضف عبر Change Request رسمي:

### 4.1 Client Portal
- Client login.
- Project dashboard.
- Tasks / Milestones.
- Deliverables.
- Secure client documents.
- Messages.

### 4.2 Financial Systems
- Payments.
- Payment gateways.
- Invoices.
- Accounting.
- Wallets.
- Subscriptions.
- ERP.

### 4.3 Advanced CRM
- Automated sales sequences.
- Complex pipelines.
- Marketing automation.
- Lead scoring.
- Sales forecasting.
- Telephony.
- External CRM synchronization.

### 4.4 Government Integrations
- Government APIs.
- Automated government submissions.
- Identity verification.
- Official license issuance.

### 4.5 Apps / AI / E-commerce
- iOS / Android apps.
- AI chatbot / AI study generation.
- Shopping cart / Checkout / Subscriptions.

## 5. Business Scope Constraints

### 5.1 Services
لن تُنشر خدمة كخدمة رسمية حتى يعتمد العميل اسمها ووصفها وتصنيفها وطريقة تقديمها وCTA الخاص بها.

### 5.2 Trust Claims
ممنوع عرض عميل أو شريك أو اعتماد أو رقم نجاح أو إنجاز إلا إذا تم تأكيد أنه حقيقي ومصرح بنشره.

### 5.3 Case Studies
أي Case Study يجب أن تكون مصرحًا بنشرها أو مجهولة الهوية إذا كانت خاضعة لـNDA.

### 5.4 Legal Wording
لا يقدم الموقع وعودًا قانونية أو تنظيمية مطلقة مثل “نضمن الترخيص” إلا إذا اعتمدها العميل قانونيًا.

## 6. Technical Scope Boundaries

### Frontend
- Rendering / Routing.
- Components.
- RTL/LTR.
- Accessibility.
- SEO rendering.
- Forms UI.
- Responsive layouts.

### Backend
- CMS data.
- Translations.
- Media metadata.
- Leads.
- Assessments.
- Users / Roles / Permissions.
- APIs.
- Audit.
- Notifications.
- Settings.

### Object Storage
- Images / Documents / PDFs / Videos if approved.

### Database
- Structured metadata / relations / content / leads / users / audit.

## 7. Change Control

أي طلب جديد بعد اعتماد هذا الملف يصنف إلى:
- **Clarification** — لا يغير النطاق.
- **Correction** — إصلاح لما تم اعتماده.
- **Change Request** — يضيف أو يغير النطاق.
- **Future Phase** — مؤجل رسميًا.

## 8. V1 Acceptance Boundary

يعتبر V1 مكتملًا عندما:
1. تعمل جميع صفحات النطاق.
2. تعمل اللغات المعتمدة.
3. يمكن إدارة المحتوى من Admin.
4. تعمل Media Library.
5. تعمل Forms وتحفظ Leads.
6. تعمل الصلاحيات.
7. يعمل SEO الأساسي.
8. يعمل الموقع Responsive.
9. لا توجد بيانات تجريبية غير مقصودة.
10. لا توجد ميزات Future Scope منفذة جزئيًا بصورة مربكة.

## 9. Client Approval Checklist

- [ ] الخدمات النهائية.
- [ ] القطاعات.
- [ ] لغات الإطلاق.
- [ ] أنواع Leads.
- [ ] Brands / Products / Ventures.
- [ ] Clients / Partners.
- [ ] Case Studies.
- [ ] هل الأسعار تظهر؟
- [ ] Booking Calendar أم Form فقط؟
- [ ] Export Leads؟
- [ ] Scheduled Publishing؟
- [ ] Admin MFA؟
- [ ] Direct Video Upload؟
- [ ] الميزات المؤجلة رسميًا.
