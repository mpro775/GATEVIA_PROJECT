import Link from 'next/link';
import { text, translation } from '@/lib/content';
import type { MediaLike } from '@/lib/media';
import { MediaFrame } from '../brand/media-frame';
import { HeroGatewayScene } from './hero-gateway-scene';

function DirectionCue() {
  return (
    <span className="home-hero__direction" aria-hidden="true">
      <span />
    </span>
  );
}

export function HomeHero({
  content,
  mediaItem,
  railCategories,
}: {
  content: Record<string, unknown>;
  mediaItem: MediaLike | undefined;
  railCategories: Record<string, unknown>[];
}) {
  const primary = content.primaryCta as Record<string, unknown> | undefined;
  const secondary = content.secondaryCta as Record<string, unknown> | undefined;
  const labels = [...railCategories]
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((category) => text(translation(category).name))
    .filter(Boolean);

  return (
    <section className="home-hero" data-home-section="hero">
      <div className="container-wide home-hero__canvas">
        <div className="home-hero__copy">
          {Boolean(content.eyebrow) && (
            <div className="eyebrow" data-reveal="fade">
              {text(content.eyebrow)}
            </div>
          )}
          <h1 data-reveal="up" style={{ '--reveal-delay': '50ms' } as React.CSSProperties}>
            {text(content.title)}
          </h1>
          {Boolean(content.body) && (
            <p data-reveal="up" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
              {text(content.body)}
            </p>
          )}
          {(Boolean(primary?.label) || Boolean(secondary?.label)) && (
            <div
              className="home-hero__actions"
              data-reveal="up"
              style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
            >
              {Boolean(primary?.label) && Boolean(primary?.href) && (
                <Link className="gv-button gv-button--primary gv-button--lg home-hero__primary" href={text(primary?.href)}>
                  {text(primary?.label)}
                  <DirectionCue />
                </Link>
              )}
              {Boolean(secondary?.label) && Boolean(secondary?.href) && (
                <Link className="home-hero__secondary" href={text(secondary?.href)}>
                  {text(secondary?.label)}
                  <DirectionCue />
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="home-hero__visual">
          {mediaItem?.url ? (
            <MediaFrame
              media={mediaItem}
              priority
              preset="hero"
              sizes="(max-width: 834px) calc(100vw - 2rem), 58vw"
              className="home-hero__media"
            />
          ) : (
            <HeroGatewayScene />
          )}
        </div>

        {labels.length > 0 ? (
          <ol
            className="home-gateway-rail"
            data-reveal="up"
            style={{ '--reveal-delay': '420ms' } as React.CSSProperties}
          >
            {labels.map((label, index) => (
              <li key={label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{label}</strong>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
