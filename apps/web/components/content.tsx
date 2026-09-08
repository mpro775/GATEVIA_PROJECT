import Link from 'next/link';
import { Card, EmptyState } from '@gatevia/ui';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import { LeadForm } from './lead-form';

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
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">GATEVIA · SAUDI ARABIA</div>
          <h1>{text(tr.title, home ? 'GATEVIA' : '')}</h1>
          {Boolean(tr.excerpt) && <p>{text(tr.excerpt)}</p>}
          <div className="hero-actions">
            <Link className="gv-button" href={`/${locale}/book-consultation`}>
              {copy(locale).consultation}
            </Link>
            <Link className="text-link" href={`/${locale}/services`}>
              {copy(locale).services}
            </Link>
          </div>
        </div>
        <div className="portal" aria-hidden="true" />
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
  return (
    <div className="grid">
      {items.map((item) => {
        const tr = translation(item);
        return (
          <Card className="content-card" key={String(item.id)}>
            <span className="eyebrow">{resource.replace('-', ' ')}</span>
            <h3>{text(tr.title ?? tr.name)}</h3>
            <p>{text(tr.excerpt ?? tr.shortDescription)}</p>
            {tr.slug && (
              <Link
                className="content-card__link"
                href={`/${locale}/${resource}/${String(tr.slug)}`}
              >
                {t.readMore} →
              </Link>
            )}
          </Card>
        );
      })}
    </div>
  );
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

export async function SectionRenderer({ sections, locale }: { sections: unknown; locale: string }) {
  const rows = list(sections) as Record<string, unknown>[];

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
            const primary = content.primaryCta as Record<string, unknown> | undefined;
            const secondary = content.secondaryCta as Record<string, unknown> | undefined;
            return (
              <section className="hero" key={String(row.id)}>
                <div className="container hero-grid">
                  <div>
                    {Boolean(content.eyebrow) && (
                      <div className="eyebrow">{text(content.eyebrow)}</div>
                    )}
                    <h1>{text(content.title)}</h1>
                    {Boolean(content.body) && <p>{text(content.body)}</p>}
                    <div className="hero-actions">
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
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaItem.url} alt={mediaItem.translations?.[0]?.altText ?? ''} />
                    </figure>
                  ) : (
                    <div className="portal" aria-hidden="true" />
                  )}
                </div>
              </section>
            );
          }

          if (type === 'text_image') {
            const image = mediaItem?.url ? (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaItem.url} alt={mediaItem.translations?.[0]?.altText ?? ''} />
              </figure>
            ) : null;
            return (
              <section className="section section--surface" key={String(row.id)}>
                <div className="container text-image">
                  {content.mediaPosition === 'start' && image}
                  <div className="rich-text">
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

          if (type === 'process' || type === 'timeline') {
            return (
              <section className="section" key={String(row.id)}>
                <div className="container">
                  {Boolean(content.title) && <h2>{text(content.title)}</h2>}
                  <ol className={type === 'timeline' ? 'timeline' : 'process-grid'}>
                    {list(content.steps).map((rawStep, index) => {
                      const step = rawStep as Record<string, unknown>;
                      return (
                        <li key={index}>
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
                      <div className="stat" key={index}>
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
                  {Boolean(content.title || content.body) && (
                    <div className="section-header">
                      <div>
                        <span className="eyebrow">GATEVIA</span>
                        {Boolean(content.title) && <h2>{text(content.title)}</h2>}
                      </div>
                      {Boolean(content.body) && <p>{text(content.body)}</p>}
                    </div>
                  )}
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
                  {Boolean(content.title) && <h2>{text(content.title)}</h2>}
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
                        <div className="logo-card" key={String(item.id)}>
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
                  {Boolean(content.title) && <h2>{text(content.title)}</h2>}
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
                <div className="container" style={{ textAlign: 'center' }}>
                  {Boolean(content.title) && <h2>{text(content.title)}</h2>}
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
                        <details key={String(faq.id)} className="faq-item">
                          <summary>{text(ft.title ?? ft.question)}</summary>
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
              <div className="container rich-text">
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

export function RichBlocks({
  blocks,
  media = {},
}: {
  blocks: unknown;
  media?: Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;
}) {
  return (
    <>
      {list(blocks).map((raw, index) => {
        const block = raw as Record<string, unknown>;
        const type = text(block.type);
        if (type === 'heading') return <h2 key={index}>{text(block.text)}</h2>;
        if (type === 'quote')
          return (
            <blockquote key={index}>
              {text(block.text)}
              {Boolean(block.attribution) && <footer>{text(block.attribution)}</footer>}
            </blockquote>
          );
        if (type === 'list')
          return block.ordered ? (
            <ol key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ol>
          ) : (
            <ul key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ul>
          );
        if (type === 'link')
          return (
            <p key={index}>
              <Link href={text(block.href)}>{text(block.text)}</Link>
            </p>
          );
        if (type === 'image') {
          const item = media[text(block.mediaId)];
          return item?.url ? (
            <figure key={index}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.translations?.[0]?.altText ?? ''} />
            </figure>
          ) : null;
        }
        if (type === 'callout')
          return (
            <aside key={index} className="panel">
              {text(block.text)}
            </aside>
          );
        if (type === 'table')
          return (
            <div key={index} className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {list(block.headers).map((header, i) => (
                      <th key={i}>{text(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list(block.rows).map((rawRow, i) => (
                    <tr key={i}>
                      {list(rawRow).map((cell, j) => (
                        <td key={j}>{text(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        if (type === 'embed') {
          const provider = text(block.provider);
          const videoId = text(block.videoId);
          const src =
            provider === 'youtube'
              ? `https://www.youtube-nocookie.com/embed/${videoId}`
              : provider === 'vimeo'
                ? `https://player.vimeo.com/video/${videoId}`
                : '';
          return src ? (
            <iframe key={index} src={src} title="Embedded video" loading="lazy" allowFullScreen />
          ) : null;
        }
        return <p key={index}>{text(block.text)}</p>;
      })}
    </>
  );
}

export function ContentItems({ items }: { items: unknown }) {
  return (
    <ul>
      {list(items).map((raw, index) => {
        if (typeof raw === 'string') return <li key={index}>{raw}</li>;
        const item = raw as Record<string, unknown>;
        return (
          <li key={index}>
            {Boolean(item.title) && <strong>{text(item.title)} </strong>}
            {text(item.body ?? item.label ?? item.value)}
            {text(item.suffix)}
          </li>
        );
      })}
    </ul>
  );
}
