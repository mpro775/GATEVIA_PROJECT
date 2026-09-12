import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CONTENT_STATUS =
  process.env.GATEVIA_CONTENT_SEED_STATUS === 'published' ? ('published' as const) : ('draft' as const);
const PUBLISHED_AT = CONTENT_STATUS === 'published' ? new Date() : null;

const locales = ['en', 'ar-SA'] as const;
type Locale = (typeof locales)[number];
type Localized<T> = Record<Locale, T>;

function stableUuid(key: string): string {
  const hex = createHash('sha256').update(`gatevia-initial-content-v1:${key}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function localized<T>(en: T, ar: T): Localized<T> {
  return { en, 'ar-SA': ar };
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function seoTitle(title: string) {
  return `${title} | GATEVIA`;
}

const categories = [
  {
    key: 'market-access',
    sortOrder: 10,
    tr: localized(
      {
        name: 'Market Access',
        slug: 'market-access',
        description: 'Research, validation and strategy for informed entry into the Saudi market.',
      },
      {
        name: 'دخول السوق',
        slug: 'دخول-السوق',
        description: 'البحث والتحقق وبناء الاستراتيجية لاتخاذ قرار مدروس عند دخول السوق السعودي.',
      },
    ),
  },
  {
    key: 'execution',
    sortOrder: 20,
    tr: localized(
      {
        name: 'Execution',
        slug: 'execution',
        description: 'Practical support for establishment, licensing, sourcing and operational readiness.',
      },
      {
        name: 'التنفيذ',
        slug: 'التنفيذ',
        description: 'دعم عملي للتأسيس والتراخيص والتوريد والجاهزية التشغيلية داخل المملكة.',
      },
    ),
  },
  {
    key: 'growth',
    sortOrder: 30,
    tr: localized(
      {
        name: 'Growth',
        slug: 'growth',
        description: 'Go-to-market, partnerships, distribution and growth support after market entry.',
      },
      {
        name: 'النمو',
        slug: 'النمو',
        description: 'دعم استراتيجية الإطلاق والشراكات والتوزيع والنمو بعد دخول السوق.',
      },
    ),
  },
] as const;

const categoryContent = {
  'market-access': localized(
    {
      whoFor: ['International companies evaluating Saudi Arabia', 'Founders validating a Saudi opportunity', 'Teams that need evidence before committing capital'],
      problems: ['Insufficient market visibility', 'Unclear demand or competitive position', 'Uncertain entry options and priorities'],
      deliverables: ['Structured research and analysis', 'Decision-ready findings', 'Clear market-entry recommendations'],
      process: ['Define the decision', 'Collect and assess evidence', 'Compare options', 'Translate findings into an entry direction'],
      benefits: ['Reduce uncertainty', 'Prioritize the right opportunities', 'Make better-informed entry decisions'],
    },
    {
      whoFor: ['الشركات الدولية التي تقيّم السوق السعودي', 'المؤسسون الذين يتحققون من فرصة داخل المملكة', 'الفرق التي تحتاج أدلة قبل الالتزام بالاستثمار'],
      problems: ['ضعف وضوح السوق', 'عدم وضوح الطلب أو الوضع التنافسي', 'تعدد خيارات الدخول وصعوبة ترتيب الأولويات'],
      deliverables: ['بحث وتحليل منظم', 'نتائج قابلة لاتخاذ القرار', 'توصيات واضحة لاتجاه دخول السوق'],
      process: ['تحديد القرار المطلوب', 'جمع الأدلة وتحليلها', 'مقارنة الخيارات', 'تحويل النتائج إلى اتجاه دخول واضح'],
      benefits: ['تقليل عدم اليقين', 'ترتيب الفرص حسب الأولوية', 'اتخاذ قرار دخول أكثر وعيًا'],
    },
  ),
  execution: localized(
    {
      whoFor: ['Companies ready to establish in Saudi Arabia', 'Teams coordinating licensing and setup', 'Businesses preparing local operations'],
      problems: ['Fragmented setup tasks', 'Multiple stakeholders and procedures', 'Need for local execution coordination'],
      deliverables: ['Structured setup plan', 'Execution coordination', 'Clear action and dependency tracking'],
      process: ['Confirm scope', 'Map requirements', 'Coordinate execution', 'Track readiness and handover'],
      benefits: ['Improve coordination', 'Reduce avoidable delays', 'Create a clearer path to operational readiness'],
    },
    {
      whoFor: ['الشركات المستعدة للتأسيس في السعودية', 'الفرق التي تنسق التراخيص والإعداد', 'الأعمال التي تستعد للتشغيل المحلي'],
      problems: ['تشتت مهام التأسيس', 'تعدد الأطراف والإجراءات', 'الحاجة إلى تنسيق تنفيذ محلي'],
      deliverables: ['خطة تأسيس منظمة', 'تنسيق خطوات التنفيذ', 'متابعة واضحة للإجراءات والاعتماديات'],
      process: ['تأكيد النطاق', 'حصر المتطلبات', 'تنسيق التنفيذ', 'متابعة الجاهزية والتسليم'],
      benefits: ['رفع كفاءة التنسيق', 'تقليل التأخيرات الممكن تجنبها', 'توضيح الطريق نحو الجاهزية التشغيلية'],
    },
  ),
  growth: localized(
    {
      whoFor: ['Companies preparing to launch in Saudi Arabia', 'Businesses seeking local growth channels', 'Teams building partnerships and distribution'],
      problems: ['Unclear route to market', 'Weak local commercial traction', 'Need for scalable partnership and distribution models'],
      deliverables: ['Go-to-market direction', 'Growth priorities', 'Partnership and channel development support'],
      process: ['Assess current position', 'Define target segments and channels', 'Build the commercial plan', 'Support execution and iteration'],
      benefits: ['Focus commercial effort', 'Improve market relevance', 'Build a stronger foundation for sustainable growth'],
    },
    {
      whoFor: ['الشركات التي تستعد للإطلاق في السعودية', 'الأعمال الباحثة عن قنوات نمو محلية', 'الفرق التي تبني شراكات وتوزيعًا داخل السوق'],
      problems: ['عدم وضوح مسار الوصول إلى السوق', 'ضعف الزخم التجاري المحلي', 'الحاجة إلى نموذج قابل للتوسع للشراكات والتوزيع'],
      deliverables: ['اتجاه واضح للذهاب إلى السوق', 'أولويات نمو محددة', 'دعم تطوير الشراكات والقنوات'],
      process: ['تقييم الوضع الحالي', 'تحديد الشرائح والقنوات', 'بناء الخطة التجارية', 'دعم التنفيذ والتحسين المستمر'],
      benefits: ['تركيز الجهد التجاري', 'رفع ملاءمة العرض للسوق', 'بناء أساس أقوى للنمو المستدام'],
    },
  ),
} as const;

const services = [
  // Market Access
  ['market-research', 'market-access', 'Market Research', 'أبحاث السوق', 'market-research', 'أبحاث-السوق', 'Build a grounded view of customers, demand, competitors and market dynamics before making entry decisions.', 'بناء رؤية واقعية عن العملاء والطلب والمنافسين وديناميكيات السوق قبل اتخاذ قرارات الدخول.'],
  ['feasibility-study', 'market-access', 'Feasibility Study', 'دراسة الجدوى', 'feasibility-study', 'دراسة-الجدوى', 'Assess the commercial and operational viability of a proposed Saudi market opportunity.', 'تقييم الجدوى التجارية والتشغيلية لفرصة مقترحة داخل السوق السعودي.'],
  ['competitor-analysis', 'market-access', 'Competitor Analysis', 'تحليل المنافسين', 'competitor-analysis', 'تحليل-المنافسين', 'Understand the competitive landscape, positioning patterns and market gaps relevant to your offer.', 'فهم المشهد التنافسي وأنماط التموضع والفجوات المرتبطة بعرضك في السوق.'],
  ['market-sizing', 'market-access', 'Market Sizing', 'تقدير حجم السوق', 'market-sizing', 'تقدير-حجم-السوق', 'Estimate the addressable opportunity and define practical assumptions for market potential.', 'تقدير حجم الفرصة المتاحة وبناء افتراضات عملية لفهم إمكانات السوق.'],
  ['customer-demand-research', 'market-access', 'Customer & Demand Research', 'أبحاث العملاء والطلب', 'customer-demand-research', 'أبحاث-العملاء-والطلب', 'Explore target customer needs, buying behavior and demand signals relevant to market entry.', 'استكشاف احتياجات العملاء المستهدفين وسلوك الشراء ومؤشرات الطلب المرتبطة بدخول السوق.'],
  ['market-entry-strategy', 'market-access', 'Market Entry Strategy', 'استراتيجية دخول السوق', 'market-entry-strategy', 'استراتيجية-دخول-السوق', 'Turn research and strategic choices into a clear, prioritized Saudi market-entry roadmap.', 'تحويل نتائج البحث والخيارات الاستراتيجية إلى خارطة طريق واضحة ومرتبة لدخول السوق السعودي.'],
  ['regulatory-landscape-assessment', 'market-access', 'Regulatory Landscape Assessment', 'تقييم المشهد التنظيمي', 'regulatory-landscape-assessment', 'تقييم-المشهد-التنظيمي', 'Map the regulatory landscape and identify requirements that may affect entry planning and execution.', 'رسم صورة للمشهد التنظيمي وتحديد المتطلبات التي قد تؤثر على تخطيط وتنفيذ دخول السوق.'],
  ['local-partner-search', 'market-access', 'Local Partner Search', 'البحث عن شريك محلي', 'local-partner-search', 'البحث-عن-شريك-محلي', 'Define partner criteria, identify candidates and support a structured local partner evaluation process.', 'تحديد معايير الشريك والبحث عن المرشحين ودعم عملية تقييم منظمة للشركاء المحليين.'],

  // Execution
  ['company-formation-support', 'execution', 'Company Formation Support', 'دعم تأسيس الشركات', 'company-formation-support', 'دعم-تأسيس-الشركات', 'Coordinate the practical workstream required to move from entry decision toward company establishment.', 'تنسيق مسار العمل العملي للانتقال من قرار دخول السوق إلى مرحلة تأسيس الشركة.'],
  ['licensing-support', 'execution', 'Licensing Support', 'دعم التراخيص', 'licensing-support', 'دعم-التراخيص', 'Organize licensing requirements and coordinate the steps needed for business readiness.', 'تنظيم متطلبات التراخيص وتنسيق الخطوات اللازمة للوصول إلى الجاهزية لممارسة النشاط.'],
  ['government-procedures-coordination', 'execution', 'Government Procedures Coordination', 'تنسيق الإجراءات الحكومية', 'government-procedures-coordination', 'تنسيق-الإجراءات-الحكومية', 'Structure and coordinate required procedural workstreams with clarity on dependencies and next actions.', 'تنظيم وتنسيق مسارات الإجراءات المطلوبة مع وضوح الاعتماديات والخطوات التالية.'],
  ['local-operations-setup', 'execution', 'Local Operations Setup', 'إعداد العمليات المحلية', 'local-operations-setup', 'إعداد-العمليات-المحلية', 'Support the practical setup of the local operating model, suppliers and launch readiness.', 'دعم الإعداد العملي لنموذج التشغيل المحلي والموردين والجاهزية للإطلاق.'],
  ['vendor-supplier-sourcing', 'execution', 'Vendor & Supplier Sourcing', 'البحث عن الموردين', 'vendor-supplier-sourcing', 'البحث-عن-الموردين', 'Identify and assess potential vendors and suppliers against defined operating requirements.', 'تحديد وتقييم الموردين المحتملين وفق متطلبات التشغيل والمعايير المحددة.'],
  ['recruitment-hr-support', 'execution', 'Recruitment / HR Support', 'دعم التوظيف والموارد البشرية', 'recruitment-hr-support', 'دعم-التوظيف-والموارد-البشرية', 'Support planning and coordination for the people requirements of a Saudi market launch.', 'دعم تخطيط وتنسيق الاحتياجات البشرية اللازمة لإطلاق النشاط في السوق السعودي.'],
  ['banking-financial-setup-guidance', 'execution', 'Banking & Financial Setup Guidance', 'إرشاد الإعداد المصرفي والمالي', 'banking-financial-setup-guidance', 'إرشاد-الإعداد-المصرفي-والمالي', 'Provide structured guidance around banking and financial setup workstreams for local readiness.', 'تقديم إرشاد منظم لمسارات الإعداد المصرفي والمالي المطلوبة للجاهزية المحلية.'],
  ['partner-distributor-identification', 'execution', 'Partner / Distributor Identification', 'تحديد الشركاء والموزعين', 'partner-distributor-identification', 'تحديد-الشركاء-والموزعين', 'Identify potential commercial partners or distributors aligned with your route-to-market requirements.', 'تحديد شركاء أو موزعين تجاريين محتملين بما يتوافق مع متطلبات الوصول إلى السوق.'],

  // Growth
  ['go-to-market-strategy', 'growth', 'Go-To-Market Strategy', 'استراتيجية الذهاب إلى السوق', 'go-to-market-strategy', 'استراتيجية-الذهاب-إلى-السوق', 'Define target segments, channels, positioning and priorities for launching and growing in Saudi Arabia.', 'تحديد الشرائح والقنوات والتموضع والأولويات اللازمة للإطلاق والنمو في السعودية.'],
  ['business-development', 'growth', 'Business Development', 'تطوير الأعمال', 'business-development', 'تطوير-الأعمال', 'Develop a structured commercial pipeline and market-development approach aligned with your goals.', 'بناء نهج منظم لتطوير السوق والفرص التجارية بما يتوافق مع أهدافك.'],
  ['distribution-strategy', 'growth', 'Distribution Strategy', 'استراتيجية التوزيع', 'distribution-strategy', 'استراتيجية-التوزيع', 'Evaluate distribution options and design a channel approach suited to the Saudi market.', 'تقييم خيارات التوزيع وبناء نهج قنوات يناسب طبيعة السوق السعودي.'],
  ['partnerships', 'growth', 'Partnerships', 'الشراكات', 'partnerships', 'الشراكات', 'Build a structured approach to identifying, prioritizing and developing strategic partnerships.', 'بناء نهج منظم لتحديد الشراكات الاستراتيجية وترتيبها وتطويرها.'],
  ['localization-strategy', 'growth', 'Localization Strategy', 'استراتيجية التوطين والمواءمة', 'localization-strategy', 'استراتيجية-التوطين-والمواءمة', 'Adapt positioning, customer experience and market approach to Saudi expectations and context.', 'مواءمة التموضع وتجربة العميل ونهج السوق مع توقعات وسياق السوق السعودي.'],
  ['marketing-strategy', 'growth', 'Marketing Strategy', 'استراتيجية التسويق', 'marketing-strategy', 'استراتيجية-التسويق', 'Define a focused marketing direction aligned with the target audience, offer and commercial priorities.', 'تحديد اتجاه تسويقي مركز يتوافق مع الجمهور المستهدف والعرض والأولويات التجارية.'],
  ['growth-consulting', 'growth', 'Growth Consulting', 'استشارات النمو', 'growth-consulting', 'استشارات-النمو', 'Prioritize growth opportunities, identify constraints and build an actionable path for expansion.', 'ترتيب فرص النمو وتحديد العوائق وبناء مسار قابل للتنفيذ للتوسع.'],
  ['expansion-strategy', 'growth', 'Expansion Strategy', 'استراتيجية التوسع', 'expansion-strategy', 'استراتيجية-التوسع', 'Plan the next stage of market expansion using evidence, commercial priorities and execution readiness.', 'تخطيط المرحلة التالية من التوسع بالاعتماد على الأدلة والأولويات التجارية والجاهزية للتنفيذ.'],
] as const;

const faqs = [
  {
    key: 'market-entry-start', categoryKey: 'market-entry', sortOrder: 10,
    tr: localized(
      { question: 'Where should a company start when considering the Saudi market?', answer: 'Start by clarifying the business objective, target customer and decision criteria, then validate demand, competition and the practical entry options before committing to an execution path.' },
      { question: 'من أين تبدأ الشركة عند التفكير في دخول السوق السعودي؟', answer: 'تبدأ بتحديد الهدف التجاري والعميل المستهدف ومعايير القرار، ثم التحقق من الطلب والمنافسة وخيارات الدخول العملية قبل الالتزام بمسار التنفيذ.' },
    ),
  },
  {
    key: 'market-entry-research', categoryKey: 'research', sortOrder: 20,
    tr: localized(
      { question: 'Why is market research important before establishment?', answer: 'Research helps separate assumptions from evidence and supports decisions about opportunity size, target segments, positioning, competitors and the most suitable entry approach.' },
      { question: 'لماذا تعد أبحاث السوق مهمة قبل التأسيس؟', answer: 'تساعد الأبحاث على فصل الافتراضات عن الأدلة وتدعم قرارات حجم الفرصة والشرائح المستهدفة والتموضع والمنافسين ونهج الدخول الأنسب.' },
    ),
  },
  {
    key: 'feasibility-vs-research', categoryKey: 'research', sortOrder: 30,
    tr: localized(
      { question: 'What is the difference between market research and a feasibility study?', answer: 'Market research focuses on understanding the market and customer environment, while a feasibility study assesses whether a defined business opportunity is commercially and operationally viable.' },
      { question: 'ما الفرق بين أبحاث السوق ودراسة الجدوى؟', answer: 'تركز أبحاث السوق على فهم السوق والعملاء، بينما تقيّم دراسة الجدوى ما إذا كانت فرصة عمل محددة قابلة للتطبيق تجاريًا وتشغيليًا.' },
    ),
  },
  {
    key: 'company-setup-scope', categoryKey: 'company-setup', sortOrder: 40,
    tr: localized(
      { question: 'Does GATEVIA support only company formation?', answer: 'The proposed GATEVIA service model covers the wider market-entry journey: understanding and validating the opportunity, coordinating establishment and operational readiness, then supporting go-to-market and growth.' },
      { question: 'هل تقتصر خدمات GATEVIA على تأسيس الشركات فقط؟', answer: 'يغطي نموذج خدمات GATEVIA المقترح رحلة دخول السوق بصورة أوسع: فهم الفرصة والتحقق منها، تنسيق التأسيس والجاهزية التشغيلية، ثم دعم الإطلاق والنمو.' },
    ),
  },
  {
    key: 'partner-search', categoryKey: 'market-entry', sortOrder: 50,
    tr: localized(
      { question: 'Can GATEVIA support local partner or distributor identification?', answer: 'Yes. The proposed scope includes defining partner criteria, identifying relevant candidates and supporting a structured evaluation process.' },
      { question: 'هل يمكن لـGATEVIA دعم البحث عن شريك محلي أو موزع؟', answer: 'نعم. يشمل النطاق المقترح تحديد معايير الشريك والبحث عن المرشحين المناسبين ودعم عملية تقييم منظمة.' },
    ),
  },
  {
    key: 'entry-journey', categoryKey: 'market-entry', sortOrder: 60,
    tr: localized(
      { question: 'What stages does a Saudi market-entry journey typically include?', answer: 'GATEVIA structures the journey around six stages: Understand, Validate, Enter, Establish, Operate and Grow. The exact workstream depends on the company and opportunity.' },
      { question: 'ما المراحل التي تتضمنها رحلة دخول السوق السعودي؟', answer: 'تنظم GATEVIA الرحلة حول ست مراحل: الفهم، التحقق، الدخول، التأسيس، التشغيل، ثم النمو. ويختلف نطاق العمل التفصيلي حسب الشركة والفرصة.' },
    ),
  },
  {
    key: 'growth-after-entry', categoryKey: 'growth', sortOrder: 70,
    tr: localized(
      { question: 'What happens after a company enters the market?', answer: 'The focus shifts to route-to-market execution, business development, partnerships, distribution, localization and structured growth priorities.' },
      { question: 'ماذا بعد دخول الشركة إلى السوق؟', answer: 'ينتقل التركيز إلى تنفيذ استراتيجية الوصول للسوق وتطوير الأعمال والشراكات والتوزيع والمواءمة المحلية وتحديد أولويات النمو.' },
    ),
  },
  {
    key: 'consultation', categoryKey: 'general', sortOrder: 80,
    tr: localized(
      { question: 'What should I prepare before booking a consultation?', answer: 'A short description of your company, target opportunity, current stage, priorities and expected timeline is enough to make the first discussion more useful.' },
      { question: 'ماذا أجهز قبل حجز الاستشارة؟', answer: 'يكفي تجهيز نبذة مختصرة عن الشركة والفرصة المستهدفة والمرحلة الحالية والأولويات والجدول الزمني المتوقع لتكون المحادثة الأولى أكثر فائدة.' },
    ),
  },
] as const;

const pageDefinitions = [
  { key: 'home', pageType: 'home', templateKey: 'home', featured: true, slugs: localized('home', 'home'), titles: localized('Your Gateway to the Saudi Market', 'بوابتك لدخول السوق السعودي والنمو فيه'), excerpts: localized('Research, execution and growth support for companies building a path into Saudi Arabia.', 'بحث وتنفيذ ودعم للنمو للشركات التي تبني مسارها نحو السوق السعودي.') },
  { key: 'saudi-market-entry', pageType: 'landing', templateKey: 'market-entry', slugs: localized('saudi-market-entry', 'دخول-السوق-السعودي'), titles: localized('Saudi Market Entry', 'دخول السوق السعودي'), excerpts: localized('A structured journey from understanding the opportunity to establishing, operating and growing in Saudi Arabia.', 'رحلة منظمة من فهم الفرصة إلى التأسيس والتشغيل والنمو في المملكة العربية السعودية.') },
  { key: 'services', pageType: 'listing', templateKey: 'services-list', slugs: localized('services', 'services'), titles: localized('Services', 'الخدمات'), excerpts: localized('Market Access, Execution and Growth services for the Saudi market journey.', 'خدمات دخول السوق والتنفيذ والنمو ضمن رحلة السوق السعودي.') },
  { key: 'industries', pageType: 'listing', templateKey: 'industries-list', slugs: localized('industries', 'industries'), titles: localized('Industries', 'القطاعات'), excerpts: localized('Explore sector-specific perspectives and relevant services as approved content becomes available.', 'استكشف الرؤى القطاعية والخدمات ذات الصلة عند اعتماد المحتوى الخاص بالقطاعات.') },
  { key: 'how-we-work', pageType: 'standard', templateKey: 'process', slugs: localized('how-we-work', 'كيف-نعمل'), titles: localized('How We Work', 'كيف نعمل'), excerpts: localized('A clear, evidence-led approach from discovery to execution and growth.', 'منهج واضح قائم على الأدلة من الاستكشاف إلى التنفيذ والنمو.') },
  { key: 'case-studies', pageType: 'listing', templateKey: 'case-studies-list', slugs: localized('case-studies', 'case-studies'), titles: localized('Case Studies', 'دراسات الحالة'), excerpts: localized('Verified client cases will be published here after approval.', 'سيتم نشر حالات العملاء الموثقة هنا بعد اعتمادها.') },
  { key: 'insights', pageType: 'listing', templateKey: 'insights-list', slugs: localized('insights', 'insights'), titles: localized('Insights', 'المعرفة والرؤى'), excerpts: localized('Articles, guides and reports about Saudi market entry and growth.', 'مقالات وأدلة وتقارير حول دخول السوق السعودي والنمو فيه.') },
  { key: 'ecosystem', pageType: 'standard', templateKey: 'ecosystem', slugs: localized('ecosystem', 'منظومة-الأعمال'), titles: localized('Ecosystem', 'منظومة الأعمال'), excerpts: localized('Approved GATEVIA brands, products and ventures will be presented here.', 'سيتم عرض العلامات والمنتجات والمشاريع المعتمدة ضمن منظومة GATEVIA هنا.') },
  { key: 'about', pageType: 'standard', templateKey: 'about', slugs: localized('about', 'عن-جيتفيا'), titles: localized('About GATEVIA', 'عن GATEVIA'), excerpts: localized('A Saudi market-entry and growth partner built around clarity, execution and long-term market development.', 'شريك لدخول السوق السعودي والنمو فيه، بمنهج يقوم على الوضوح والتنفيذ وتطوير السوق على المدى الطويل.') },
  { key: 'team', pageType: 'listing', templateKey: 'team-list', slugs: localized('team', 'team'), titles: localized('Team', 'الفريق'), excerpts: localized('Approved team profiles will be published here.', 'سيتم نشر ملفات أعضاء الفريق المعتمدة هنا.') },
  { key: 'partners', pageType: 'listing', templateKey: 'partners-list', slugs: localized('partners', 'partners'), titles: localized('Partners', 'الشركاء'), excerpts: localized('Approved partners will be published here.', 'سيتم نشر الشركاء المعتمدين هنا.') },
  { key: 'clients', pageType: 'listing', templateKey: 'clients-list', slugs: localized('clients', 'clients'), titles: localized('Clients', 'العملاء'), excerpts: localized('Only approved client relationships will be displayed.', 'سيتم عرض علاقات العملاء المعتمدة فقط.') },
  { key: 'brands', pageType: 'listing', templateKey: 'brands-list', slugs: localized('brands', 'brands'), titles: localized('Brands', 'العلامات'), excerpts: localized('Approved brands connected to the GATEVIA ecosystem.', 'العلامات المعتمدة المرتبطة بمنظومة GATEVIA.') },
  { key: 'products', pageType: 'listing', templateKey: 'products-list', slugs: localized('products', 'products'), titles: localized('Products & Ventures', 'المنتجات والمشاريع'), excerpts: localized('Approved products and ventures connected to the GATEVIA ecosystem.', 'المنتجات والمشاريع المعتمدة المرتبطة بمنظومة GATEVIA.') },
  { key: 'faqs', pageType: 'listing', templateKey: 'faq-list', slugs: localized('faqs', 'faqs'), titles: localized('Frequently Asked Questions', 'الأسئلة الشائعة'), excerpts: localized('Common questions about market entry, setup, research and growth.', 'أسئلة شائعة حول دخول السوق والتأسيس والبحث والنمو.') },
  { key: 'contact', pageType: 'form', templateKey: 'contact', slugs: localized('contact', 'contact'), titles: localized('Contact GATEVIA', 'تواصل مع GATEVIA'), excerpts: localized('Tell us what you are exploring in the Saudi market.', 'أخبرنا بما تعمل على استكشافه في السوق السعودي.') },
  { key: 'book-consultation', pageType: 'form', templateKey: 'consultation', slugs: localized('book-consultation', 'book-consultation'), titles: localized('Book a Consultation', 'احجز استشارة'), excerpts: localized('Share your current stage and priorities so the first conversation can focus on the right questions.', 'شاركنا مرحلتك الحالية وأولوياتك حتى تركز المحادثة الأولى على الأسئلة المناسبة.') },
  { key: 'market-entry-assessment', pageType: 'form', templateKey: 'assessment', slugs: localized('market-entry-assessment', 'market-entry-assessment'), titles: localized('Market Entry Assessment', 'تقييم دخول السوق'), excerpts: localized('Provide context about your company, objective, timeline and support needs.', 'زوّدنا بسياق عن شركتك وهدفك والجدول الزمني ونوع الدعم المطلوب.') },
  { key: 'privacy-policy', pageType: 'legal', templateKey: 'legal', slugs: localized('privacy-policy', 'سياسة-الخصوصية'), titles: localized('Privacy Policy', 'سياسة الخصوصية'), excerpts: localized('Working draft — legal review required before publication.', 'مسودة أولية — تتطلب مراجعة قانونية قبل النشر.') },
  { key: 'terms', pageType: 'legal', templateKey: 'legal', slugs: localized('terms', 'الشروط-والأحكام'), titles: localized('Terms & Conditions', 'الشروط والأحكام'), excerpts: localized('Working draft — legal review required before publication.', 'مسودة أولية — تتطلب مراجعة قانونية قبل النشر.') },
  { key: 'cookie-policy', pageType: 'legal', templateKey: 'legal', slugs: localized('cookie-policy', 'سياسة-ملفات-الارتباط'), titles: localized('Cookie Policy', 'سياسة ملفات الارتباط'), excerpts: localized('Working draft — review required before publication.', 'مسودة أولية — تتطلب المراجعة قبل النشر.') },
] as const;

type PageDefinition = (typeof pageDefinitions)[number];

function pageTranslation(page: PageDefinition, locale: Locale) {
  const title = page.titles[locale];
  const excerpt = page.excerpts[locale];
  return {
    locale,
    title,
    slug: page.slugs[locale],
    excerpt,
    seoTitle: seoTitle(title),
    seoDescription: excerpt,
    robotsIndex: page.pageType !== 'legal',
  };
}

function pageSections(key: string, serviceIds: Record<string, string>, faqIds: Record<string, string>) {
  const cta = {
    en: { label: 'Book a consultation', href: '/en/book-consultation' },
    'ar-SA': { label: 'احجز استشارة', href: '/ar-sa/book-consultation' },
  } as const;

  if (key === 'home') {
    return [
      {
        type: 'hero',
        sortOrder: 10,
        tr: localized(
          { eyebrow: 'GATEVIA · SAUDI ARABIA', title: 'Your Gateway to the Saudi Market', body: 'Navigate market access, execution and growth with a structured partner for the Saudi market journey.', primaryCta: cta.en, secondaryCta: { label: 'Explore services', href: '/en/services' } },
          { eyebrow: 'GATEVIA · المملكة العربية السعودية', title: 'بوابتك لدخول السوق السعودي والنمو فيه', body: 'انتقل من دراسة السوق إلى التنفيذ والنمو عبر مسار منظم يدعم رحلتك في المملكة.', primaryCta: cta['ar-SA'], secondaryCta: { label: 'استكشف الخدمات', href: '/ar-sa/services' } },
        ),
      },
      {
        type: 'process',
        sortOrder: 20,
        tr: localized(
          { eyebrow: 'Three pillars', title: 'From opportunity to sustainable growth', steps: [
            { title: 'Market Access', body: 'Understand the market, validate the opportunity and define the right entry direction.' },
            { title: 'Execution', body: 'Coordinate establishment, licensing, sourcing and local operational readiness.' },
            { title: 'Growth', body: 'Build go-to-market, partnerships, distribution and expansion priorities.' },
          ] },
          { eyebrow: 'ثلاث ركائز', title: 'من الفرصة إلى النمو المستدام', steps: [
            { title: 'دخول السوق', body: 'فهم السوق والتحقق من الفرصة وتحديد اتجاه الدخول المناسب.' },
            { title: 'التنفيذ', body: 'تنسيق التأسيس والتراخيص والتوريد والجاهزية التشغيلية المحلية.' },
            { title: 'النمو', body: 'بناء استراتيجية الذهاب إلى السوق والشراكات والتوزيع وأولويات التوسع.' },
          ] },
        ),
      },
      {
        type: 'timeline',
        sortOrder: 30,
        tr: localized(
          { eyebrow: 'Saudi market entry journey', title: 'A clear path from understanding to growth', steps: [
            { marker: '01', title: 'Understand', body: 'Clarify the opportunity, objectives and decision context.' },
            { marker: '02', title: 'Validate', body: 'Test demand, feasibility, competition and entry assumptions.' },
            { marker: '03', title: 'Enter', body: 'Choose the route to market and prepare the entry plan.' },
            { marker: '04', title: 'Establish', body: 'Coordinate establishment, licensing and setup requirements.' },
            { marker: '05', title: 'Operate', body: 'Build local operational readiness and execution capability.' },
            { marker: '06', title: 'Grow', body: 'Develop channels, partnerships and expansion priorities.' },
          ] },
          { eyebrow: 'رحلة دخول السوق السعودي', title: 'مسار واضح من الفهم إلى النمو', steps: [
            { marker: '01', title: 'افهم', body: 'وضّح الفرصة والأهداف وسياق القرار.' },
            { marker: '02', title: 'تحقق', body: 'اختبر الطلب والجدوى والمنافسة وافتراضات الدخول.' },
            { marker: '03', title: 'ادخل', body: 'اختر مسار الوصول إلى السوق وجهّز خطة الدخول.' },
            { marker: '04', title: 'أسّس', body: 'نسّق متطلبات التأسيس والتراخيص والإعداد.' },
            { marker: '05', title: 'شغّل', body: 'ابنِ الجاهزية التشغيلية وقدرة التنفيذ محليًا.' },
            { marker: '06', title: 'انمُ', body: 'طوّر القنوات والشراكات وأولويات التوسع.' },
          ] },
        ),
      },
      {
        type: 'services_grid',
        sortOrder: 40,
        tr: localized(
          { title: 'Selected services', body: 'Start with the workstream that matches your current stage.', serviceIds: ['market-research', 'market-entry-strategy', 'company-formation-support', 'licensing-support', 'go-to-market-strategy', 'growth-consulting'].map((k) => serviceIds[k]!) },
          { title: 'خدمات مختارة', body: 'ابدأ بمسار العمل الذي يتوافق مع مرحلتك الحالية.', serviceIds: ['market-research', 'market-entry-strategy', 'company-formation-support', 'licensing-support', 'go-to-market-strategy', 'growth-consulting'].map((k) => serviceIds[k]!) },
        ),
      },
      {
        type: 'faq',
        sortOrder: 120,
        tr: localized(
          { title: 'Common questions', faqIds: Object.values(faqIds).slice(0, 6) },
          { title: 'أسئلة شائعة', faqIds: Object.values(faqIds).slice(0, 6) },
        ),
      },
      {
        type: 'cta',
        sortOrder: 130,
        tr: localized(
          { title: 'Planning your next move in Saudi Arabia?', body: 'Share your current stage and priorities. We will use them to focus the first conversation.', primaryCta: cta.en },
          { title: 'تخطط لخطوتك القادمة في السوق السعودي؟', body: 'شاركنا مرحلتك الحالية وأولوياتك لنركز المحادثة الأولى على ما يهمك.', primaryCta: cta['ar-SA'] },
        ),
      },
    ];
  }

  if (key === 'saudi-market-entry') {
    return [
      {
        type: 'hero',
        tr: localized(
          { eyebrow: 'Saudi Market Entry', title: 'Enter Saudi Arabia with a structured plan', body: 'Move from market understanding and validation to establishment, operations and growth through a clear sequence of decisions and workstreams.', primaryCta: cta.en, secondaryCta: { label: 'Start assessment', href: '/en/market-entry-assessment' } },
          { eyebrow: 'دخول السوق السعودي', title: 'ادخل السوق السعودي بخطة منظمة', body: 'انتقل من فهم السوق والتحقق من الفرصة إلى التأسيس والتشغيل والنمو عبر تسلسل واضح للقرارات ومسارات العمل.', primaryCta: cta['ar-SA'], secondaryCta: { label: 'ابدأ التقييم', href: '/ar-sa/market-entry-assessment' } },
        ),
      },
      {
        type: 'process',
        tr: localized(
          { title: 'Who this is for', steps: [
            { title: 'International companies', body: 'Businesses entering Saudi Arabia for the first time or expanding their presence.' },
            { title: 'Founders and investors', body: 'Decision-makers validating a new opportunity before establishment.' },
            { title: 'Existing businesses', body: 'Companies seeking stronger partnerships, channels or growth inside the Kingdom.' },
          ] },
          { title: 'لمن هذه الرحلة؟', steps: [
            { title: 'الشركات الدولية', body: 'الشركات التي تدخل السوق السعودي لأول مرة أو توسع حضورها داخل المملكة.' },
            { title: 'المؤسسون والمستثمرون', body: 'صناع القرار الذين يتحققون من فرصة جديدة قبل التأسيس.' },
            { title: 'الشركات القائمة', body: 'الشركات التي تبحث عن شراكات أو قنوات أو نمو أقوى داخل المملكة.' },
          ] },
        ),
      },
      {
        type: 'timeline',
        tr: localized(
          { title: 'The entry journey', steps: ['Understand', 'Validate', 'Enter', 'Establish', 'Operate', 'Grow'].map((title, i) => ({ marker: String(i + 1).padStart(2, '0'), title, body: ['Frame the opportunity and decision context.', 'Validate demand, feasibility and entry assumptions.', 'Select the route to market and entry priorities.', 'Coordinate formation, licensing and required setup.', 'Prepare local operations and launch readiness.', 'Develop commercial channels, partnerships and expansion.'][i]! })) },
          { title: 'رحلة الدخول', steps: ['افهم', 'تحقق', 'ادخل', 'أسّس', 'شغّل', 'انمُ'].map((title, i) => ({ marker: String(i + 1).padStart(2, '0'), title, body: ['حدّد الفرصة وسياق القرار.', 'تحقق من الطلب والجدوى وافتراضات الدخول.', 'اختر مسار الوصول إلى السوق وأولويات الدخول.', 'نسّق التأسيس والتراخيص والإعداد المطلوب.', 'جهّز العمليات المحلية والاستعداد للإطلاق.', 'طوّر القنوات التجارية والشراكات والتوسع.'][i]! })) },
        ),
      },
      {
        type: 'services_grid',
        tr: localized(
          { title: 'Services across the journey', serviceIds: ['market-research', 'feasibility-study', 'market-entry-strategy', 'company-formation-support', 'licensing-support', 'local-operations-setup', 'go-to-market-strategy', 'business-development'].map((k) => serviceIds[k]!) },
          { title: 'خدمات عبر مراحل الرحلة', serviceIds: ['market-research', 'feasibility-study', 'market-entry-strategy', 'company-formation-support', 'licensing-support', 'local-operations-setup', 'go-to-market-strategy', 'business-development'].map((k) => serviceIds[k]!) },
        ),
      },
      { type: 'faq', tr: localized({ title: 'Market-entry questions', faqIds: Object.values(faqIds).slice(0, 6) }, { title: 'أسئلة حول دخول السوق', faqIds: Object.values(faqIds).slice(0, 6) }) },
      { type: 'cta', tr: localized({ title: 'Ready to define the right entry path?', body: 'Start with a consultation or share your context through the market-entry assessment.', primaryCta: cta.en }, { title: 'جاهز لتحديد مسار الدخول الأنسب؟', body: 'ابدأ باستشارة أو شاركنا سياقك من خلال تقييم دخول السوق.', primaryCta: cta['ar-SA'] }) },
    ];
  }

  if (key === 'how-we-work') {
    return [
      { type: 'hero', tr: localized({ eyebrow: 'How We Work', title: 'Clarity first. Execution second. Growth with context.', body: 'Our working model follows the decision journey: understand the situation, validate assumptions, coordinate execution and improve the path as the market responds.', primaryCta: cta.en }, { eyebrow: 'كيف نعمل', title: 'الوضوح أولًا، ثم التنفيذ، ثم النمو وفق سياق السوق.', body: 'يتبع منهج العمل رحلة القرار: فهم الوضع، التحقق من الافتراضات، تنسيق التنفيذ، ثم تحسين المسار وفق استجابة السوق.', primaryCta: cta['ar-SA'] }) },
      { type: 'process', tr: localized({ title: 'A practical working model', steps: [
        { title: 'Discover', body: 'Understand objectives, constraints and the decision that needs to be made.' },
        { title: 'Validate', body: 'Use research and analysis to test the assumptions that matter most.' },
        { title: 'Plan', body: 'Translate findings into priorities, owners, dependencies and next actions.' },
        { title: 'Execute', body: 'Coordinate the agreed workstreams and maintain visibility on progress.' },
        { title: 'Learn & Grow', body: 'Use market feedback to refine channels, positioning and growth priorities.' },
      ] }, { title: 'نموذج عمل عملي', steps: [
        { title: 'الاستكشاف', body: 'فهم الأهداف والقيود والقرار المطلوب اتخاذه.' },
        { title: 'التحقق', body: 'استخدام البحث والتحليل لاختبار الافتراضات الأكثر تأثيرًا.' },
        { title: 'التخطيط', body: 'تحويل النتائج إلى أولويات ومسؤوليات واعتماديات وخطوات تالية.' },
        { title: 'التنفيذ', body: 'تنسيق مسارات العمل المتفق عليها والحفاظ على وضوح التقدم.' },
        { title: 'التعلم والنمو', body: 'استخدام ملاحظات السوق لتحسين القنوات والتموضع وأولويات النمو.' },
      ] }) },
      { type: 'cta', tr: localized({ title: 'Have a specific market-entry question?', primaryCta: cta.en }, { title: 'لديك سؤال محدد حول دخول السوق؟', primaryCta: cta['ar-SA'] }) },
    ];
  }

  if (key === 'about') {
    return [
      { type: 'hero', tr: localized({ eyebrow: 'About GATEVIA', title: 'A partner for Saudi market entry and growth', body: 'GATEVIA is designed around a broader market-entry journey: understand the opportunity, execute the path to market and build the foundations for growth.', primaryCta: cta.en }, { eyebrow: 'عن GATEVIA', title: 'شريك لدخول السوق السعودي والنمو فيه', body: 'تقوم GATEVIA على رحلة أوسع من مجرد التأسيس: فهم الفرصة، تنفيذ مسار الدخول، ثم بناء أسس النمو داخل السوق.', primaryCta: cta['ar-SA'] }) },
      { type: 'rich_text', tr: localized({ blocks: [
        { type: 'heading', text: 'Our positioning', level: 2 },
        { type: 'paragraph', text: 'GATEVIA is positioned as a Saudi Market Entry & Growth Partner for international companies, founders, investors and established businesses evaluating or expanding in the Kingdom.' },
        { type: 'heading', text: 'What guides the model', level: 2 },
        { type: 'list', items: ['Evidence before assumptions', 'Clear decisions and ownership', 'Practical execution coordination', 'Growth built on local market context'] },
      ] }, { blocks: [
        { type: 'heading', text: 'تموضعنا', level: 2 },
        { type: 'paragraph', text: 'تتموضع GATEVIA كشريك لدخول السوق السعودي والنمو فيه للشركات الدولية والمؤسسين والمستثمرين والشركات القائمة التي تقيّم فرصها أو توسع حضورها داخل المملكة.' },
        { type: 'heading', text: 'ما الذي يوجّه نموذج العمل؟', level: 2 },
        { type: 'list', items: ['الأدلة قبل الافتراضات', 'وضوح القرار والمسؤوليات', 'تنسيق عملي للتنفيذ', 'نمو مبني على سياق السوق المحلي'] },
      ] }) },
      { type: 'process', tr: localized({ title: 'Three connected capabilities', steps: [
        { title: 'Market Access', body: 'Research, feasibility, competition and entry strategy.' },
        { title: 'Execution', body: 'Formation, licensing, sourcing and operational setup support.' },
        { title: 'Growth', body: 'Go-to-market, business development, partnerships and expansion.' },
      ] }, { title: 'ثلاث قدرات مترابطة', steps: [
        { title: 'دخول السوق', body: 'البحث والجدوى والمنافسة واستراتيجية الدخول.' },
        { title: 'التنفيذ', body: 'دعم التأسيس والتراخيص والتوريد والإعداد التشغيلي.' },
        { title: 'النمو', body: 'الذهاب إلى السوق وتطوير الأعمال والشراكات والتوسع.' },
      ] }) },
      { type: 'cta', tr: localized({ title: 'Explore the right path for your company', primaryCta: cta.en }, { title: 'استكشف المسار الأنسب لشركتك', primaryCta: cta['ar-SA'] }) },
    ];
  }

  if (['privacy-policy', 'terms', 'cookie-policy'].includes(key)) {
    return [
      { type: 'rich_text', tr: localized({ blocks: [
        { type: 'callout', text: 'Working draft. This legal content must be reviewed and approved before publication.' },
        { type: 'paragraph', text: 'Use the administration panel to replace this draft with the approved legal text for GATEVIA.' },
      ] }, { blocks: [
        { type: 'callout', text: 'مسودة أولية. يجب مراجعة هذا المحتوى القانوني واعتماده قبل النشر.' },
        { type: 'paragraph', text: 'استخدم لوحة الإدارة لاستبدال هذه المسودة بالنص القانوني المعتمد لـGATEVIA.' },
      ] }) },
    ];
  }

  if (key === 'ecosystem') {
    return [
      { type: 'hero', tr: localized({ eyebrow: 'Ecosystem', title: 'Brands, products and ventures', body: 'This area is reserved for approved entities connected to the GATEVIA ecosystem. No unverified entity is seeded.', primaryCta: cta.en }, { eyebrow: 'منظومة الأعمال', title: 'العلامات والمنتجات والمشاريع', body: 'هذه المساحة مخصصة للكيانات المعتمدة المرتبطة بمنظومة GATEVIA، ولا تتم إضافة أي كيان غير موثق ضمن الـseed.', primaryCta: cta['ar-SA'] }) },
    ];
  }

  return [];
}

async function ensureCategory(category: (typeof categories)[number]) {
  const id = stableUuid(`service-category:${category.key}`);
  await prisma.serviceCategory.upsert({
    where: { id },
    create: { id, status: CONTENT_STATUS, sortOrder: category.sortOrder },
    update: {},
  });
  for (const locale of locales) {
    await prisma.serviceCategoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: id, locale } },
      create: { categoryId: id, locale, ...category.tr[locale] },
      update: {},
    });
  }
  return id;
}

async function ensureService(
  row: (typeof services)[number],
  categoryIds: Record<string, string>,
  index: number,
) {
  const [key, categoryKey, enTitle, arTitle, enSlug, arSlug, enShort, arShort] = row;
  const id = stableUuid(`service:${key}`);
  const content = categoryContent[categoryKey];
  await prisma.service.upsert({
    where: { id },
    create: {
      id,
      categoryId: categoryIds[categoryKey]!,
      status: CONTENT_STATUS,
      featured: ['market-research', 'market-entry-strategy', 'company-formation-support', 'licensing-support', 'go-to-market-strategy', 'growth-consulting'].includes(key),
      sortOrder: (index + 1) * 10,
      publishedAt: PUBLISHED_AT,
    },
    update: {},
  });

  const translations = localized(
    {
      title: enTitle,
      slug: enSlug,
      shortDescription: enShort,
      overview: `${enShort} GATEVIA structures this workstream around the decisions, dependencies and practical next steps relevant to your current market-entry stage.`,
      whoFor: json(content.en.whoFor),
      problems: json(content.en.problems),
      deliverables: json(content.en.deliverables),
      process: json(content.en.process),
      benefits: json(content.en.benefits),
      ctaLabel: 'Book a consultation',
      seoTitle: seoTitle(enTitle),
      seoDescription: enShort,
      robotsIndex: true,
    },
    {
      title: arTitle,
      slug: arSlug,
      shortDescription: arShort,
      overview: `${arShort} تنظّم GATEVIA هذا المسار حول القرارات والاعتماديات والخطوات العملية المناسبة لمرحلتك الحالية في رحلة دخول السوق.`,
      whoFor: json(content['ar-SA'].whoFor),
      problems: json(content['ar-SA'].problems),
      deliverables: json(content['ar-SA'].deliverables),
      process: json(content['ar-SA'].process),
      benefits: json(content['ar-SA'].benefits),
      ctaLabel: 'احجز استشارة',
      seoTitle: seoTitle(arTitle),
      seoDescription: arShort,
      robotsIndex: true,
    },
  );

  for (const locale of locales) {
    await prisma.serviceTranslation.upsert({
      where: { serviceId_locale: { serviceId: id, locale } },
      create: { serviceId: id, locale, ...translations[locale] },
      update: {},
    });
  }
  return id;
}

async function ensureFaq(faq: (typeof faqs)[number]) {
  const id = stableUuid(`faq:${faq.key}`);
  await prisma.faq.upsert({
    where: { id },
    create: { id, categoryKey: faq.categoryKey, sortOrder: faq.sortOrder, status: CONTENT_STATUS },
    update: {},
  });
  for (const locale of locales) {
    await prisma.faqTranslation.upsert({
      where: { faqId_locale: { faqId: id, locale } },
      create: { faqId: id, locale, ...faq.tr[locale] },
      update: {},
    });
  }
  return id;
}

async function ensurePage(page: PageDefinition, serviceIds: Record<string, string>, faqIds: Record<string, string>) {
  const id = stableUuid(`page:${page.key}`);
  const legal = page.pageType === 'legal';
  await prisma.page.upsert({
    where: { id },
    create: {
      id,
      pageType: page.pageType,
      templateKey: page.templateKey,
      status: legal ? 'draft' : CONTENT_STATUS,
      featured: 'featured' in page ? page.featured : false,
      publishedAt: legal ? null : PUBLISHED_AT,
    },
    update: {},
  });
  for (const locale of locales) {
    await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId: id, locale } },
      create: { pageId: id, ...pageTranslation(page, locale) },
      update: {},
    });
  }

  const sections = pageSections(page.key, serviceIds, faqIds);
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i]!;
    // Use explicit sortOrder if provided; otherwise fall back to index-based.
    const sortOrder = section.sortOrder ?? (i + 1) * 10;
    const sectionId = stableUuid(`page:${page.key}:section:${String(sortOrder)}`);
    const stored = await prisma.pageSection.upsert({
      where: { pageId_sortOrder: { pageId: id, sortOrder } },
      create: { id: sectionId, pageId: id, sectionType: section.type, sortOrder, isVisible: true, settings: json({}) },
      update: {},
    });
    for (const locale of locales) {
      await prisma.pageSectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: stored.id, locale } },
        create: { sectionId: stored.id, locale, content: json(section.tr[locale]) },
        update: {},
      });
    }
  }
  return id;
}

async function ensureMenuItem(input: {
  menuId: string;
  key: string;
  sortOrder: number;
  targetType: string;
  targetId: string;
  labels: Localized<string>;
  parentKey?: string;
}) {
  const id = stableUuid(`nav:${input.key}`);
  const parentId = input.parentKey ? stableUuid(`nav:${input.parentKey}`) : null;
  await prisma.navigationItem.upsert({
    where: { id },
    create: {
      id,
      menuId: input.menuId,
      parentId,
      itemType: 'internal',
      internalEntityType: input.targetType,
      internalEntityId: input.targetId,
      sortOrder: input.sortOrder,
      visible: true,
    },
    update: {},
  });
  for (const locale of locales) {
    await prisma.navigationItemTranslation.upsert({
      where: { navigationItemId_locale: { navigationItemId: id, locale } },
      create: { navigationItemId: id, locale, label: input.labels[locale] },
      update: {},
    });
  }
}

async function seedNavigation(pageIds: Record<string, string>, serviceIds: Record<string, string>) {
  const menus = Object.fromEntries(
    await Promise.all(
      ['main', 'footer-services', 'footer-company', 'footer-resources', 'footer-legal'].map(async (key) => {
        const menu = await prisma.navigationMenu.upsert({
          where: { key },
          create: { key, location: key, status: 'draft' },
          update: CONTENT_STATUS === 'published' ? { status: 'published' } : {},
        });
        return [key, menu.id] as const;
      }),
    ),
  );

  const main = menus.main!;
  const mainItems = [
    ['main-services', 10, 'pages', pageIds.services!, localized('Services', 'الخدمات')],
    ['main-market-entry', 20, 'pages', pageIds['saudi-market-entry']!, localized('Saudi Market Entry', 'دخول السوق السعودي')],
    ['main-industries', 30, 'pages', pageIds.industries!, localized('Industries', 'القطاعات')],
    ['main-case-studies', 40, 'pages', pageIds['case-studies']!, localized('Case Studies', 'دراسات الحالة')],
    ['main-insights', 50, 'pages', pageIds.insights!, localized('Insights', 'الرؤى')],
    ['main-about', 60, 'pages', pageIds.about!, localized('About', 'عن GATEVIA')],
    ['main-consultation', 70, 'pages', pageIds['book-consultation']!, localized('Book a Consultation', 'احجز استشارة')],
  ] as const;
  for (const [key, sortOrder, targetType, targetId, labels] of mainItems) {
    await ensureMenuItem({ menuId: main, key, sortOrder, targetType, targetId, labels });
  }

  const serviceChildren = [
    ['main-services-market-research', 11, 'market-research', localized('Market Research', 'أبحاث السوق')],
    ['main-services-feasibility', 12, 'feasibility-study', localized('Feasibility Study', 'دراسة الجدوى')],
    ['main-services-entry-strategy', 13, 'market-entry-strategy', localized('Market Entry Strategy', 'استراتيجية دخول السوق')],
    ['main-services-company-formation', 14, 'company-formation-support', localized('Company Formation', 'تأسيس الشركات')],
    ['main-services-licensing', 15, 'licensing-support', localized('Licensing Support', 'دعم التراخيص')],
    ['main-services-go-to-market', 16, 'go-to-market-strategy', localized('Go-To-Market Strategy', 'استراتيجية الذهاب إلى السوق')],
  ] as const;
  for (const [key, sortOrder, serviceKey, labels] of serviceChildren) {
    await ensureMenuItem({ menuId: main, key, sortOrder, targetType: 'services', targetId: serviceIds[serviceKey]!, labels, parentKey: 'main-services' });
  }

  const aboutChildren = [
    ['main-about-company', 61, 'about', localized('About GATEVIA', 'عن GATEVIA')],
    ['main-about-team', 62, 'team', localized('Team', 'الفريق')],
    ['main-about-partners', 63, 'partners', localized('Partners', 'الشركاء')],
    ['main-about-ecosystem', 64, 'ecosystem', localized('Ecosystem', 'منظومة الأعمال')],
  ] as const;
  for (const [key, sortOrder, pageKey, labels] of aboutChildren) {
    await ensureMenuItem({ menuId: main, key, sortOrder, targetType: 'pages', targetId: pageIds[pageKey]!, labels, parentKey: 'main-about' });
  }

  const footerServices = menus['footer-services']!;
  for (const [i, serviceKey] of ['market-entry-strategy', 'company-formation-support', 'licensing-support', 'go-to-market-strategy', 'growth-consulting'].entries()) {
    const service = services.find((row) => row[0] === serviceKey)!;
    await ensureMenuItem({ menuId: footerServices, key: `footer-service-${serviceKey}`, sortOrder: (i + 1) * 10, targetType: 'services', targetId: serviceIds[serviceKey]!, labels: localized(service[2], service[3]) });
  }

  const footerCompany = menus['footer-company']!;
  for (const [i, pageKey, en, ar] of [
    [0, 'about', 'About GATEVIA', 'عن GATEVIA'],
    [1, 'team', 'Team', 'الفريق'],
    [2, 'partners', 'Partners', 'الشركاء'],
    [3, 'ecosystem', 'Ecosystem', 'منظومة الأعمال'],
    [4, 'contact', 'Contact', 'تواصل معنا'],
  ] as const) {
    await ensureMenuItem({ menuId: footerCompany, key: `footer-company-${pageKey}`, sortOrder: (i + 1) * 10, targetType: 'pages', targetId: pageIds[pageKey]!, labels: localized(en, ar) });
  }

  const footerResources = menus['footer-resources']!;
  for (const [i, pageKey, en, ar] of [
    [0, 'case-studies', 'Case Studies', 'دراسات الحالة'],
    [1, 'insights', 'Insights', 'الرؤى'],
    [2, 'faqs', 'FAQ', 'الأسئلة الشائعة'],
  ] as const) {
    await ensureMenuItem({ menuId: footerResources, key: `footer-resource-${pageKey}`, sortOrder: (i + 1) * 10, targetType: 'pages', targetId: pageIds[pageKey]!, labels: localized(en, ar) });
  }

  const footerLegal = menus['footer-legal']!;
  for (const [i, pageKey, en, ar] of [
    [0, 'privacy-policy', 'Privacy Policy', 'سياسة الخصوصية'],
    [1, 'terms', 'Terms & Conditions', 'الشروط والأحكام'],
    [2, 'cookie-policy', 'Cookie Policy', 'سياسة ملفات الارتباط'],
  ] as const) {
    await ensureMenuItem({ menuId: footerLegal, key: `footer-legal-${pageKey}`, sortOrder: (i + 1) * 10, targetType: 'pages', targetId: pageIds[pageKey]!, labels: localized(en, ar) });
  }
}

async function seedInitialSettings() {
  const defaults = [
    ['company.name', { en: 'GATEVIA', 'ar-SA': 'GATEVIA' }],
    ['seo.default_title', { en: 'GATEVIA | Saudi Market Entry & Growth', 'ar-SA': 'GATEVIA | دخول السوق السعودي والنمو' }],
    ['seo.default_description', { en: 'Saudi market access, execution and growth support for international companies, founders and businesses expanding in the Kingdom.', 'ar-SA': 'دعم دخول السوق السعودي والتنفيذ والنمو للشركات الدولية والمؤسسين والأعمال التي تتوسع داخل المملكة.' }],
  ] as const;

  for (const [key, value] of defaults) {
    const current = await prisma.globalSetting.findUnique({ where: { key } });
    if (!current) continue;
    const empty = current.value === '' || current.value === null || (typeof current.value === 'object' && !Array.isArray(current.value) && Object.keys(current.value as object).length === 0);
    if (empty) await prisma.globalSetting.update({ where: { key }, data: { value: json(value) } });
  }
}

async function seed() {
  for (const locale of locales) {
    const exists = await prisma.language.findUnique({ where: { code: locale } });
    if (!exists) throw new Error(`System seed must run first. Missing language: ${locale}`);
  }

  const categoryIds: Record<string, string> = {};
  for (const category of categories) categoryIds[category.key] = await ensureCategory(category);

  const serviceIds: Record<string, string> = {};
  for (let i = 0; i < services.length; i += 1) {
    const row = services[i]!;
    serviceIds[row[0]] = await ensureService(row, categoryIds, i);
  }

  const faqIds: Record<string, string> = {};
  for (const faq of faqs) faqIds[faq.key] = await ensureFaq(faq);

  const pageIds: Record<string, string> = {};
  for (const page of pageDefinitions) pageIds[page.key] = await ensurePage(page, serviceIds, faqIds);

  await seedNavigation(pageIds, serviceIds);
  await seedInitialSettings();

  console.info(
    JSON.stringify({
      event: 'initial_content_seed_complete',
      status: CONTENT_STATUS,
      pages: pageDefinitions.length,
      serviceCategories: categories.length,
      services: services.length,
      faqs: faqs.length,
      navigationMenus: 5,
      protectedUnverifiedEntities: ['industries', 'clients', 'partners', 'case-studies', 'testimonials', 'certifications', 'trust-metrics', 'brands', 'products', 'team-members'],
      note: 'Seed is additive/idempotent and does not overwrite existing seeded records. Legal pages stay draft.',
    }),
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
