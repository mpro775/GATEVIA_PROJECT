import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { mediaFromMap } from '@/lib/media';
import { copy } from '@/lib/ui-copy';
import { DetailBreadcrumbs, DetailCta, DetailRelated } from './detail-shared';

type Item = { title: string; body: string };

function items(value: unknown): Item[] {
  return list(value)
    .map((raw) => {
      if (typeof raw === 'string') return { title: '', body: raw };
      const row = raw as Record<string, unknown>;
      return {
        title: text(row.title ?? row.label),
        body: text(row.body ?? row.value ?? row.text),
      };
    })
    .filter((item) => item.title || item.body);
}

function CardList({ value, ordered = false }: { value: unknown; ordered?: boolean }) {
  const rows = items(value);
  if (!rows.length) return null;
  return (
    <div className={`service-detail__card-list${ordered ? ' service-detail__card-list--ordered' : ''}`}>
      {rows.map((item, index) => (
        <article key={`${item.title}-${index}`} className="service-detail__item" data-reveal="up" style={{ '--reveal-delay': `${Math.min(index, 6) * 45}ms` } as React.CSSProperties}>
          <span className="service-detail__item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          {item.title && <h3>{item.title}</h3>}
          {item.body && <p>{item.body}</p>}
        </article>
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <header className="detail-section-heading" data-reveal="up">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </header>
  );
}

export async function ServiceDetailPage({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const tr = translation(entity);
  const t = copy(locale);
  const [relIndustries, relCases, relInsights] = await Promise.all([
    safe(getList('industries', locale, `&service=${String(entity.id)}&pageSize=6`), []),
    safe(getList('case-studies', locale, `&service=${String(entity.id)}&pageSize=4`), []),
    safe(getList('insights', locale, `&service=${String(entity.id)}&pageSize=4`), []),
  ]);
  const inline = entity as Record<string, Record<string, unknown>[]>;
  const industries = inline.industries?.length ? inline.industries : relIndustries as Record<string, unknown>[];
  const caseStudies = inline.caseStudies?.length ? inline.caseStudies : relCases as Record<string, unknown>[];
  const insights = inline.insights?.length ? inline.insights : relInsights as Record<string, unknown>[];
  const faqs = inline.faqs ?? [];
  const heroMedia = mediaFromMap(entity.media, entity.effectiveHeroMediaId ?? entity.heroMediaId);
  const title = text(tr.title ?? tr.name);
  const lead = text(tr.shortDescription ?? tr.excerpt ?? tr.overview);
  const overview = text(tr.overview);
  const sectionLinks = [
    overview ? { id: 'service-overview', label: t.overview } : null,
    tr.whoFor || tr.problems ? { id: 'service-fit', label: t.whoFor } : null,
    tr.deliverables ? { id: 'service-deliverables', label: t.deliverables } : null,
    tr.process ? { id: 'service-process', label: t.process } : null,
    tr.benefits ? { id: 'service-outcomes', label: t.outcomes } : null,
    faqs.length ? { id: 'service-faq', label: t.faqs } : null,
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <div className="service-detail">
      <section className="detail-hero detail-hero--service">
        <div className="container-wide detail-hero__grid">
          <div className="detail-hero__copy">
            <DetailBreadcrumbs locale={locale} items={[
              { label: t.home, href: `/${locale}` },
              { label: t.services, href: `/${locale}/services` },
              { label: title },
            ]} />
            <span className="detail-hero__kicker"><i aria-hidden="true" />{t.serviceLabel}</span>
            <h1>{title}</h1>
            {lead && <p>{lead}</p>}
            <div className="detail-hero__actions">
              <Link className="gv-button gv-button--primary gv-button--lg" href={`/${locale}/book-consultation`}>{t.consultation}<Icon name="arrow" /></Link>
              <Link className="text-link" href={`/${locale}/services`}>{t.services}<Icon name="arrow" /></Link>
            </div>
          </div>
          <div className="detail-hero__media" data-reveal="media">
            {heroMedia?.url ? (
              <MediaImage media={heroMedia} alt={title} preset="hero" fill priority sizes="(max-width: 768px) 100vw, 48vw" />
            ) : (
              <div className="detail-hero__fallback" aria-hidden="true"><span /><span /><span /></div>
            )}
            <div className="detail-hero__frame" aria-hidden="true" />
            <div className="detail-hero__media-label"><span>GATEVIA</span><strong>SAUDI ARABIA</strong></div>
          </div>
        </div>
      </section>

      {sectionLinks.length > 1 && (
        <nav className="detail-section-nav" aria-label={locale.startsWith('ar') ? 'أقسام الخدمة' : 'Service sections'}>
          <div className="container-wide">
            {sectionLinks.map((item, index) => <a key={item.id} href={`#${item.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</a>)}
          </div>
        </nav>
      )}

      {overview && (
        <section id="service-overview" className="section service-detail__overview">
          <div className="container-wide service-detail__overview-grid">
            <SectionHeading eyebrow={t.serviceOverview} title={t.saudiMarketFocus} />
            <div className="service-detail__overview-copy" data-reveal="up"><p>{overview}</p></div>
            {text(tr.timelineText) && (
              <aside className="service-detail__timeline-note" data-reveal="up">
                <Icon name="clock" /><span>{t.timeline}</span><strong>{text(tr.timelineText)}</strong>
              </aside>
            )}
          </div>
        </section>
      )}

      {!!(tr.whoFor || tr.problems) && (
        <section id="service-fit" className="section service-detail__fit">
          <div className="container-wide">
            <SectionHeading eyebrow="01" title={locale.startsWith('ar') ? 'هل هذه الخدمة مناسبة لك؟' : 'Is this the right service for you?'} />
            <div className="service-detail__bento">
              {!!tr.whoFor && <article className="service-detail__bento-panel service-detail__bento-panel--accent"><span className="eyebrow">{t.whoFor}</span><CardList value={tr.whoFor} /></article>}
              {!!tr.problems && <article className="service-detail__bento-panel"><span className="eyebrow">{t.problems}</span><CardList value={tr.problems} /></article>}
            </div>
          </div>
        </section>
      )}

      {!!tr.deliverables && (
        <section id="service-deliverables" className="section service-detail__deliverables">
          <div className="container-wide">
            <SectionHeading eyebrow="02" title={t.deliverables} body={locale.startsWith('ar') ? 'مخرجات واضحة وقابلة للاستخدام تساعد فريقك على اتخاذ القرار والتحرك.' : 'Clear, usable outputs designed to help your team decide and move.'} />
            <CardList value={tr.deliverables} />
          </div>
        </section>
      )}

      {!!tr.process && (
        <section id="service-process" className="section service-detail__process">
          <div className="container-wide">
            <SectionHeading eyebrow="03" title={t.process} body={locale.startsWith('ar') ? 'مسار عمل مترابط يحافظ على وضوح القرار والمسؤوليات من البداية إلى التسليم.' : 'A connected workflow that keeps decisions and ownership visible from start to delivery.'} />
            <div className="service-detail__process-track"><CardList value={tr.process} ordered /></div>
          </div>
        </section>
      )}

      {!!tr.benefits && (
        <section id="service-outcomes" className="section service-detail__outcomes">
          <div className="container-wide">
            <SectionHeading eyebrow="04" title={t.outcomes} />
            <CardList value={tr.benefits} />
          </div>
        </section>
      )}

      <DetailRelated items={caseStudies} locale={locale} resource="case-studies" heading={t.relatedCases} />
      <DetailRelated items={industries} locale={locale} resource="industries" heading={t.relatedIndustries} />
      <DetailRelated items={insights} locale={locale} resource="insights" heading={t.relatedInsights} />

      {faqs.length > 0 && (
        <section id="service-faq" className="section service-detail__faq">
          <div className="container-wide service-detail__faq-grid">
            <SectionHeading eyebrow="05" title={t.faqs} />
            <div className="faq-list">
              {faqs.map((faq) => {
                const ft = translation(faq);
                return <details key={String(faq.id)} className="faq-item" data-reveal="fade"><summary><span>{text(ft.title ?? ft.question)}</span><Icon name="plus" /></summary><p>{text(ft.answer ?? ft.content)}</p></details>;
              })}
            </div>
          </div>
        </section>
      )}

      <DetailCta locale={locale} title={t.readyMarket} body={locale.startsWith('ar') ? 'شاركنا ما الذي تحاول تحقيقه وسنساعدك على تحديد نقطة البداية والمسار الأنسب.' : 'Tell us what you are trying to achieve and we will help identify the right starting point and workstream.'} />
    </div>
  );
}
