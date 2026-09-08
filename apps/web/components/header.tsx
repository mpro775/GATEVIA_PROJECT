'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@gatevia/ui';
import type { Language, NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';

// Hardcoded fallback nav used ONLY when CMS returns no items.
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
  // Absolute URLs (http/https) are returned as-is
  if (/^https?:\/\//.test(href)) return href;
  // Relative paths already starting with /locale segment
  if (href.startsWith(`/${locale}`)) return href;
  // Prefix with locale
  return `/${locale}${href.startsWith('/') ? '' : '/'}${href}`;
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
  identity: { name: string; logoUrl?: string };
}) {
  const [open, setOpen] = useState(false);
  const t = copy(locale);
  const links = navItems.length > 0 ? navItems : fallbackLinks(locale);
  const alternate = languages.find((l) => l.code.toLowerCase() !== locale);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href={`/${locale}`} className="brand" aria-label={`${identity.name} home`}>
          {identity.logoUrl ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={identity.logoUrl} alt="" className="brand-mark" /></> : <span className="brand-mark">▰</span>} {identity.name}
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((item) => (
            <Link
              key={item.id}
              href={resolveUrl(item, locale)}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          {alternate && (
            <Link 
              className="locale-link" 
              href={`/${alternate.code.toLowerCase()}`}
              onClick={() => {
                // @ts-expect-error global
                window.dataLayer?.push({ event: 'language_switch', to: alternate.code.toLowerCase() });
              }}
            >
              {alternate.nativeName}
            </Link>
          )}
          <ThemeToggle />
          <Link className="text-link header-cta" href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
          <button
            className="gv-theme-toggle mobile-menu"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.close : t.menu}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-panel" aria-label="Mobile navigation">
          {links.map((item) => (
            <Link
              key={item.id}
              onClick={() => setOpen(false)}
              href={resolveUrl(item, locale)}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {item.label}
            </Link>
          ))}
          <Link onClick={() => setOpen(false)} href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
          <ThemeToggle />
        </nav>
      )}
    </header>
  );
}
