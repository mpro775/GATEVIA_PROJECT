import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import { mediaFromMap, type MediaLike } from '@/lib/media';

type Stage = {
  key: string;
  label: string;
  motif: string;
  items: Record<string, unknown>[];
};

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

const stageCopy = {
  en: [
    { label: 'Market Access', motif: 'Gateway' },
    { label: 'Execution', motif: 'Path' },
    { label: 'Growth', motif: 'Expansion' },
  ],
  ar: [
    { label: 'دخول السوق', motif: 'البوابة' },
    { label: 'التنفيذ', motif: 'المسار' },
    { label: 'النمو', motif: 'التوسع' },
  ],
} as const;

function groupServices(items: Record<string, unknown>[], locale: string): Stage[] {
  const copy = locale.toLowerCase().startsWith('ar') ? stageCopy.ar : stageCopy.en;
  const groups = new Map<string, Record<string, unknown>[]>();

  items.forEach((item, index) => {
    const categoryId = text(item.categoryId, `group-${Math.min(Math.floor(index / 2), 2)}`);
    const group = groups.get(categoryId) ?? [];
    group.push(item);
    groups.set(categoryId, group);
  });

  return [...groups.entries()].map(([key, groupedItems], index) => ({
    key,
    label:
      copy[index]?.label ??
      (locale.toLowerCase().startsWith('ar') ? `المسار ${index + 1}` : `Stage ${index + 1}`),
    motif: copy[index]?.motif ?? '',
    items: groupedItems,
  }));
}

function StageIcon({ index }: { index: number }) {
  const icons = [
    // Market access: a global market with a clear point of entry.
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h11M12 3.5c2.1 2.35 3.2 5.2 3.2 8.5M12 20.5C9.9 18.15 8.8 15.3 8.8 12" />
      <path d="m15.5 16 2.5-2.5L20.5 16M18 13.5V20" />
    </>,
    // Execution: an actionable plan being completed.
    <>
      <path d="M9 5.5H6.5A1.5 1.5 0 0 0 5 7v12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V7a1.5 1.5 0 0 0-1.5-1.5H15" />
      <rect x="9" y="3.5" width="6" height="4" rx="1" />
      <path d="m8.5 14 2.25 2.25 4.75-5" />
    </>,
    // Growth: measurable upward business momentum.
    <>
      <path d="M4 20V8M4 20h16" />
      <path d="m7 16 4-4 3 2.5L20 8.5" />
      <path d="M16 8.5h4v4" />
    </>,
  ];

  return (
    <span className="home-services__stage-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        {icons[index] ?? icons[icons.length - 1]}
      </svg>
    </span>
  );
}

export function HomeServicesShowcase({
  content,
  items,
  locale,
}: {
  content: Record<string, unknown>;
  items: Record<string, unknown>[];
  locale: string;
}) {
  const stages = groupServices(items, locale);
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
                  <small>{stage.motif}</small>
                </div>
                <h3>{stage.label}</h3>
                <StageIcon index={stageIndex} />
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
