import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

function caseMedia(item: Record<string, unknown>) {
  const tr = translation(item);
  const media = item.media as MediaRecord | undefined;
  for (const id of [item.heroMediaId, tr.ogMediaId]) {
    if (typeof id === 'string' && media?.[id]?.url) return media[id];
  }
  return undefined;
}

function CaseGeometry() {
  return (
    <div className="home-cases__geometry" aria-hidden="true">
      <span className="home-cases__gate" />
      <span className="home-cases__route" />
      <span className="home-cases__node home-cases__node--a" />
      <span className="home-cases__node home-cases__node--b" />
      <span className="home-cases__node home-cases__node--c" />
    </div>
  );
}

export function HomeCaseStudies({
  content,
  items,
  locale,
  demo,
}: {
  content: Record<string, unknown>;
  items: Record<string, unknown>[];
  locale: string;
  demo: boolean;
}) {
  if (items.length === 0) return null;
  const t = copy(locale);
  const featuredIndex = Math.max(
    0,
    items.findIndex((item) => item.featured === true),
  );
  const featured = items[featuredIndex]!;
  const featuredTr = translation(featured);
  const featuredTitle = text(featuredTr.title);
  const featuredSlug = text(featuredTr.slug);
  const featuredSummary = text(featuredTr.context ?? featuredTr.challenge);
  const featuredMedia = caseMedia(featured);
  const clientLabel = text(
    featuredTr.clientLabel,
    featured.anonymized === true ? t.confidentialClient : '',
  );
  const supporting = items.filter((_, index) => index !== featuredIndex);

  return (
    <section className="section home-cases" data-home-section="case-studies">
      <div className="container-wide">
        <header className="home-section-header home-cases__header">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {demo && <span className="home-demo-badge">{t.illustrative}</span>}
          </div>
          <Link className="home-section-action" href={`/${locale}/case-studies`}>
            {t.viewAllCases}
            <Icon name="arrow" />
          </Link>
        </header>

        <div className="home-cases__dossier">
          <article className="home-cases__featured" data-reveal="case-feature">
            <div className="home-cases__media">
              {featuredMedia?.url ? (
                <Image
                  src={featuredMedia.url}
                  alt={featuredMedia.translations?.[0]?.altText ?? featuredTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 62vw"
                />
              ) : (
                <CaseGeometry />
              )}
              <span className="home-cases__featured-label">{t.featuredCase}</span>
              <span className="home-cases__case-number" aria-hidden="true">
                01
              </span>
            </div>
            <div className="home-cases__featured-copy">
              {clientLabel && <span className="eyebrow">{clientLabel}</span>}
              <h3>
                {featuredSlug ? (
                  <Link href={`/${locale}/case-studies/${featuredSlug}`}>{featuredTitle}</Link>
                ) : (
                  featuredTitle
                )}
              </h3>
              {featuredSummary && <p>{featuredSummary}</p>}
              {featuredSlug && (
                <Link className="home-cases__read" href={`/${locale}/case-studies/${featuredSlug}`}>
                  {t.readMore}
                  <Icon name="arrow" />
                </Link>
              )}
            </div>
          </article>

          {supporting.length > 0 && (
            <ol className="home-cases__supporting">
              {supporting.map((item, index) => {
                const tr = translation(item);
                const title = text(tr.title);
                const slug = text(tr.slug);
                const summary = text(tr.context ?? tr.challenge);
                const row = (
                  <>
                    <span className="home-cases__row-index" aria-hidden="true">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <div>
                      {text(tr.clientLabel) && (
                        <span className="eyebrow">{text(tr.clientLabel)}</span>
                      )}
                      <h3>{title}</h3>
                      {summary && <p>{summary}</p>}
                    </div>
                    {slug && <Icon name="arrow" />}
                  </>
                );
                return (
                  <li
                    key={String(item.id ?? index)}
                    data-reveal="case-row"
                    style={
                      { '--reveal-delay': `${Math.min(index, 5) * 65}ms` } as React.CSSProperties
                    }
                  >
                    {slug ? (
                      <Link href={`/${locale}/case-studies/${slug}`}>{row}</Link>
                    ) : (
                      <article>{row}</article>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
