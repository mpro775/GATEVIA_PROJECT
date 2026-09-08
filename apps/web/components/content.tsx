import Link from 'next/link';
import { Card, EmptyState } from '@gatevia/ui';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

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
          {tr.excerpt && <p>{text(tr.excerpt)}</p>}
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
              <Link className="content-card__link" href={`/${locale}/${resource}/${String(tr.slug)}`}>
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

export async function SectionRenderer({
  sections,
  locale,
}: {
  sections: unknown;
  locale: string;
}) {
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

          // Hero is rendered by the parent template, skip here.
          if (type === 'hero') return null;

          // ── Stats section ────────────────────────────────────────────────
          if (type === 'stats') {
            return (
              <section className="section" key={String(row.id)}>
                <div className="container stats">
                  {list(content.items).map((raw, index) => {
                    const item = raw as Record<string, unknown>;
                    return (
                      <div className="stat" key={index}>
                        <strong>{text(item.value)}{text(item.suffix)}</strong>
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
            let items: Record<string, unknown>[] =
              (collections?.[gridResource] ?? []) as Record<string, unknown>[];

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
                  {(content.title || content.body) && (
                    <div className="section-header">
                      <div>
                        <span className="eyebrow">GATEVIA</span>
                        {content.title && <h2>{text(content.title)}</h2>}
                      </div>
                      {content.body && <p>{text(content.body)}</p>}
                    </div>
                  )}
                  {items.length > 0 && (
                    <ContentGrid items={items} locale={locale} resource={gridResource} />
                  )}
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
                  {content.title && <h2>{text(content.title)}</h2>}
                  {content.body && <p>{text(content.body)}</p>}
                  {primaryCta?.label && primaryCta.href && (
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
            const embedded = (row.collections as Record<string, unknown[]> | undefined)?.faqs as Record<string, unknown>[] | undefined;
            const faqs = embedded?.length ? embedded : await safe(getList('faqs', locale, '&pageSize=10') as Promise<Record<string, unknown>[]>, []);
            if (faqs.length === 0) return null;
            return (
              <section className="section" key={String(row.id)}>
                <div className="container">
                  {content.title && <h2>{text(content.title)}</h2>}
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

          // ── Generic rich-text / default section ───────────────────────────
          return (
            <section className="section section--surface" key={String(row.id)}>
              <div className="container rich-text">
                <span className="eyebrow">GATEVIA</span>
                {content.title && <h2>{text(content.title)}</h2>}
                {content.body && <p>{text(content.body)}</p>}
                {content.blocks && <RichBlocks blocks={content.blocks} />}
              </div>
            </section>
          );
        }),
      )}
    </>
  );
}

export function RichBlocks({ blocks, media = {} }: { blocks: unknown; media?: Record<string, { url?: string; translations?: Array<{ altText?: string }> }> }) {
  return (
    <>
      {list(blocks).map((raw, index) => {
        const block = raw as Record<string, unknown>;
        const type = text(block.type);
        if (type === 'heading') return <h2 key={index}>{text(block.text)}</h2>;
        if (type === 'quote') return <blockquote key={index}>{text(block.text)}{block.attribution && <footer>{text(block.attribution)}</footer>}</blockquote>;
        if (type === 'list')
          return block.ordered ? (
            <ol key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ol>
          ) : <ul key={index}>{list(block.items).map((item, i) => <li key={i}>{text(item)}</li>)}</ul>;
        if (type === 'link') return <p key={index}><Link href={text(block.href)}>{text(block.text)}</Link></p>;
        if (type === 'image') {
          const item = media[text(block.mediaId)];
          return item?.url ? <figure key={index}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.url} alt={item.translations?.[0]?.altText ?? ''} /></figure> : null;
        }
        if (type === 'callout') return <aside key={index} className="panel">{text(block.text)}</aside>;
        if (type === 'table') return <div key={index} className="table-wrap"><table><thead><tr>{list(block.headers).map((header, i) => <th key={i}>{text(header)}</th>)}</tr></thead><tbody>{list(block.rows).map((rawRow, i) => <tr key={i}>{list(rawRow).map((cell, j) => <td key={j}>{text(cell)}</td>)}</tr>)}</tbody></table></div>;
        if (type === 'embed') {
          const provider = text(block.provider);
          const videoId = text(block.videoId);
          const src = provider === 'youtube' ? `https://www.youtube-nocookie.com/embed/${videoId}` : provider === 'vimeo' ? `https://player.vimeo.com/video/${videoId}` : '';
          return src ? <iframe key={index} src={src} title="Embedded video" loading="lazy" allowFullScreen /> : null;
        }
        return <p key={index}>{text(block.text)}</p>;
      })}
    </>
  );
}

export function ContentItems({ items }: { items: unknown }) {
  return <ul>{list(items).map((raw, index) => {
    if (typeof raw === 'string') return <li key={index}>{raw}</li>;
    const item = raw as Record<string, unknown>;
    return <li key={index}>{item.title && <strong>{text(item.title)} </strong>}{text(item.body ?? item.label ?? item.value)}{text(item.suffix)}</li>;
  })}</ul>;
}
