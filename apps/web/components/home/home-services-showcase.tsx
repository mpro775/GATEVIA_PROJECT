import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';

type Stage = {
  key: string;
  label: string;
  motif: string;
  items: Record<string, unknown>[];
};

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
    label: copy[index]?.label ?? (locale.toLowerCase().startsWith('ar') ? `المسار ${index + 1}` : `Stage ${index + 1}`),
    motif: copy[index]?.motif ?? '',
    items: groupedItems,
  }));
}

function StageMotif({ index }: { index: number }) {
  return (
    <span className={`home-services__motif home-services__motif--${index + 1}`} aria-hidden="true">
      <i />
      <i />
      <i />
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
    <section className="section home-services">
      <div className="container-wide home-services__inner">
        <header className="home-section-header home-services__header">
          <div>
            {Boolean(content.eyebrow) && (
              <span className="eyebrow" data-reveal="fade">{text(content.eyebrow)}</span>
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
                <StageMotif index={stageIndex} />
              </header>
              <ol className="home-services__items">
                {stage.items.map((item, itemIndex) => {
                  const tr = translation(item);
                  const slug = text(tr.slug);
                  const href = slug ? `/${locale}/services/${slug}` : `/${locale}/services`;
                  const globalIndex = items.indexOf(item);
                  return (
                    <li key={String(item.id ?? `${stage.key}-${itemIndex}`)}>
                      <Link
                        className="home-services__item"
                        href={href}
                        data-reveal="service-row"
                        style={{ '--reveal-delay': `${250 + globalIndex * 60}ms` } as React.CSSProperties}
                      >
                        <span className="home-services__item-index">
                          {String(globalIndex + 1).padStart(2, '0')}
                        </span>
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
