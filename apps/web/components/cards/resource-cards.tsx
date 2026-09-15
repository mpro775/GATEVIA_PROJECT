import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import {
  getMediaAlt,
  mediaFromMap,
  withDefaultResourceMedia,
  type MediaLike,
} from '@/lib/media';
import { copy } from '@/lib/ui-copy';

type ResourceMediaMode = 'cover' | 'logo';

interface ResourceMedia {
  media: MediaLike | undefined;
  mode: ResourceMediaMode;
  isFallback: boolean;
}

function firstMedia(item: Record<string, unknown>, ids: unknown[]): MediaLike | undefined {
  for (const id of ids) {
    const candidate = mediaFromMap(item.media, id);
    if (candidate?.url) return candidate;
  }
  return undefined;
}

/**
 * Resource-aware media resolver. Real CMS media always wins; the five GATEVIA
 * placeholder artworks are only used when the matching entity has no media.
 */
function mediaFor(item: Record<string, unknown>, resource?: string): ResourceMedia {
  const tr = translation(item);

  switch (resource) {
    case 'services':
      return {
        media: firstMedia(item, [item.effectiveHeroMediaId, item.heroMediaId, item.iconMediaId, tr.ogMediaId]),
        mode: 'cover',
        isFallback: false,
      };
    case 'industries':
      return { media: firstMedia(item, [item.heroMediaId, tr.ogMediaId]), mode: 'cover', isFallback: false };
    case 'case-studies':
      return { media: firstMedia(item, [item.heroMediaId, tr.ogMediaId]), mode: 'cover', isFallback: false };
    case 'insights':
      return { media: firstMedia(item, [item.coverMediaId, tr.ogMediaId]), mode: 'cover', isFallback: false };
    case 'team':
    case 'team-members': {
      const resolved = withDefaultResourceMedia(firstMedia(item, [item.photoMediaId]), resource);
      return { ...resolved, mode: 'cover' };
    }
    case 'clients':
    case 'partners': {
      const actual = firstMedia(item, [item.logoMediaId]);
      const resolved = withDefaultResourceMedia(actual, resource);
      return { ...resolved, mode: resolved.isFallback ? 'cover' : 'logo' };
    }
    case 'certifications':
    case 'testimonials':
      return { media: firstMedia(item, [item.logoMediaId]), mode: 'logo', isFallback: false };
    case 'brands': {
      const cover = firstMedia(item, [item.coverMediaId]);
      if (cover) return { media: cover, mode: 'cover', isFallback: false };
      const logo = firstMedia(item, [item.logoMediaId]);
      if (logo) return { media: logo, mode: 'logo', isFallback: false };
      const og = firstMedia(item, [tr.ogMediaId]);
      if (og) return { media: og, mode: 'cover', isFallback: false };
      const fallback = withDefaultResourceMedia(undefined, resource);
      return { ...fallback, mode: 'cover' };
    }
    case 'products': {
      // Product logoMediaId is the product's primary image by project convention.
      const actual = firstMedia(item, [item.logoMediaId, tr.ogMediaId]);
      const resolved = withDefaultResourceMedia(actual, resource);
      return { ...resolved, mode: 'cover' };
    }
    default:
      return {
        media: firstMedia(item, [
          item.heroMediaId,
          item.coverMediaId,
          item.imageMediaId,
          item.photoMediaId,
          item.logoMediaId,
          tr.ogMediaId,
          tr.coverMediaId,
        ]),
        mode: 'cover',
        isFallback: false,
      };
  }
}

function CardLink({
  item,
  locale,
  resource,
  children,
  className,
}: {
  item: Record<string, unknown>;
  locale: string;
  resource: string;
  children: React.ReactNode;
  className: string;
}) {
  const tr = translation(item);
  const href = tr.slug ? `/${locale}/${resource}/${String(tr.slug)}` : undefined;
  return href ? (
    <Link className={className} href={href} data-reveal="up">
      {children}
    </Link>
  ) : (
    <article className={className} data-reveal="up">
      {children}
    </article>
  );
}

function Media({ item, resource }: { item: Record<string, unknown>; resource?: string }) {
  const visual = mediaFor(item, resource);
  const tr = translation(item);
  const name = text(tr.name ?? tr.title);
  return visual.media?.url ? (
    <div
      className={`resource-card__media${visual.mode === 'logo' ? ' resource-card__media--logo' : ''}${
        visual.isFallback ? ' resource-card__media--fallback' : ''
      }`}
    >
      <MediaImage
        media={visual.media}
        alt={getMediaAlt(visual.media, name)}
        preset={visual.mode === 'logo' ? 'logo' : 'card'}
        width={900}
        height={640}
        sizes="(max-width: 700px) calc(100vw - 2rem), (max-width: 1100px) 50vw, 33vw"
      />
    </div>
  ) : (
    <div className="resource-card__media resource-card__media--gateway" aria-hidden="true">
      <span />
    </div>
  );
}

export function ServiceCard({
  item,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  locale: string;
  index: number;
}) {
  const tr = translation(item);
  return (
    <CardLink
      item={item}
      locale={locale}
      resource="services"
      className="resource-card service-card"
    >
      <Media item={item} resource="services" />
      <span className="resource-card__index">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <span className="eyebrow">{copy(locale).services}</span>
        <h3>{text(tr.title ?? tr.name)}</h3>
        <p>{text(tr.shortDescription ?? tr.overview ?? tr.context ?? tr.challenge)}</p>
      </div>
      <Icon name="arrow" className="resource-card__arrow" />
    </CardLink>
  );
}
export function IndustryCard({
  item,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  locale: string;
  index: number;
}) {
  const tr = translation(item);
  return (
    <CardLink
      item={item}
      locale={locale}
      resource="industries"
      className="resource-card industry-card"
    >
      <Media item={item} resource="industries" />
      <div className="resource-card__body">
        <span className="resource-card__index">{String(index + 1).padStart(2, '0')}</span>
        <h3>{text(tr.title ?? tr.name)}</h3>
        <p>{text(tr.shortDescription ?? tr.excerpt)}</p>
        <Icon name="arrow" />
      </div>
    </CardLink>
  );
}
export function CaseStudyCard({ item, locale }: { item: Record<string, unknown>; locale: string }) {
  const tr = translation(item);
  const metrics = Array.isArray(tr.metrics) ? tr.metrics.slice(0, 2) : [];
  return (
    <CardLink
      item={item}
      locale={locale}
      resource="case-studies"
      className="resource-card case-card"
    >
      <Media item={item} resource="case-studies" />
      <div className="resource-card__body">
        <span className="eyebrow">{copy(locale).cases}</span>
        <h3>{text(tr.title ?? tr.name)}</h3>
        <p>{text(tr.context ?? tr.challenge)}</p>
        {metrics.length > 0 && (
          <div className="case-card__metrics">
            {metrics.map((raw, i) => {
              const metric = raw as Record<string, unknown>;
              return (
                <span key={i}>
                  <strong>{text(metric.value)}</strong>
                  {text(metric.label ?? metric.body)}
                </span>
              );
            })}
          </div>
        )}
        <span className="card-action">
          {copy(locale).readMore}
          <Icon name="arrow" />
        </span>
      </div>
    </CardLink>
  );
}
export function InsightCard({ item, locale }: { item: Record<string, unknown>; locale: string }) {
  const tr = translation(item);
  const date =
    typeof item.publishedAt === 'string'
      ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(item.publishedAt))
      : '';
  return (
    <CardLink
      item={item}
      locale={locale}
      resource="insights"
      className="resource-card insight-card"
    >
      <Media item={item} resource="insights" />
      <div className="resource-card__body">
        <div className="insight-card__meta">
          <span>{text(item.type, 'Insight')}</span>
          {date && <time>{date}</time>}
        </div>
        <h3>{text(tr.title ?? tr.name)}</h3>
        <p>{text(tr.excerpt ?? tr.shortDescription)}</p>
        <span className="card-action">
          {copy(locale).readMore}
          <Icon name="arrow" />
        </span>
      </div>
    </CardLink>
  );
}
export function EcosystemCard({
  item,
  locale,
  resource,
}: {
  item: Record<string, unknown>;
  locale: string;
  resource: string;
}) {
  const tr = translation(item);
  return (
    <CardLink
      item={item}
      locale={locale}
      resource={resource}
      className="resource-card ecosystem-card"
    >
      <Media item={item} resource={resource} />
      <div className="resource-card__body">
        <span className="eyebrow">{resource.replace('-', ' ')}</span>
        <h3>{text(tr.name ?? tr.title)}</h3>
        <p>{text(tr.shortDescription ?? tr.excerpt)}</p>
        <Icon name="arrow" />
      </div>
    </CardLink>
  );
}
export function PersonCard({ item }: { item: Record<string, unknown> }) {
  const tr = translation(item);
  return (
    <article className="resource-card person-card">
      <Media item={item} resource="team" />
      <div className="resource-card__body">
        <h3>{text(tr.name ?? tr.title)}</h3>
        <p>{text(tr.position ?? tr.role ?? tr.jobTitle ?? tr.shortDescription)}</p>
      </div>
    </article>
  );
}

export function TestimonialCard({ item }: { item: Record<string, unknown> }) {
  const tr = translation(item);
  const attribution = [text(item.personRole), text(item.companyName)].filter(Boolean).join(' · ');
  return (
    <blockquote className="resource-card testimonial-card" data-reveal="up">
      <span className="testimonial-card__mark" aria-hidden="true">
        “
      </span>
      <p>{text(tr.quote)}</p>
      <footer>
        <strong>{text(item.personName)}</strong>
        {attribution && <span>{attribution}</span>}
      </footer>
    </blockquote>
  );
}

export function ResourceGrid({
  items,
  locale,
  resource,
}: {
  items: Record<string, unknown>[];
  locale: string;
  resource: string;
}) {
  const className = `resource-grid resource-grid--${resource}`;
  return (
    <div className={className}>
      {items.map((item, index) => {
        const key = String(item.id ?? index);
        if (resource === 'services')
          return <ServiceCard key={key} item={item} locale={locale} index={index} />;
        if (resource === 'industries')
          return <IndustryCard key={key} item={item} locale={locale} index={index} />;
        if (resource === 'case-studies')
          return <CaseStudyCard key={key} item={item} locale={locale} />;
        if (resource === 'insights') return <InsightCard key={key} item={item} locale={locale} />;
        if (resource === 'team') return <PersonCard key={key} item={item} />;
        if (resource === 'testimonials') return <TestimonialCard key={key} item={item} />;
        return <EcosystemCard key={key} item={item} locale={locale} resource={resource} />;
      })}
    </div>
  );
}
