# GATEVIA — المتطلبات غير الوظيفية
**الإصدار:** Draft v0.2 — للمراجعة مع العميل قبل الاعتماد  
**الحالة:** غير معتمد  
**المرجع:** GATEVIA Functional Requirements v0.1

---

# 1. الأداء

## NFR-PERF-001
يجب تصميم الموقع لتحقيق تحميل سريع للصفحات العامة.

## NFR-PERF-002
استخدام:
- SSR / SSG / Caching وفق نوع الصفحة.
- Image Optimization.
- Lazy Loading.
- Code Splitting.
- CDN للوسائط.

## NFR-PERF-003
يجب ألا تعتمد الصفحة العامة على تحميل كمية كبيرة غير ضرورية من JavaScript.

## NFR-PERF-004
الصور الكبيرة يجب أن تتوفر بأحجام محسنة للعرض.

## NFR-PERF-005
يجب مراقبة Core Web Vitals والسعي للوصول إلى نتائج جيدة خصوصًا للصفحات التسويقية الرئيسية.

---

# 2. القابلية للتوسع

## NFR-SCALE-001
النظام يجب أن يدعم إضافة:
- لغات.
- صفحات.
- خدمات.
- قطاعات.
- Case Studies.
- Articles.
دون تعديل معماري جذري.

## NFR-SCALE-002
بنية الترجمة يجب ألا تعتمد على أعمدة ثابتة مثل `title_ar` و`title_en`.

## NFR-SCALE-003
يجب أن يسمح التصميم التقني بإضافة Client Portal مستقبلًا دون إعادة بناء الموقع العام.

## NFR-SCALE-004
Media Storage يجب أن يكون منفصلًا عن خادم التطبيق قدر الإمكان.

---

# 3. قاعدة البيانات

## NFR-DB-001
قاعدة البيانات الموصى بها: **PostgreSQL**.

## NFR-DB-002
استخدام Foreign Keys وConstraints للحفاظ على سلامة العلاقات.

## NFR-DB-003
يمكن استخدام JSONB في البيانات المرنة التي لا تحتاج نموذجًا علائقيًا ثابتًا بالكامل.

## NFR-DB-004
عدم تخزين Binary Media files داخل PostgreSQL إلا لسبب تقني معتمد.

## NFR-DB-005
تطبيق Indexes على الاستعلامات المتكررة والحقول المستخدمة في البحث والفلترة.

---

# 4. الأمان

## NFR-SEC-001
جميع الاتصالات العامة والإدارية عبر HTTPS.

## NFR-SEC-002
تخزين كلمات المرور باستخدام خوارزمية Hash قوية مناسبة.

## NFR-SEC-003
تطبيق Role-Based Access Control.

## NFR-SEC-004
Validation لجميع مدخلات المستخدم.

## NFR-SEC-005
الحماية من:
- SQL Injection.
- XSS.
- CSRF بحسب نمط المصادقة.
- Broken Access Control.
- Brute Force.
- File Upload Abuse.

## NFR-SEC-006
تطبيق Rate Limiting للنقاط الحساسة والنماذج العامة.

## NFR-SEC-007
تحديد أنواع وأحجام الملفات المسموحة في Media Library.

## NFR-SEC-008
عدم عرض Stack Traces أو تفاصيل داخلية للزائر.

## NFR-SEC-009
إدارة Secrets من Environment / Secret Management وليس داخل Source Code.

## NFR-SEC-010
تسجيل العمليات الإدارية الحساسة عند الحاجة.

---

# 5. الخصوصية وحماية البيانات

## NFR-PRIV-001
جمع أقل قدر ضروري من بيانات الزوار والعملاء المحتملين.

## NFR-PRIV-002
يجب توفير Privacy Policy واضحة قبل الإطلاق.

## NFR-PRIV-003
يجب تحديد فترة الاحتفاظ بالـLeads والبيانات الشخصية ضمن سياسة العمل.

## NFR-PRIV-004
تقييد الاطلاع على بيانات Leads حسب الصلاحيات.

## NFR-PRIV-005
يجب مراجعة متطلبات الأنظمة السعودية ذات الصلة بحماية البيانات الشخصية عند اعتماد النطاق القانوني والتشغيلي النهائي، وعدم اعتبار هذه الوثيقة استشارة قانونية.

## NFR-PRIV-006
عند استخدام أدوات Analytics/Cookies خارجية، يجب تقييم الحاجة إلى Consent Management حسب الأدوات والأسواق المستهدفة.

---

# 6. الاعتمادية والتوفر

## NFR-REL-001
النظام يجب أن يتحمل فشل خدمة طرف ثالث دون توقف الموقع العام قدر الإمكان.

## NFR-REL-002
فشل إرسال Email يجب ألا يؤدي إلى فقدان Lead بعد حفظه في قاعدة البيانات.

## NFR-REL-003
العمليات الحساسة يجب أن تكون Atomic / Transactional عند الحاجة.

## NFR-REL-004
يجب توفير Health Checks لخدمات التطبيق الأساسية.

---

# 7. النسخ الاحتياطي والاستعادة

## NFR-BACKUP-001
توفير نسخ احتياطية دورية لقاعدة البيانات.

## NFR-BACKUP-002
تحديد Backup Retention Policy قبل الإنتاج.

## NFR-BACKUP-003
يجب اختبار إمكانية الاستعادة بصورة دورية.

## NFR-BACKUP-004
Media Storage يجب أن تكون له سياسة حماية/نسخ مناسبة حسب مزود التخزين.

---

# 8. المراقبة والسجلات

## NFR-OBS-001
توفير Application Logs منظمة.

## NFR-OBS-002
مراقبة أخطاء Backend وFrontend في بيئة الإنتاج.

## NFR-OBS-003
تتبع:
- API failures.
- Failed form submissions.
- Email delivery failures.
- Unexpected 5xx errors.

## NFR-OBS-004
يفضل ربط Error Monitoring مثل Sentry أو ما يعادله.

---

# 9. SEO التقني

## NFR-SEO-001
جميع الصفحات العامة المهمة يجب أن تكون قابلة للفهرسة وفق إعدادات الإدارة.

## NFR-SEO-002
HTML يجب أن يحتوي Metadata مناسبًا من الخادم/وقت البناء قدر الإمكان.

## NFR-SEO-003
دعم:
- Sitemap XML.
- robots.txt.
- Canonical.
- hreflang.
- Open Graph.
- Structured Data.

## NFR-SEO-004
تجنب Duplicate Content بين اللغات.

## NFR-SEO-005
URLs نظيفة ومقروءة.

---

# 10. تعدد اللغات

## NFR-I18N-001
يجب ألا يكون عدد اللغات محدودًا مسبقًا في نموذج البيانات.

## NFR-I18N-002
دعم RTL / LTR بصورة صحيحة في جميع Components.

## NFR-I18N-003
يجب أن تكون اللغة جزءًا واضحًا من سياق الصفحة والـURL حسب الاستراتيجية المعتمدة.

## NFR-I18N-004
الواجهة الإدارية يجب أن تجعل حالة الترجمة واضحة للمحرر.

## NFR-I18N-005
يجب دعم Unicode بالكامل.

---

# 11. سهولة الاستخدام UX

## NFR-UX-001
تجربة الزائر يجب أن توضح خلال ثوانٍ:
- ماذا تقدم GATEVIA.
- لمن تقدم الخدمة.
- لماذا GATEVIA.
- ما الخطوة التالية.

## NFR-UX-002
يجب أن تتوفر CTA واضحة في الصفحات الرئيسية.

## NFR-UX-003
النماذج يجب ألا تطلب بيانات غير ضرورية.

## NFR-UX-004
رسائل النجاح والخطأ يجب أن تكون واضحة ومترجمة.

## NFR-UX-005
لوحة الإدارة يجب أن تكون قابلة للاستخدام من غير المطورين.

---

# 12. إمكانية الوصول Accessibility

## NFR-A11Y-001
الالتزام قدر الإمكان بممارسات WCAG 2.2 AA المناسبة لنطاق المشروع.

## NFR-A11Y-002
دعم Keyboard Navigation للعناصر الأساسية.

## NFR-A11Y-003
استخدام Contrast مناسب.

## NFR-A11Y-004
Alt Text للصور المهمة.

## NFR-A11Y-005
Labels واضحة للنماذج.

## NFR-A11Y-006
عدم الاعتماد على اللون وحده لإيصال معنى مهم.

---

# 13. التوافق مع الأجهزة والمتصفحات

## NFR-COMP-001
دعم Responsive Design كامل.

## NFR-COMP-002
دعم الإصدارات الحديثة من:
- Chrome.
- Edge.
- Safari.
- Firefox.

## NFR-COMP-003
دعم Mobile Safari وChrome Android.

## NFR-COMP-004
لا يشترط دعم المتصفحات القديمة غير المدعومة أمنيًا ما لم يطلب العميل ذلك صراحة.

---

# 14. إدارة الوسائط

## NFR-MEDIA-001
Media Storage عبر Object Storage مثل Cloudflare R2 أو S3-compatible storage.

## NFR-MEDIA-002
تقديم الصور عبر CDN قدر الإمكان.

## NFR-MEDIA-003
إنشاء Variants / Resized Images حسب الاستخدام.

## NFR-MEDIA-004
دعم WebP و/أو AVIF للصور المناسبة.

## NFR-MEDIA-005
عدم تحميل Original عالي الدقة في أماكن لا تحتاجه.

## NFR-MEDIA-006
تطبيق قيود رفع حسب:
- File type.
- File size.
- Dimensions عند الحاجة.

---

# 15. قابلية الصيانة

## NFR-MAINT-001
استخدام TypeScript في Frontend وBackend.

## NFR-MAINT-002
تقسيم النظام إلى Modules واضحة.

## NFR-MAINT-003
عدم Hardcode محتوى الشركة داخل Frontend متى كان من المفترض إدارته عبر CMS.

## NFR-MAINT-004
استخدام Migrations موثقة لتغييرات قاعدة البيانات.

## NFR-MAINT-005
توحيد Error Handling وAPI response conventions.

## NFR-MAINT-006
توفير Documentation مناسبة للتشغيل والإدارة.

---

# 16. جودة الكود

## NFR-QUAL-001
تطبيق Linting وFormatting.

## NFR-QUAL-002
منع TypeScript build errors قبل النشر.

## NFR-QUAL-003
Code Review قبل دمج التغييرات المهمة.

## NFR-QUAL-004
استخدام Naming Conventions ثابتة.

## NFR-QUAL-005
عدم تخزين أسرار أو Credentials داخل Repository.

---

# 17. API

## NFR-API-001
Versioning للـAPI إذا كان مناسبًا.

## NFR-API-002
Responses متسقة.

## NFR-API-003
Pagination للقوائم الكبيرة.

## NFR-API-004
Filtering / Sorting بطريقة منظمة.

## NFR-API-005
Authentication/Authorization للـAdmin endpoints.

## NFR-API-006
عدم إتاحة بيانات داخلية غير مطلوبة في Public API.

---

# 18. البريد والإشعارات

## NFR-MAIL-001
استخدام مزود Email Transactional موثوق.

## NFR-MAIL-002
ضبط SPF / DKIM / DMARC حسب الدومين والمزود قبل الإنتاج.

## NFR-MAIL-003
فشل البريد لا يحذف أو يلغي Lead المحفوظ.

## NFR-MAIL-004
يجب تسجيل حالة الإرسال أو الخطأ عند الحاجة.

---

# 19. التحليلات

## NFR-AN-001
Analytics scripts يجب ألا تؤثر بصورة كبيرة على الأداء.

## NFR-AN-002
تحميل أدوات الطرف الثالث بما يتوافق مع سياسة Cookies/Consent المعتمدة.

## NFR-AN-003
يجب الحفاظ على UTM parameters عند انتقال المستخدم إلى نموذج التحويل.

---

# 20. قابلية النشر والتشغيل

## NFR-DEP-001
فصل بيئات:
- Development.
- Staging.
- Production.
قدر الإمكان.

## NFR-DEP-002
Environment configuration خارج Source Code.

## NFR-DEP-003
توفير طريقة Deployment قابلة للتكرار.

## NFR-DEP-004
إجراء Database Migration بشكل منضبط قبل/أثناء النشر.

## NFR-DEP-005
إمكانية Rollback أو استعادة الإصدار السابق عند فشل نشر مهم.

---

# 21. الاستضافة

المتطلبات النهائية تعتمد على حجم الزيارات وخطة العميل، لكن البنية يجب أن تسمح بفصل:

- Frontend.
- Backend.
- PostgreSQL.
- Object Storage.
- CDN.

ولا يشترط منذ البداية فصل كل خدمة على خادم مستقل.

---

# 22. قابلية التوسع إلى Client Portal

## NFR-FUT-001
تصميم Users/Roles بطريقة لا تمنع إضافة Client Users مستقبلًا.

## NFR-FUT-002
عدم ربط CMS بشكل يمنع إضافة:
- Projects.
- Documents.
- Tasks.
- Deliverables.
- Client Communication.

## NFR-FUT-003
التوسع المستقبلي لا يعني تنفيذ هذه الوحدات في V1.

---

# 23. معايير القبول غير الوظيفية قبل الإنتاج

قبل Go-Live يجب التحقق على الأقل من:

- HTTPS مفعل.
- Production secrets سليمة.
- Backup يعمل.
- Error Monitoring يعمل.
- Admin access محمي.
- Forms محمية من Spam.
- Media upload restrictions مفعلة.
- Sitemap وrobots.txt صحيحان.
- hreflang صحيح للغات المنشورة.
- Mobile responsive pass.
- RTL pass.
- LTR pass.
- Major browsers pass.
- Page metadata pass.
- No broken links الأساسية.
- No exposed stack traces.
- Build/Lint pass.
- Analytics الأساسية مفعلة حسب الاتفاق.

---

# 24. قرارات غير وظيفية تحتاج اعتماد

1. مزود الاستضافة النهائي.
2. مزود Object Storage النهائي.
3. مزود Transactional Email.
4. مدة الاحتفاظ بالنسخ الاحتياطية.
5. RPO/RTO المطلوبان إن كان العميل يحتاج SLA رسميًا.
6. هل يوجد SLA Availability رسمي؟
7. سياسة Cookies/Consent.
8. سياسة الاحتفاظ بالـLeads.
9. مستوى Audit Logging.
10. هل نحتاج WAF/Cloudflare Rules متقدمة.
11. هل Admin MFA مطلوب من V1.
12. هل Staging إلزامي ودائم.
13. هل يوجد متطلب Hosting/Data Residency محدد من العميل أو الجهة القانونية.
14. هل يوجد معيار أمني/امتثال خاص بالعميل يتجاوز المتطلبات العامة المذكورة.


---

# 21. Theme Quality & Rendering

## NFR-THEME-001
يجب أن يكون Light Mode وDark Mode مبنيين على Semantic Design Tokens مشتركة، وليس على HEX values متناثرة أو Overrides عشوائية.

## NFR-THEME-002
يجب ألا يظهر Theme Flash / FOUC واضح عند التحميل الأول، وألا تحدث Hydration Mismatch بسبب تحديد الـTheme.

## NFR-THEME-003
يجب أن يحقق النص والعناصر التفاعلية والـFocus States تباينًا مناسبًا في كل من Light وDark، بما يتوافق مع هدف WCAG 2.2 AA ضمن نطاق المشروع.

## NFR-THEME-004
اختيار Theme يجب أن يكون Server-readable أو مهيأ قبل أول Paint بطريقة آمنة؛ لا يُقبل الاعتماد على `localStorage` بعد hydration باعتباره الحل الوحيد إذا كان سيؤدي إلى وميض أو اختلاف في الرندر.

## NFR-THEME-005
تبديل Theme يجب ألا يتطلب إعادة تحميل الصفحة، وألا يسبب Layout Shift ملحوظًا.

## NFR-THEME-006
يجب اختبار كلا الوضعين على الصفحات المرجعية، RTL/LTR، Responsive breakpoints، والمتصفحات المدعومة.

## NFR-THEME-007
الصور والشعارات والرسوم البيانية التي تحتاج معاملة مختلفة حسب الخلفية يجب أن تستخدم Asset variants أو Containers معتمدة؛ لا يجوز عكس ألوان شعارات العملاء/الشركاء آليًا بصورة تشوه الهوية.
