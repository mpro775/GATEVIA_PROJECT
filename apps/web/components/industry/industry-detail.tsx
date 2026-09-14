import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { ContentGrid, ContentItems } from '@/components/content';
import { MediaImage } from '@/components/media-image';
import { list, text, translation } from '@/lib/content';
import { mediaFromMap, type MediaLike } from '@/lib/media';
import { copy } from '@/lib/ui-copy';

function firstMedia(item: Record<string, unknown>, ids: unknown[]): MediaLike | undefined {
  for (const id of ids) {
    const media = mediaFromMap(item.media, id);
    if (media?.url) return media;
  }
  return undefined;
}

function serviceMedia(item: Record<string, unknown>): MediaLike | undefined {
  const tr = translation(item);
  return firstMedia(item, [
    item.effectiveHeroMediaId,
    item.heroMediaId,
    item.iconMediaId,
    tr.ogMediaId,
  ]);
}

function IndustryServiceCard({
  item,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  locale: string;
  index: number;
}) {
  const tr = translation(item);
  const t = copy(locale);
  const media = serviceMedia(item);
  const slug = text(tr.slug);
  const description = text(tr.shortDescription ?? tr.overview ?? tr.excerpt);
  const href = slug ? `/${locale}/services/${slug}` : `/${locale}/services`;

  return (
    <Link className="industry-service-card" href={href} data-reveal="up">
      <div
        className={`industry-service-card__visual${media?.url ? ' industry-service-card__visual--media' : ''}`}
      >
        {media?.url ? (
          <MediaImage
            media={media}
            alt={text(tr.title ?? tr.name)}
            preset="card"
            fill
            sizes="(max-width: 768px) calc(100vw - 2rem), (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span className="industry-service-card__gateway" aria-hidden="true">
            <i />
            <i />
          </span>
        )}
        <span className="industry-service-card__index">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="industry-service-card__body">
        <span className="eyebrow">{t.serviceLabel}</span>
        <h3>{text(tr.title ?? tr.name)}</h3>
        {description && <p>{description}</p>}
        <span className="industry-service-card__action">
          {t.exploreService}
          <Icon name="arrow" />
        </span>
      </div>
    </Link>
  );
}

export function IndustryDetailHero({
  entity,
  locale,
}: {
  entity: Record<string, unknown>;
  locale: string;
}) {
  const tr = translation(entity);
  const t = copy(locale);
  const heroMedia = firstMedia(entity, [entity.heroMediaId, tr.ogMediaId]);
  const title = text(tr.name ?? tr.title);
  const summary = text(tr.shortDescription ?? tr.excerpt ?? tr.overview);

  return (
    <section className="industry-detail-hero">
      <div className="container-wide industry-detail-hero__grid">
        <div className="industry-detail-hero__copy">
          <div className="industry-detail-hero__kicker" data-reveal="fade">
            <span>GATEVIA</span>
            <i aria-hidden="true" />
            <span>{t.industries}</span>
          </div>
          <h1 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>
            {title}
          </h1>
          {summary && (
            <p data-reveal="up" style={{ '--reveal-delay': '105ms' } as React.CSSProperties}>
              {summary}
            </p>
          )}
          <div
            className="industry-detail-hero__actions"
            data-reveal="up"
            style={{ '--reveal-delay': '155ms' } as React.CSSProperties}
          >
            <Link
              className="gv-button gv-button--primary gv-button--lg"
              href={`/${locale}/book-consultation`}
            >
              {text(tr.ctaLabel, t.consultation)}
            </Link>
            <Link className="gv-button gv-button--secondary gv-button--lg" href="#industry-services">
              {t.exploreIndustryServices}
              <Icon name="arrow" />
            </Link>
          </div>
        </div>

        <div className="industry-detail-hero__visual" data-reveal="media">
          {heroMedia?.url ? (
            <MediaImage
              media={heroMedia}
              alt={title}
              preset="hero"
              fill
              priority
              sizes="(max-width: 834px) calc(100vw - 2rem), 52vw"
            />
          ) : (
            <div className="industry-detail-hero__fallback" aria-hidden="true">
              <span />
              <span />
            </div>
          )}
          <div className="industry-detail-hero__shade" aria-hidden="true" />
          <div className="industry-detail-hero__frame" aria-hidden="true" />
          <div className="industry-detail-hero__caption">
            <span>{t.saudiMarketFocus}</span>
            <strong>{title}</strong>
          </div>
        </div>
      </div>
      <div className="industry-detail-hero__rail" aria-hidden="true" />
    </section>
  );
}

function IndustryRelatedSection({
  items,
  locale,
  resource,
  heading,
  eyebrow,
  surface = false,
}: {
  items: Record<string, unknown>[];
  locale: string;
  resource: string;
  heading: string;
  eyebrow: string;
  surface?: boolean;
}) {
  if (!items.length) return null;

  return (
    <section className={`section industry-related${surface ? ' industry-related--surface' : ''}`}>
      <div className="container-wide">
        <div className="industry-section-heading" data-reveal="up">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{heading}</h2>
          </div>
        </div>
        <ContentGrid items={items} locale={locale} resource={resource} />
      </div>
    </section>
  );
}

export function IndustryDetailContent({
  entity,
  locale,
  services,
  caseStudies,
  insights,
}: {
  entity: Record<string, unknown>;
  locale: string;
  services: Record<string, unknown>[];
  caseStudies: Record<string, unknown>[];
  insights: Record<string, unknown>[];
}) {
  const tr = translation(entity);
  const t = copy(locale);
  const challenges = list(tr.challenges);
  const opportunities = list(tr.opportunities);
  const serviceCount = Math.min(Math.max(services.length, 1), 6);

  return (
    <>
      {tr.overview && (
        <section className="section industry-overview">
          <div className="container industry-overview__grid">
            <div className="industry-overview__heading" data-reveal="up">
              <span className="eyebrow">{t.market}</span>
              <h2>{t.industryOverview}</h2>
            </div>
            <div className="industry-overview__copy" data-reveal="up">
              <p>{text(tr.overview)}</p>
              <span className="industry-overview__line" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}

      {(challenges.length > 0 || opportunities.length > 0) && (
        <section className="section industry-signals">
          <div className="container-wide industry-signals__grid">
            {challenges.length > 0 && (
              <article className="industry-signal-card industry-signal-card--challenges" data-reveal="up">
                <header>
                  <span className="industry-signal-card__number">01</span>
                  <div>
                    <span className="eyebrow">{t.industryMarketLens}</span>
                    <h2>{t.industryChallenges}</h2>
                  </div>
                </header>
                <ContentItems items={challenges} />
              </article>
            )}
            {opportunities.length > 0 && (
              <article className="industry-signal-card industry-signal-card--opportunities" data-reveal="up">
                <header>
                  <span className="industry-signal-card__number">02</span>
                  <div>
                    <span className="eyebrow">{t.saudiMarketFocus}</span>
                    <h2>{t.industryOpportunities}</h2>
                  </div>
                </header>
                <ContentItems items={opportunities} />
              </article>
            )}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section id="industry-services" className="section industry-services-section">
          <div className="container-wide">
            <div className="industry-section-heading industry-section-heading--split" data-reveal="up">
              <div>
                <span className="eyebrow">{t.services}</span>
                <h2>{t.industryServices}</h2>
              </div>
              <p>{t.industryServicesLead}</p>
            </div>

            <div className={`industry-service-grid industry-service-grid--count-${serviceCount}`}>
              {services.map((service, index) => (
                <IndustryServiceCard
                  key={String(service.id ?? index)}
                  item={service}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <IndustryRelatedSection
        items={caseStudies}
        locale={locale}
        resource="case-studies"
        eyebrow={t.cases}
        heading={t.relatedCases}
        surface
      />

      <IndustryRelatedSection
        items={insights}
        locale={locale}
        resource="insights"
        eyebrow={t.insights}
        heading={t.industryInsights}
      />

      <section className="section industry-detail-cta">
        <div className="container-wide">
          <div className="industry-detail-cta__panel" data-reveal="up">
            <div className="industry-detail-cta__copy">
              <span className="eyebrow">{t.industryCtaEyebrow}</span>
              <h2>{t.interestedMarket}</h2>
              <p>{t.industryCtaBody}</p>
            </div>
            <div className="industry-detail-cta__actions">
              <Link
                className="gv-button gv-button--primary gv-button--lg"
                href={`/${locale}/book-consultation`}
              >
                {text(tr.ctaLabel, t.consultation)}
              </Link>
              <Link className="gv-button gv-button--secondary gv-button--lg" href={`/${locale}/contact`}>
                {t.contact}
              </Link>
            </div>
            <span className="industry-detail-cta__mark" aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
