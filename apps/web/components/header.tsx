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
    { label: t.services, url: `/${locale}/services`, isExternal: false, isVisible: true },
    { label: t.market, url: `/${locale}/saudi-market-entry`, isExternal: false, isVisible: true },
    { label: t.industries, url: `/${locale}/industries`, isExternal: false, isVisible: true },
    { label: t.cases, url: `/${locale}/case-studies`, isExternal: false, isVisible: true },
    { label: t.insights, url: `/${locale}/insights`, isExternal: false, isVisible: true },
    { label: t.about, url: `/${locale}/about`, isExternal: false, isVisible: true },
  ];
}

function resolveUrl(item: NavItem, locale: string): string {
  // Absolute URLs (http/https) are returned as-is
  if (/^https?:\/\//.test(item.url)) return item.url;
  // Relative paths already starting with /locale segment
  if (item.url.startsWith(`/${locale}`)) return item.url;
  // Prefix with locale
  return `/${locale}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
}

export function Header({
  locale,
  languages,
  navItems,
}: {
  locale: string;
  languages: Language[];
  navItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const t = copy(locale);
  const links = navItems.length > 0 ? navItems : fallbackLinks(locale);
  const alternate = languages.find((l) => l.code.toLowerCase() !== locale);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href={`/${locale}`} className="brand" aria-label="GATEVIA home">
          <span className="brand-mark">▰</span> GATEVIA
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((item) => (
            <Link
              key={item.url}
              href={resolveUrl(item, locale)}
              {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
              key={item.url}
              onClick={() => setOpen(false)}
              href={resolveUrl(item, locale)}
              {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
