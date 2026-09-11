import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;
type EcosystemKind = 'brand' | 'product';

function identityMedia(item: Record<string, unknown>, kind: EcosystemKind) {
  const media = item.media as MediaRecord | undefined;
  const ids = kind === 'brand' ? [item.coverMediaId, item.logoMediaId] : [item.logoMediaId];
  for (const id of ids) {
    if (typeof id === 'string' && media?.[id]?.url) return media[id];
  }
  return undefined;
}

function metadata(item: Record<string, unknown>, kind: EcosystemKind, locale: string) {
  const t = copy(locale);
  const relationship = text(item.relationshipType);
  const productType = text(item.productType);
  const launchStatus = text(item.launchStatus);
  return [
    relationship
      ? t.relationshipTypes[relationship as keyof typeof t.relationshipTypes]
      : undefined,
    kind === 'product' && productType
      ? t.productTypes[productType as keyof typeof t.productTypes]
      : undefined,
    kind === 'product' && launchStatus
      ? t.launchStatuses[launchStatus as keyof typeof t.launchStatuses]
      : undefined,
  ].filter(Boolean) as string[];
}

function EcosystemRow({
  item,
  kind,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  kind: EcosystemKind;
  locale: string;
  index: number;
}) {
  const tr = translation(item);
  const name = text(tr.name);
  const slug = text(tr.slug);
  const route = kind === 'brand' ? 'brands' : 'products';
  const meta = metadata(item, kind, locale);
  const content = (
    <>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <strong>{name}</strong>
      <small>{meta.join(' · ')}</small>
      {slug && <Icon name="arrow" />}
    </>
  );
  return (
    <li
      data-reveal="ecosystem-row"
      style={{ '--reveal-delay': `${Math.min(index, 6) * 55}ms` } as React.CSSProperties}
    >
      {slug ? <Link href={`/${locale}/${route}/${slug}`}>{content}</Link> : <div>{content}</div>}
    </li>
  );
}

export function HomeEcosystemAtlas({
  content,
  brands,
  products,
  locale,
  demo,
}: {
  content: Record<string, unknown>;
  brands: Record<string, unknown>[];
  products: Record<string, unknown>[];
  locale: string;
  demo: boolean;
}) {
  const t = copy(locale);
  const combined = [
    ...brands.map((item) => ({ item, kind: 'brand' as const })),
    ...products.map((item) => ({ item, kind: 'product' as const })),
  ];
  if (combined.length === 0) return null;
  const featuredIndex = Math.max(
    0,
    combined.findIndex(({ item }) => item.featured === true),
  );
  const featured = combined[featuredIndex]!;
  const featuredTr = translation(featured.item);
  const featuredName = text(featuredTr.name);
  const featuredSlug = text(featuredTr.slug);
  const featuredRoute = featured.kind === 'brand' ? 'brands' : 'products';
  const featuredMedia = identityMedia(featured.item, featured.kind);
  const featuredMeta = metadata(featured.item, featured.kind, locale);
  const visibleBrands = brands.filter((item) => item !== featured.item);
  const visibleProducts = products.filter((item) => item !== featured.item);

  return (
    <section className="section home-ecosystem">
      <div className="container-wide">
        <header className="home-section-header home-ecosystem__header">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
          <Link className="home-section-action" href={`/${locale}/ecosystem`}>
            {t.viewEcosystem}
            <Icon name="arrow" />
          </Link>
        </header>

        <article className="home-ecosystem__featured" data-reveal="ecosystem-feature">
          <div className="home-ecosystem__identity">
            {featuredMedia?.url ? (
              <Image
                src={featuredMedia.url}
                alt={featuredMedia.translations?.[0]?.altText ?? featuredName}
                fill
                sizes="(max-width: 768px) 100vw, 38vw"
              />
            ) : (
              <span aria-hidden="true">{featuredName.slice(0, 2)}</span>
            )}
          </div>
          <div className="home-ecosystem__featured-copy">
            <span className="eyebrow">{t.featuredIdentity}</span>
            <h3>{featuredName}</h3>
            {text(featuredTr.shortDescription) && <p>{text(featuredTr.shortDescription)}</p>}
            {featuredMeta.length > 0 && <small>{featuredMeta.join(' · ')}</small>}
            {featuredSlug && (
              <Link
                href={`/${locale}/${featuredRoute}/${featuredSlug}`}
                aria-label={`${t.readMore}: ${featuredName}`}
              >
                <Icon name="arrow" />
              </Link>
            )}
          </div>
        </article>

        <div className="home-ecosystem__groups">
          {visibleBrands.length > 0 && (
            <section aria-labelledby="ecosystem-brands">
              <h3 id="ecosystem-brands">{t.brands}</h3>
              <ol>
                {visibleBrands.map((item, index) => (
                  <EcosystemRow
                    key={String(item.id ?? index)}
                    item={item}
                    kind="brand"
                    locale={locale}
                    index={index}
                  />
                ))}
              </ol>
            </section>
          )}
          {visibleProducts.length > 0 && (
            <section aria-labelledby="ecosystem-products">
              <h3 id="ecosystem-products">{t.productsVentures}</h3>
              <ol>
                {visibleProducts.map((item, index) => (
                  <EcosystemRow
                    key={String(item.id ?? index)}
                    item={item}
                    kind="product"
                    locale={locale}
                    index={index}
                  />
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
