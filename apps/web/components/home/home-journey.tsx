import type { CSSProperties } from 'react';

import { list, text } from '@/lib/content';

type StageIconProps = {
  index: number;
};

function StageIcon({ index }: StageIconProps) {
  const common = {
    className: 'home-journey__icon-svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (index) {
    case 0:
      return (
        <svg {...common}>
          <path d="M9.2 17.2h5.6" />
          <path d="M10 20h4" />
          <path d="M8.3 14.2c-1.2-1-2-2.5-2-4.2A5.7 5.7 0 0 1 12 4.3a5.7 5.7 0 0 1 5.7 5.7c0 1.7-.8 3.2-2 4.2-.7.6-1 1.1-1.1 1.8H9.4c-.1-.7-.4-1.2-1.1-1.8Z" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M9.3 19V5" />
          <path d="M14.7 19v-7" />
          <path d="M20 19V3" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
          <path d="M9 4v14" />
          <path d="M15 6v14" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Z" />
          <path d="M19.2 13.7a7.7 7.7 0 0 0 .1-1.7 7.7 7.7 0 0 0-.1-1.7l2-1.5-2-3.4-2.5 1a8 8 0 0 0-3-1.7L13.4 2H9.6l-.4 2.7a8 8 0 0 0-3 1.7l-2.5-1-2 3.4 2 1.5A7.7 7.7 0 0 0 3.6 12a7.7 7.7 0 0 0 .1 1.7l-2 1.5 2 3.4 2.5-1a8 8 0 0 0 3 1.7l.4 2.7h3.8l.4-2.7a8 8 0 0 0 3-1.7l2.5 1 2-3.4-2.1-1.5Z" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.4" />
          <circle cx="16.2" cy="7.2" r="2" />
          <path d="M3.6 18.7c.4-3 2.2-4.8 4.6-4.8s4.2 1.8 4.6 4.8" />
          <path d="M13.2 14.1c.8-.7 1.8-1.1 3-1.1 2.2 0 3.8 1.7 4.2 4.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M6 16v-4" />
          <path d="M11 16V9" />
          <path d="M16 16V6" />
          <path d="m6 8 4-3 4 2 4-4" />
          <path d="M15.5 3H18v2.5" />
        </svg>
      );
  }
}

type JourneyRow = 'top' | 'bottom';

type JourneyStation = {
  node: readonly [number, number];
  cardX: string;
  row: JourneyRow;
};

const JOURNEY_VIEWBOX_WIDTH = 1200;

const RTL_ROUTE =
  'M1008 150 C850 150 760 150 600 150 C440 150 330 150 192 150 C90 150 90 270 192 270 C330 270 440 270 600 270 C760 270 850 270 1008 270';
const LTR_ROUTE =
  'M192 150 C350 150 440 150 600 150 C760 150 870 150 1008 150 C1110 150 1110 270 1008 270 C870 270 760 270 600 270 C440 270 350 270 192 270';

const RTL_STATIONS: readonly JourneyStation[] = [
  { node: [1008, 150], cardX: '84%', row: 'top' },
  { node: [600, 150], cardX: '50%', row: 'top' },
  { node: [192, 150], cardX: '16%', row: 'top' },
  { node: [192, 270], cardX: '16%', row: 'bottom' },
  { node: [600, 270], cardX: '50%', row: 'bottom' },
  { node: [1008, 270], cardX: '84%', row: 'bottom' },
] as const;

const LTR_STATIONS: readonly JourneyStation[] = RTL_STATIONS.map(({ node: [x, y], cardX, row }) => ({
  node: [JOURNEY_VIEWBOX_WIDTH - x, y] as const,
  cardX: `${100 - Number.parseFloat(cardX)}%`,
  row,
}));

const RTL_MOBILE_ROUTE =
  'M78 24 C78 80 22 84 22 138 C22 190 78 194 78 248 C78 300 22 304 22 358 C22 410 78 414 78 468 C78 520 22 524 22 600';
const LTR_MOBILE_ROUTE =
  'M22 24 C22 80 78 84 78 138 C78 190 22 194 22 248 C22 300 78 304 78 358 C78 410 22 414 22 468 C22 520 78 524 78 600';

const RTL_MOBILE_NODES = [
  [78, 24],
  [22, 138],
  [78, 248],
  [22, 358],
  [78, 468],
  [22, 600],
] as const;
const LTR_MOBILE_NODES = RTL_MOBILE_NODES.map(([x, y]) => [100 - x, y] as const);

export function HomeJourney({
  content,
  locale,
}: {
  content: Record<string, unknown>;
  locale: string;
}) {
  const steps = (list(content.steps) as Record<string, unknown>[]).slice(0, 6);
  const isArabic = locale.toLowerCase().startsWith('ar');
  const route = isArabic ? RTL_ROUTE : LTR_ROUTE;
  const stations = isArabic ? RTL_STATIONS : LTR_STATIONS;
  const mobileRoute = isArabic ? RTL_MOBILE_ROUTE : LTR_MOBILE_ROUTE;
  const mobileNodes = isArabic ? RTL_MOBILE_NODES : LTR_MOBILE_NODES;
  const arrowId = isArabic ? 'homeJourneyArrowRtl' : 'homeJourneyArrowLtr';
  const intro = text(
    content.body,
    isArabic
      ? 'رحلة عملية من 6 مراحل مترابطة تساعدك على فهم السوق، والتحقق من الفرصة، ثم الإطلاق والتشغيل والتوسع بثقة.'
      : 'A connected six-stage journey to understand the market, validate the opportunity, then launch, operate and grow with confidence.',
  );

  return (
    <section className="section home-journey" data-home-section="journey">
      <div className="home-journey__topography" aria-hidden="true" />

      <div className="container-wide home-journey__inner">
        <header className="home-journey__header">
          <div className="home-journey__heading">
            {Boolean(content.eyebrow) && (
              <span className="eyebrow home-journey__eyebrow" data-reveal="fade">
                {text(content.eyebrow)}
              </span>
            )}

            {Boolean(content.title) && (
              <h2 data-reveal="up" style={{ '--reveal-delay': '55ms' } as CSSProperties}>
                {text(content.title)}
              </h2>
            )}

            <p data-reveal="up" style={{ '--reveal-delay': '105ms' } as CSSProperties}>
              {intro}
            </p>
          </div>

          <span className="home-journey__count" data-reveal="fade">
            <span className="home-journey__count-mark" aria-hidden="true" />
            <strong>{steps.length}</strong>
            {isArabic ? 'مراحل' : 'stages'}
          </span>
        </header>

        <div
          className={`home-journey__map ${isArabic ? 'is-rtl' : 'is-ltr'}`}
          data-reveal="journey-map"
        >
          <svg
            className="home-journey__path"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={arrowId}
                markerWidth="10"
                markerHeight="10"
                refX="7"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path className="home-journey__arrow" d="M1 1 8 5 1 9" />
              </marker>
            </defs>

            <path className="home-journey__path-glow" d={route} />
            <path className="home-journey__path-guide" d={route} />
            <path
              className="home-journey__path-active"
              d={route}
              pathLength="1"
              markerEnd={`url(#${arrowId})`}
            />

            {stations.slice(0, steps.length).map(({ node: [cx, cy] }, index) => (
              <g
                className="home-journey__station"
                key={`${cx}-${cy}-${index}`}
                style={
                  {
                    '--journey-stage-delay': `${260 + index * 245}ms`,
                  } as CSSProperties
                }
              >
                <circle className="home-journey__station-halo" cx={cx} cy={cy} r="20" />
                <circle className="home-journey__station-ring" cx={cx} cy={cy} r="11" />
                <circle className="home-journey__station-core" cx={cx} cy={cy} r="3.8" />
              </g>
            ))}
          </svg>

          <svg
            className="home-journey__mobile-route"
            viewBox="0 0 100 640"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="home-journey__mobile-route-glow" d={mobileRoute} />
            <path className="home-journey__mobile-route-guide" d={mobileRoute} />
            <path
              className="home-journey__mobile-route-active"
              d={mobileRoute}
              pathLength="1"
            />
            {mobileNodes.slice(0, steps.length).map(([cx, cy], index) => (
              <g
                className="home-journey__mobile-station"
                key={`mobile-${cx}-${cy}-${index}`}
                style={
                  {
                    '--journey-stage-delay': `${260 + index * 245}ms`,
                  } as CSSProperties
                }
              >
                <circle className="home-journey__mobile-station-halo" cx={cx} cy={cy} r="4.8" />
                <circle className="home-journey__mobile-station-ring" cx={cx} cy={cy} r="2.5" />
                <circle className="home-journey__mobile-station-core" cx={cx} cy={cy} r="0.9" />
              </g>
            ))}
          </svg>

          <div className="home-journey__saudi" aria-hidden="true">
            <svg viewBox="0 0 240 190" role="presentation">
              <path d="M52 37 86 24l24 13 29-9 18 18 23 5 10 23-9 18 8 25-17 17-4 24-30 3-20 13-24-10-27 5-11-23-22-11 6-25-13-21 17-20-2-22 30-6Z" />
            </svg>
            <span className="home-journey__saudi-pin" />
            <span className="home-journey__saudi-copy">
              {isArabic ? (
                <>
                  فرص أكبر
                  <br />
                  لمستقبل أوسع
                </>
              ) : (
                <>
                  Bigger opportunities
                  <br />
                  broader horizons
                </>
              )}
            </span>
          </div>

          <ol className="home-journey__steps">
            {steps.map((step, index) => {
              const station = stations[index] ?? stations[stations.length - 1]!;

              return (
                <li
                  className={`home-journey__step home-journey__step--${station.row}`}
                  key={`${text(step.marker)}-${text(step.title)}-${index}`}
                  style={
                    {
                      '--journey-card-left': station.cardX,
                      '--journey-stage-delay': `${260 + index * 245}ms`,
                    } as CSSProperties
                  }
                >
                  <div className="home-journey__step-topline">
                    <span className="home-journey__index">
                      {text(step.marker, String(index + 1).padStart(2, '0'))}
                    </span>
                    <span className="home-journey__icon" aria-hidden="true">
                      <StageIcon index={index} />
                    </span>
                  </div>

                  <div className="home-journey__copy">
                    <h3>{text(step.title)}</h3>
                    {Boolean(step.body) && <p>{text(step.body)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="home-journey__destination" aria-hidden="true">
            <span className="home-journey__destination-flag" />
            <span>
              {isArabic ? (
                <>
                  نمو مستدام
                  <br />
                  في السوق السعودي
                </>
              ) : (
                <>
                  Sustainable growth
                  <br />
                  in Saudi Arabia
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
