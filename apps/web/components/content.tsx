import Link from 'next/link';
import { EmptyState, Icon } from '@gatevia/ui';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import { MediaImage } from './media-image';
import {
  mediaFromMap,
  withDefaultResourceMedia,
  type MediaMap,
  type MediaLike,
} from '@/lib/media';
import { LeadForm } from './lead-form';
import { GatewayVisual } from './brand/gateway-visual';
import { MediaFrame } from './brand/media-frame';
import { SectionHeading } from './brand/section-heading';
import { ResourceGrid } from './cards/resource-cards';
import { RichBlocks } from './editorial/content-blocks';
import { HomeHero } from './home/home-hero';
import { HomeFaq } from './home/home-faq';
import { HomeJourney } from './home/home-journey';
import { HomeServicesShowcase } from './home/home-services-showcase';
import { HomeEvidenceLedger } from './home/home-evidence-ledger';
import { HomeSectorExplorer } from './home/home-sector-explorer';
import { HomeConsultationGateway } from './home/home-consultation-gateway';
import { HomeCaseStudies } from './home/home-case-studies';
import { HomeTestimonials } from './home/home-testimonials';
import { HomeNetworkRegistry } from './home/home-network-registry';
import { HomeEcosystemAtlas } from './home/home-ecosystem-atlas';
import { HomeInsights } from './home/home-insights';
import { StrategicPillars } from './home/strategic-pillars';
export { RichBlocks, ContentItems } from './editorial/content-blocks';

// ─── Basic card grid ────────────────────────────────────────────────────────

export function PageHero({
  translation: tr,
  locale,
  home = false,
  media,
  mediaMode = 'cover',
}: {
  translation: Record<string, unknown>;
  locale: string;
  home?: boolean;
  media?: MediaLike | undefined;
  mediaMode?: 'cover' | 'contain';
}) {
  return (
    <section className={`hero ${home ? 'hero--home' : 'hero--inner'}`}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow" data-reveal="fade">
            GATEVIA · SAUDI ARABIA
          </div>
          <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>
            {text(tr.title ?? tr.name, home ? 'GATEVIA' : '')}
          </h1>
          {Boolean(tr.excerpt ?? tr.shortDescription) && (
            <p data-reveal="up" style={{ '--reveal-delay': '105ms' } as React.CSSProperties}>
              {text(tr.excerpt ?? tr.shortDescription)}
            </p>
          )}
          <div
            className="hero-actions"
            data-reveal="up"
            style={{ '--reveal-delay': '155ms' } as React.CSSProperties}
          >
            <Link className="gv-button" href={`/${locale}/book-consultation`}>
              {copy(locale).consultation}
            </Link>
            <Link className="text-link" href={`/${locale}/services`}>
              {copy(locale).services}
            </Link>
          </div>
        </div>
        {media?.url ? (
          <MediaFrame
            media={media}
            alt={text(tr.title ?? tr.name)}
            preset="hero"
            priority
            className={mediaMode === 'contain' ? 'media-frame--contain' : ''}
          />
        ) : (
          <GatewayVisual />
        )}
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
    variant === 'home'
      ? rows.find((row) => text(row.sectionType) === 'service_category_pillars')
      : undefined;
  const homeCategories = ((homePillarRow?.collections as Record<string, unknown[]> | undefined)?.[
    'service-categories'
  ] ?? []) as Record<string, unknown>[];

  return (
    <>
      {await Promise.all(
        rows.map(async (row) => {
          const tr = Array.isArray(row.translations)
            ? (row.translations[0] as { content?: Record<string, unknown> } | undefined)
            : undefined;
          const content = tr?.content ?? {};
          const type = text(row.sectionType);
          const settings = row.settings as Record<string, unknown> | undefined;
          const demo = settings?.demo === true;
          const media = row.media as MediaMap | undefined;
          const mediaItem = mediaFromMap(media, content.mediaId);

          if (type === 'hero') {
            if (variant === 'home') {
              return (
                <HomeHero
                  key={String(row.id)}
                  content={content}
                  mediaItem={mediaItem}
                  railCategories={homeCategories}
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
                      <div className="eyebrow" data-reveal="fade">
                        {text(content.eyebrow)}
                      </div>
                    )}
                    <h1
                      data-reveal="up"
                      style={{ '--reveal-delay': '55ms' } as React.CSSProperties}
                    >
                      {text(content.title)}
                    </h1>
                    {Boolean(content.body) && (
                      <p
                        data-reveal="up"
                        style={{ '--reveal-delay': '105ms' } as React.CSSProperties}
                      >
                        {text(content.body)}
                      </p>
                    )}
                    <div
                      className="hero-actions"
                      data-reveal="up"
                      style={{ '--reveal-delay': '155ms' } as React.CSSProperties}
                    >
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
                      media={mediaItem}
                      priority
                      preset="hero"
                      sizes="(max-width: 768px) calc(100vw - 2rem), 50vw"
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
              <MediaFrame media={mediaItem} preset="content" />
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

          if (type === 'service_category_pillars') {
            const categories = ((row.collections as Record<string, unknown[]> | undefined)?.[
              'service-categories'
            ] ?? []) as Record<string, unknown>[];
            return (
              <StrategicPillars
                key={String(row.id)}
                content={content}
                categories={categories}
              />
            );
          }

          if (variant === 'home' && type === 'timeline') {
            return <HomeJourney key={String(row.id)} content={content} locale={locale} />;
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
                  <ol
                    className={type === 'timeline' ? 'timeline' : 'process-grid'}
                    data-reveal="line"
                  >
                    {list(content.steps).map((rawStep, index) => {
                      const step = rawStep as Record<string, unknown>;
                      return (
                        <li
                          key={index}
                          data-reveal="up"
                          style={
                            {
                              '--reveal-delay': `${Math.min(index, 6) * 60}ms`,
                            } as React.CSSProperties
                          }
                        >
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
            if (variant === 'home') {
              return (
                <HomeEvidenceLedger
                  key={String(row.id)}
                  content={content}
                  demo={demo}
                  locale={locale}
                />
              );
            }
            return (
              <section className="section" key={String(row.id)}>
                <div className="container stats">
                  {list(content.items).map((raw, index) => {
                    const item = raw as Record<string, unknown>;
                    return (
                      <div
                        className="stat"
                        key={index}
                        data-reveal="up"
                        style={
                          {
                            '--reveal-delay': `${Math.min(index, 5) * 55}ms`,
                          } as React.CSSProperties
                        }
                      >
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

            if (variant === 'home' && type === 'services_grid') {
              const categoryIds = [
                ...new Set(items.map((item) => text(item.categoryId)).filter(Boolean)),
              ];
              const knownIds = new Set(homeCategories.map((category) => text(category.id)));
              const missingIds = categoryIds.filter((id) => !knownIds.has(id));
              const additionalCategories = missingIds.length
                ? await safe(
                    getList(
                      'service-categories',
                      locale,
                      `&ids=${encodeURIComponent(missingIds.join(','))}&pageSize=100`,
                    ) as Promise<Record<string, unknown>[]>,
                    [],
                  )
                : [];
              return (
                <HomeServicesShowcase
                  key={String(row.id)}
                  content={content}
                  items={items}
                  categories={[...homeCategories, ...additionalCategories]}
                  locale={locale}
                />
              );
            }

            if (variant === 'home' && type === 'industries_grid') {
              return (
                <HomeSectorExplorer
                  key={String(row.id)}
                  content={content}
                  items={items}
                  locale={locale}
                  demo={demo}
                />
              );
            }

            if (variant === 'home' && type === 'case_studies') {
              return (
                <HomeCaseStudies
                  key={String(row.id)}
                  content={content}
                  items={items}
                  locale={locale}
                  demo={demo}
                />
              );
            }

            if (variant === 'home' && type === 'testimonials') {
              return (
                <HomeTestimonials
                  key={String(row.id)}
                  content={content}
                  items={items}
                  locale={locale}
                  demo={demo}
                />
              );
            }

            if (variant === 'home' && type === 'insights') {
              return (
                <HomeInsights
                  key={String(row.id)}
                  content={content}
                  items={items}
                  locale={locale}
                  demo={demo}
                />
              );
            }

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
            if (variant === 'home' && type === 'logo_cloud') {
              return (
                <HomeNetworkRegistry
                  key={String(row.id)}
                  content={content}
                  clients={(collections?.clients ?? []) as Record<string, unknown>[]}
                  partners={(collections?.partners ?? []) as Record<string, unknown>[]}
                  locale={locale}
                  demo={demo}
                />
              );
            }
            if (variant === 'home' && type === 'ecosystem') {
              return (
                <HomeEcosystemAtlas
                  key={String(row.id)}
                  content={content}
                  brands={(collections?.brands ?? []) as Record<string, unknown>[]}
                  products={(collections?.products ?? []) as Record<string, unknown>[]}
                  locale={locale}
                  demo={demo}
                />
              );
            }
            const resources =
              type === 'logo_cloud' ? ['clients', 'partners'] : ['brands', 'products'];
            const entries = resources.flatMap((resource) =>
              ((collections?.[resource] ?? []) as Record<string, unknown>[]).map((item) => ({
                item,
                resource,
              })),
            );
            return (
              <section className="section section--surface" key={String(row.id)}>
                <div className="container">
                  {Boolean(content.title) && <h2 data-reveal="up">{text(content.title)}</h2>}
                  <div className="logo-cloud">
                    {entries.map(({ item, resource }) => {
                      const itemTr = translation(item);
                      const cover =
                        resource === 'brands' ? mediaFromMap(item.media, item.coverMediaId) : undefined;
                      const logo = mediaFromMap(item.media, item.logoMediaId);
                      const visual = withDefaultResourceMedia(cover ?? logo, resource);
                      const artwork = visual.isFallback || resource === 'products' || Boolean(cover);
                      return (
                        <div
                          className={`logo-card${artwork ? ' logo-card--artwork' : ''}`}
                          key={`${resource}-${String(item.id)}`}
                          data-reveal="fade"
                        >
                          {visual.media?.url && (
                            <MediaImage
                              media={visual.media}
                              alt={text(itemTr.name ?? itemTr.title)}
                              preset={artwork ? 'card' : 'logo'}
                              width={180}
                              height={artwork ? 180 : 72}
                            />
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
            if (variant === 'home') {
              return (
                <HomeConsultationGateway
                  key={String(row.id)}
                  content={content}
                  locale={locale}
                  mediaItem={mediaItem}
                />
              );
            }
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
            if (variant === 'home') {
              return <HomeFaq key={String(row.id)} content={content} faqs={faqs} locale={locale} />;
            }
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
