import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import type { FooterNavigation, NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';

type FooterLink = { id: string; label: string; href: string; external?: boolean };

function resolveUrl(href: string, locale: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(`/${locale}`)) return href;
  return `/${locale}${href.startsWith('/') ? '' : '/'}${href}`;
}

function menuLinks(items: NavItem[], fallback: FooterLink[]): FooterLink[] {
  if (items.length === 0) return fallback;
  const links = items.flatMap((item) => {
    const children = item.children ?? [];
    if (children.length > 0) {
      return children
        .filter((child) => Boolean(child.href))
        .map((child) => ({
          id: child.id,
          label: child.label,
          href: child.href!,
          external: child.external,
        }));
    }
    return item.href
      ? [{ id: item.id, label: item.label, href: item.href, external: item.external }]
      : [];
  });
  return links.length > 0 ? links : fallback;
}

function FooterNav({
  title,
  links,
  locale,
}: {
  title: string;
  links: FooterLink[];
  locale: string;
}) {
  return (
    <nav className="footer-nav" aria-label={title} data-reveal="up">
      <h2>{title}</h2>
      <ul>
        {links.map((item) => {
          const href = resolveUrl(item.href, locale);
          const external = item.external || /^https?:\/\//.test(item.href);
          return (
            <li key={item.id}>
              <Link
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer({
  locale,
  navigation,
  identity,
}: {
  locale: string;
  navigation: FooterNavigation;
  identity: {
    name: string;
    logoUrl?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    linkedInUrl?: string | undefined;
  };
}) {
  const t = copy(locale);
  const fallbacks = {
    services: [
      { id: 'fallback-services', label: t.services, href: '/services' },
      { id: 'fallback-industries', label: t.industries, href: '/industries' },
    ],
    company: [
      { id: 'fallback-about', label: t.about, href: '/about' },
      { id: 'fallback-team', label: t.team, href: '/team' },
      { id: 'fallback-partners', label: t.partners, href: '/partners' },
    ],
    resources: [
      { id: 'fallback-insights', label: t.insights, href: '/insights' },
      { id: 'fallback-cases', label: t.cases, href: '/case-studies' },
    ],
    legal: [
      { id: 'fallback-privacy', label: t.privacyPolicy, href: '/privacy-policy' },
      { id: 'fallback-terms', label: t.terms, href: '/terms' },
      { id: 'fallback-cookies', label: t.cookies, href: '/cookie-policy' },
    ],
  } satisfies Record<keyof FooterNavigation, FooterLink[]>;
  const groups = {
    services: menuLinks(navigation.services, fallbacks.services),
    company: menuLinks(navigation.company, fallbacks.company),
    resources: menuLinks(navigation.resources, fallbacks.resources),
    legal: menuLinks(navigation.legal, fallbacks.legal),
  };
  const hasContact = Boolean(identity.email || identity.phone || identity.linkedInUrl);

  return (
    <footer className="site-footer">
      <div className="container-wide">
        <div className="footer-gateway" aria-hidden="true" data-reveal="footer-path">
          <span />
          <span />
          <span />
        </div>

        <div className="footer-layout">
          <div className="footer-brand" data-reveal="up">
            <div
              className={`footer-logo-surface${identity.logoUrl ? ' footer-logo-surface--cms' : ''}`}
            >
              <Image
                src={identity.logoUrl ?? '/brand/gatevia-logo-dark.svg'}
                alt={identity.name}
                width={190}
                height={58}
                className="footer-logo"
                unoptimized={!identity.logoUrl || (identity.logoUrl ?? '').endsWith('.svg')}
              />
            </div>
            <p>
              {locale.startsWith('ar')
                ? 'دخول السوق السعودي، التنفيذ، والنمو.'
                : 'Saudi market access, execution and growth.'}
            </p>
          </div>

          {hasContact && (
            <div className="footer-contact" data-reveal="up">
              <h2>{t.contact}</h2>
              {identity.email && <a href={`mailto:${identity.email}`}>{identity.email}</a>}
              {identity.phone && <a href={`tel:${identity.phone}`}>{identity.phone}</a>}
              {identity.linkedInUrl && (
                <a href={identity.linkedInUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="linkedin" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          )}

          <FooterNav title={t.services} links={groups.services} locale={locale} />
          <FooterNav title={t.company} links={groups.company} locale={locale} />
          <FooterNav title={t.resources} links={groups.resources} locale={locale} />
          <FooterNav title={t.legal} links={groups.legal} locale={locale} />
        </div>

        <div className="footer-legal-row">
          <span>
            © {new Date().getFullYear()} {identity.name}
          </span>
          <span>GATEVIA / SAUDI ARABIA</span>
        </div>
      </div>
    </footer>
  );
}
