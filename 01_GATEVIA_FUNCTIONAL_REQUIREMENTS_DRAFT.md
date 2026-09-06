# GATEVIA — المتطلبات الوظيفية
**الإصدار:** Draft v0.1 — للمراجعة مع العميل قبل الاعتماد  
**الحالة:** غير معتمد  
**المرجع:** GATEVIA Project Overview v0.1

---

# 1. إدارة اللغات والترجمة

## FR-LANG-001 — إدارة اللغات
يجب أن يستطيع المسؤول:
- إضافة لغة.
- تفعيل/تعطيل لغة.
- تحديد اللغة الافتراضية.
- تحديد اسم اللغة والاسم المحلي.
- تحديد Direction: RTL / LTR.
- ترتيب اللغات.

## FR-LANG-002 — ترجمة المحتوى
يجب أن يدعم كل محتوى قابل للنشر ترجمة مستقلة حسب اللغة، بما يشمل:
- Title.
- Slug.
- Short Description.
- Long Content.
- CTA text.
- SEO metadata.
- Alt Text عند الحاجة.

## FR-LANG-003 — التبديل بين اللغات
يجب أن يستطيع الزائر تغيير اللغة من أي صفحة.

## FR-LANG-004 — ربط النسخ المترجمة
عند تغيير اللغة، يجب الانتقال إلى النسخة المقابلة من نفس المحتوى إن وجدت.

## FR-LANG-005 — Fallback
يجب تحديد سياسة واضحة عندما لا توجد ترجمة:
- عدم عرض الصفحة باللغة المطلوبة، أو
- الرجوع إلى اللغة الافتراضية.
ويتم اعتماد السلوك النهائي مع العميل.

---

# 2. إدارة الصفحات

## FR-PAGE-001
إنشاء صفحة جديدة.

## FR-PAGE-002
تعديل صفحة.

## FR-PAGE-003
حذف/أرشفة صفحة حسب الصلاحية.

## FR-PAGE-004
إدارة:
- العنوان.
- Slug.
- المحتوى.
- حالة النشر.
- تاريخ النشر.
- صورة المشاركة.
- SEO.
- اللغات.

## FR-PAGE-005 — Controlled Page Builder
يجب دعم أقسام جاهزة يمكن إضافتها وترتيبها مثل:
- Hero.
- Rich Text.
- Text + Image.
- Statistics.
- Services Grid.
- Industries Grid.
- Process.
- Timeline.
- Testimonials.
- Case Studies.
- Logo Cloud.
- FAQ.
- CTA.
- Contact Form.

## FR-PAGE-006
إظهار/إخفاء Section دون حذفه.

## FR-PAGE-007
إعادة ترتيب Sections.

---

# 3. إدارة الخدمات

## FR-SVC-001
إنشاء وتعديل وأرشفة الخدمات.

## FR-SVC-002
تصنيف الخدمات ضمن مجموعات، مثل:
- Market Access.
- Execution.
- Growth.

## FR-SVC-003
كل خدمة قد تحتوي على:
- Title.
- Slug.
- Short Description.
- Overview.
- Hero Media.
- Icon.
- Who Is This For.
- Problems We Solve.
- Deliverables.
- Process.
- Benefits.
- Timeline text.
- CTA.
- FAQs.
- Related Industries.
- Related Case Studies.
- Related Insights.
- SEO.

## FR-SVC-004
تحديد خدمة Featured.

## FR-SVC-005
تحديد ترتيب الخدمات.

---

# 4. إدارة القطاعات

## FR-IND-001
إنشاء وتعديل وأرشفة قطاع.

## FR-IND-002
كل قطاع يدعم:
- الاسم.
- Slug.
- الوصف.
- Hero.
- Market Overview.
- Challenges.
- Opportunities.
- Related Services.
- Related Case Studies.
- Related Insights.
- CTA.
- SEO.

## FR-IND-003
تحديد القطاعات Featured وترتيبها.

---

# 5. Saudi Market Entry Page

## FR-ME-001
صفحة مستقلة مخصصة لخدمة دخول السوق السعودي.

## FR-ME-002
تدعم عرض رحلة العميل، مثل:
- Understand.
- Validate.
- Enter.
- Establish.
- Operate.
- Grow.

## FR-ME-003
ربط مراحل الرحلة بخدمات GATEVIA ذات العلاقة.

## FR-ME-004
إظهار CTA لحجز استشارة أو بدء Assessment.

---

# 6. How We Work

## FR-HOW-001
إدارة خطوات العمل من لوحة التحكم.

## FR-HOW-002
كل خطوة تدعم:
- العنوان.
- الوصف.
- الرقم/الترتيب.
- أيقونة أو Media.

---

# 7. Case Studies

## FR-CS-001
إنشاء وتعديل وأرشفة Case Study.

## FR-CS-002
كل Case Study تدعم:
- Title.
- Client Name أو Anonymous Label.
- Country.
- Industry.
- Challenge.
- Solution.
- Services Used.
- Results.
- Metrics.
- Gallery.
- Testimonial.
- Featured.
- SEO.

## FR-CS-003
إمكانية إخفاء هوية العميل لأسباب NDA.

## FR-CS-004
ربط Case Study بالخدمات والقطاعات.

---

# 8. Insights / Knowledge Center

## FR-INS-001
إدارة أنواع محتوى مثل:
- Articles.
- Guides.
- Reports.
- News/Updates عند الحاجة.

## FR-INS-002
كل محتوى يدعم:
- Title.
- Slug.
- Cover.
- Excerpt.
- Rich Content.
- Author.
- Category.
- Tags.
- Publish Date.
- Related Services.
- Related Industries.
- Downloadable File عند الحاجة.
- SEO.

## FR-INS-003
دعم Draft / Published / Archived.

## FR-INS-004
دعم Scheduled Publishing إذا تم اعتماده.

## FR-INS-005
صفحات Listing مع:
- Search.
- Filtering.
- Pagination.

---

# 9. FAQ

## FR-FAQ-001
إنشاء وتعديل وحذف/أرشفة FAQ.

## FR-FAQ-002
تصنيف FAQ.

## FR-FAQ-003
ربط FAQ بخدمة أو صفحة عند الحاجة.

## FR-FAQ-004
ترتيب العناصر.

---

# 10. Team

## FR-TEAM-001
إدارة أعضاء الفريق.

## FR-TEAM-002
بيانات العضو:
- Name.
- Position.
- Photo.
- Bio.
- LinkedIn.
- Display Order.
- Active/Inactive.

---

# 11. Testimonials

## FR-TST-001
إدارة آراء العملاء.

## FR-TST-002
بيانات الرأي:
- Client Name.
- Position.
- Company.
- Company Logo.
- Country.
- Testimonial.
- Featured.
- Display Order.

---

# 12. Partners / Clients Logos

## FR-PRT-001
إدارة Logos للشركاء/العملاء/الجهات ذات العلاقة.

## FR-PRT-002
إتاحة التصنيف والترتيب والرابط الخارجي عند الحاجة.

---

# 13. Media Library

## FR-MEDIA-001
رفع:
- Images.
- Video files أو روابط الفيديو حسب السياسة.
- PDFs.
- Documents.
- Logos.
- Icons.

## FR-MEDIA-002
دعم Multiple Upload.

## FR-MEDIA-003
دعم Folders.

## FR-MEDIA-004
Search & Filter.

## FR-MEDIA-005
Preview.

## FR-MEDIA-006
حفظ Metadata:
- Original filename.
- MIME type.
- Size.
- Dimensions.
- Uploader.
- Created date.

## FR-MEDIA-007
Alt Text وCaption قابلان للترجمة.

## FR-MEDIA-008
إعادة استخدام الوسيط في أكثر من محتوى.

## FR-MEDIA-009
منع حذف ملف مستخدم أو تحذير المسؤول قبل الحذف.

## FR-MEDIA-010
إمكانية استبدال الملف مع الحفاظ على المرجع إذا تم اعتماد ذلك.

---

# 14. Navigation & Footer

## FR-NAV-001
إدارة القوائم من لوحة التحكم.

## FR-NAV-002
دعم:
- Main Navigation.
- Footer menus.
- Custom links.
- Internal links.
- External links.
- ترتيب العناصر.
- Nested navigation عند الحاجة.

## FR-NAV-003
الترجمة لكل عنصر قائمة.

---

# 15. Contact Form

## FR-CONTACT-001
نموذج تواصل عام.

## FR-CONTACT-002
الحقول المقترحة:
- Full Name.
- Company.
- Email.
- Phone.
- Country.
- Subject.
- Message.

## FR-CONTACT-003
حفظ الطلب في قاعدة البيانات.

## FR-CONTACT-004
إرسال إشعار للفريق عبر البريد الإلكتروني.

## FR-CONTACT-005
إظهار رسالة نجاح واضحة للزائر.

---

# 16. Book a Consultation

## FR-CONS-001
نموذج مستقل لحجز/طلب استشارة.

## FR-CONS-002
الحقول المقترحة:
- Full Name.
- Company.
- Business Email.
- Phone.
- Country.
- Service Required.
- Company Stage.
- Estimated Timeline.
- Message.

## FR-CONS-003
حفظ الطلب كـLead.

## FR-CONS-004
تمييز مصدره بأنه Consultation Request.

---

# 17. Market Entry Assessment

## FR-ASSM-001
توفير Assessment متعدد الخطوات.

## FR-ASSM-002
الأسئلة قابلة للإدارة من النظام قدر الإمكان.

## FR-ASSM-003
الأسئلة المبدئية:
- Industry.
- Company Country.
- Current Saudi presence.
- Objective.
- Entry Timeline.
- Need for company formation.
- Need for local partner.
- Additional Notes.

## FR-ASSM-004
حفظ الإجابات وربطها بالـLead.

## FR-ASSM-005
إمكانية عرض Summary للإدارة.

## FR-ASSM-006
إرسال إشعار عند وصول Assessment جديد.

---

# 18. Lead Management

## FR-LEAD-001
قائمة مركزية للـLeads.

## FR-LEAD-002
مصادر الـLead:
- Contact.
- Consultation.
- Assessment.
- Landing Page.
- Manual Entry مستقبلًا.

## FR-LEAD-003
بيانات Lead:
- Name.
- Company.
- Email.
- Phone.
- Country.
- Service.
- Industry.
- Message.
- Source.
- UTM Source.
- UTM Medium.
- UTM Campaign.
- Created At.

## FR-LEAD-004
حالات مبدئية:
- New.
- Contacted.
- Qualified.
- Proposal.
- Won.
- Lost.

## FR-LEAD-005
إضافة Internal Notes.

## FR-LEAD-006
Assign To User.

## FR-LEAD-007
تسجيل تغيير الحالة.

## FR-LEAD-008
فلترة وبحث وترتيب Leads.

## FR-LEAD-009
Export CSV/Excel إذا تم اعتماده.

---

# 19. SEO Management

## FR-SEO-001
لكل صفحة/محتوى:
- SEO Title.
- Meta Description.
- OG Title.
- OG Description.
- OG Image.
- Canonical.
- Index / NoIndex.

## FR-SEO-002
Metadata مستقلة لكل لغة.

## FR-SEO-003
إنشاء Sitemap.

## FR-SEO-004
دعم robots.txt.

## FR-SEO-005
دعم hreflang للنسخ المترجمة.

## FR-SEO-006
دعم Structured Data المناسبة:
- Organization.
- Service.
- Article.
- FAQ.
- Breadcrumb.

## FR-SEO-007
إدارة Redirects عند تغيير Slugs إذا تم اعتمادها.

---

# 20. General Website Settings

## FR-SET-001
إدارة:
- Company Name.
- Logo.
- Favicon.
- Contact Email.
- Phone.
- Address.
- Social Links.
- Default SEO.
- Default OG Image.

## FR-SET-002
إدارة روابط Social Media.

## FR-SET-003
إدارة نصوص Header/Footer الأساسية القابلة للتعديل.

---

# 21. Analytics & Tracking

## FR-AN-001
دعم Google Analytics 4.

## FR-AN-002
دعم Google Tag Manager.

## FR-AN-003
دعم Search Console من الجانب التقني.

## FR-AN-004
تسجيل UTM Parameters مع Leads.

## FR-AN-005
دعم Events الأساسية مثل:
- CTA Click.
- Contact Submit.
- Consultation Submit.
- Assessment Start.
- Assessment Complete.
- Download Report.

---

# 22. Users, Roles & Permissions

## FR-AUTH-001
تسجيل دخول آمن للوحة الإدارة.

## FR-AUTH-002
إدارة المستخدمين الإداريين.

## FR-AUTH-003
دعم Roles & Permissions.

## FR-AUTH-004
أمثلة صلاحيات:
- Super Admin.
- Content Manager.
- Marketing.
- Sales.
- Viewer.

## FR-AUTH-005
تقييد عمليات CRUD حسب الصلاحية.

## FR-AUTH-006
استعادة كلمة المرور.

---

# 23. Audit / Activity

## FR-AUD-001
تسجيل العمليات الحساسة في لوحة الإدارة، مثل:
- Create.
- Update.
- Delete/Archive.
- Publish.
- Lead status changes.

## FR-AUD-002
إظهار:
- المستخدم.
- العملية.
- الكيان.
- التاريخ.

> مستوى تفصيل الـAudit النهائي يعتمد مع العميل والفريق التقني.

---

# 24. Public Search

## FR-SRCH-001
إمكانية البحث في Insights على الأقل.

## FR-SRCH-002
إمكانية توسيع البحث لاحقًا ليشمل الخدمات والقطاعات.

---

# 25. Forms Protection

## FR-FORM-001
التحقق من صحة المدخلات.

## FR-FORM-002
حماية النماذج من Spam / Bots.

## FR-FORM-003
تطبيق Rate Limiting مناسب.

## FR-FORM-004
عدم كشف أخطاء داخلية للمستخدم.

---

# 26. Responsive Website

## FR-RESP-001
جميع صفحات الموقع تعمل على:
- Mobile.
- Tablet.
- Desktop.

## FR-RESP-002
Navigation متوافقة مع الشاشات الصغيرة.

## FR-RESP-003
النماذج والـCMS-generated sections تعمل بصورة Responsive.

---

# 27. نطاق مستقبلي غير ملزم في V1

هذه ليست متطلبات V1 إلا إذا اعتمدها العميل:

- Client Portal.
- Project Tracking.
- Secure Client Documents.
- Invoicing.
- Payment Gateway.
- Advanced CRM.
- Calendar booking integration.
- WhatsApp integration.
- Marketing Automation.
- AI assistant.
- Government API integrations.
- Mobile Applications.

---

# 28. نقاط تحتاج قرار العميل قبل الاعتماد النهائي

1. هل العربية والإنجليزية هما لغتا الإطلاق؟
2. هل إضافة اللغات ستكون من Super Admin فقط؟
3. هل نستخدم Fallback للترجمة أم نخفي المحتوى غير المترجم؟
4. ما الخدمات الرسمية النهائية؟
5. ما القطاعات الرسمية؟
6. هل الأسعار تظهر للعامة؟
7. هل Case Studies بأسماء العملاء؟
8. هل Testimonials حقيقية ومتاحة للنشر؟
9. هل يوجد Booking Calendar فعلي أم Request Form فقط؟
10. هل Assessment يعطي نتيجة تلقائية للعميل أم يرسل البيانات للفريق فقط؟
11. هل يحتاج Sales Team إلى Assignment وNotes من V1؟
12. هل نحتاج Export للـLeads؟
13. هل Scheduled Publishing مطلوب؟
14. هل Video Upload مباشر أم Embed فقط؟
15. هل Redirect Manager مطلوب من V1؟
16. هل Audit Log كامل مطلوب؟
17. ما حسابات Analytics المطلوبة؟
18. هل توجد تكاملات خارجية يجب تضمينها من الإصدار الأول؟
