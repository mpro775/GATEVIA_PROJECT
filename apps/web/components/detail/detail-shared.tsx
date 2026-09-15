import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { ResourceGrid } from '@/components/cards/resource-cards';
import { copy } from '@/lib/ui-copy';

export function DetailBreadcrumbs({ locale, items }: {
  locale: string;
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav className="detail-breadcrumbs" aria-label={locale.startsWith('ar') ? 'مسار الصفحة' : 'Breadcrumb'}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.href ?? item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DetailRelated({ items, locale, resource, heading, eyebrow = 'GATEVIA' }: {
  items: Record<string, unknown>[];
  locale: string;
  resource: string;
  heading: string;
  eyebrow?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="section detail-related">
      <div className="container-wide">
        <header className="detail-section-heading" data-reveal="up">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
        </header>
        <ResourceGrid items={items} locale={locale} resource={resource} />
      </div>
    </section>
  );
}

export function DetailCta({ locale, title, body }: { locale: string; title: string; body?: string }) {
  const t = copy(locale);
  return (
    <section className="detail-cta">
      <div className="container-wide detail-cta__inner" data-reveal="up">
        <div>
          <span className="eyebrow">GATEVIA</span>
          <h2>{title}</h2>
          {body && <p>{body}</p>}
        </div>
        <Link className="gv-button gv-button--primary gv-button--lg" href={`/${locale}/book-consultation`}>
          {t.consultation}<Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
