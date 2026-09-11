import { createServer } from 'node:http';

const isArabic = (url) => new URL(url, 'http://localhost').searchParams.get('locale')?.toLowerCase().startsWith('ar');
const localized = (ar, en, arMode) => (arMode ? ar : en);

const services = [
  ['access', 'Market Research', 'أبحاث السوق', 'market-research', 'أبحاث-السوق', 'Build a grounded view of customers, demand and competitors.', 'بناء رؤية واقعية عن العملاء والطلب والمنافسين.'],
  ['access', 'Market Entry Strategy', 'استراتيجية دخول السوق', 'market-entry-strategy', 'استراتيجية-دخول-السوق', 'Turn evidence into a clear, prioritized market-entry roadmap.', 'تحويل الأدلة إلى خارطة طريق واضحة ومرتبة لدخول السوق.'],
  ['execution', 'Company Formation Support', 'دعم تأسيس الشركات', 'company-formation-support', 'دعم-تأسيس-الشركات', 'Coordinate the practical workstream toward company establishment.', 'تنسيق مسار العمل العملي للوصول إلى تأسيس الشركة.'],
  ['execution', 'Licensing Support', 'دعم التراخيص', 'licensing-support', 'دعم-التراخيص', 'Organize licensing requirements and business-readiness steps.', 'تنظيم متطلبات التراخيص وخطوات الجاهزية لممارسة النشاط.'],
  ['growth', 'Go-To-Market Strategy', 'استراتيجية الذهاب إلى السوق', 'go-to-market-strategy', 'استراتيجية-الذهاب-إلى-السوق', 'Define segments, channels, positioning and launch priorities.', 'تحديد الشرائح والقنوات والتموضع وأولويات الإطلاق.'],
  ['growth', 'Growth Consulting', 'استشارات النمو', 'growth-consulting', 'استشارات-النمو', 'Prioritize opportunities and build an actionable expansion path.', 'ترتيب الفرص وبناء مسار قابل للتنفيذ للتوسع.'],
];

const questions = [
  ['Where should a company start when considering the Saudi market?', 'من أين تبدأ الشركة عند التفكير في دخول السوق السعودي؟'],
  ['Why is market research important before establishment?', 'لماذا تعد أبحاث السوق مهمة قبل التأسيس؟'],
  ['What is the difference between market research and a feasibility study?', 'ما الفرق بين أبحاث السوق ودراسة الجدوى؟'],
  ['Does GATEVIA support only company formation?', 'هل تقتصر خدمات GATEVIA على تأسيس الشركات فقط؟'],
  ['Can GATEVIA support local partner or distributor identification?', 'هل يمكن لـGATEVIA دعم البحث عن شريك محلي أو موزع؟'],
  ['What stages does a Saudi market-entry journey typically include?', 'ما المراحل التي تتضمنها رحلة دخول السوق السعودي؟'],
];

const journey = [
  ['Understand', 'افهم'], ['Validate', 'تحقق'], ['Enter', 'ادخل'],
  ['Establish', 'أسّس'], ['Operate', 'شغّل'], ['Grow', 'انمُ'],
];

function page(ar) {
  const serviceItems = services.map((service, index) => ({
    id: `service-${index}`,
    categoryId: service[0],
    translations: [{ title: ar ? service[2] : service[1], slug: ar ? service[4] : service[3], shortDescription: ar ? service[6] : service[5] }],
  }));
  const faqItems = questions.map((question, index) => ({
    id: `faq-${index}`,
    translations: [{ question: ar ? question[1] : question[0], answer: localized('إجابة واضحة ومباشرة تساعد فريقك على اتخاذ القرار المناسب للمرحلة الحالية.', 'A clear, direct answer that helps your team make the right decision for its current stage.', ar) }],
  }));
  const steps = journey.map((step, index) => ({ marker: String(index + 1).padStart(2, '0'), title: ar ? step[1] : step[0], body: localized('وصف موجز للقرار والعمل المطلوب في هذه المرحلة.', 'A concise description of the decision and work required at this stage.', ar) }));

  return {
    id: 'home',
    translations: [{ title: localized('بوابتك لدخول السوق السعودي والنمو فيه', 'Your Gateway to the Saudi Market', ar), slug: 'home' }],
    sections: [
      { id: 'hero', sectionType: 'hero', translations: [{ content: { eyebrow: 'GATEVIA · SAUDI ARABIA', title: localized('بوابتك لدخول السوق السعودي والنمو فيه', 'Your Gateway to the Saudi Market', ar), body: localized('بحث وتنفيذ ودعم للنمو للشركات التي تبني مسارها نحو السوق السعودي.', 'Research, execution and growth support for companies entering Saudi Arabia.', ar), primaryCta: { label: localized('احجز استشارة', 'Book a consultation', ar), href: `/${ar ? 'ar-SA' : 'en'}/book-consultation` } } }] },
      { id: 'pillars', sectionType: 'process', translations: [{ content: { eyebrow: 'GATEVIA', title: localized('منظومة واحدة لرحلتك في السوق', 'One system for your market journey', ar), steps: steps.slice(0, 3) } }] },
      { id: 'journey', sectionType: 'timeline', translations: [{ content: { eyebrow: localized('رحلة دخول السوق السعودي', 'Saudi market entry journey', ar), title: localized('مسار واضح من الفهم إلى النمو', 'A clear path from understanding to growth', ar), steps } }] },
      { id: 'services', sectionType: 'services_grid', translations: [{ content: { title: localized('خدمات مختارة', 'Selected services', ar), body: localized('ابدأ بمسار العمل الذي يتوافق مع مرحلتك الحالية.', 'Start with the workstream that matches your current stage.', ar) } }], collections: { services: serviceItems } },
      { id: 'faq-section', sectionType: 'faq', translations: [{ content: { title: localized('أسئلة شائعة', 'Common questions', ar) } }], collections: { faqs: faqItems } },
    ],
  };
}

createServer((request, response) => {
  const url = request.url ?? '/';
  const ar = isArabic(url);
  let data = {};
  if (url.includes('/public/languages')) data = [{ code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: true }, { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isDefault: false }];
  else if (url.includes('/public/settings')) data = { values: { 'company.name': 'GATEVIA' }, media: {} };
  else if (url.includes('/public/navigation/')) data = { items: [] };
  else if (url.includes('/public/pages/home')) data = page(ar);
  response.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  response.end(JSON.stringify({ data }));
}).listen(3002, '127.0.0.1');
