import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

function insightMedia(item: Record<string, unknown>) {
  const tr = translation(item);
  const media = item.media as MediaRecord | undefined;
  for (const id of [item.coverMediaId, tr.ogMediaId]) {
    if (typeof id === 'string' && media?.[id]?.url) return media[id];
  }
  return undefined;
}

function insightType(item: Record<string, unknown>, locale: string) {
  const t = copy(locale);
  const type = text(item.type);
  return t.insightTypes[type as keyof typeof t.insightTypes] ?? t.insights;
}

function insightDate(item: Record<string, unknown>, locale: string) {
  if (typeof item.publishedAt !== 'string') return null;
  const date = new Date(item.publishedAt);
  if (Number.isNaN(date.valueOf())) return null;
  return {
    iso: item.publishedAt,
    label: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date),
  };
}

function EditorialFallback() {
  return (
    <div className="home-insights__fallback" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function HomeInsights({
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
  const featuredSlug = text(featuredTr.slug);
  const featuredTitle = text(featuredTr.title);
  const featuredDate = insightDate(featured, locale);
  const media = insightMedia(featured);
  const secondary = items.filter((_, index) => index !== featuredIndex);

  return (
    <section className="section home-insights">
      <div className="container-wide">
        <header className="home-section-header home-insights__header">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
          <Link className="home-section-action" href={`/${locale}/insights`}>
            {t.viewAllInsights}
            <Icon name="arrow" />
          </Link>
        </header>

        <div className="home-insights__desk">
          <article className="home-insights__featured" data-reveal="insight-feature">
            <Link
              href={featuredSlug ? `/${locale}/insights/${featuredSlug}` : `/${locale}/insights`}
            >
              <div className="home-insights__cover">
                {media?.url ? (
                  <Image
                    src={media.url}
                    alt={media.translations?.[0]?.altText ?? featuredTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 62vw"
                  />
                ) : (
                  <EditorialFallback />
                )}
                <span>{t.featuredStory}</span>
              </div>
              <div className="home-insights__featured-copy">
                <div className="home-insights__meta">
                  <span>{insightType(featured, locale)}</span>
                  {featuredDate && <time dateTime={featuredDate.iso}>{featuredDate.label}</time>}
                </div>
                <h3>{featuredTitle}</h3>
                {text(featuredTr.excerpt) && <p>{text(featuredTr.excerpt)}</p>}
                <Icon name="arrow" />
              </div>
            </Link>
          </article>

          {secondary.length > 0 && (
            <div className="home-insights__stories">
              {secondary.map((item, index) => {
                const tr = translation(item);
                const slug = text(tr.slug);
                const title = text(tr.title);
                const date = insightDate(item, locale);
                return (
                  <article
                    key={String(item.id ?? index)}
                    data-reveal="insight-row"
                    style={
                      { '--reveal-delay': `${Math.min(index, 7) * 55}ms` } as React.CSSProperties
                    }
                  >
                    <Link href={slug ? `/${locale}/insights/${slug}` : `/${locale}/insights`}>
                      <span className="home-insights__story-index" aria-hidden="true">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="home-insights__meta">
                          <span>{insightType(item, locale)}</span>
                          {date && <time dateTime={date.iso}>{date.label}</time>}
                        </div>
                        <h3>{title}</h3>
                      </div>
                      <Icon name="arrow" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
