import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@gatevia/ui';
import { ContentGrid, PageHero, SectionRenderer } from '@/components/content';
import { LeadForm } from '@/components/lead-form';
import { getDetail, getList, getPage, getLanguages, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import { buildMetadata, JsonLd, serviceSchema, caseStudySchema, articleSchema, faqSchema } from '@/lib/seo';

const listResources = new Set([
  'services', 'industries', 'case-studies', 'insights',
  'brands', 'products', 'clients', 'partners',
  'certifications', 'trust-metrics', 'testimonials', 'team', 'faqs',
]);
const detailResources = new Set([
  'services', 'industries', 'case-studies', 'insights', 'brands', 'products',
]);
const formMap: Record<string, 'contact' | 'consultation' | 'market-entry-assessment'> = {
  contact: 'contact',
  'book-consultation': 'consultation',
  'market-entry-assessment': 'market-entry-assessment',
};

async function resolve(locale: string, segments: string[]) {
  const [root, slug] = segments;
  if (root && listResources.has(root)) {
    return slug && detailResources.has(root)
      ? { kind: 'detail' as const, resource: root, data: await safe(getDetail(root, locale, slug), {}) }
      : { kind: 'list' as const, resource: root, data: await safe(getList(root, locale), []) };
  }
  const pageSlug = segments.join('/');
  return { kind: 'page' as const, resource: pageSlug, data: await safe(getPage(locale, pageSlug), {}) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; segments: string[] }>;
}): Promise<Metadata> {
  const { locale, segments } = await params;
  const [result, languages] = await Promise.all([
    resolve(locale, segments),
    safe(getLanguages(), []),
  ]);
  const entity = Array.isArray(result.data) ? {} : result.data;
  const tr = translation(entity);
  const title = text(tr.seoTitle ?? tr.title ?? tr.name, segments.at(-1)?.replaceAll('-', ' ') ?? 'GATEVIA');
  
  return buildMetadata({
    title,
    description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
    canonical: `/${locale}/${segments.join('/')}`,
    locale,
    languages,
    imageUrl: tr.seoImageUrl ? String(tr.seoImageUrl) : undefined,
    type: result.resource === 'insights' && result.kind === 'detail' ? 'article' : 'website',
    publishedAt: entity.publishedAt ? String(entity.publishedAt) : undefined,
    updatedAt: entity.updatedAt ? String(entity.updatedAt) : undefined,
    noindex: !entity.id && result.kind !== 'list',
  });
}

// ─── Resource-specific detail components ────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`section${className ? ` ${className}` : ''}`}>
      <div className="container rich-text">{children}</div>
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
        <h2 style={{ marginBlockEnd: '1.2rem' }}>{heading}</h2>
        <ContentGrid items={items} locale={locale} resource={resource} />
      </div>
    </section>
  );
}

async function ServiceDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const [relIndustries, relCases, relInsights] = await Promise.all([
    safe(getList('industries', locale, `&serviceId=${String(entity.id)}&pageSize=6`), []),
    safe(getList('case-studies', locale, `&serviceId=${String(entity.id)}&pageSize=4`), []),
    safe(getList('insights', locale, `&serviceId=${String(entity.id)}&pageSize=4`), []),
  ]);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const industries = inline.industries?.length ? inline.industries : relIndustries as Record<string, unknown>[];
  const caseStudies = inline.caseStudies?.length ? inline.caseStudies : relCases as Record<string, unknown>[];
  const insights = inline.insights?.length ? inline.insights : relInsights as Record<string, unknown>[];
  const faqs = (inline.faqs ?? []) as Record<string, unknown>[];

  return (
    <>
      {tr.overview && <Section><p>{text(tr.overview)}</p></Section>}
      {tr.whoFor && (
        <Section className="section--surface">
          <h2>Who is this for</h2>
          <p>{text(tr.whoFor as string)}</p>
        </Section>
      )}
      {tr.problems && (
        <Section>
          <h2>Problems we solve</h2>
          <p>{text(tr.problems as string)}</p>
        </Section>
      )}
      {tr.deliverables && (
        <Section className="section--surface">
          <h2>What you get</h2>
          <p>{text(tr.deliverables as string)}</p>
        </Section>
      )}
      {tr.process && (
        <Section>
          <h2>How we work</h2>
          <p>{text(tr.process as string)}</p>
        </Section>
      )}
      {tr.benefits && (
        <Section className="section--surface">
          <h2>Benefits</h2>
          <p>{text(tr.benefits as string)}</p>
        </Section>
      )}
      {tr.timeline && (
        <Section>
          <h2>Timeline</h2>
          <p>{text(tr.timeline as string)}</p>
        </Section>
      )}
      <RelatedGrid items={industries as Record<string, unknown>[]} locale={locale} resource="industries" heading="Related industries" />
      <RelatedGrid items={caseStudies as Record<string, unknown>[]} locale={locale} resource="case-studies" heading="Related case studies" />
      <RelatedGrid items={insights as Record<string, unknown>[]} locale={locale} resource="insights" heading="Related insights" />
      {faqs.length > 0 && (
        <Section>
          <h2>Frequently asked questions</h2>
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
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to enter the Saudi market?</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>{t.consultation}</Link>
        </div>
      </section>
    </>
  );
}

async function IndustryDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const [relServices, relCases, relInsights] = await Promise.all([
    safe(getList('services', locale, `&industryId=${String(entity.id)}&pageSize=6`), []),
    safe(getList('case-studies', locale, `&industryId=${String(entity.id)}&pageSize=4`), []),
    safe(getList('insights', locale, `&industryId=${String(entity.id)}&pageSize=4`), []),
  ]);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = inline.services?.length ? inline.services : relServices as Record<string, unknown>[];
  const caseStudies = inline.caseStudies?.length ? inline.caseStudies : relCases as Record<string, unknown>[];
  const insights = inline.insights?.length ? inline.insights : relInsights as Record<string, unknown>[];

  return (
    <>
      {tr.overview && <Section><p>{text(tr.overview)}</p></Section>}
      <RelatedGrid items={services as Record<string, unknown>[]} locale={locale} resource="services" heading="Our services for this industry" />
      <RelatedGrid items={caseStudies as Record<string, unknown>[]} locale={locale} resource="case-studies" heading="Case studies" />
      <RelatedGrid items={insights as Record<string, unknown>[]} locale={locale} resource="insights" heading="Industry insights" />
      <section className="section section--accent">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Interested in this market?</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>{t.consultation}</Link>
        </div>
      </section>
    </>
  );
}

async function CaseStudyDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const gallery = list((entity as { gallery?: unknown }).gallery) as Record<string, unknown>[];
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = (inline.services ?? []) as Record<string, unknown>[];
  const industries = (inline.industries ?? []) as Record<string, unknown>[];

  return (
    <>
      {tr.challenge && (
        <Section>
          <h2>The challenge</h2>
          <p>{text(tr.challenge as string)}</p>
        </Section>
      )}
      {tr.approach && (
        <Section className="section--surface">
          <h2>Our approach</h2>
          <p>{text(tr.approach as string)}</p>
        </Section>
      )}
      {tr.results && (
        <Section>
          <h2>Results</h2>
          <p>{text(tr.results as string)}</p>
        </Section>
      )}
      {gallery.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="grid">
              {gallery.map((media, i) => (
                <div key={i} className="content-card">
                  {text((media as Record<string, unknown>).url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={text((media as Record<string, unknown>).url)}
                      alt={text((media as Record<string, unknown>).alt)}
                      loading="lazy"
                      style={{ width: '100%', borderRadius: '.5rem' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <RelatedGrid items={services} locale={locale} resource="services" heading="Services involved" />
      <RelatedGrid items={industries} locale={locale} resource="industries" heading="Industries" />
      <section className="section section--accent">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Want similar results?</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>{t.consultation}</Link>
        </div>
      </section>
    </>
  );
}

async function InsightDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = (inline.services ?? []) as Record<string, unknown>[];
  const industries = (inline.industries ?? []) as Record<string, unknown>[];

  return (
    <>
      <Section>
        {entity.publishedAt && (
          <p className="cell-meta" style={{ marginBlockEnd: '1rem' }}>
            {new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(String(entity.publishedAt)))}
          </p>
        )}
        {tr.content ? (
          <div dangerouslySetInnerHTML={{ __html: String(tr.content) }} />
        ) : (
          <p>{text(tr.overview ?? tr.excerpt)}</p>
        )}
      </Section>
      <RelatedGrid items={services} locale={locale} resource="services" heading="Related services" />
      <RelatedGrid items={industries} locale={locale} resource="industries" heading="Related industries" />
      <section className="section section--accent">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to act on these insights?</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>{t.consultation}</Link>
        </div>
      </section>
    </>
  );
}

function BrandOrProductDetail({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  return (
    <>
      <Section>
        <p>{text(tr.overview ?? tr.excerpt ?? tr.shortDescription)}</p>
        {tr.description && <p>{text(tr.description as string)}</p>}
        {entity.website && (
          <p>
            <a
              href={String(entity.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Visit website →
            </a>
          </p>
        )}
      </Section>
      <section className="section section--accent">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Interested in partnering?</h2>
          <Link className="gv-button" href={`/${locale}/book-consultation`}>{t.consultation}</Link>
        </div>
      </section>
    </>
  );
}

// ─── Main page component ────────────────────────────────────────────────────

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; segments: string[] }>;
}) {
  const { locale, segments } = await params;
  const result = await resolve(locale, segments);
  const pageKey = segments.join('/');
  const t = copy(locale);

  // LIST page
  if (result.kind === 'list') {
    return (
      <>
        <section className="page-head">
          <div className="container">
            <span className="eyebrow">GATEVIA</span>
            <h1>{segments[0]!.replaceAll('-', ' ')}</h1>
          </div>
        </section>
        <section className="section">
          <div className="container">
            {segments[0] === 'insights' && (
              <div className="filter-bar">
                <input className="gv-input search-input" type="search" placeholder={t.search} />
              </div>
            )}
            <ContentGrid
              items={result.data as Record<string, unknown>[]}
              locale={locale}
              resource={result.resource}
            />
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
        <section className="page-head">
          <div className="container">
            <span className="eyebrow">GATEVIA</span>
            <h1>{pageKey.replaceAll('-', ' ')}</h1>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <LeadForm kind={formMap[pageKey]!} locale={locale} />
          </div>
        </section>
      </>
    );
  }

  if (!entity.id && !formMap[pageKey]) notFound();

  const tr = translation(entity);
  const heroTr = tr.title || tr.name ? tr : { title: pageKey.replaceAll('-', ' ') };

  return (
    <>
      <PageHero translation={heroTr} locale={locale} />

      {/* JSON-LD Schemas */}
      {result.kind === 'detail' && result.resource === 'services' && (
        <JsonLd schema={serviceSchema({
          name: text(tr.title ?? tr.name),
          description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
          url: `/${locale}/${segments.join('/')}`,
          locale,
        })} />
      )}
      {result.kind === 'detail' && result.resource === 'case-studies' && (
        <JsonLd schema={caseStudySchema({
          headline: text(tr.title ?? tr.name),
          description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
          url: `/${locale}/${segments.join('/')}`,
          publishedAt: entity.publishedAt ? String(entity.publishedAt) : undefined,
          locale,
        })} />
      )}
      {result.kind === 'detail' && result.resource === 'insights' && (
        <JsonLd schema={articleSchema({
          headline: text(tr.title ?? tr.name),
          description: text(tr.seoDescription ?? tr.excerpt ?? tr.shortDescription),
          url: `/${locale}/${segments.join('/')}`,
          publishedAt: entity.publishedAt ? String(entity.publishedAt) : new Date().toISOString(),
          updatedAt: entity.updatedAt ? String(entity.updatedAt) : undefined,
          locale,
        })} />
      )}
      {result.kind === 'list' && result.resource === 'faqs' && (
        <JsonLd schema={faqSchema((result.data as Record<string, unknown>[]).map(faq => {
          const ft = translation(faq);
          return { question: text(ft.title ?? ft.question), answer: text(ft.answer ?? ft.content) };
        }))} />
      )}
      {result.kind === 'detail' && result.resource === 'faqs' && (
        <JsonLd schema={faqSchema([{ question: text(tr.title ?? tr.question), answer: text(tr.answer ?? tr.content) }])} />
      )}

      {/* CMS page with sections */}
      {result.kind === 'page' && (
        <SectionRenderer sections={entity.sections} locale={locale} />
      )}

      {/* Form on page (contact / consultation pages that are CMS pages too) */}
      {formMap[pageKey] && (
        <section className="section">
          <div className="container">
            <LeadForm kind={formMap[pageKey]!} locale={locale} />
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
