import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { HomeEcosystemAtlas } from '@/components/home/home-ecosystem-atlas';
import { getList, safe } from '@/lib/api';
import { list, text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';
import { DetailBreadcrumbs, DetailCta } from './detail-shared';

function heroContent(entity: Record<string, unknown>): Record<string, unknown> {
  const sections = list(entity.sections) as Record<string, unknown>[];
  const hero = sections.find((section) => text(section.sectionType) === 'hero');
  const translations = hero?.translations;
  if (Array.isArray(translations)) {
    const first = translations[0] as { content?: Record<string, unknown> } | undefined;
    if (first?.content) return first.content;
  }
  return {};
}

export async function EcosystemPage({ entity, locale }: { entity: Record<string, unknown>; locale: string }) {
  const t = copy(locale);
  const tr = translation(entity);
  const hero = heroContent(entity);
  const [brands, products] = await Promise.all([
    safe(getList('brands', locale, '&pageSize=100'), []),
    safe(getList('products', locale, '&pageSize=100'), []),
  ]);
  const title = text(hero.title ?? tr.title, t.viewEcosystem);
  const body = text(hero.body ?? tr.excerpt);
  const eyebrow = text(hero.eyebrow, t.viewEcosystem);
  const total = brands.length + products.length;

  return (
    <div className="ecosystem-page">
      <section className="detail-hero ecosystem-page__hero">
        <div className="container-wide ecosystem-page__hero-grid">
          <div className="detail-hero__copy">
            <DetailBreadcrumbs locale={locale} items={[
              { label: t.home, href: `/${locale}` },
              { label: title },
            ]} />
            <span className="detail-hero__kicker"><i aria-hidden="true" />{eyebrow}</span>
            <h1>{title}</h1>
            {body && <p>{body}</p>}
            <div className="detail-hero__actions">
              <a className="gv-button gv-button--primary gv-button--lg" href="#ecosystem-directory">{t.explorePortfolio}<Icon name="arrow" /></a>
              <Link className="text-link" href={`/${locale}/book-consultation`}>{t.consultation}<Icon name="arrow" /></Link>
            </div>
          </div>
          <div className="ecosystem-page__hero-visual" aria-hidden="true" data-reveal="media">
            <div className="ecosystem-page__gate ecosystem-page__gate--one" />
            <div className="ecosystem-page__gate ecosystem-page__gate--two" />
            <div className="ecosystem-page__gate ecosystem-page__gate--three" />
            <span className="ecosystem-page__route" />
            <span className="ecosystem-page__node ecosystem-page__node--a" />
            <span className="ecosystem-page__node ecosystem-page__node--b" />
            <span className="ecosystem-page__node ecosystem-page__node--c" />
            <strong>GATEVIA</strong>
          </div>
        </div>
      </section>

      <section className="ecosystem-page__stats" aria-label={t.ecosystemCount}>
        <div className="container-wide ecosystem-page__stats-grid">
          <div><strong>{String(total).padStart(2, '0')}</strong><span>{t.ecosystemCount}</span></div>
          <div><strong>{String(brands.length).padStart(2, '0')}</strong><span>{t.ecosystemBrands}</span></div>
          <div><strong>{String(products.length).padStart(2, '0')}</strong><span>{t.ecosystemProducts}</span></div>
        </div>
      </section>

      <div id="ecosystem-directory">
        <HomeEcosystemAtlas
          content={{
            eyebrow: locale.startsWith('ar') ? 'محفظة GATEVIA' : 'GATEVIA PORTFOLIO',
            title: locale.startsWith('ar') ? 'استكشف منظومة الأعمال' : 'Explore the ecosystem',
            body: locale.startsWith('ar')
              ? 'علامات ومنتجات ومشاريع مترابطة ضمن منظومة واحدة، مع عرض واضح لطبيعة كل كيان وحالته.'
              : 'Brands, products and ventures presented as one connected portfolio with clear identity and status.',
          }}
          brands={brands}
          products={products}
          locale={locale}
          demo={false}
          fullPage
        />
      </div>

      <DetailCta
        locale={locale}
        title={locale.startsWith('ar') ? 'هل ترى فرصة للتعاون ضمن المنظومة؟' : 'See an opportunity to work within the ecosystem?'}
        body={locale.startsWith('ar') ? 'ناقش معنا فرص الشراكة أو الدخول للسوق أو التنفيذ والنمو.' : 'Talk to us about partnership, market entry, execution or growth opportunities.'}
      />
    </div>
  );
}
