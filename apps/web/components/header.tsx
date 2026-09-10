'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, IconButton, ThemeToggle } from '@gatevia/ui';
import { apiClient, type Language, type NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';
import { track } from './analytics';

function fallbackLinks(locale: string): NavItem[] {
  const t = copy(locale);
  return [
    { id: '1', label: t.services, href: `/${locale}/services`, external: false },
    { id: '2', label: t.market, href: `/${locale}/saudi-market-entry`, external: false },
    { id: '3', label: t.industries, href: `/${locale}/industries`, external: false },
    { id: '4', label: t.cases, href: `/${locale}/case-studies`, external: false },
    { id: '5', label: t.insights, href: `/${locale}/insights`, external: false },
    { id: '6', label: t.about, href: `/${locale}/about`, external: false },
  ];
}
function resolveUrl(item: NavItem, locale: string): string {
  const href = item.href || '';
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(`/${locale}`)) return href;
  return `/${locale}${href.startsWith('/') ? '' : '/'}${href}`;
}

function Brand({
  locale,
  identity,
}: {
  locale: string;
  identity: { name: string; logoUrl?: string | undefined };
}) {
  return (
    <Link href={`/${locale}`} className="brand" aria-label={`${identity.name} home`}>
      {identity.logoUrl ? (
        <Image src={identity.logoUrl} alt="" width={42} height={42} className="brand-mark" />
      ) : (
        <span className="brand-glyph" aria-hidden="true">
          <i />
          <i />
        </span>
      )}
      <span>{identity.name}</span>
    </Link>
  );
}

function DesktopNavigation({
  links,
  locale,
  pathname,
}: {
  links: NavItem[];
  locale: string;
  pathname: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', key);
    };
  }, []);
  return (
    <nav ref={navRef} className="desktop-nav" aria-label="Main navigation">
      {links.map((item) => {
        const href = resolveUrl(item, locale);
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const children = item.children ?? [];
        return (
          <div className={`nav-item${active ? ' is-active' : ''}`} key={item.id}>
            {children.length ? (
              <button
                type="button"
                aria-expanded={openId === item.id}
                aria-controls={`menu-${item.id}`}
                onClick={() => setOpenId((v) => (v === item.id ? null : item.id))}
              >
                {item.label}
                <Icon name="chevron" />
              </button>
            ) : (
              <Link
                href={href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </Link>
            )}
            {children.length > 0 && openId === item.id && (
              <div id={`menu-${item.id}`} className="mega-menu">
                <div className="mega-menu__intro">
                  <span className="eyebrow">GATEVIA</span>
                  <strong>{item.label}</strong>
                  <span className="mega-menu__line" />
                </div>
                <div className="mega-menu__links">
                  {item.href && (
                    <Link href={href} onClick={() => setOpenId(null)}>
                      {item.label}
                      <Icon name="arrow" />
                    </Link>
                  )}
                  {children.map((child, index) => (
                    <Link
                      key={child.id}
                      href={resolveUrl(child, locale)}
                      onClick={() => setOpenId(null)}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {child.label}
                      {child.external && <Icon name="external" />}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Header({
  locale,
  languages,
  navItems,
  identity,
}: {
  locale: string;
  languages: Language[];
  navItems: NavItem[];
  identity: { name: string; logoUrl?: string | undefined };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = copy(locale);
  const links = navItems.length ? navItems : fallbackLinks(locale);
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector<HTMLButtonElement>('.mobile-drawer__head button')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), select, summary, [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  const localizedPath = (language: Language) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length) parts[0] = language.code.toLowerCase();
    else parts.push(language.code.toLowerCase());
    return `/${parts.join('/')}`;
  };
  const switchLanguage = async (language: Language) => {
    const parts = pathname.split('/').filter(Boolean);
    const route = parts.slice(1);
    const details = new Set([
      'services',
      'industries',
      'case-studies',
      'insights',
      'brands',
      'products',
    ]);
    const lists = new Set([
      ...details,
      'clients',
      'partners',
      'certifications',
      'trust-metrics',
      'testimonials',
      'team',
      'faqs',
    ]);
    let resource: string | undefined;
    let slug: string | undefined;
    if (route[0] && route[1] && details.has(route[0])) {
      resource = route[0];
      slug = route[1];
    } else if (!route[0]) {
      resource = 'pages';
      slug = 'home';
    } else if (!lists.has(route[0])) {
      resource = 'pages';
      slug = route.join('/');
    }
    if (resource && slug) {
      try {
        const { data: body } = await apiClient.GET(
          '/api/v1/public/{resource}/{slug}' as never,
          {
            params: { path: { resource, slug: encodeURIComponent(slug) }, query: { locale } },
          } as never,
        );
        const alternates = (body as { data?: { alternates?: Record<string, string> } } | undefined)
          ?.data?.alternates;
        const target = Object.entries(alternates ?? {}).find(
          ([code]) => code.toLowerCase() === language.code.toLowerCase(),
        )?.[1];
        if (target) {
          window.location.assign(target);
          return;
        }
      } catch {
        /* Fall back to the same localized route when alternates are unavailable. */
      }
    }
    window.location.assign(localizedPath(language));
  };
  return (
    <>
      <header className="site-header">
        <div className="container-wide header-row">
          <Brand locale={locale} identity={identity} />
          <DesktopNavigation links={links} locale={locale} pathname={pathname} />
          <div className="header-tools">
            {languages.length > 1 && (
              <label className="locale-picker">
                <Icon name="globe" />
                <span className="sr-only">Language</span>
                <select
                  value={locale}
                  onChange={(e) => {
                    const language = languages.find((item) => item.code === e.target.value);
                    if (language) {
                      track('language_switch', { to: language.code.toLowerCase() });
                      void switchLanguage(language);
                    }
                  }}
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.nativeName}
                    </option>
                  ))}
                </select>
                <Icon name="chevron" />
              </label>
            )}
            <ThemeToggle />
            <Link className="header-cta" href={`/${locale}/book-consultation`}>
              {t.consultation}
              <Icon name="arrow" />
            </Link>
            <IconButton
              className="mobile-menu"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label={t.menu}
            >
              <Icon name="menu" />
            </IconButton>
          </div>
        </div>
      </header>
      {open && (
        <div
          ref={drawerRef}
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t.menu}
        >
          <div className="mobile-drawer__head">
            <Brand locale={locale} identity={identity} />
            <IconButton onClick={() => setOpen(false)} aria-label={t.close}>
              <Icon name="close" />
            </IconButton>
          </div>
          <nav className="mobile-nav">
            {links.map((item, index) =>
              item.children?.length ? (
                <details key={item.id}>
                  <summary>
                    <span>
                      <small>{String(index + 1).padStart(2, '0')}</small>
                      {item.label}
                    </span>
                    <Icon name="plus" />
                  </summary>
                  <div>
                    {item.href && (
                      <Link onClick={() => setOpen(false)} href={resolveUrl(item, locale)}>
                        {item.label}
                      </Link>
                    )}
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        onClick={() => setOpen(false)}
                        href={resolveUrl(child, locale)}
                      >
                        {child.label}
                        <Icon name="arrow" />
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link key={item.id} onClick={() => setOpen(false)} href={resolveUrl(item, locale)}>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  {item.label}
                  <Icon name="arrow" />
                </Link>
              ),
            )}
          </nav>
          <div className="mobile-drawer__footer">
            <Link
              className="gv-button gv-button--primary gv-button--lg"
              onClick={() => setOpen(false)}
              href={`/${locale}/book-consultation`}
            >
              {t.consultation}
              <Icon name="arrow" />
            </Link>
            {languages.length > 1 && (
              <div className="mobile-locales">
                {languages.map((language) => (
                  <button key={language.code} onClick={() => void switchLanguage(language)}>
                    {language.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
