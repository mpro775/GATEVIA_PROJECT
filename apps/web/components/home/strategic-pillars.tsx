import { MediaImage } from '@/components/media-image';
import { list, text } from '@/lib/content';
import { mediaFromMap, type MediaMap } from '@/lib/media';

export function StrategicPillars({
  content,
  media,
}: {
  content: Record<string, unknown>;
  media?: MediaMap | undefined;
}) {
  const steps = list(content.steps) as Record<string, unknown>[];

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
            {steps.map((rawStep, index) => {
              const mediaId = typeof rawStep.mediaId === 'string' ? rawStep.mediaId : undefined;
              const item = mediaFromMap(media, mediaId);
              return (
                <li
                  className="strategic-pillar"
                  key={index}
                  data-reveal="up"
                  style={{ '--reveal-delay': `${160 + index * 80}ms` } as React.CSSProperties}
                >
                  <div className="strategic-pillar__topline">
                    <span className="strategic-pillar__index">
                      {text(rawStep.marker, String(index + 1).padStart(2, '0'))}
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
                    <h3>{text(rawStep.title)}</h3>
                    <p>{text(rawStep.body)}</p>
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
