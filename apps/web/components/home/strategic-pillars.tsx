import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import { mediaFromMap } from '@/lib/media';

export function StrategicPillars({
  content,
  categories,
}: {
  content: Record<string, unknown>;
  categories: Record<string, unknown>[];
}) {
  const orderedCategories = [...categories].sort(
    (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
  );

  return (
    <section className="section strategic-pillars" data-home-section="pillars">
      <div className="container-wide strategic-pillars__inner">
        <header className="strategic-pillars__header">
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
        </header>

        <div className="strategic-pillars__composition">
          <div className="strategic-pillars__connector" aria-hidden="true" data-reveal="line" />
          <ol className="strategic-pillars__grid">
            {orderedCategories.map((category, index) => {
              const tr = translation(category);
              const item = mediaFromMap(category.media, category.coverMediaId);
              return (
                <li
                  className="strategic-pillar"
                  key={String(category.id ?? index)}
                  data-reveal="up"
                  style={{ '--reveal-delay': `${160 + index * 80}ms` } as React.CSSProperties}
                >
                  <div className="strategic-pillar__topline">
                    <span className="strategic-pillar__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="strategic-pillar__coordinate" aria-hidden="true">
                      GTV / {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {item?.url ? (
                    <div className="strategic-pillar__media" data-reveal="media">
                      <MediaImage
                        media={item}
                        preset="card"
                        fill
                        sizes="(max-width: 834px) calc(100vw - 5rem), 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="strategic-pillar__copy">
                    <h3>{text(tr.name)}</h3>
                    <p>{text(tr.description)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
