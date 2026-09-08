'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@gatevia/ui';
import { publicApiUrl, type Language, type NavItem } from '@/lib/api';
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

function NavBranch({ item, locale, mobile = false, onNavigate }: { item: NavItem; locale: string; mobile?: boolean; onNavigate?: () => void }) {
  const link = <Link
    href={resolveUrl(item, locale)}
    {...(onNavigate ? { onClick: onNavigate } : {})}
    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
  >{item.label}</Link>;
  if (!item.children?.length) return link;
  return (
    <details className={mobile ? 'mobile-nav-branch' : 'nav-branch'}>
      <summary>{item.label}</summary>
      <div className="nav-children">
        {item.href && link}
        {item.children.map((child) => <NavBranch key={child.id} item={child} locale={locale} mobile={mobile} {...(onNavigate ? { onNavigate } : {})} />)}
      </div>
    </details>
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
  const links = navItems.length > 0 ? navItems : fallbackLinks(locale);
  const localizedPath = (language: Language) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length) parts[0] = language.code.toLowerCase();
    else parts.push(language.code.toLowerCase());
    return `/${parts.join('/')}`;
  };
  const switchLanguage = async (language: Language) => {
    const parts = pathname.split('/').filter(Boolean);
    const route = parts.slice(1);
    const detailResources = new Set(['services','industries','case-studies','insights','brands','products']);
    const listResources = new Set([...detailResources,'clients','partners','certifications','trust-metrics','testimonials','team','faqs']);
    let resource:string|undefined;
    let slug:string|undefined;
    if (route[0] && route[1] && detailResources.has(route[0])) { resource=route[0]; slug=route[1]; }
    else if (!route[0]) { resource='pages'; slug='home'; }
    else if (!listResources.has(route[0])) { resource='pages'; slug=route.join('/'); }
    if (resource&&slug) {
      try {
        const response=await fetch(`${publicApiUrl}/public/${resource}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,{headers:{Accept:'application/json'}});
        if(response.ok){const body=await response.json() as {data?:{alternates?:Record<string,string>}};const target=Object.entries(body.data?.alternates??{}).find(([code])=>code.toLowerCase()===language.code.toLowerCase())?.[1];if(target){window.location.assign(target);return;}}
      } catch { /* Fall back to retaining the current route below. */ }
    }
    window.location.assign(localizedPath(language));
  };

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href={`/${locale}`} className="brand" aria-label={`${identity.name} home`}>
          {identity.logoUrl ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={identity.logoUrl} alt="" className="brand-mark" /></> : <span className="brand-mark">▰</span>} {identity.name}
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((item) => <NavBranch key={item.id} item={item} locale={locale} />)}
        </nav>

        <div className="header-tools">
          {languages.length > 1 && (
            <label className="locale-picker">
              <span className="sr-only">Language</span>
              <select
                className="gv-input"
                value={locale}
                onChange={(event) => {
                  const language = languages.find((item) => item.code === event.target.value);
                  if (!language) return;
                  // @ts-expect-error optional analytics global
                  window.dataLayer?.push({ event: 'language_switch', to: language.code.toLowerCase() });
                  void switchLanguage(language);
                }}
              >
                {languages.map((language) => <option key={language.code} value={language.code}>{language.nativeName}</option>)}
              </select>
            </label>
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
          {links.map((item) => <NavBranch key={item.id} item={item} locale={locale} mobile onNavigate={() => setOpen(false)} />)}
          <Link onClick={() => setOpen(false)} href={`/${locale}/book-consultation`}>
            {t.consultation}
          </Link>
          <ThemeToggle />
        </nav>
      )}
    </header>
  );
}
