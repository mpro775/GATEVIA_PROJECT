import { list, text } from '@/lib/content';

export function HomeJourney({
  content,
  locale,
}: {
  content: Record<string, unknown>;
  locale: string;
}) {
  const steps = list(content.steps) as Record<string, unknown>[];
  const isArabic = locale.toLowerCase().startsWith('ar');

  return (
    <section className="section home-journey">
      <div className="container-wide home-journey__inner">
        <header className="home-section-header home-journey__header">
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
          </div>
          <span className="home-journey__count" data-reveal="fade">
            <strong>{String(steps.length).padStart(2, '0')}</strong>
            {isArabic ? 'مراحل' : 'stages'}
          </span>
        </header>

        <div className="home-journey__map">
          <svg
            className="home-journey__path"
            viewBox="0 0 1000 430"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-reveal="journey-path"
          >
            <path className="home-journey__path-base" d="M70 105 H930 V325 H70" />
            <path className="home-journey__path-active" d="M70 105 H930 V325 H70" pathLength="1" />
          </svg>
          <ol className="home-journey__steps">
            {steps.map((step, index) => (
              <li
                className="home-journey__step"
                key={`${text(step.marker)}-${text(step.title)}-${index}`}
                data-reveal="journey-node"
                style={{ '--reveal-delay': `${180 + index * 80}ms` } as React.CSSProperties}
              >
                <span className="home-journey__node" aria-hidden="true" />
                <span className="home-journey__index">
                  {text(step.marker, String(index + 1).padStart(2, '0'))}
                </span>
                <div className="home-journey__copy">
                  <h3>{text(step.title)}</h3>
                  {Boolean(step.body) && <p>{text(step.body)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
