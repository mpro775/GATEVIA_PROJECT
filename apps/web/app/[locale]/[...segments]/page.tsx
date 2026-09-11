import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ContentRecord } from '@gatevia/api-client';
import { Icon } from '@gatevia/ui';
import {
  ContentGrid,
  ContentItems,
  PageHero,
  RichBlocks,
  SectionRenderer,
} from '@/components/content';
import { LeadForm } from '@/components/lead-form';
import {
  getDetail,
  getList,
  getPage,
  getLanguages,
  getSettings,
  isNotFoundError,
  safe,
} from '@/lib/api';
import { list, localizedSetting, resolvedMediaUrl, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import {
  breadcrumbSchema,
  buildMetadata,
  JsonLd,
  serviceSchema,
  caseStudySchema,
  articleSchema,
  faqSchema,
} from '@/lib/seo';

const listResources = new Set([
  'services',
  'industries',
  'case-studies',
  'insights',
  'brands',
  'products',
  'clients',
  'partners',
  'certifications',
  'trust-metrics',
  'testimonials',
  'team',
  'faqs',
]);
const detailResources = new Set([
  'services',
  'industries',
  'case-studies',
  'insights',
  'brands',
  'products',
]);
const formMap: Record<string, 'contact' | 'consultation' | 'market-entry-assessment'> = {
  contact: 'contact',
  'book-consultation': 'consultation',
  'market-entry-assessment': 'market-entry-assessment',
};

async function resolve(locale: string, segments: string[], q?: string, preview?: string) {
  const [root, slug] = segments;
  if (root && listResources.has(root)) {
    if (slug && detailResources.has(root)) {
      try {
        const data = await getDetail(root, locale, slug, preview);
        return {
          kind: 'detail' as const,
          resource: root,
          data,
        };
      } catch (error) {
        if (isNotFoundError(error)) {
          notFound();
        }
        throw error;
      }
    }
    return {
      kind: 'list' as const,
      resource: root,
      data: await safe(getList(root, locale, q ? `&q=${encodeURIComponent(q)}` : ''), []),
    };
  }
  const pageSlug = segments.join('/');
  if (formMap[pageSlug]) {
    return {
      kind: 'page' as const,
      resource: pageSlug,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      data: (await safe(getPage(locale, pageSlug, preview), {})) as ContentRecord,
    };
  }
  try {
    const data = await getPage(locale, pageSlug, preview);
    return {
      kind: 'page' as const,
      resource: pageSlug,
      data,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; segments: string[] }>;
}): Promise<Metadata> {
  const { locale, segments } = await params;
  const [result, languages, settings] = await Promise.all([
    resolve(locale, segments),
    safe(getLanguages(), []),
    safe(getSettings(locale), { values: {}, media: {} }),
  ]);
  const entity = Array.isArray(result.data) ? {} : result.data;
  const tr = translation(entity);
  const title = text(
    tr.seoTitle ?? tr.title ?? tr.name,
    segments.at(-1)?.replaceAll('-', ' ') ?? 'GATEVIA',
  );
  const defaultOgId = settings.values['seo.default_og_media_id'];
  const imageUrl =
    resolvedMediaUrl(entity, tr.ogMediaId) ??
    (typeof defaultOgId === 'string' ? settings.media[defaultOgId]?.url : undefined);
  const siteName = localizedSetting(settings.values, 'company.name', locale, 'GATEVIA');

  return buildMetadata({
    title,
    description: text(
      tr.seoDescription ?? tr.excerpt ?? tr.shortDescription,
      localizedSetting(settings.values, 'seo.default_description', locale),
    ),
    canonical: text(tr.canonicalUrl, `/${locale}/${segments.join('/')}`),
    locale,
    languages,
    localizedAlternates: entity.alternates as Record<string, string> | undefined,
    imageUrl,
    siteName,
    type: result.resource === 'insights' && result.kind === 'detail' ? 'article' : 'website',
    publishedAt: typeof entity.publishedAt === 'string' ? entity.publishedAt : undefined,
    updatedAt: typeof entity.updatedAt === 'string' ? entity.updatedAt : undefined,
    noindex: tr.robotsIndex === false || (!entity.id && result.kind !== 'list'),
  });
}

// ─── Resource-specific detail components ────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`section${className ? ` ${className}` : ''}`}>
      <div className="container rich-text" data-reveal="up">{children}</div>
    </section>
  );
}

function RelatedGrid({
  items,
  locale,
  resource,
  heading,
}: {
  items: Record<string, unknown>[];
  locale: string;
  resource: string;
  heading: string;
}) {
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading" data-reveal="up">
          <div>
            <span className="eyebrow">GATEVIA</span>
            <h2>{heading}</h2>
          </div>
        </div>
        <ContentGrid items={items} locale={locale} resource={resource} />
      </div>
    </section>
  );
}

async function ServiceDetail({
  entity,
  locale,
}: {
  entity: Record<string, unknown>;
  locale: string;
}) {
  const tr = translation(entity);
  const t = copy(locale);
  const [relIndustries, relCases, relInsights] = await Promise.all([
    safe(getList('industries', locale, `&service=${String(entity.id)}&pageSize=6`), []),
    safe(getList('case-studies', locale, `&service=${String(entity.id)}&pageSize=4`), []),
    safe(getList('insights', locale, `&service=${String(entity.id)}&pageSize=4`), []),
  ]);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const industries = inline.industries?.length
    ? inline.industries
    : (relIndustries as Record<string, unknown>[]);
  const caseStudies = inline.caseStudies?.length
    ? inline.caseStudies
    : (relCases as Record<string, unknown>[]);
  const insights = inline.insights?.length
    ? inline.insights
    : (relInsights as Record<string, unknown>[]);
  const faqs = inline.faqs ?? [];

  return (
    <>
      {tr.overview && (
        <Section>
          <p>{text(tr.overview)}</p>
        </Section>
      )}
      {tr.whoFor && (
        <Section className="section--surface">
          <h2>{t.whoFor}</h2>
          <ContentItems items={tr.whoFor} />
        </Section>
      )}
      {tr.problems && (
        <Section>
          <h2>{t.problems}</h2>
          <ContentItems items={tr.problems} />
        </Section>
      )}
      {tr.deliverables && (
        <Section className="section--surface">
          <h2>{t.deliverables}</h2>
          <ContentItems items={tr.deliverables} />
        </Section>
      )}
      {tr.process && (
        <Section>
          <h2>{t.process}</h2>
          <ContentItems items={tr.process} />
        </Section>
      )}
      {tr.benefits && (
        <Section className="section--surface">
          <h2>{t.benefits}</h2>
          <ContentItems items={tr.benefits} />
        </Section>
      )}
      {tr.timelineText && (
        <Section>
          <h2>{t.timeline}</h2>
          <p>{text(tr.timelineText)}</p>
        </Section>
      )}
      <RelatedGrid
        items={industries}
        locale={locale}
        resource="industries"
        heading={t.relatedIndustries}
      />
      <RelatedGrid
        items={caseStudies}
        locale={locale}
        resource="case-studies"
        heading={t.relatedCases}
      />
      <RelatedGrid
        items={insights}
        locale={locale}
        resource="insights"
        heading={t.relatedInsights}
      />
      {faqs.length > 0 && (
        <Section>
          <h2>{t.faqs}</h2>
          <div className="faq-list">
            {faqs.map((faq) => {
              const ft = translation(faq);
              return (
                <details key={String(faq.id)} className="faq-item">
                  <summary>{text(ft.title ?? ft.question)}</summary>
                  <p>{text(ft.answer ?? ft.content)}</p>
                </details>
              );
            })}
          </div>
        </Section>
      )}
      <section className="section section--accent">
        <div className="container cta-panel" data-reveal="up">
          <h2>{t.readyMarket}</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
        </div>
      </section>
    </>
  );
}

async function IndustryDetail({
  entity,
  locale,
}: {
  entity: Record<string, unknown>;
  locale: string;
}) {
  const tr = translation(entity);
  const t = copy(locale);
  const [relServices, relCases, relInsights] = await Promise.all([
    safe(getList('services', locale, `&industry=${String(entity.id)}&pageSize=6`), []),
    safe(getList('case-studies', locale, `&industry=${String(entity.id)}&pageSize=4`), []),
    safe(getList('insights', locale, `&industry=${String(entity.id)}&pageSize=4`), []),
  ]);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = inline.services?.length
    ? inline.services
    : (relServices as Record<string, unknown>[]);
  const caseStudies = inline.caseStudies?.length
    ? inline.caseStudies
    : (relCases as Record<string, unknown>[]);
  const insights = inline.insights?.length
    ? inline.insights
    : (relInsights as Record<string, unknown>[]);

  return (
    <>
      {tr.overview && (
        <Section>
          <p>{text(tr.overview)}</p>
        </Section>
      )}
      <RelatedGrid
        items={services}
        locale={locale}
        resource="services"
        heading={t.industryServices}
      />
      <RelatedGrid items={caseStudies} locale={locale} resource="case-studies" heading={t.cases} />
      <RelatedGrid
        items={insights}
        locale={locale}
        resource="insights"
        heading={t.industryInsights}
      />
      <section className="section section--accent">
        <div className="container cta-panel" data-reveal="up">
          <h2>{t.interestedMarket}</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
        </div>
      </section>
    </>
  );
}

function CaseStudyDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const gallery = list((entity as { gallery?: unknown }).gallery) as Record<string, unknown>[];
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = inline.services ?? [];
  const industries = inline.industries ?? [];

  return (
    <>
      {tr.context && (
        <Section>
          <h2>{t.context}</h2>
          <p>{text(tr.context)}</p>
        </Section>
      )}
      {tr.challenge && (
        <Section>
          <h2>{t.challenge}</h2>
          <p>{text(tr.challenge)}</p>
        </Section>
      )}
      {tr.objectives && (
        <Section className="section--surface">
          <h2>{t.objectives}</h2>
          <ContentItems items={tr.objectives} />
        </Section>
      )}
      {tr.solution && (
        <Section className="section--surface">
          <h2>{t.solution}</h2>
          <p>{text(tr.solution)}</p>
        </Section>
      )}
      {tr.process && (
        <Section>
          <h2>{t.process}</h2>
          <ContentItems items={tr.process} />
        </Section>
      )}
      {tr.results && (
        <Section>
          <h2>{t.results}</h2>
          <ContentItems items={tr.results} />
        </Section>
      )}
      {tr.metrics && (
        <Section className="section--surface">
          <h2>{t.metrics}</h2>
          <ContentItems items={tr.metrics} />
        </Section>
      )}
      {gallery.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="grid">
              {gallery.map((media, i) => (
                <div key={i} className="content-card">
                  {text(media.url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={text(media.url)}
                      alt={text(media.alt)}
                      loading="lazy"
                      className="gallery-image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <RelatedGrid
        items={services}
        locale={locale}
        resource="services"
        heading={t.servicesInvolved}
      />
      <RelatedGrid
        items={industries}
        locale={locale}
        resource="industries"
        heading={t.industries}
      />
      <section className="section section--accent">
        <div className="container cta-panel" data-reveal="up">
          <h2>{t.similarResults}</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
        </div>
      </section>
    </>
  );
}

function InsightDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = inline.services ?? [];
  const industries = inline.industries ?? [];

  return (
    <>
      <Section>
        {Boolean(entity.publishedAt) && (
          <p className="cell-meta">
            {new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(
              new Date(String(entity.publishedAt)),
            )}
          </p>
        )}
        {tr.content ? (
          <RichBlocks
            blocks={tr.content}
            media={
              (entity.media as
                | Record<string, { url?: string; translations?: Array<{ altText?: string }> }>
                | undefined) ?? {}
            }
          />
        ) : (
          <p>{text(tr.overview ?? tr.excerpt)}</p>
        )}
      </Section>
      <RelatedGrid items={services} locale={locale} resource="services" heading={t.services} />
      <RelatedGrid
        items={industries}
        locale={locale}
        resource="industries"
        heading={t.relatedIndustries}
      />
      <section className="section section--accent">
        <div className="container cta-panel" data-reveal="up">
          <h2>{t.actInsights}</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
        </div>
      </section>
    </>
  );
}

function BrandOrProductDetail({
  entity,
  locale,
}: {
  entity: Record<string, unknown>;
  locale: string;
}) {
  const tr = translation(entity);
  const t = copy(locale);
  return (
    <>
      <Section>
        <p>{text(tr.overview ?? tr.excerpt ?? tr.shortDescription)}</p>
        {Boolean(tr.fullDescription) && <p>{text(tr.fullDescription)}</p>}
        {Boolean(entity.website) && (
          <p>
            <a
              href={String(entity.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              {t.visitWebsite} <Icon name="external" />
            </a>
          </p>
        )}
      </Section>
      <section className="section section--accent">
        <div className="container cta-panel" data-reveal="up">
          <h2>{t.interestedPartnering}</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
        </div>
      </section>
    </>
  );
}

// ─── Main page component ────────────────────────────────────────────────────

export default async function DynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; segments: string[] }>;
  searchParams: Promise<{ q?: string; preview?: string }>;
}) {
  const { locale, segments } = await params;
  const { q = '', preview } = await searchParams;
  const result = await resolve(locale, segments, q.trim(), preview);
  const pageKey = segments.join('/');
  const t = copy(locale);

  // LIST page
  if (result.kind === 'list') {
    const faqJsonLd =
      result.resource === 'faqs'
        ? faqSchema(
            (result.data as Record<string, unknown>[]).map((faq) => {
              const ft = translation(faq);
              return {
                question: text(ft.title ?? ft.question),
                answer: text(ft.answer ?? ft.content),
              };
            }),
          )
        : null;
    return (
      <>
        {faqJsonLd && <JsonLd schema={faqJsonLd} />}
        <section className={`page-head page-head--${result.resource}`}>
          <div className="container page-head__content">
            <span className="eyebrow" data-reveal="fade">GATEVIA</span>
            <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>
              {(
                {
                  services: t.services,
                  industries: t.industries,
                  'case-studies': t.cases,
                  insights: t.insights,
                  team: locale.startsWith('ar') ? 'الفريق' : 'Team',
                  partners: locale.startsWith('ar') ? 'الشركاء' : 'Partners',
                  clients: locale.startsWith('ar') ? 'العملاء' : 'Clients',
                  brands: locale.startsWith('ar') ? 'العلامات' : 'Brands',
                  products: locale.startsWith('ar') ? 'المنتجات والمشاريع' : 'Products & Ventures',
                  faqs: t.faqs,
                  testimonials: locale.startsWith('ar') ? 'الشهادات' : 'Testimonials',
                } as Record<string, string>
              )[result.resource] ?? segments[0]!.replaceAll('-', ' ')}
            </h1>
          </div>
        </section>
        <section className="section">
          <div className="container" data-reveal="fade">
            {segments[0] === 'insights' && (
              <form className="filter-bar" method="get">
                <input
                  className="gv-input search-input"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder={t.search}
                />
                <button className="gv-button" type="submit">
                  {t.searchAction}
                </button>
              </form>
            )}
            <ContentGrid items={result.data} locale={locale} resource={result.resource} />
          </div>
        </section>
      </>
    );
  }

  const entity = result.data as Record<string, unknown>;

  // Form-only pages
  if (formMap[pageKey]) {
    return (
      <>
        <section className="page-head page-head--form">
          <div className="container page-head__content">
            <span className="eyebrow" data-reveal="fade">GATEVIA</span>
            <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>
              {pageKey === 'contact'
                ? locale.startsWith('ar')
                  ? 'تواصل معنا'
                  : 'Contact us'
                : pageKey === 'book-consultation'
                  ? t.consultation
                  : locale.startsWith('ar')
                    ? 'تقييم دخول السوق'
                    : 'Market entry assessment'}
            </h1>
          </div>
        </section>
        <section className="section conversion-section">
          <div className="container-narrow" data-reveal="up">
            <LeadForm kind={formMap[pageKey]} locale={locale} />
          </div>
        </section>
      </>
    );
  }

  if (!entity.id && !formMap[pageKey]) notFound();

  const tr = translation(entity);
  const heroTr = tr.title || tr.name ? tr : { title: pageKey.replaceAll('-', ' ') };
  const imageUrl = resolvedMediaUrl(entity, tr.ogMediaId);
  const hasSectionHero =
    result.kind === 'page' &&
    Array.isArray(entity.sections) &&
    entity.sections.some((section) => (section as Record<string, unknown>).sectionType === 'hero');

  return (
    <>
      {!hasSectionHero && <PageHero translation={heroTr} locale={locale} />}

      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: `/${locale}` },
          ...segments.map((segment, index) => ({
            name:
              index === segments.length - 1
                ? text(tr.title ?? tr.name, segment.replaceAll('-', ' '))
                : segment.replaceAll('-', ' '),
            url: `/${locale}/${segments.slice(0, index + 1).join('/')}`,
          })),
        ])}
      />

      {/* JSON-LD Schemas */}
      {result.kind === 'detail' && result.resource === 'services' && (
        <JsonLd
          schema={serviceSchema({
            name: text(tr.title ?? tr.name),
            description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
            url: `/${locale}/${segments.join('/')}`,
            locale,
          })}
        />
      )}
      {result.kind === 'detail' && result.resource === 'case-studies' && (
        <JsonLd
          schema={caseStudySchema({
            headline: text(tr.title ?? tr.name),
            description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
            url: `/${locale}/${segments.join('/')}`,
            imageUrl,
            publishedAt: typeof entity.publishedAt === 'string' ? entity.publishedAt : undefined,
            locale,
          })}
        />
      )}
      {result.kind === 'detail' && result.resource === 'insights' && (
        <JsonLd
          schema={articleSchema({
            headline: text(tr.title ?? tr.name),
            description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
            url: `/${locale}/${segments.join('/')}`,
            imageUrl,
            publishedAt:
              typeof entity.publishedAt === 'string'
                ? entity.publishedAt
                : new Date().toISOString(),
            updatedAt: typeof entity.updatedAt === 'string' ? entity.updatedAt : undefined,
            locale,
          })}
        />
      )}
      {result.kind === 'detail' && result.resource === 'faqs' && (
        <JsonLd
          schema={faqSchema([
            { question: text(tr.title ?? tr.question), answer: text(tr.answer ?? tr.content) },
          ])}
        />
      )}

      {/* CMS page with sections */}
      {result.kind === 'page' && <SectionRenderer sections={entity.sections} locale={locale} />}

      {/* Form on page (contact / consultation pages that are CMS pages too) */}
      {formMap[pageKey] && (
        <section className="section">
          <div className="container">
            <LeadForm kind={formMap[pageKey]} locale={locale} />
          </div>
        </section>
      )}

      {/* Resource detail templates */}
      {result.kind === 'detail' && result.resource === 'services' && (
        <ServiceDetail entity={entity} locale={locale} />
      )}
      {result.kind === 'detail' && result.resource === 'industries' && (
        <IndustryDetail entity={entity} locale={locale} />
      )}
      {result.kind === 'detail' && result.resource === 'case-studies' && (
        <CaseStudyDetail entity={entity} locale={locale} />
      )}
      {result.kind === 'detail' && result.resource === 'insights' && (
        <InsightDetail entity={entity} locale={locale} />
      )}
      {result.kind === 'detail' &&
        (result.resource === 'brands' || result.resource === 'products') && (
          <BrandOrProductDetail entity={entity} locale={locale} />
        )}
    </>
  );
}
