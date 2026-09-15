'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import { mediaFromMap, type MediaLike } from '@/lib/media';
import { copy } from '@/lib/ui-copy';

type EcosystemKind = 'brand' | 'product';
type MediaMode = 'cover' | 'logo';
type Filter = 'all' | EcosystemKind;

function identityMedia(item: Record<string, unknown>, kind: EcosystemKind): { media: MediaLike | undefined; mode: MediaMode } {
  const tr = translation(item);
  const cover = kind === 'brand'
    ? mediaFromMap(item.media, item.coverMediaId)
    : mediaFromMap(item.media, tr.ogMediaId);
  if (cover?.url) return { media: cover, mode: 'cover' };
  const logo = mediaFromMap(item.media, item.logoMediaId);
  return { media: logo, mode: 'logo' };
}

function metadata(item: Record<string, unknown>, kind: EcosystemKind, locale: string) {
  const t = copy(locale);
  const relationship = text(item.relationshipType);
  const productType = text(item.productType);
  const launchStatus = text(item.launchStatus);
  return [
    relationship ? t.relationshipTypes[relationship as keyof typeof t.relationshipTypes] : undefined,
    kind === 'product' && productType ? t.productTypes[productType as keyof typeof t.productTypes] : undefined,
    kind === 'product' && launchStatus ? t.launchStatuses[launchStatus as keyof typeof t.launchStatuses] : undefined,
  ].filter(Boolean) as string[];
}

function EcosystemCard({ item, kind, locale, index }: { item: Record<string, unknown>; kind: EcosystemKind; locale: string; index: number }) {
  const t = copy(locale);
  const tr = translation(item);
  const name = text(tr.name);
  const description = text(tr.shortDescription ?? tr.fullDescription);
  const slug = text(tr.slug);
  const route = kind === 'brand' ? 'brands' : 'products';
  const visual = identityMedia(item, kind);
  const meta = metadata(item, kind, locale);
  const card = (
    <>
      <div className={`home-ecosystem-card__visual home-ecosystem-card__visual--${visual.mode}`}>
        {visual.media?.url ? (
          <MediaImage media={visual.media} alt={name} preset={visual.mode === 'cover' ? 'card' : 'logo'} fill sizes="(max-width: 720px) 88vw, (max-width: 1100px) 45vw, 28vw" />
        ) : (
          <span className="home-ecosystem-card__monogram" aria-hidden="true">{name.slice(0, 2)}</span>
        )}
        <span className="home-ecosystem-card__kind">{kind === 'brand' ? t.brands : t.productsVentures}</span>
      </div>
      <div className="home-ecosystem-card__copy">
        <span className="home-ecosystem-card__index">{String(index + 1).padStart(2, '0')}</span>
        <h3>{name}</h3>
        {description && <p>{description}</p>}
        {meta.length > 0 && <small>{meta.join(' · ')}</small>}
        {slug && <span className="home-ecosystem-card__arrow"><Icon name="arrow" /></span>}
      </div>
    </>
  );
  return (
    <article className="home-ecosystem-card" data-reveal="up" style={{ '--reveal-delay': `${Math.min(index, 6) * 55}ms` } as React.CSSProperties}>
      {slug ? <Link href={`/${locale}/${route}/${slug}`} aria-label={`${t.readMore}: ${name}`}>{card}</Link> : <div>{card}</div>}
    </article>
  );
}

export function HomeEcosystemAtlas({ content, brands, products, locale, demo, fullPage = false }: {
  content: Record<string, unknown>;
  brands: Record<string, unknown>[];
  products: Record<string, unknown>[];
  locale: string;
  demo: boolean;
  fullPage?: boolean;
}) {
  const t = copy(locale);
  const ecosystemHref = `/${locale}/${locale.startsWith('ar') ? 'منظومة-الأعمال' : 'ecosystem'}`;
  const [filter, setFilter] = useState<Filter>('all');
  const combined = useMemo(() => [
    ...brands.map((item) => ({ item, kind: 'brand' as const })),
    ...products.map((item) => ({ item, kind: 'product' as const })),
  ], [brands, products]);
  if (combined.length === 0) return null;

  const featured = combined.find(({ item }) => item.featured === true) ?? combined[0]!;
  const featuredTr = translation(featured.item);
  const featuredName = text(featuredTr.name);
  const featuredDescription = text(featuredTr.shortDescription ?? featuredTr.fullDescription);
  const featuredSlug = text(featuredTr.slug);
  const featuredRoute = featured.kind === 'brand' ? 'brands' : 'products';
  const featuredVisual = identityMedia(featured.item, featured.kind);
  const featuredMeta = metadata(featured.item, featured.kind, locale);

  const filtered = combined.filter((entry) => {
    if (entry.item === featured.item) return false;
    return filter === 'all' || entry.kind === filter;
  });

  return (
    <section className={`section home-ecosystem${fullPage ? ' home-ecosystem--full' : ''}`} data-home-section="ecosystem">
      <div className="container-wide">
        <header className="home-section-header home-ecosystem__header">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {Boolean(content.body) && <p>{text(content.body)}</p>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
          {!fullPage && <Link className="home-section-action" href={ecosystemHref}>{t.viewEcosystem}<Icon name="arrow" /></Link>}
        </header>

        <article className="home-ecosystem__featured" data-reveal="ecosystem-feature">
          <div className={`home-ecosystem__identity home-ecosystem__identity--${featuredVisual.mode}`}>
            {featuredVisual.media?.url ? <MediaImage media={featuredVisual.media} alt={featuredName} preset={featuredVisual.mode === 'logo' ? 'logo' : 'content'} fill sizes="(max-width: 768px) 100vw, 48vw" /> : <span aria-hidden="true">{featuredName.slice(0, 2)}</span>}
          </div>
          <div className="home-ecosystem__featured-copy">
            <span className="eyebrow">{t.featuredIdentity}</span>
            <h3>{featuredName}</h3>
            {featuredDescription && <p>{featuredDescription}</p>}
            {featuredMeta.length > 0 && <small>{featuredMeta.join(' · ')}</small>}
            {featuredSlug && <Link href={`/${locale}/${featuredRoute}/${featuredSlug}`} className="home-ecosystem__featured-link">{t.readMore}<Icon name="arrow" /></Link>}
          </div>
        </article>

        <div className="home-ecosystem__toolbar" aria-label={t.explorePortfolio}>
          <div className="home-ecosystem__tabs" role="tablist" aria-label={t.explorePortfolio}>
            {([
              ['all', t.ecosystemAll, combined.length],
              ['brand', t.ecosystemBrands, brands.length],
              ['product', t.ecosystemProducts, products.length],
            ] as const).map(([value, label, count]) => (
              <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}>
                <span>{label}</span><small>{String(count).padStart(2, '0')}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="home-ecosystem__card-grid">
          {filtered.map(({ item, kind }, index) => <EcosystemCard key={`${kind}-${String(item.id ?? index)}`} item={item} kind={kind} locale={locale} index={index} />)}
        </div>
      </div>
    </section>
  );
}
