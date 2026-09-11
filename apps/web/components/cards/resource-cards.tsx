import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

/**
 * Resource-aware media resolver.
 * Priority order is derived from the CMS contracts in packages/contracts/src/cms.ts.
 * Root-level media IDs take precedence over translation-level ones.
 */
function mediaFor(item: Record<string, unknown>, resource?: string) {
  const tr = translation(item);
  const media = item.media as MediaRecord | undefined;

  // Build a priority list of candidate IDs based on the resource type.
  let ids: unknown[];
  switch (resource) {
    // services: heroMediaId (root), iconMediaId (root), then OG from translation
    case 'services':
      ids = [item.heroMediaId, item.iconMediaId, tr.ogMediaId];
      break;
    // industries: heroMediaId (root), then OG from translation
    case 'industries':
      ids = [item.heroMediaId, tr.ogMediaId];
      break;
    // case-studies: heroMediaId (root), then OG from translation
    case 'case-studies':
      ids = [item.heroMediaId, tr.ogMediaId];
      break;
    // insights: coverMediaId (root), then OG from translation
    case 'insights':
      ids = [item.coverMediaId, tr.ogMediaId];
      break;
    // team-members: photoMediaId (root)
    case 'team':
    case 'team-members':
      ids = [item.photoMediaId];
      break;
    // logo-primary resources: logoMediaId (root)
    case 'clients':
    case 'partners':
    case 'certifications':
    case 'testimonials':
      ids = [item.logoMediaId];
      break;
    // brands: logoMediaId (root) for identity, coverMediaId (root) for card cover
    case 'brands':
      ids = [item.coverMediaId, item.logoMediaId, tr.ogMediaId];
      break;
    // products/ventures: logoMediaId (root), then OG from translation
    case 'products':
      ids = [item.logoMediaId, tr.ogMediaId];
      break;
    default:
      // Generic fallback — maintain backward compat with previous field list
      ids = [
        item.heroMediaId,
        item.coverMediaId,
        item.imageMediaId,
        item.photoMediaId,
        item.logoMediaId,
        tr.ogMediaId,
        tr.coverMediaId,
      ];
  }

  for (const id of ids) {
    if (typeof id === 'string' && media?.[id]?.url) return media[id];
  }
  return undefined;
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
    <article className={className} data-reveal="up">{children}</article>
  );
}

function Media({ item, resource }: { item: Record<string, unknown>; resource?: string }) {
  const media = mediaFor(item, resource);
  return media?.url ? (
    <div className="resource-card__media">
      <Image
        src={media.url}
        alt={media.translations?.[0]?.altText ?? ''}
        width={900}
        height={640}
        sizes="(max-width: 700px) 100vw, 33vw"
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
        <p>{text(tr.shortDescription ?? tr.excerpt)}</p>
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
        <p>{text(tr.shortDescription ?? tr.excerpt)}</p>
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
        <p>{text(tr.role ?? tr.jobTitle ?? tr.shortDescription)}</p>
      </div>
    </article>
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
        if (resource === 'team' || resource === 'testimonials')
          return <PersonCard key={key} item={item} />;
        return <EcosystemCard key={key} item={item} locale={locale} resource={resource} />;
      })}
    </div>
  );
}
