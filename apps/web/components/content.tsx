import Link from 'next/link';
import { EmptyState, Icon } from '@gatevia/ui';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import { LeadForm } from './lead-form';
import { GatewayVisual } from './brand/gateway-visual';
import { MediaFrame } from './brand/media-frame';
import { SectionHeading } from './brand/section-heading';
import { ResourceGrid } from './cards/resource-cards';
import { RichBlocks } from './editorial/content-blocks';
import { HomeHero } from './home/home-hero';
import { StrategicPillars } from './home/strategic-pillars';
export { RichBlocks, ContentItems } from './editorial/content-blocks';

// ─── Basic card grid ────────────────────────────────────────────────────────

export function PageHero({
  translation: tr,
  locale,
  home = false,
}: {
  translation: Record<string, unknown>;
  locale: string;
  home?: boolean;
}) {
  return (
    <section className={`hero ${home ? 'hero--home' : 'hero--inner'}`}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow" data-reveal="fade">GATEVIA · SAUDI ARABIA</div>
          <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>{text(tr.title, home ? 'GATEVIA' : '')}</h1>
          {Boolean(tr.excerpt) && <p data-reveal="up" style={{ '--reveal-delay': '105ms' } as React.CSSProperties}>{text(tr.excerpt)}</p>}
          <div className="hero-actions" data-reveal="up" style={{ '--reveal-delay': '155ms' } as React.CSSProperties}>
            <Link className="gv-button" href={`/${locale}/book-consultation`}>
              {copy(locale).consultation}
            </Link>
            <Link className="text-link" href={`/${locale}/services`}>
              {copy(locale).services}
            </Link>
          </div>
        </div>
        <GatewayVisual />
      </div>
    </section>
  );
}

export function ContentGrid({
  items,
  locale,
  resource,
}: {
  items: Record<string, unknown>[];
  locale: string;
  resource: string;
}) {
  const t = copy(locale);
  if (!items.length) return <EmptyState title={t.emptyTitle} description={t.emptyBody} />;
  return <ResourceGrid items={items} locale={locale} resource={resource} />;
}

// ─── Section-type → resource mapping ────────────────────────────────────────

const SECTION_RESOURCE_MAP: Record<string, string> = {
  services_grid: 'services',
  industries_grid: 'industries',
  case_studies: 'case-studies',
  insights: 'insights',
  testimonials: 'testimonials',
};

// ─── Async section renderer (server component) ───────────────────────────────

export type SectionRendererVariant = 'default' | 'home';

export async function SectionRenderer({
  sections,
  locale,
  variant = 'default',
}: {
  sections: unknown;
  locale: string;
  variant?: SectionRendererVariant;
}) {
  const rows = list(sections) as Record<string, unknown>[];
  const homePillarRow =
    variant === 'home' ? rows.find((row) => text(row.sectionType) === 'process') : undefined;
  const homePillarTranslation = Array.isArray(homePillarRow?.translations)
    ? (homePillarRow.translations[0] as { content?: Record<string, unknown> } | undefined)
    : undefined;
  const homePillarSteps = list(homePillarTranslation?.content?.steps) as Record<string, unknown>[];

  return (
    <>
      {await Promise.all(
        rows.map(async (row) => {
          const tr = Array.isArray(row.translations)
            ? (row.translations[0] as { content?: Record<string, unknown> } | undefined)
            : undefined;
          const content = tr?.content ?? {};
          const type = text(row.sectionType);
          const media = row.media as
            | Record<string, { url?: string; translations?: Array<{ altText?: string }> }>
            | undefined;
          const mediaItem =
            typeof content.mediaId === 'string' ? media?.[content.mediaId] : undefined;

          if (type === 'hero') {
            if (variant === 'home') {
              return (
                <HomeHero
                  key={String(row.id)}
                  content={content}
                  locale={locale}
                  mediaItem={mediaItem}
                  railSteps={homePillarSteps}
                />
              );
            }
            const primary = content.primaryCta as Record<string, unknown> | undefined;
            const secondary = content.secondaryCta as Record<string, unknown> | undefined;
            return (
              <section className="hero" key={String(row.id)}>
                <div className="container hero-grid">
                  <div className="hero-copy">
                    {Boolean(content.eyebrow) && (
                      <div className="eyebrow" data-reveal="fade">{text(content.eyebrow)}</div>
                    )}
                    <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>{text(content.title)}</h1>
                    {Boolean(content.body) && <p data-reveal="up" style={{ '--reveal-delay': '105ms' } as React.CSSProperties}>{text(content.body)}</p>}
                    <div className="hero-actions" data-reveal="up" style={{ '--reveal-delay': '155ms' } as React.CSSProperties}>
                      {Boolean(primary?.label) && Boolean(primary?.href) && (
                        <Link className="gv-button" href={text(primary?.href)}>
                          {text(primary?.label)}
                        </Link>
                      )}
                      {Boolean(secondary?.label) && Boolean(secondary?.href) && (
                        <Link className="text-link" href={text(secondary?.href)}>
                          {text(secondary?.label)}
                        </Link>
                      )}
                    </div>
                  </div>
                  {mediaItem?.url ? (
                    <MediaFrame
                      src={mediaItem.url}
                      alt={mediaItem.translations?.[0]?.altText ?? ''}
                      priority
                    />
                  ) : (
                    <GatewayVisual />
                  )}
                </div>
              </section>
            );
          }

          if (type === 'text_image') {
            const image = mediaItem?.url ? (
              <MediaFrame src={mediaItem.url} alt={mediaItem.translations?.[0]?.altText ?? ''} />
            ) : null;
            return (
              <section className="section section--surface" key={String(row.id)}>
                <div className="container text-image">
                  {content.mediaPosition === 'start' && image}
                  <div className="rich-text" data-reveal="up">
                    {Boolean(content.eyebrow) && (
                      <span className="eyebrow">{text(content.eyebrow)}</span>
                    )}
                    {Boolean(content.title) && <h2>{text(content.title)}</h2>}
                    <p>{text(content.body)}</p>
                  </div>
                  {content.mediaPosition !== 'start' && image}
                </div>
              </section>
            );
          }

          if (variant === 'home' && type === 'process') {
            return <StrategicPillars key={String(row.id)} content={content} />;
          }

          if (type === 'process' || type === 'timeline') {
            return (
              <section
                className={`section ${type === 'timeline' ? 'timeline-section' : 'process-section'}`}
                key={String(row.id)}
              >
                <div className="container">
                  <SectionHeading
                    eyebrow={text(content.eyebrow)}
                    title={text(content.title)}
                    body={text(content.body)}
                  />
                  <ol className={type === 'timeline' ? 'timeline' : 'process-grid'} data-reveal="line">
                    {list(content.steps).map((rawStep, index) => {
                      const step = rawStep as Record<string, unknown>;
                      return (
                        <li key={index} data-reveal="up" style={{ '--reveal-delay': `${Math.min(index, 6) * 60}ms` } as React.CSSProperties}>
                          <span className="eyebrow">
                            {text(step.marker, String(index + 1).padStart(2, '0'))}
                          </span>
                          <h3>{text(step.title)}</h3>
                          <p>{text(step.body)}</p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>
            );
          }

          // ── Stats section ────────────────────────────────────────────────
          if (type === 'stats') {
            return (
              <section className="section" key={String(row.id)}>
                <div className="container stats">
                  {list(content.items).map((raw, index) => {
                    const item = raw as Record<string, unknown>;
                    return (
                      <div className="stat" key={index} data-reveal="up" style={{ '--reveal-delay': `${Math.min(index, 5) * 55}ms` } as React.CSSProperties}>
                        <strong>
                          {text(item.value)}
                          {text(item.suffix)}
                        </strong>
                        <span>{text(item.label)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // ── Grid sections — fetch real collection items ────────────────
          const gridResource = SECTION_RESOURCE_MAP[type];
          if (gridResource) {
            // Items may come pre-embedded from the backend in row.collections
            const collections = row.collections as Record<string, unknown[]> | undefined;
            let items: Record<string, unknown>[] = (collections?.[gridResource] ?? []) as Record<
              string,
              unknown
            >[];

            // If backend didn't embed the items, fetch them
            if (items.length === 0) {
              items = await safe(
                getList(gridResource, locale, '&pageSize=6') as Promise<Record<string, unknown>[]>,
                [],
              );
            }

            if (items.length === 0 && !content.title) return null; // hide empty optional section

            return (
              <section className="section" key={String(row.id)}>
                <div className="container">
                  <SectionHeading
                    eyebrow={text(content.eyebrow, 'GATEVIA')}
                    title={text(content.title)}
                    body={text(content.body)}
                  />
                  {items.length > 0 && (
                    <ContentGrid items={items} locale={locale} resource={gridResource} />
                  )}
                </div>
              </section>
            );
          }

          if (type === 'logo_cloud' || type === 'ecosystem') {
            const collections = row.collections as Record<string, unknown[]> | undefined;
            const resources =
              type === 'logo_cloud' ? ['clients', 'partners'] : ['brands', 'products'];
            const items = resources.flatMap(
              (resource) => (collections?.[resource] ?? []) as Record<string, unknown>[],
            );
            return (
              <section className="section section--surface" key={String(row.id)}>
                <div className="container">
                  {Boolean(content.title) && <h2 data-reveal="up">{text(content.title)}</h2>}
                  <div className="logo-cloud">
                    {items.map((item) => {
                      const itemTr = translation(item);
                      const itemMedia = item.media as
                        | Record<
                            string,
                            { url?: string; translations?: Array<{ altText?: string }> }
                          >
                        | undefined;
                      const logoId = text(item.logoMediaId);
                      const logo = logoId ? itemMedia?.[logoId] : undefined;
                      return (
                        <div className="logo-card" key={String(item.id)} data-reveal="fade">
                          {logo?.url && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={logo.url}
                                alt={
                                  logo.translations?.[0]?.altText ??
                                  text(itemTr.name ?? itemTr.title)
                                }
                              />
                            </>
                          )}
                          <strong>{text(itemTr.name ?? itemTr.title)}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          if (type === 'form') {
            const formType =
              content.formType === 'assessment'
                ? 'market-entry-assessment'
                : content.formType === 'consultation'
                  ? 'consultation'
                  : 'contact';
            return (
              <section className="section" key={String(row.id)}>
                <div className="container">
                  {Boolean(content.title) && <h2 data-reveal="up">{text(content.title)}</h2>}
                  <LeadForm kind={formType} locale={locale} />
                </div>
              </section>
            );
          }

          // ── CTA section ──────────────────────────────────────────────────
          if (type === 'cta') {
            const primaryCta = content.primaryCta as Record<string, unknown> | undefined;
            return (
              <section className="section section--accent" key={String(row.id)}>
                <div className="container cta-panel" data-reveal="up">
                  {Boolean(content.title) && <h2 data-reveal="up">{text(content.title)}</h2>}
                  {Boolean(content.body) && <p>{text(content.body)}</p>}
                  {primaryCta && Boolean(primaryCta.label) && Boolean(primaryCta.href) && (
                    <Link className="gv-button" href={text(primaryCta.href)}>
                      {text(primaryCta.label)}
                    </Link>
                  )}
                </div>
              </section>
            );
          }

          // ── FAQ section ───────────────────────────────────────────────────
          if (type === 'faq') {
            const embedded = (row.collections as Record<string, unknown[]> | undefined)?.faqs as
              Record<string, unknown>[] | undefined;
            const faqs = embedded?.length
              ? embedded
              : await safe(
                  getList('faqs', locale, '&pageSize=10') as Promise<Record<string, unknown>[]>,
                  [],
                );
            if (faqs.length === 0) return null;
            return (
              <section className="section" key={String(row.id)}>
                <div className="container">
                  {Boolean(content.title) && <h2>{text(content.title)}</h2>}
                  <div className="faq-list">
                    {faqs.map((faq) => {
                      const ft = translation(faq);
                      return (
                        <details key={String(faq.id)} className="faq-item" data-reveal="fade">
                          <summary>
                            <span>{text(ft.title ?? ft.question)}</span>
                            <Icon name="plus" />
                          </summary>
                          <p>{text(ft.answer ?? ft.content)}</p>
                        </details>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          // ── Rich text / safe fallback section ─────────────────────────────
          return (
            <section className="section section--surface" key={String(row.id)}>
              <div className="container rich-text" data-reveal="up">
                <span className="eyebrow">GATEVIA</span>
                {Boolean(content.title) && <h2>{text(content.title)}</h2>}
                {Boolean(content.body) && <p>{text(content.body)}</p>}
                {Boolean(content.blocks) && (
                  <RichBlocks blocks={content.blocks} media={media ?? {}} />
                )}
              </div>
            </section>
          );
        }),
      )}
    </>
  );
}
