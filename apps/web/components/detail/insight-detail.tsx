import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { RichBlocks, editorialHeadingId } from '@/components/editorial/content-blocks';
import { list, text, translation } from '@/lib/content';
import { mediaFromMap, type MediaMap } from '@/lib/media';
import { copy } from '@/lib/ui-copy';
import { DetailBreadcrumbs, DetailCta, DetailRelated } from './detail-shared';
import { InsightActions } from './insight-actions';

function blockText(value: unknown): string {
  return list(value)
    .map((raw) => {
      if (typeof raw === 'string') return raw;
      const block = raw as Record<string, unknown>;
      return [text(block.text), ...list(block.items).map((item) => text(item))].filter(Boolean).join(' ');
    })
    .join(' ');
}

function readingMinutes(value: unknown): number {
  const words = blockText(value).trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 190));
}

function tableOfContents(value: unknown) {
  return list(value)
    .map((raw, index) => {
      const block = raw as Record<string, unknown>;
      if (text(block.type) !== 'heading') return null;
      const label = text(block.text);
      if (!label) return null;
      return { id: editorialHeadingId(block.text, index), label, level: Number(block.level) === 3 ? 3 : 2 };
    })
    .filter(Boolean) as Array<{ id: string; label: string; level: 2 | 3 }>;
}

export function InsightDetailPage({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const services = inline.services ?? [];
  const industries = inline.industries ?? [];
  const cover = mediaFromMap(entity.media, entity.coverMediaId ?? tr.ogMediaId);
  const downloadable = mediaFromMap(entity.media, entity.downloadableMediaId);
  const title = text(tr.title ?? tr.name);
  const excerpt = text(tr.excerpt ?? tr.shortDescription);
  const type = text(entity.type);
  const typeLabel = type ? t.insightTypes[type as keyof typeof t.insightTypes] : t.insights;
  const toc = tableOfContents(tr.content);
  const minutes = readingMinutes(tr.content);
  const date = entity.publishedAt
    ? new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar-SA' : 'en', { dateStyle: 'long' }).format(new Date(String(entity.publishedAt)))
    : '';
  const author = text(entity.authorName);

  return (
    <div className="insight-detail">
      <section className="detail-hero insight-detail__hero">
        <div className="container-wide insight-detail__hero-inner">
          <DetailBreadcrumbs locale={locale} items={[
            { label: t.home, href: `/${locale}` },
            { label: t.insights, href: `/${locale}/insights` },
            { label: title },
          ]} />
          <div className="insight-detail__hero-grid">
            <div className="detail-hero__copy">
              <div className="insight-detail__meta-row">
                <span className="insight-detail__type">{typeLabel}</span>
                {date && <span><Icon name="calendar" />{date}</span>}
                <span><Icon name="clock" />{minutes} {t.readTime}</span>
              </div>
              <h1>{title}</h1>
              {excerpt && <p>{excerpt}</p>}
              {author && <div className="insight-detail__author"><span>{t.by}</span><strong>{author}</strong></div>}
            </div>
            <div className="insight-detail__cover" data-reveal="media">
              {cover?.url ? (
                <MediaImage media={cover} alt={title} preset="hero" fill priority sizes="(max-width: 768px) 100vw, 48vw" />
              ) : (
                <div className="insight-detail__cover-fallback" aria-hidden="true"><span /><span /><span /></div>
              )}
              <div className="insight-detail__cover-label"><span>{typeLabel}</span><strong>GATEVIA / INSIGHTS</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section insight-detail__article-section">
        <div className="container-wide insight-detail__article-layout">
          <aside className="insight-detail__sidebar">
            <div className="insight-detail__sidebar-sticky">
              {toc.length > 0 && (
                <nav className="insight-detail__toc" aria-label={t.tableOfContents}>
                  <span className="eyebrow">{t.tableOfContents}</span>
                  <ol>
                    {toc.map((item) => <li key={item.id} data-level={item.level}><a href={`#${item.id}`}>{item.label}</a></li>)}
                  </ol>
                </nav>
              )}
              <InsightActions locale={locale} title={title} />
              {downloadable?.url && (
                <a className="insight-detail__download" href={downloadable.url} target="_blank" rel="noopener noreferrer">
                  <span>{t.downloadResource}</span><Icon name="external" />
                </a>
              )}
              {(services.length > 0 || industries.length > 0) && (
                <div className="insight-detail__related-tags">
                  {services.length > 0 && <div><span>{t.services}</span>{services.slice(0, 4).map((item) => { const itemTr = translation(item); return <Link key={String(item.id)} href={`/${locale}/services/${text(itemTr.slug)}`}>{text(itemTr.title ?? itemTr.name)}</Link>; })}</div>}
                  {industries.length > 0 && <div><span>{t.industries}</span>{industries.slice(0, 4).map((item) => { const itemTr = translation(item); return <Link key={String(item.id)} href={`/${locale}/industries/${text(itemTr.slug)}`}>{text(itemTr.name ?? itemTr.title)}</Link>; })}</div>}
                </div>
              )}
            </div>
          </aside>

          <article className="insight-detail__article rich-text">
            {tr.content ? <RichBlocks blocks={tr.content} media={(entity.media as MediaMap | undefined) ?? {}} /> : <p>{text(tr.overview ?? tr.excerpt)}</p>}
          </article>
        </div>
      </section>

      <DetailRelated items={services} locale={locale} resource="services" heading={t.services} />
      <DetailRelated items={industries} locale={locale} resource="industries" heading={t.relatedIndustries} />
      <DetailCta locale={locale} title={t.actInsights} />
    </div>
  );
}
