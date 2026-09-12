import { list, text } from '@/lib/content';
import { PillarVisual } from './pillar-visual';

export function StrategicPillars({ content }: { content: Record<string, unknown> }) {
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
          <div
            className="strategic-pillars__connector"
            aria-hidden="true"
            data-reveal="line"
          />
          <ol className="strategic-pillars__grid">
            {steps.map((rawStep, index) => (
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
                <PillarVisual index={index} />
                <div className="strategic-pillar__copy">
                  <h3>{text(rawStep.title)}</h3>
                  <p>{text(rawStep.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
