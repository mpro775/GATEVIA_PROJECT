import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const locales = ['en', 'ar-SA'] as const;
type Locale = (typeof locales)[number];
type Localized<T> = Record<Locale, T>;

const publishedAt = new Date('2026-09-01T09:00:00.000Z');
const now = new Date();

function stableUuid(key: string): string {
  const hex = createHash('sha256').update(`gatevia-demo-v1:${key}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function localized<T>(en: T, ar: T): Localized<T> {
  return { en, 'ar-SA': ar };
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function mediaAt(pool: string[], index: number): string | null {
  return pool.length ? pool[index % pool.length]! : null;
}

function dateDaysAgo(days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

const industries = [
  {
    key: 'fintech',
    featured: true,
    tr: localized(
      {
        name: 'Fintech & Digital Finance',
        slug: 'fintech-digital-finance',
        shortDescription:
          'Digital payments, embedded finance and financial technology businesses entering or scaling in Saudi Arabia.',
        overview:
          'A fast-moving market shaped by digital adoption, regulatory requirements, partnerships and strong expectations around trust, localization and customer experience.',
        challenges: [
          'Regulatory readiness',
          'Local partnerships',
          'Trust and compliance',
          'Go-to-market localization',
        ],
        opportunities: [
          'Digital payments',
          'B2B financial infrastructure',
          'SME enablement',
          'Embedded finance',
        ],
      },
      {
        name: 'التقنية المالية والتمويل الرقمي',
        slug: 'التقنية-المالية',
        shortDescription:
          'شركات المدفوعات والتمويل الرقمي والتقنية المالية التي تدخل السوق السعودي أو تتوسع داخله.',
        overview:
          'سوق سريع التطور تقوده الرقمنة والمتطلبات التنظيمية والشراكات وتوقعات مرتفعة تجاه الثقة والتوطين وتجربة العميل.',
        challenges: [
          'الجاهزية التنظيمية',
          'الشراكات المحلية',
          'الثقة والامتثال',
          'توطين استراتيجية الدخول',
        ],
        opportunities: [
          'المدفوعات الرقمية',
          'البنية المالية للشركات',
          'تمكين المنشآت الصغيرة',
          'التمويل المضمّن',
        ],
      },
    ),
    services: [
      'market-research',
      'regulatory-landscape-assessment',
      'market-entry-strategy',
      'local-partner-search',
      'go-to-market-strategy',
    ],
  },
  {
    key: 'healthcare',
    featured: true,
    tr: localized(
      {
        name: 'Healthcare & Healthtech',
        slug: 'healthcare-healthtech',
        shortDescription:
          'Healthcare providers, medical technology companies and digital health ventures evaluating Saudi market opportunities.',
        overview:
          'Saudi healthcare transformation creates opportunities across care delivery, technology, diagnostics and operational enablement, with high importance placed on regulation and stakeholder mapping.',
        challenges: [
          'Licensing pathways',
          'Procurement cycles',
          'Clinical stakeholder mapping',
          'Localization',
        ],
        opportunities: ['Digital health', 'Diagnostics', 'Care operations', 'Specialty services'],
      },
      {
        name: 'الرعاية الصحية والتقنية الصحية',
        slug: 'الرعاية-الصحية',
        shortDescription:
          'مقدمو الرعاية وشركات التقنية الطبية والصحة الرقمية التي تقيّم فرص السوق السعودي.',
        overview:
          'يخلق تحول قطاع الصحة في المملكة فرصًا في تقديم الرعاية والتقنية والتشخيص والتمكين التشغيلي، مع أهمية كبيرة للتنظيم وفهم أصحاب المصلحة.',
        challenges: ['مسارات الترخيص', 'دورات المشتريات', 'خريطة أصحاب المصلحة', 'التوطين'],
        opportunities: ['الصحة الرقمية', 'التشخيص', 'تشغيل الرعاية', 'الخدمات التخصصية'],
      },
    ),
    services: [
      'market-research',
      'feasibility-study',
      'licensing-support',
      'government-procedures-coordination',
      'business-development',
    ],
  },
  {
    key: 'food-beverage',
    featured: true,
    tr: localized(
      {
        name: 'Food, Beverage & Consumer',
        slug: 'food-beverage-consumer',
        shortDescription:
          'Consumer brands, food producers and retail concepts building distribution and commercial traction in the Kingdom.',
        overview:
          'Success depends on demand validation, channel strategy, distributor selection, pricing, localization and disciplined retail execution.',
        challenges: [
          'Distributor selection',
          'Channel economics',
          'Consumer localization',
          'Retail execution',
        ],
        opportunities: [
          'Premium food',
          'Healthy consumer products',
          'Modern retail',
          'E-commerce distribution',
        ],
      },
      {
        name: 'الأغذية والمشروبات والمنتجات الاستهلاكية',
        slug: 'الأغذية-والمشروبات',
        shortDescription:
          'العلامات الاستهلاكية ومنتجو الأغذية ومفاهيم التجزئة التي تبني قنوات توزيع وحضورًا تجاريًا في المملكة.',
        overview:
          'يعتمد النجاح على التحقق من الطلب واستراتيجية القنوات واختيار الموزع والتسعير والتوطين والانضباط في التنفيذ داخل التجزئة.',
        challenges: ['اختيار الموزع', 'اقتصاديات القنوات', 'توطين المنتج', 'تنفيذ التجزئة'],
        opportunities: [
          'الأغذية المميزة',
          'المنتجات الصحية',
          'التجزئة الحديثة',
          'توزيع التجارة الإلكترونية',
        ],
      },
    ),
    services: [
      'market-research',
      'competitor-analysis',
      'partner-distributor-identification',
      'go-to-market-strategy',
      'distribution-strategy',
    ],
  },
  {
    key: 'technology-saas',
    featured: true,
    tr: localized(
      {
        name: 'Technology & SaaS',
        slug: 'technology-saas',
        shortDescription:
          'B2B software, cloud and digital-product companies preparing for Saudi market entry and growth.',
        overview:
          'Technology companies often need sharper ICP definition, local commercial context, enterprise stakeholder access and a repeatable route to market.',
        challenges: [
          'Enterprise access',
          'Local proof points',
          'Pricing and packaging',
          'Data and compliance expectations',
        ],
        opportunities: ['Enterprise SaaS', 'AI enablement', 'Cybersecurity', 'Vertical software'],
      },
      {
        name: 'التقنية والبرمجيات كخدمة',
        slug: 'التقنية-والبرمجيات',
        shortDescription:
          'شركات البرمجيات السحابية والمنتجات الرقمية B2B التي تستعد لدخول السوق السعودي والنمو فيه.',
        overview:
          'تحتاج شركات التقنية غالبًا إلى تعريف أدق للعميل المستهدف وفهم السياق التجاري المحلي والوصول لأصحاب القرار وبناء مسار مبيعات قابل للتكرار.',
        challenges: [
          'الوصول للمنشآت',
          'بناء إثبات محلي',
          'التسعير والباقات',
          'متطلبات البيانات والامتثال',
        ],
        opportunities: [
          'برمجيات المؤسسات',
          'تمكين الذكاء الاصطناعي',
          'الأمن السيبراني',
          'البرمجيات المتخصصة',
        ],
      },
    ),
    services: [
      'market-sizing',
      'market-entry-strategy',
      'business-development',
      'partnerships',
      'growth-consulting',
    ],
  },
  {
    key: 'industrial-manufacturing',
    featured: false,
    tr: localized(
      {
        name: 'Industrial & Manufacturing',
        slug: 'industrial-manufacturing',
        shortDescription:
          'Industrial suppliers, manufacturers and specialized B2B operators assessing local demand and setup options.',
        overview:
          'Industrial entry decisions are shaped by procurement structures, localization requirements, channel partners, technical standards and long sales cycles.',
        challenges: [
          'Procurement complexity',
          'Standards and approvals',
          'Localization requirements',
          'Channel coverage',
        ],
        opportunities: [
          'Industrial localization',
          'Maintenance solutions',
          'Specialty components',
          'Supply-chain services',
        ],
      },
      {
        name: 'الصناعة والتصنيع',
        slug: 'الصناعة-والتصنيع',
        shortDescription:
          'الموردون الصناعيون والمصنعون وشركات B2B المتخصصة التي تقيّم الطلب المحلي وخيارات التأسيس.',
        overview:
          'تتأثر قرارات الدخول الصناعي بهياكل المشتريات ومتطلبات التوطين والشركاء والمعايير الفنية ودورات البيع الطويلة.',
        challenges: ['تعقيد المشتريات', 'المعايير والاعتمادات', 'متطلبات التوطين', 'تغطية القنوات'],
        opportunities: [
          'التصنيع المحلي',
          'حلول الصيانة',
          'المكونات المتخصصة',
          'خدمات سلاسل الإمداد',
        ],
      },
    ),
    services: [
      'feasibility-study',
      'vendor-supplier-sourcing',
      'regulatory-landscape-assessment',
      'local-operations-setup',
      'business-development',
    ],
  },
  {
    key: 'mobility-logistics',
    featured: false,
    tr: localized(
      {
        name: 'Mobility & Logistics',
        slug: 'mobility-logistics',
        shortDescription:
          'Mobility platforms, logistics providers and supply-chain technology businesses exploring Saudi growth.',
        overview:
          'The sector combines infrastructure growth, digitization and new operating models, requiring practical validation of demand, partnerships and execution readiness.',
        challenges: [
          'Operational density',
          'Partner networks',
          'Unit economics',
          'Service localization',
        ],
        opportunities: [
          'Last-mile technology',
          'Fleet enablement',
          'B2B logistics',
          'Supply-chain visibility',
        ],
      },
      {
        name: 'التنقل والخدمات اللوجستية',
        slug: 'التنقل-والخدمات-اللوجستية',
        shortDescription:
          'منصات التنقل ومقدمو الخدمات اللوجستية وتقنيات سلاسل الإمداد التي تستكشف فرص النمو في السعودية.',
        overview:
          'يجمع القطاع بين نمو البنية التحتية والرقمنة ونماذج تشغيل جديدة، ويحتاج إلى تحقق عملي من الطلب والشراكات والجاهزية التنفيذية.',
        challenges: ['الكثافة التشغيلية', 'شبكات الشركاء', 'اقتصاديات الوحدة', 'توطين الخدمة'],
        opportunities: [
          'تقنيات الميل الأخير',
          'تمكين الأساطيل',
          'لوجستيات B2B',
          'وضوح سلاسل الإمداد',
        ],
      },
    ),
    services: [
      'market-research',
      'feasibility-study',
      'local-partner-search',
      'local-operations-setup',
      'growth-consulting',
    ],
  },
] as const;

const clients = [
  [
    'nexa-cloud',
    'Nexa Cloud Systems',
    'نيكسا للأنظمة السحابية',
    'technology-saas',
    'AE',
    'Regional B2B cloud platform evaluating a Saudi enterprise launch.',
    'منصة سحابية إقليمية للشركات تقيّم إطلاقها في سوق المؤسسات السعودي.',
  ],
  [
    'harbor-health',
    'Harbor Health Labs',
    'هاربور هيلث لابس',
    'healthcare',
    'GB',
    'Digital-health company exploring partnerships and licensing pathways.',
    'شركة صحة رقمية تستكشف الشراكات ومسارات الترخيص.',
  ],
  [
    'northstar-foods',
    'Northstar Foods',
    'نورث ستار فودز',
    'food-beverage',
    'TR',
    'Premium food producer developing a Saudi distribution model.',
    'منتج أغذية مميز يعمل على بناء نموذج توزيع في السعودية.',
  ],
  [
    'orbit-pay',
    'OrbitPay Technologies',
    'أوربت باي للتقنية',
    'fintech',
    'SG',
    'Payments infrastructure company validating demand and regulatory readiness.',
    'شركة بنية تحتية للمدفوعات تتحقق من الطلب والجاهزية التنظيمية.',
  ],
  [
    'forge-industrial',
    'Forge Industrial Solutions',
    'فورج للحلول الصناعية',
    'industrial-manufacturing',
    'DE',
    'Industrial supplier assessing localization and channel opportunities.',
    'مورد صناعي يقيّم فرص التوطين والقنوات التجارية.',
  ],
  [
    'qantara-mobility',
    'Qantara Mobility',
    'قنطرة للتنقل',
    'mobility-logistics',
    'JO',
    'Mobility technology venture preparing a Saudi operating model.',
    'مشروع تقني للتنقل يستعد لبناء نموذج تشغيل سعودي.',
  ],
  [
    'luma-retail',
    'Luma Consumer Group',
    'لوما للمنتجات الاستهلاكية',
    'food-beverage',
    'IT',
    'Consumer brand group testing retail and e-commerce routes to market.',
    'مجموعة علامات استهلاكية تختبر قنوات التجزئة والتجارة الإلكترونية.',
  ],
  [
    'vertex-ai',
    'Vertex AI Works',
    'فيرتكس للذكاء الاصطناعي',
    'technology-saas',
    'US',
    'Enterprise AI company building a localized business-development pipeline.',
    'شركة ذكاء اصطناعي للمؤسسات تبني مسار تطوير أعمال محليًا.',
  ],
] as const;

const partners = [
  [
    'riyadh-bridge',
    'Riyadh Bridge Advisory',
    'جسر الرياض للاستشارات',
    'strategic',
    'SA',
    'Strategic advisory partner supporting market context and stakeholder access.',
  ],
  [
    'launchdesk',
    'LaunchDesk Arabia',
    'لونش دِسك العربية',
    'delivery',
    'SA',
    'Operational delivery partner supporting launch coordination and local setup.',
  ],
  [
    'cloudmesh',
    'CloudMesh Technologies',
    'كلاود مش للتقنية',
    'technology',
    'AE',
    'Technology partner for cloud, integration and digital-enablement workstreams.',
  ],
  [
    'marketlens',
    'MarketLens Research',
    'ماركت لنس للأبحاث',
    'research',
    'GB',
    'Research partner supporting specialized market intelligence and benchmarking.',
  ],
  [
    'ecosystem-hub',
    'Saudi Growth Hub',
    'مركز النمو السعودي',
    'government_ecosystem',
    'SA',
    'Ecosystem-facing organization used in this demo to illustrate institutional relationships.',
  ],
  [
    'tradepath',
    'TradePath Network',
    'شبكة تريد باث',
    'delivery',
    'BH',
    'Commercial network supporting distributor and channel discovery.',
  ],
  [
    'desert-route',
    'Desert Route Distribution',
    'ديزرت روت للتوزيع',
    'other',
    'SA',
    'Fictional distributor / local-agent profile used to test flexible partner records.',
  ],
] as const;

const brands = [
  [
    'gatevia-labs',
    'GATEVIA Labs',
    'مختبرات GATEVIA',
    'technology-saas',
    'SA',
    'owned',
    'An internal innovation brand for market-intelligence and execution tools.',
    'علامة ابتكار داخلية لتطوير أدوات معلومات السوق والتنفيذ.',
  ],
  [
    'souqscope',
    'SouqScope',
    'سوق سكوب',
    'technology-saas',
    'SA',
    'owned',
    'A market-intelligence concept for structured Saudi opportunity tracking.',
    'مفهوم لمعلومات السوق وتتبع الفرص السعودية بصورة منظمة.',
  ],
  [
    'launchlane',
    'LaunchLane',
    'لانش لين',
    'technology-saas',
    'SA',
    'managed',
    'A launch-readiness brand focused on operational checklists and coordination.',
    'علامة للجاهزية للإطلاق تركز على قوائم التحقق والتنسيق التشغيلي.',
  ],
  [
    'channelcraft',
    'ChannelCraft',
    'تشانل كرافت',
    'food-beverage',
    'SA',
    'affiliate',
    'A channel-development brand illustrating distributor and retail planning.',
    'علامة لتطوير القنوات توضح تخطيط الموزعين والتجزئة.',
  ],
  [
    'industrial-gate',
    'Industrial Gate',
    'إندستريال جيت',
    'industrial-manufacturing',
    'SA',
    'investment',
    'A fictional industrial ecosystem brand for localization and supplier discovery.',
    'علامة صناعية تجريبية للتوطين واكتشاف الموردين.',
  ],
  [
    'nexa-studio',
    'Nexa Studio',
    'نيكسا ستوديو',
    'technology-saas',
    'SA',
    'subsidiary',
    'A fictional subsidiary brand used to test subsidiary relationships.',
    'علامة فرعية وهمية لاختبار علاقة الشركات التابعة.',
  ],
  [
    'open-gateway',
    'Open Gateway Collective',
    'أوبن جيتواي',
    'technology-saas',
    'SA',
    'other',
    'A fictional ecosystem brand used to exercise the generic relationship type.',
    'علامة وهمية لاختبار نوع العلاقة العام.',
  ],
] as const;

const products = [
  [
    'market-map',
    'Saudi Market Map',
    'خريطة السوق السعودي',
    'platform',
    'technology-saas',
    'public',
    'owned',
    'Structured market, stakeholder and opportunity workspace.',
    'مساحة منظمة للسوق وأصحاب المصلحة والفرص.',
    ['Opportunity tracking', 'Stakeholder mapping', 'Market notes', 'Decision workspace'],
  ],
  [
    'entry-readiness',
    'Entry Readiness Score',
    'مؤشر جاهزية الدخول',
    'product',
    'technology-saas',
    'public',
    'owned',
    'A guided readiness assessment for companies evaluating Saudi Arabia.',
    'تقييم موجه لقياس جاهزية الشركات لدخول السوق السعودي.',
    ['Readiness score', 'Gap analysis', 'Priority actions', 'Shareable summary'],
  ],
  [
    'partner-radar',
    'Partner Radar',
    'رادار الشركاء',
    'product',
    'technology-saas',
    'private_beta',
    'owned',
    'Partner and distributor discovery workspace for route-to-market teams.',
    'مساحة لاكتشاف الشركاء والموزعين لفرق دخول السوق.',
    ['Partner criteria', 'Shortlisting', 'Evaluation notes', 'Outreach pipeline'],
  ],
  [
    'launch-room',
    'Launch Room',
    'غرفة الإطلاق',
    'platform',
    'technology-saas',
    'building',
    'owned',
    'Cross-functional launch coordination for establishment and operating readiness.',
    'تنسيق متعدد الفرق للتأسيس والجاهزية التشغيلية والإطلاق.',
    ['Workstreams', 'Dependencies', 'Owners', 'Launch checklist'],
  ],
  [
    'growth-desk',
    'Growth Desk',
    'مكتب النمو',
    'venture',
    'technology-saas',
    'concept',
    'managed',
    'A managed commercial-growth workspace for post-entry execution.',
    'مساحة مُدارة لتنفيذ النمو التجاري بعد دخول السوق.',
    ['Pipeline review', 'Channel experiments', 'Partner actions', 'Growth priorities'],
  ],
  [
    'supply-bridge',
    'Supply Bridge',
    'جسر التوريد',
    'venture',
    'industrial-manufacturing',
    'active',
    'affiliate',
    'Supplier-discovery concept connecting specialized requirements with local options.',
    'مفهوم لاكتشاف الموردين وربط الاحتياجات المتخصصة بالخيارات المحلية.',
    ['Supplier discovery', 'Requirement briefs', 'Comparison', 'Sourcing coordination'],
  ],
  [
    'venture-console',
    'Venture Console',
    'فنتشر كونسول',
    'platform',
    'technology-saas',
    'paused',
    'subsidiary',
    'A paused fictional platform used to test lifecycle and subsidiary states.',
    'منصة وهمية متوقفة مؤقتًا لاختبار حالات دورة الحياة والشركات التابعة.',
    ['Portfolio view', 'Milestones', 'Risk notes', 'Decision log'],
  ],
  [
    'legacy-desk',
    'Legacy Desk',
    'ليجاسي دِسك',
    'product',
    'technology-saas',
    'archived',
    'other',
    'An archived fictional product used to verify archived launch-state rendering in admin.',
    'منتج وهمي مؤرشف لاختبار حالة الإطلاق المؤرشفة في لوحة التحكم.',
    ['Archive state', 'Historical notes', 'Ownership record', 'Read-only reference'],
  ],
] as const;

const team = [
  [
    'layla-haddad',
    'Layla Haddad',
    'ليلى حداد',
    'Market Entry Director',
    'مديرة دخول السوق',
    'Leads market-entry programs, translating research and stakeholder context into executable priorities.',
    'تقود برامج دخول السوق وتحول البحث وسياق أصحاب المصلحة إلى أولويات قابلة للتنفيذ.',
  ],
  [
    'omar-nasser',
    'Omar Nasser',
    'عمر ناصر',
    'Strategy & Research Lead',
    'قائد الاستراتيجية والأبحاث',
    'Focuses on market intelligence, feasibility, competition and evidence-based entry decisions.',
    'يركز على معلومات السوق والجدوى والمنافسة وقرارات الدخول المبنية على الأدلة.',
  ],
  [
    'sara-khalid',
    'Sara Khalid',
    'سارة خالد',
    'Partnerships Lead',
    'قائدة الشراكات',
    'Builds partner criteria, commercial shortlists and structured relationship-development plans.',
    'تبني معايير الشركاء والقوائم التجارية وخطط تطوير العلاقات بصورة منظمة.',
  ],
  [
    'fahad-ali',
    'Fahad Ali',
    'فهد علي',
    'Execution Manager',
    'مدير التنفيذ',
    'Coordinates establishment, licensing and operational-readiness workstreams across stakeholders.',
    'ينسق مسارات التأسيس والتراخيص والجاهزية التشغيلية بين أصحاب المصلحة.',
  ],
  [
    'maya-rahman',
    'Maya Rahman',
    'مايا رحمن',
    'Growth Consultant',
    'مستشارة نمو',
    'Works on go-to-market, channel development and post-entry commercial priorities.',
    'تعمل على الذهاب إلى السوق وتطوير القنوات والأولويات التجارية بعد الدخول.',
  ],
] as const;

const insightCategories = [
  ['market-entry', 'Market Entry', 'دخول السوق'],
  ['regulation', 'Regulation & Setup', 'التنظيم والتأسيس'],
  ['growth', 'Growth & Distribution', 'النمو والتوزيع'],
  ['sector-notes', 'Sector Notes', 'رؤى القطاعات'],
] as const;

const tags = [
  ['saudi-market', 'Saudi Market', 'السوق السعودي'],
  ['market-entry', 'Market Entry', 'دخول السوق'],
  ['distribution', 'Distribution', 'التوزيع'],
  ['localization', 'Localization', 'التوطين'],
  ['partnerships', 'Partnerships', 'الشراكات'],
  ['regulation', 'Regulation', 'التنظيم'],
  ['b2b', 'B2B', 'قطاع الأعمال'],
  ['go-to-market', 'Go-To-Market', 'الذهاب إلى السوق'],
] as const;

const insights = [
  [
    'entry-options',
    'article',
    'market-entry',
    true,
    'Saudi Market Entry: Choosing the Right Route',
    'دخول السوق السعودي: اختيار المسار المناسب',
    'A practical framework for comparing entry paths before committing resources.',
    'إطار عملي لمقارنة مسارات الدخول قبل الالتزام بالموارد.',
    ['market-entry', 'saudi-market'],
    ['market-entry-strategy'],
    ['technology-saas'],
  ],
  [
    'partner-selection',
    'guide',
    'growth',
    true,
    'How to Structure a Local Partner Search',
    'كيف تنظم البحث عن شريك محلي',
    'Define criteria, build a shortlist and evaluate fit without turning partner discovery into guesswork.',
    'حدد المعايير وابنِ قائمة مختصرة وقيّم الملاءمة دون تحويل البحث عن الشريك إلى تخمين.',
    ['partnerships', 'distribution'],
    ['local-partner-search', 'partner-distributor-identification'],
    ['food-beverage'],
  ],
  [
    'regulatory-readiness',
    'article',
    'regulation',
    true,
    'Regulatory Readiness Before Company Setup',
    'الجاهزية التنظيمية قبل تأسيس الشركة',
    'Questions to resolve before formation, licensing and operational commitments.',
    'أسئلة يجب حسمها قبل التأسيس والتراخيص والالتزامات التشغيلية.',
    ['regulation', 'market-entry'],
    ['regulatory-landscape-assessment', 'licensing-support'],
    ['healthcare'],
  ],
  [
    'b2b-gtm',
    'guide',
    'growth',
    false,
    'Building a B2B Go-To-Market Plan for Saudi Arabia',
    'بناء خطة ذهاب إلى السوق B2B في السعودية',
    'Turn ICP assumptions into channels, stakeholder priorities and measurable commercial actions.',
    'حوّل افتراضات العميل المستهدف إلى قنوات وأولويات أصحاب المصلحة وإجراءات تجارية قابلة للقياس.',
    ['b2b', 'go-to-market'],
    ['go-to-market-strategy', 'business-development'],
    ['technology-saas'],
  ],
  [
    'consumer-channels',
    'report',
    'sector-notes',
    false,
    'Consumer Channel Signals: Demo Brief',
    'إشارات قنوات المستهلك: موجز تجريبي',
    'A fictional example report showing how retail and e-commerce channel observations can be presented.',
    'تقرير تجريبي وهمي يوضح طريقة عرض ملاحظات قنوات التجزئة والتجارة الإلكترونية.',
    ['distribution', 'localization'],
    ['distribution-strategy'],
    ['food-beverage'],
  ],
  [
    'industrial-localization',
    'article',
    'sector-notes',
    false,
    'Industrial Localization: What to Validate First',
    'التوطين الصناعي: ما الذي يجب التحقق منه أولًا',
    'A checklist of demand, standards, partner and operating assumptions to validate early.',
    'قائمة للتحقق مبكرًا من افتراضات الطلب والمعايير والشركاء والتشغيل.',
    ['localization', 'b2b'],
    ['feasibility-study', 'vendor-supplier-sourcing'],
    ['industrial-manufacturing'],
  ],
] as const;

const caseStudies = [
  [
    'nexa-launch',
    'nexa-cloud',
    false,
    'AE',
    true,
    'Launching an Enterprise SaaS Offer in Saudi Arabia',
    'إطلاق منتج SaaS للمؤسسات في السعودية',
    'A regional SaaS company needed a clearer Saudi enterprise-entry path before building a local sales team.',
    'شركة SaaS إقليمية احتاجت لمسار أوضح لدخول سوق المؤسسات السعودي قبل بناء فريق مبيعات محلي.',
    'The team had broad regional traction but limited evidence on priority verticals, stakeholders and buying dynamics.',
    'كان لدى الفريق حضور إقليمي جيد لكن أدلته محدودة حول القطاعات ذات الأولوية وأصحاب القرار وديناميكيات الشراء.',
    'GATEVIA structured market research, ICP refinement and a phased go-to-market plan with partner and direct-sales options.',
    'نظمت GATEVIA أبحاث السوق وتعريف العميل المستهدف وخطة دخول مرحلية تجمع بين خيارات الشراكات والمبيعات المباشرة.',
    [
      'Define priority segments',
      'Map buying stakeholders',
      'Compare direct and partner-led routes',
    ],
    ['Research', 'Stakeholder mapping', 'Commercial route design'],
    [
      { value: '3', label: 'priority verticals' },
      { value: '2', label: 'routes compared' },
    ],
    ['market-research', 'market-entry-strategy', 'go-to-market-strategy'],
    ['technology-saas'],
  ],
  [
    'northstar-distribution',
    'northstar-foods',
    false,
    'TR',
    true,
    'Designing a Distribution Model for a Premium Food Brand',
    'تصميم نموذج توزيع لعلامة أغذية مميزة',
    'A premium food producer wanted to validate Saudi demand and identify the right distributor profile.',
    'أراد منتج أغذية مميز التحقق من الطلب السعودي وتحديد مواصفات الموزع المناسب.',
    'The brand had export experience but no structured view of channel economics or distributor selection criteria.',
    'امتلكت العلامة خبرة في التصدير لكنها لم تملك تصورًا منظمًا لاقتصاديات القنوات أو معايير اختيار الموزع.',
    'The work combined competitor review, channel mapping and a scored distributor evaluation framework.',
    'جمع العمل بين مراجعة المنافسين ورسم خريطة القنوات وإطار مُقيّم لاختيار الموزعين.',
    ['Validate category demand', 'Map priority channels', 'Define distributor criteria'],
    ['Category scan', 'Channel economics', 'Partner shortlist'],
    [
      { value: '18', label: 'candidates screened' },
      { value: '5', label: 'priority channels' },
    ],
    ['competitor-analysis', 'partner-distributor-identification', 'distribution-strategy'],
    ['food-beverage'],
  ],
  [
    'harbor-health-entry',
    'harbor-health',
    false,
    'GB',
    false,
    'Clarifying a Healthtech Entry Path',
    'توضيح مسار دخول شركة تقنية صحية',
    'A digital-health company needed a coordinated view of regulation, stakeholders and launch dependencies.',
    'احتاجت شركة صحة رقمية إلى تصور منسق للتنظيم وأصحاب المصلحة واعتماديات الإطلاق.',
    'The opportunity was attractive, but licensing assumptions and stakeholder ownership were fragmented.',
    'كانت الفرصة جذابة لكن افتراضات الترخيص ومسؤوليات أصحاب المصلحة كانت متفرقة.',
    'The project created a regulatory workstream map, stakeholder plan and launch-readiness sequence.',
    'أنشأ المشروع خريطة للمسار التنظيمي وخطة لأصحاب المصلحة وتسلسلًا للجاهزية للإطلاق.',
    ['Clarify regulatory questions', 'Prioritize stakeholders', 'Sequence launch dependencies'],
    ['Regulatory review', 'Stakeholder map', 'Readiness plan'],
    [
      { value: '12', label: 'key stakeholders' },
      { value: '4', label: 'workstreams' },
    ],
    ['regulatory-landscape-assessment', 'government-procedures-coordination', 'licensing-support'],
    ['healthcare'],
  ],
  [
    'forge-localization',
    'forge-industrial',
    true,
    'DE',
    false,
    'Industrial Localization Feasibility Review',
    'مراجعة جدوى التوطين الصناعي',
    'An industrial supplier assessed whether localized operations could improve commercial access.',
    'قيّم مورد صناعي ما إذا كان التشغيل المحلي سيحسن الوصول التجاري.',
    'The business needed to compare demand, setup complexity and partner-led alternatives before investment.',
    'احتاجت الشركة إلى مقارنة الطلب وتعقيد التأسيس والبدائل المعتمدة على الشركاء قبل الاستثمار.',
    'A phased feasibility model compared local setup, distributor and hybrid operating scenarios.',
    'قارن نموذج جدوى مرحلي بين التأسيس المحلي والتوزيع والسيناريو الهجين.',
    ['Test demand assumptions', 'Compare operating models', 'Define decision gates'],
    ['Market sizing', 'Scenario design', 'Decision workshop'],
    [
      { value: '3', label: 'operating models' },
      { value: '6', label: 'decision gates' },
    ],
    ['market-sizing', 'feasibility-study', 'local-operations-setup'],
    ['industrial-manufacturing'],
  ],
  [
    'qantara-operations',
    'qantara-mobility',
    false,
    'JO',
    false,
    'Preparing a Mobility Venture for Local Operations',
    'تهيئة مشروع تنقل للتشغيل المحلي',
    'A mobility platform needed to translate a regional model into Saudi operating requirements.',
    'احتاجت منصة تنقل إلى تحويل نموذجها الإقليمي إلى متطلبات تشغيل سعودية.',
    'The core product was ready, but partnerships, operating density and rollout sequencing needed validation.',
    'كان المنتج الأساسي جاهزًا لكن الشراكات والكثافة التشغيلية وتسلسل التوسع احتاجت للتحقق.',
    'The engagement mapped launch zones, partner dependencies and an operational-readiness backlog.',
    'رسم المشروع مناطق الإطلاق واعتماديات الشركاء وقائمة جاهزية تشغيلية.',
    ['Prioritize launch zones', 'Map partner dependencies', 'Build readiness backlog'],
    ['Demand mapping', 'Partner design', 'Operating plan'],
    [
      { value: '4', label: 'launch zones' },
      { value: '9', label: 'key dependencies' },
    ],
    ['feasibility-study', 'local-partner-search', 'local-operations-setup'],
    ['mobility-logistics'],
  ],
] as const;

const testimonials = [
  [
    'nexa',
    'nexa-cloud',
    'nexa-launch',
    'Daniel Mercer',
    'Regional Growth Director',
    'Nexa Cloud Systems',
    'AE',
    'The process gave our team a much clearer view of where to focus first and which assumptions still needed evidence.',
    'أعطتنا العملية رؤية أوضح بكثير حول ما يجب التركيز عليه أولًا وما الافتراضات التي ما زالت تحتاج إلى أدلة.',
  ],
  [
    'northstar',
    'northstar-foods',
    'northstar-distribution',
    'Elif Demir',
    'Export Director',
    'Northstar Foods',
    'TR',
    'We moved from a long list of possible distributors to a structured shortlist with clear evaluation criteria.',
    'انتقلنا من قائمة طويلة من الموزعين المحتملين إلى قائمة مختصرة منظمة بمعايير تقييم واضحة.',
  ],
  [
    'harbor',
    'harbor-health',
    'harbor-health-entry',
    'Sophie Grant',
    'Market Expansion Lead',
    'Harbor Health Labs',
    'GB',
    'The regulatory and stakeholder workstreams finally became one coordinated market-entry plan.',
    'أصبحت مسارات التنظيم وأصحاب المصلحة أخيرًا خطة دخول سوق واحدة ومنسقة.',
  ],
  [
    'forge',
    'forge-industrial',
    'forge-localization',
    'Lukas Weber',
    'Commercial Strategy Manager',
    'Forge Industrial Solutions',
    'DE',
    'The scenario comparison helped us avoid committing to a local setup before the commercial case was ready.',
    'ساعدتنا مقارنة السيناريوهات على تجنب الالتزام بالتأسيس المحلي قبل نضج الجدوى التجارية.',
  ],
  [
    'qantara',
    'qantara-mobility',
    'qantara-operations',
    'Rami Haddad',
    'Co-Founder',
    'Qantara Mobility',
    'JO',
    'The launch plan connected product, operations and partnerships in a way our regional playbook did not.',
    'ربطت خطة الإطلاق بين المنتج والتشغيل والشراكات بطريقة لم يوفرها دليلنا الإقليمي.',
  ],
] as const;

const certifications = [
  [
    'iso-quality-demo',
    'Demo Standards Institute',
    'GV-DEMO-001',
    'Quality Management Readiness — Demo',
    'جاهزية إدارة الجودة — تجريبي',
    'Fictional certificate used only to test trust and certification UI.',
    'شهادة وهمية تستخدم فقط لاختبار واجهات الثقة والاعتمادات.',
  ],
  [
    'data-practice-demo',
    'Digital Practice Council',
    'GV-DEMO-002',
    'Data Practice Framework — Demo',
    'إطار ممارسات البيانات — تجريبي',
    'Fictional certification record for CMS and public-layout testing.',
    'سجل اعتماد وهمي لاختبار نظام إدارة المحتوى وتصميم الموقع.',
  ],
  [
    'research-method-demo',
    'Market Research Guild',
    'GV-DEMO-003',
    'Applied Market Research — Demo',
    'أبحاث السوق التطبيقية — تجريبي',
    'Fictional research-method certificate for design testing.',
    'اعتماد بحثي وهمي لاختبار التصميم.',
  ],
] as const;

const trustMetrics = [
  ['markets', '12', '+', 'Markets assessed', 'أسواق تم تقييمها'],
  ['workstreams', '40', '+', 'Demo workstreams modeled', 'مسار عمل تجريبي تم تصميمه'],
  ['sectors', '6', '', 'Priority sectors covered', 'قطاعات ذات أولوية'],
  ['partners-screened', '120', '+', 'Partner profiles screened', 'ملف شريك تم تقييمه'],
  ['languages', '2', '', 'Publishing languages', 'لغات النشر'],
  ['response', '48', 'h', 'Illustrative response target', 'هدف استجابة توضيحي'],
] as const;

const leads = [
  [
    'demo-lead-01',
    'Aisha Morgan',
    'BluePeak Analytics',
    'aisha.morgan@example.com',
    '+971500000101',
    'AE',
    'technology-saas',
    'market-entry-strategy',
    'consultation',
    'new',
    'Exploring a Saudi launch for a B2B analytics platform.',
  ],
  [
    'demo-lead-02',
    'Khalid Rahman',
    'Cedar Foods',
    'khalid.rahman@example.com',
    '+97339000102',
    'BH',
    'food-beverage',
    'partner-distributor-identification',
    'contact',
    'contacted',
    'Looking for distributor-selection support and channel validation.',
  ],
  [
    'demo-lead-03',
    'Emma Wright',
    'Harbor Diagnostics',
    'emma.wright@example.com',
    '+442000000103',
    'GB',
    'healthcare',
    'regulatory-landscape-assessment',
    'assessment',
    'qualified',
    'Need clarity on regulatory and stakeholder requirements before investment approval.',
  ],
  [
    'demo-lead-04',
    'Yousef Karim',
    'RouteGrid',
    'yousef.karim@example.com',
    '+962790000104',
    'JO',
    'mobility-logistics',
    'feasibility-study',
    'landing_page',
    'proposal',
    'Assessing launch feasibility for a logistics-technology product.',
  ],
  [
    'demo-lead-05',
    'Marta Klein',
    'Precision Forge',
    'marta.klein@example.com',
    '+49170000105',
    'DE',
    'industrial-manufacturing',
    'local-operations-setup',
    'manual',
    'won',
    'Comparing local setup versus distributor-led market entry.',
  ],
  [
    'demo-lead-06',
    'Noah Chen',
    'FinBridge',
    'noah.chen@example.com',
    '+6580000106',
    'SG',
    'fintech',
    'market-research',
    'consultation',
    'lost',
    'Early-stage market scan for a payments infrastructure company.',
  ],
  [
    'demo-lead-07',
    'Lina Costa',
    'Viva Consumer',
    'lina.costa@example.com',
    '+39020000107',
    'IT',
    'food-beverage',
    'go-to-market-strategy',
    'contact',
    'qualified',
    'Preparing a premium consumer brand for retail launch.',
  ],
  [
    'demo-lead-08',
    'Adam Brooks',
    'Vector Security',
    'adam.brooks@example.com',
    '+12020000108',
    'US',
    'technology-saas',
    'business-development',
    'assessment',
    'new',
    'Enterprise cybersecurity vendor seeking local pipeline support.',
  ],
] as const;

async function assertPrerequisites() {
  for (const locale of locales) {
    if (!(await prisma.language.findUnique({ where: { code: locale } }))) {
      throw new Error(`Missing language ${locale}. Run pnpm seed before pnpm seed:demo.`);
    }
  }
  const servicesCount = await prisma.service.count();
  const pagesCount = await prisma.page.count();
  if (!servicesCount || !pagesCount) {
    throw new Error('Initial content is missing. Run pnpm seed:content before pnpm seed:demo.');
  }
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_DEMO_SEED_IN_PRODUCTION !== 'true'
  ) {
    throw new Error(
      'Demo seed is blocked in production. If this environment is intentionally disposable/demo, set ALLOW_DEMO_SEED_IN_PRODUCTION=true for this command only.',
    );
  }
}

async function publishBaseContentForDemo() {
  await prisma.$transaction([
    prisma.page.updateMany({
      where: { pageType: { not: 'legal' } },
      data: { status: 'published', publishedAt },
    }),
    prisma.serviceCategory.updateMany({ data: { status: 'published' } }),
    prisma.service.updateMany({ data: { status: 'published', publishedAt } }),
    prisma.faq.updateMany({ data: { status: 'published' } }),
    prisma.navigationMenu.updateMany({ data: { status: 'published' } }),
  ]);
}

async function getServiceIds() {
  const rows = await prisma.service.findMany({
    include: { translations: { where: { locale: 'en' }, select: { slug: true } } },
  });
  return Object.fromEntries(
    rows.flatMap((row) => (row.translations[0]?.slug ? [[row.translations[0].slug, row.id]] : [])),
  );
}

async function seedIndustries(serviceIds: Record<string, string>, mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < industries.length; index += 1) {
    const item = industries[index]!;
    const id = stableUuid(`industry:${item.key}`);
    ids[item.key] = id;
    await prisma.industry.upsert({
      where: { id },
      create: {
        id,
        heroMediaId: mediaAt(mediaPool, index),
        status: 'published',
        featured: item.featured,
        sortOrder: (index + 1) * 10,
        publishedAt,
      },
      update: {},
    });
    for (const locale of locales) {
      const tr = item.tr[locale];
      await prisma.industryTranslation.upsert({
        where: { industryId_locale: { industryId: id, locale } },
        create: {
          industryId: id,
          locale,
          name: tr.name,
          slug: tr.slug,
          shortDescription: tr.shortDescription,
          overview: tr.overview,
          challenges: json(tr.challenges),
          opportunities: json(tr.opportunities),
          ctaLabel: locale === 'en' ? 'Discuss this sector' : 'ناقش هذا القطاع',
          seoTitle: `${tr.name} | GATEVIA Demo`,
          seoDescription: tr.shortDescription,
          robotsIndex: false,
        },
        update: {},
      });
    }
    for (const serviceSlug of item.services) {
      const serviceId = serviceIds[serviceSlug];
      if (!serviceId) continue;
      await prisma.serviceIndustry.upsert({
        where: { serviceId_industryId: { serviceId, industryId: id } },
        create: { serviceId, industryId: id },
        update: {},
      });
    }
  }
  return ids;
}

async function seedClients(industryIds: Record<string, string>, mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < clients.length; index += 1) {
    const [key, enName, arName, industryKey, countryCode, enDescription, arDescription] =
      clients[index]!;
    const id = stableUuid(`client:${key}`);
    ids[key] = id;
    await prisma.client.upsert({
      where: { id },
      create: {
        id,
        logoMediaId: mediaAt(mediaPool, index + 2),
        website: `https://example.com/${key}`,
        industryId: industryIds[industryKey],
        countryCode,
        featured: index < 5,
        publicVisibility: true,
        sortOrder: (index + 1) * 10,
        status: 'published',
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.clientTranslation.upsert({
        where: { clientId_locale: { clientId: id, locale } },
        create: {
          clientId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          shortDescription: locale === 'en' ? enDescription : arDescription,
        },
        update: {},
      });
    }
  }
  return ids;
}

async function seedPartners(mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < partners.length; index += 1) {
    const [key, enName, arName, partnerType, countryCode, enDescription] = partners[index]!;
    const id = stableUuid(`partner:${key}`);
    ids[key] = id;
    await prisma.partner.upsert({
      where: { id },
      create: {
        id,
        partnerType,
        logoMediaId: mediaAt(mediaPool, index + 5),
        website: `https://example.com/${key}`,
        countryCode,
        featured: index < 4,
        publicVisibility: true,
        sortOrder: (index + 1) * 10,
        status: 'published',
        startDate: new Date(Date.UTC(2024 + (index % 2), index % 12, 1)),
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.partnerTranslation.upsert({
        where: { partnerId_locale: { partnerId: id, locale } },
        create: {
          partnerId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          description:
            locale === 'en'
              ? enDescription
              : `شريك تجريبي وهمي لاختبار عرض قسم الشراكات: ${arName}.`,
        },
        update: {},
      });
    }
  }
  return ids;
}

async function seedBrands(industryIds: Record<string, string>, mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < brands.length; index += 1) {
    const [key, enName, arName, industryKey, countryCode, relationshipType, enShort, arShort] =
      brands[index]!;
    const id = stableUuid(`brand:${key}`);
    ids[key] = id;
    await prisma.brand.upsert({
      where: { id },
      create: {
        id,
        logoMediaId: mediaAt(mediaPool, index + 1),
        coverMediaId: mediaAt(mediaPool, index + 7),
        industryId: industryIds[industryKey],
        website: `https://example.com/${key}`,
        relationshipType,
        status: 'published',
        featured: index < 4,
        sortOrder: (index + 1) * 10,
        publishedAt,
        countryCode,
      },
      update: {},
    });
    for (const locale of locales) {
      const name = locale === 'en' ? enName : arName;
      const shortDescription = locale === 'en' ? enShort : arShort;
      await prisma.brandTranslation.upsert({
        where: { brandId_locale: { brandId: id, locale } },
        create: {
          brandId: id,
          locale,
          name,
          slug: locale === 'en' ? key : `demo-${key}-ar`,
          shortDescription,
          fullDescription: `${shortDescription} ${locale === 'en' ? 'This is fictional demo content created only for layout and CMS testing.' : 'هذا محتوى تجريبي وهمي مخصص فقط لاختبار التصميم ونظام إدارة المحتوى.'}`,
          seoTitle: `${name} | GATEVIA Demo`,
          seoDescription: shortDescription,
          robotsIndex: false,
        },
        update: {},
      });
    }
  }
  return ids;
}

async function seedProducts(industryIds: Record<string, string>, mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < products.length; index += 1) {
    const [
      key,
      enName,
      arName,
      productType,
      industryKey,
      launchStatus,
      relationshipType,
      enShort,
      arShort,
      features,
    ] = products[index]!;
    const id = stableUuid(`product:${key}`);
    ids[key] = id;
    await prisma.productVenture.upsert({
      where: { id },
      create: {
        id,
        logoMediaId: mediaAt(mediaPool, index + 3),
        productType,
        industryId: industryIds[industryKey],
        website: `https://example.com/${key}`,
        launchStatus,
        relationshipType,
        status: 'published',
        featured: index < 4,
        sortOrder: (index + 1) * 10,
        publishedAt,
      },
      update: {},
    });
    for (const locale of locales) {
      const name = locale === 'en' ? enName : arName;
      const shortDescription = locale === 'en' ? enShort : arShort;
      await prisma.productVentureTranslation.upsert({
        where: { productVentureId_locale: { productVentureId: id, locale } },
        create: {
          productVentureId: id,
          locale,
          name,
          slug: locale === 'en' ? key : `demo-${key}-ar`,
          shortDescription,
          fullDescription: `${shortDescription} ${locale === 'en' ? 'Fictional demo product for CMS and visual testing.' : 'منتج وهمي تجريبي لاختبار نظام إدارة المحتوى والتصميم.'}`,
          keyFeatures: json(
            locale === 'en' ? features : features.map((feature) => `ميزة تجريبية: ${feature}`),
          ),
          seoTitle: `${name} | GATEVIA Demo`,
          seoDescription: shortDescription,
          robotsIndex: false,
        },
        update: {},
      });
    }
  }
  return ids;
}

async function seedTeam(mediaPool: string[]) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < team.length; index += 1) {
    const [key, enName, arName, enPosition, arPosition, enBio, arBio] = team[index]!;
    const id = stableUuid(`team:${key}`);
    ids[key] = id;
    await prisma.teamMember.upsert({
      where: { id },
      create: {
        id,
        photoMediaId: mediaAt(mediaPool, index + 4),
        linkedinUrl: `https://www.linkedin.com/in/${key}`,
        status: 'published',
        sortOrder: (index + 1) * 10,
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.teamMemberTranslation.upsert({
        where: { memberId_locale: { memberId: id, locale } },
        create: {
          memberId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          position: locale === 'en' ? enPosition : arPosition,
          bio: locale === 'en' ? enBio : arBio,
        },
        update: {},
      });
    }
  }
  return ids;
}

async function seedInsightTaxonomy() {
  const categoryIds: Record<string, string> = {};
  for (let index = 0; index < insightCategories.length; index += 1) {
    const [key, enName, arName] = insightCategories[index]!;
    const id = stableUuid(`insight-category:${key}`);
    categoryIds[key] = id;
    await prisma.insightCategory.upsert({
      where: { id },
      create: { id, status: 'published', sortOrder: (index + 1) * 10 },
      update: {},
    });
    for (const locale of locales) {
      await prisma.insightCategoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: id, locale } },
        create: {
          categoryId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          slug: locale === 'en' ? key : `demo-${key}-ar`,
        },
        update: {},
      });
    }
  }

  const tagIds: Record<string, string> = {};
  for (const [key, enName, arName] of tags) {
    const id = stableUuid(`tag:${key}`);
    tagIds[key] = id;
    await prisma.tag.upsert({ where: { id }, create: { id, key: `demo-${key}` }, update: {} });
    for (const locale of locales) {
      await prisma.tagTranslation.upsert({
        where: { tagId_locale: { tagId: id, locale } },
        create: {
          tagId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          slug: locale === 'en' ? `demo-${key}` : `demo-${key}-ar`,
        },
        update: {},
      });
    }
  }
  return { categoryIds, tagIds };
}

async function seedInsights(
  categoryIds: Record<string, string>,
  tagIds: Record<string, string>,
  industryIds: Record<string, string>,
  serviceIds: Record<string, string>,
  mediaPool: string[],
) {
  const ids: Record<string, string> = {};
  const author = await prisma.user.findFirst({
    where: { status: 'active' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  for (let index = 0; index < insights.length; index += 1) {
    const [
      key,
      type,
      categoryKey,
      featured,
      enTitle,
      arTitle,
      enExcerpt,
      arExcerpt,
      tagKeys,
      serviceSlugs,
      industryKeys,
    ] = insights[index]!;
    const id = stableUuid(`insight:${key}`);
    ids[key] = id;
    await prisma.insight.upsert({
      where: { id },
      create: {
        id,
        type,
        categoryId: categoryIds[categoryKey],
        authorUserId: author?.id,
        coverMediaId: mediaAt(mediaPool, index + 6),
        status: 'published',
        featured,
        publishedAt: dateDaysAgo(index * 9 + 2),
      },
      update: {},
    });
    for (const locale of locales) {
      const title = locale === 'en' ? enTitle : arTitle;
      const excerpt = locale === 'en' ? enExcerpt : arExcerpt;
      const content =
        locale === 'en'
          ? [
              {
                type: 'paragraph',
                text: `${enExcerpt} This fictional article exists to exercise long-form insight layouts, related content and CMS editing.`,
              },
              { type: 'heading', level: 2, text: 'What to validate' },
              {
                type: 'list',
                items: [
                  'Decision context',
                  'Market evidence',
                  'Stakeholder requirements',
                  'Execution dependencies',
                ],
              },
              {
                type: 'callout',
                text: 'Demo content — replace with approved editorial content before production use.',
              },
            ]
          : [
              {
                type: 'paragraph',
                text: `${arExcerpt} هذا المقال وهمي ومخصص لاختبار تخطيط المحتوى الطويل والعلاقات والتحرير من لوحة التحكم.`,
              },
              { type: 'heading', level: 2, text: 'ما الذي يجب التحقق منه؟' },
              {
                type: 'list',
                items: ['سياق القرار', 'أدلة السوق', 'متطلبات أصحاب المصلحة', 'اعتماديات التنفيذ'],
              },
              {
                type: 'callout',
                text: 'محتوى تجريبي — استبدله بمحتوى تحريري معتمد قبل الاستخدام الإنتاجي.',
              },
            ];
      await prisma.insightTranslation.upsert({
        where: { insightId_locale: { insightId: id, locale } },
        create: {
          insightId: id,
          locale,
          title,
          slug: locale === 'en' ? `demo-${key}` : `demo-${key}-ar`,
          excerpt,
          content: json(content),
          seoTitle: `${title} | GATEVIA Demo`,
          seoDescription: excerpt,
          robotsIndex: false,
        },
        update: {},
      });
    }
    for (const tagKey of tagKeys) {
      await prisma.insightTag.upsert({
        where: { insightId_tagId: { insightId: id, tagId: tagIds[tagKey]! } },
        create: { insightId: id, tagId: tagIds[tagKey]! },
        update: {},
      });
    }
    for (const serviceSlug of serviceSlugs) {
      const serviceId = serviceIds[serviceSlug];
      if (serviceId)
        await prisma.insightService.upsert({
          where: { insightId_serviceId: { insightId: id, serviceId } },
          create: { insightId: id, serviceId },
          update: {},
        });
    }
    for (const industryKey of industryKeys) {
      const industryId = industryIds[industryKey];
      if (industryId)
        await prisma.insightIndustry.upsert({
          where: { insightId_industryId: { insightId: id, industryId } },
          create: { insightId: id, industryId },
          update: {},
        });
    }
  }
  return ids;
}

async function seedCaseStudies(
  clientIds: Record<string, string>,
  industryIds: Record<string, string>,
  serviceIds: Record<string, string>,
  mediaPool: string[],
) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < caseStudies.length; index += 1) {
    const [
      key,
      clientKey,
      anonymized,
      countryCode,
      featured,
      enTitle,
      arTitle,
      enContext,
      arContext,
      enChallenge,
      arChallenge,
      enSolution,
      arSolution,
      enObjectives,
      enProcess,
      metrics,
      serviceSlugs,
      industryKeys,
    ] = caseStudies[index]!;
    const id = stableUuid(`case-study:${key}`);
    ids[key] = id;
    await prisma.caseStudy.upsert({
      where: { id },
      create: {
        id,
        clientId: clientIds[clientKey],
        anonymized,
        countryCode,
        heroMediaId: mediaAt(mediaPool, index + 8),
        status: 'published',
        featured,
        publishedAt: dateDaysAgo(index * 14 + 5),
        sortOrder: (index + 1) * 10,
      },
      update: {},
    });
    for (const locale of locales) {
      const title = locale === 'en' ? enTitle : arTitle;
      const context = locale === 'en' ? enContext : arContext;
      const challenge = locale === 'en' ? enChallenge : arChallenge;
      const solution = locale === 'en' ? enSolution : arSolution;
      await prisma.caseStudyTranslation.upsert({
        where: { caseStudyId_locale: { caseStudyId: id, locale } },
        create: {
          caseStudyId: id,
          locale,
          title,
          slug: locale === 'en' ? `demo-${key}` : `demo-${key}-ar`,
          clientLabel: anonymized
            ? locale === 'en'
              ? 'Confidential industrial client'
              : 'عميل صناعي سري'
            : undefined,
          context,
          challenge,
          objectives: json(
            locale === 'en' ? enObjectives : enObjectives.map((v) => `هدف تجريبي: ${v}`),
          ),
          solution,
          process: json(locale === 'en' ? enProcess : enProcess.map((v) => `خطوة تجريبية: ${v}`)),
          results: json(
            locale === 'en'
              ? ['Clearer entry decision', 'Prioritized next actions', 'Aligned stakeholder plan']
              : ['قرار دخول أوضح', 'أولويات تنفيذ محددة', 'خطة موحدة لأصحاب المصلحة'],
          ),
          metrics: json(metrics),
          testimonialText:
            locale === 'en'
              ? 'Demo case study — all companies, people and outcomes are fictional.'
              : 'دراسة حالة تجريبية — جميع الشركات والأشخاص والنتائج وهمية.',
          seoTitle: `${title} | GATEVIA Demo`,
          seoDescription: context,
          robotsIndex: false,
        },
        update: {},
      });
    }
    for (const serviceSlug of serviceSlugs) {
      const serviceId = serviceIds[serviceSlug];
      if (serviceId)
        await prisma.caseStudyService.upsert({
          where: { caseStudyId_serviceId: { caseStudyId: id, serviceId } },
          create: { caseStudyId: id, serviceId },
          update: {},
        });
    }
    for (const industryKey of industryKeys) {
      const industryId = industryIds[industryKey];
      if (industryId)
        await prisma.caseStudyIndustry.upsert({
          where: { caseStudyId_industryId: { caseStudyId: id, industryId } },
          create: { caseStudyId: id, industryId },
          update: {},
        });
    }
  }
  return ids;
}

async function seedTestimonials(
  clientIds: Record<string, string>,
  caseStudyIds: Record<string, string>,
  mediaPool: string[],
) {
  const ids: Record<string, string> = {};
  for (let index = 0; index < testimonials.length; index += 1) {
    const [
      key,
      clientKey,
      caseKey,
      personName,
      personRole,
      companyName,
      countryCode,
      enQuote,
      arQuote,
    ] = testimonials[index]!;
    const id = stableUuid(`testimonial:${key}`);
    ids[key] = id;
    await prisma.testimonial.upsert({
      where: { id },
      create: {
        id,
        clientId: clientIds[clientKey],
        caseStudyId: caseStudyIds[caseKey],
        logoMediaId: mediaAt(mediaPool, index + 2),
        personName,
        personRole,
        companyName,
        countryCode,
        consentConfirmed: true,
        featured: index < 4,
        status: 'published',
        sortOrder: (index + 1) * 10,
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.testimonialTranslation.upsert({
        where: { testimonialId_locale: { testimonialId: id, locale } },
        create: { testimonialId: id, locale, quote: locale === 'en' ? enQuote : arQuote },
        update: {},
      });
    }
  }
  return ids;
}

async function seedCertifications(mediaPool: string[]) {
  for (let index = 0; index < certifications.length; index += 1) {
    const [key, issuer, certificateNumber, enName, arName, enDescription, arDescription] =
      certifications[index]!;
    const id = stableUuid(`certification:${key}`);
    await prisma.certification.upsert({
      where: { id },
      create: {
        id,
        logoMediaId: mediaAt(mediaPool, index + 9),
        issuer,
        certificateNumber,
        validFrom: new Date(Date.UTC(2025, index, 1)),
        validUntil: new Date(Date.UTC(2028, index, 1)),
        verificationUrl: `https://example.com/certificates/${key}`,
        publicVisibility: true,
        status: 'published',
        sortOrder: (index + 1) * 10,
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.certificationTranslation.upsert({
        where: { certificationId_locale: { certificationId: id, locale } },
        create: {
          certificationId: id,
          locale,
          name: locale === 'en' ? enName : arName,
          description: locale === 'en' ? enDescription : arDescription,
        },
        update: {},
      });
    }
  }
}

async function seedTrustMetrics() {
  for (let index = 0; index < trustMetrics.length; index += 1) {
    const [key, value, suffix, enLabel, arLabel] = trustMetrics[index]!;
    const id = stableUuid(`trust-metric:${key}`);
    await prisma.trustMetric.upsert({
      where: { id },
      create: {
        id,
        value,
        suffix: suffix || null,
        evidenceNoteInternal:
          'DEMO ONLY — fictional metric for UI/layout testing; do not publish as a real GATEVIA claim.',
        publicVisibility: true,
        sortOrder: (index + 1) * 10,
        status: 'published',
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.trustMetricTranslation.upsert({
        where: { trustMetricId_locale: { trustMetricId: id, locale } },
        create: { trustMetricId: id, locale, label: locale === 'en' ? enLabel : arLabel },
        update: {},
      });
    }
  }
}

async function seedLeads(industryIds: Record<string, string>, serviceIds: Record<string, string>) {
  const activeUser = await prisma.user.findFirst({
    where: { status: 'active' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  for (let index = 0; index < leads.length; index += 1) {
    const [
      key,
      fullName,
      companyName,
      email,
      phone,
      countryCode,
      industryKey,
      serviceSlug,
      sourceType,
      status,
      message,
    ] = leads[index]!;
    const id = stableUuid(`lead:${key}`);
    await prisma.lead.upsert({
      where: { id },
      create: {
        id,
        fullName,
        companyName,
        email,
        phone,
        countryCode,
        preferredLocale: index % 3 === 0 ? 'ar-SA' : 'en',
        industryId: industryIds[industryKey],
        serviceId: serviceIds[serviceSlug],
        message,
        sourceType,
        sourcePage: '/demo-seed',
        sourceUrl: 'https://example.com/demo-seed',
        submissionLocale: index % 3 === 0 ? 'ar-SA' : 'en',
        status,
        assignedToUserId: index > 0 ? activeUser?.id : undefined,
        utmSource: index % 2 === 0 ? 'linkedin' : 'google',
        utmMedium: index % 2 === 0 ? 'social' : 'cpc',
        utmCampaign: 'demo-market-entry',
        referrer: 'https://example.com/demo-referrer',
        landingPage: '/en/saudi-market-entry',
        consentConfirmed: true,
        consentAt: dateDaysAgo(index + 1),
        formDetails: json({
          demo: true,
          companyStage: ['exploring', 'validating', 'ready'][index % 3],
          timeline: ['0-3 months', '3-6 months', '6-12 months'][index % 3],
        }),
        createdAt: dateDaysAgo(index * 2 + 1),
      },
      update: {},
    });
    await prisma.leadActivity.upsert({
      where: { id: stableUuid(`lead-activity:${key}:created`) },
      create: {
        id: stableUuid(`lead-activity:${key}:created`),
        leadId: id,
        actorUserId: activeUser?.id,
        type: 'demo_seed_created',
        payload: json({ demo: true, source: sourceType }),
        createdAt: dateDaysAgo(index * 2 + 1),
      },
      update: {},
    });
    if (activeUser && index < 5) {
      await prisma.leadNote.upsert({
        where: { id: stableUuid(`lead-note:${key}`) },
        create: {
          id: stableUuid(`lead-note:${key}`),
          leadId: id,
          authorUserId: activeUser.id,
          body: `Demo CRM note for ${companyName}. Replace or remove when real lead data is available.`,
        },
        update: {},
      });
    }
    if (sourceType === 'assessment') {
      await prisma.assessment.upsert({
        where: { id: stableUuid(`assessment:${key}`) },
        create: {
          id: stableUuid(`assessment:${key}`),
          leadId: id,
          formVersion: 'demo-v1',
          answers: json({
            objective: 'Evaluate Saudi market entry',
            marketKnowledge: 'moderate',
            localEntity: false,
            preferredRoute: index % 2 ? 'partner-led' : 'direct',
            budgetRange: 'demo-only',
          }),
          submittedAt: dateDaysAgo(index * 2 + 1),
        },
        update: {},
      });
    }
  }
}

async function seedRedirects() {
  const redirects = [
    ['/en/old-market-entry', '/en/saudi-market-entry', 301, 'en'],
    ['/ar-sa/old-market-entry', '/ar-sa/saudi-market-entry', 301, 'ar-SA'],
    ['/demo-consulting', '/en/book-consultation', 302, null],
  ] as const;
  for (const [sourcePath, destinationPath, statusCode, locale] of redirects) {
    await prisma.redirect.upsert({
      where: { sourcePath },
      create: { sourcePath, destinationPath, statusCode, locale, active: true },
      update: {},
    });
  }
}

async function seedDemoPageSections(input: {
  industryIds: Record<string, string>;
  caseStudyIds: Record<string, string>;
  testimonialIds: Record<string, string>;
  clientIds: Record<string, string>;
  partnerIds: Record<string, string>;
  brandIds: Record<string, string>;
  productIds: Record<string, string>;
  insightIds: Record<string, string>;
}) {
  const pages = await prisma.pageTranslation.findMany({
    where: { locale: 'en', slug: { in: ['home', 'ecosystem'] } },
    select: { slug: true, pageId: true },
  });
  const pageIds = Object.fromEntries(pages.map((row) => [row.slug, row.pageId]));
  if (!pageIds.home) return;

  const homeSections = [
    [
      'stats',
      60,
      localized(
        {
          eyebrow: 'Demo proof points',
          title: 'A fuller view of the experience',
          items: [
            { label: 'Demo markets assessed', value: '12', suffix: '+' },
            { label: 'Workstreams modeled', value: '40', suffix: '+' },
            { label: 'Priority sectors', value: '6' },
            { label: 'Partner profiles', value: '120', suffix: '+' },
          ],
        },
        {
          eyebrow: 'مؤشرات تجريبية',
          title: 'صورة أكمل لتجربة الموقع',
          items: [
            { label: 'أسواق تجريبية تم تقييمها', value: '12', suffix: '+' },
            { label: 'مسارات عمل تم تصميمها', value: '40', suffix: '+' },
            { label: 'قطاعات ذات أولوية', value: '6' },
            { label: 'ملفات شركاء', value: '120', suffix: '+' },
          ],
        },
      ),
    ],
    [
      'industries_grid',
      50,
      localized(
        {
          eyebrow: 'Industries',
          title: 'Sector experience across the Saudi opportunity landscape',
          industryIds: Object.values(input.industryIds).slice(0, 6),
        },
        {
          eyebrow: 'القطاعات',
          title: 'خبرة قطاعية عبر مشهد الفرص في السوق السعودي',
          industryIds: Object.values(input.industryIds).slice(0, 6),
        },
      ),
    ],
    [
      'case_studies',
      70,
      localized(
        {
          eyebrow: 'Case studies',
          title: 'Illustrative market-entry engagements',
          caseStudyIds: Object.values(input.caseStudyIds).slice(0, 4),
        },
        {
          eyebrow: 'دراسات الحالة',
          title: 'نماذج توضيحية لمشاريع دخول السوق',
          caseStudyIds: Object.values(input.caseStudyIds).slice(0, 4),
        },
      ),
    ],
    [
      'testimonials',
      80,
      localized(
        {
          eyebrow: 'Client voice',
          title: 'What a structured process can change',
          testimonialIds: Object.values(input.testimonialIds).slice(0, 5),
        },
        {
          eyebrow: 'آراء العملاء',
          title: 'ما الذي يمكن أن تغيره العملية المنظمة',
          testimonialIds: Object.values(input.testimonialIds).slice(0, 5),
        },
      ),
    ],
    [
      'logo_cloud',
      90,
      localized(
        {
          eyebrow: 'Network',
          title: 'Demo clients and partners',
          clientIds: Object.values(input.clientIds).slice(0, 8),
          partnerIds: Object.values(input.partnerIds).slice(0, 6),
        },
        {
          eyebrow: 'الشبكة',
          title: 'عملاء وشركاء تجريبيون',
          clientIds: Object.values(input.clientIds).slice(0, 8),
          partnerIds: Object.values(input.partnerIds).slice(0, 6),
        },
      ),
    ],
    [
      'ecosystem',
      100,
      localized(
        {
          eyebrow: 'Ecosystem',
          title: 'Brands, products and ventures',
          brandIds: Object.values(input.brandIds).slice(0, 5),
          productIds: Object.values(input.productIds).slice(0, 6),
        },
        {
          eyebrow: 'منظومة الأعمال',
          title: 'علامات ومنتجات ومشاريع',
          brandIds: Object.values(input.brandIds).slice(0, 5),
          productIds: Object.values(input.productIds).slice(0, 6),
        },
      ),
    ],
    [
      'insights',
      110,
      localized(
        {
          eyebrow: 'Insights',
          title: 'Practical notes for Saudi market decisions',
          insightIds: Object.values(input.insightIds).slice(0, 6),
        },
        {
          eyebrow: 'الرؤى',
          title: 'ملاحظات عملية لقرارات السوق السعودي',
          insightIds: Object.values(input.insightIds).slice(0, 6),
        },
      ),
    ],
  ] as const;

  for (const [sectionType, sortOrder, content] of homeSections) {
    const id = stableUuid(`page-section:home:${sectionType}`);
    const section = await prisma.pageSection.upsert({
      where: { id },
      create: {
        id,
        pageId: pageIds.home,
        sectionType,
        sortOrder,
        isVisible: true,
        settings: json({ demo: true }),
      },
      update: { sortOrder },
    });
    for (const locale of locales) {
      await prisma.pageSectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: section.id, locale } },
        create: { sectionId: section.id, locale, content: json(content[locale]) },
        update: {},
      });
    }
  }

  if (pageIds.ecosystem) {
    const ecosystemContent = localized(
      {
        eyebrow: 'Demo ecosystem',
        title: 'Explore the ecosystem layout',
        brandIds: Object.values(input.brandIds),
        productIds: Object.values(input.productIds),
      },
      {
        eyebrow: 'منظومة تجريبية',
        title: 'استكشف تصميم منظومة الأعمال',
        brandIds: Object.values(input.brandIds),
        productIds: Object.values(input.productIds),
      },
    );
    const section = await prisma.pageSection.upsert({
      where: { pageId_sortOrder: { pageId: pageIds.ecosystem, sortOrder: 20 } },
      create: {
        id: stableUuid('page-section:ecosystem:ecosystem'),
        pageId: pageIds.ecosystem,
        sectionType: 'ecosystem',
        sortOrder: 20,
        isVisible: true,
        settings: json({ demo: true }),
      },
      update: {},
    });
    for (const locale of locales) {
      await prisma.pageSectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: section.id, locale } },
        create: { sectionId: section.id, locale, content: json(ecosystemContent[locale]) },
        update: {},
      });
    }
  }
}

async function seed() {
  await assertPrerequisites();

  await publishBaseContentForDemo();

  const readyImages = await prisma.media.findMany({
    where: { status: 'ready', mimeType: { startsWith: 'image/' } },
    orderBy: { createdAt: 'asc' },
    take: 24,
    select: { id: true },
  });
  const mediaPool = readyImages.map((row) => row.id);
  const serviceIds = await getServiceIds();

  const industryIds = await seedIndustries(serviceIds, mediaPool);
  const clientIds = await seedClients(industryIds, mediaPool);
  const partnerIds = await seedPartners(mediaPool);
  const brandIds = await seedBrands(industryIds, mediaPool);
  const productIds = await seedProducts(industryIds, mediaPool);
  await seedTeam(mediaPool);
  const { categoryIds, tagIds } = await seedInsightTaxonomy();
  const insightIds = await seedInsights(categoryIds, tagIds, industryIds, serviceIds, mediaPool);
  const caseStudyIds = await seedCaseStudies(clientIds, industryIds, serviceIds, mediaPool);
  const testimonialIds = await seedTestimonials(clientIds, caseStudyIds, mediaPool);
  await seedCertifications(mediaPool);
  await seedTrustMetrics();
  await seedLeads(industryIds, serviceIds);
  await seedRedirects();
  await seedDemoPageSections({
    industryIds,
    caseStudyIds,
    testimonialIds,
    clientIds,
    partnerIds,
    brandIds,
    productIds,
    insightIds,
  });

  console.info(
    JSON.stringify(
      {
        event: 'demo_seed_complete',
        warning:
          'All business names, people, claims, metrics, testimonials, case studies and outcomes created by this seed are fictional demo data.',
        mediaReuse: mediaPool.length,
        counts: {
          industries: industries.length,
          clients: clients.length,
          partners: partners.length,
          brands: brands.length,
          products: products.length,
          teamMembers: team.length,
          insightCategories: insightCategories.length,
          tags: tags.length,
          insights: insights.length,
          caseStudies: caseStudies.length,
          testimonials: testimonials.length,
          certifications: certifications.length,
          trustMetrics: trustMetrics.length,
          leads: leads.length,
          homeDemoSections: 7,
          ecosystemDemoSections: 1,
        },
        note: mediaPool.length
          ? 'Existing ready image media were reused cyclically to make cards visually populated.'
          : 'No ready image media found; UI fallback artwork will be used until media is uploaded.',
      },
      null,
      2,
    ),
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
