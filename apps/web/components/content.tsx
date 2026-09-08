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
  case_studies_grid: 'case-studies',
  insights_grid: 'insights',
  testimonials: 'testimonials',
  trust_logos: 'clients',
  partners_grid: 'partners',
  brands_grid: 'brands',
  team_grid: 'team-members',
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
            const embeddedKey = gridResource.replace('-', '_'); // e.g. case-studies -> case_studies
            let items: Record<string, unknown>[] =
              (collections?.[embeddedKey] ?? collections?.[gridResource] ?? []) as Record<string, unknown>[];

            // If backend didn't embed the items, fetch them
            if (items.length === 0) {
              items = await safe(
                getList(gridResource, locale, '&status=published&pageSize=6') as Promise<Record<string, unknown>[]>,
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
            return (
              <section className="section section--accent" key={String(row.id)}>
                <div className="container" style={{ textAlign: 'center' }}>
                  {content.title && <h2>{text(content.title)}</h2>}
                  {content.body && <p>{text(content.body)}</p>}
                  {content.ctaLabel && content.ctaUrl && (
                    <Link className="gv-button" href={text(content.ctaUrl)}>
                      {text(content.ctaLabel)}
                    </Link>
                  )}
                </div>
              </section>
            );
          }

          // ── FAQ section ───────────────────────────────────────────────────
          if (type === 'faq') {
            const faqs = await safe(
              getList('faqs', locale, '&status=published&pageSize=10') as Promise<Record<string, unknown>[]>,
              [],
            );
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

function RichBlocks({ blocks }: { blocks: unknown }) {
  return (
    <>
      {list(blocks).map((raw, index) => {
        const block = raw as Record<string, unknown>;
        const type = text(block.type);
        if (type === 'heading') return <h2 key={index}>{text(block.text)}</h2>;
        if (type === 'quote') return <blockquote key={index}>{text(block.text)}</blockquote>;
        if (type === 'list')
          return (
            <ul key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ul>
          );
        return <p key={index}>{text(block.text)}</p>;
      })}
    </>
  );
}
