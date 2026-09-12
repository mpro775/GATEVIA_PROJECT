import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import { mediaFromMap, type MediaLike } from '@/lib/media';
import { groupServicesByCategory } from './home-services-grouping';

type ServiceMedia = {
  item: MediaLike;
  mode: 'cover' | 'contain';
};

function mediaForService(item: Record<string, unknown>): ServiceMedia | undefined {
  const tr = translation(item);
  const media = item.media;
  const candidates: Array<{ id: unknown; mode: ServiceMedia['mode'] }> = [
    { id: item.heroMediaId, mode: 'cover' },
    { id: item.iconMediaId, mode: 'contain' },
    { id: tr.ogMediaId, mode: 'cover' },
  ];
  for (const candidate of candidates) {
    const resolved = mediaFromMap(media, candidate.id);
    if (resolved?.url) {
      return { item: resolved, mode: candidate.mode };
    }
  }
  return undefined;
}

function StageIcon({ category }: { category: Record<string, unknown> }) {
  const icon = mediaFromMap(category.media, category.iconMediaId);
  return (
    <span className="home-services__stage-icon" aria-hidden="true">
      {icon?.url ? <MediaImage media={icon} preset="logo" fill sizes="3rem" /> : <Icon name="plus" />}
    </span>
  );
}

export function HomeServicesShowcase({
  content,
  items,
  categories,
  locale,
}: {
  content: Record<string, unknown>;
  items: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  locale: string;
}) {
  const stages = groupServicesByCategory(items, categories);
  const isArabic = locale.toLowerCase().startsWith('ar');

  return (
    <section className="section home-services" data-home-section="services">
      <div className="container-wide home-services__inner">
        <header className="home-section-header home-services__header">
          <div>
            {Boolean(content.eyebrow) && (
              <span className="eyebrow" data-reveal="fade">
                {text(content.eyebrow)}
              </span>
            )}
            {Boolean(content.title) && (
              <h2 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>
                {text(content.title)}
              </h2>
            )}
            {Boolean(content.body) && (
              <p data-reveal="up" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
                {text(content.body)}
              </p>
            )}
          </div>
          <Link className="home-section-action" href={`/${locale}/services`} data-reveal="fade">
            {isArabic ? 'عرض جميع الخدمات' : 'View all services'}
            <Icon name="arrow" />
          </Link>
        </header>

        <ol className="home-services__stages">
          {stages.map((stage, stageIndex) => (
            <li
              className="home-services__stage"
              key={stage.key}
              data-reveal="up"
              style={{ '--reveal-delay': `${130 + stageIndex * 80}ms` } as React.CSSProperties}
            >
              <header className="home-services__stage-header">
                <div className="home-services__stage-meta">
                  <span>{String(stageIndex + 1).padStart(2, '0')}</span>
                  <small>GTV / {String(stageIndex + 1).padStart(2, '0')}</small>
                </div>
                <h3>{stage.label}</h3>
                <StageIcon category={stage.category} />
              </header>
              <ol className="home-services__items">
                {stage.items.map((item, itemIndex) => {
                  const tr = translation(item);
                  const slug = text(tr.slug);
                  const href = slug ? `/${locale}/services/${slug}` : `/${locale}/services`;
                  const globalIndex = items.indexOf(item);
                  const serviceMedia = mediaForService(item);
                  return (
                    <li key={String(item.id ?? `${stage.key}-${itemIndex}`)}>
                      <Link
                        className={`home-services__item${serviceMedia?.item.url ? ' home-services__item--with-media' : ''}`}
                        href={href}
                        data-reveal="service-row"
                        style={
                          { '--reveal-delay': `${250 + globalIndex * 60}ms` } as React.CSSProperties
                        }
                      >
                        <span className="home-services__item-index">
                          {String(globalIndex + 1).padStart(2, '0')}
                        </span>
                        {serviceMedia?.item.url ? (
                          <span
                            className={`home-services__item-media home-services__item-media--${serviceMedia.mode}`}
                          >
                            <MediaImage
                              media={serviceMedia.item}
                              preset={serviceMedia.mode === 'contain' ? 'logo' : 'thumbnail'}
                              fill
                              sizes="(max-width: 834px) 6rem, 7rem"
                            />
                          </span>
                        ) : null}
                        <span className="home-services__item-copy">
                          <strong>{text(tr.title ?? tr.name)}</strong>
                          {Boolean(tr.shortDescription ?? tr.excerpt) && (
                            <span>{text(tr.shortDescription ?? tr.excerpt)}</span>
                          )}
                        </span>
                        <Icon name="arrow" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
