'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, IconButton, ThemeToggle } from '@gatevia/ui';
import { apiClient, type Language, type NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';
import { track } from '../analytics';
import { HeaderBrand } from './brand';
import { DesktopNavigation } from './desktop-navigation';
import { fallbackLinks } from './header-utils';
import { LanguageMenu } from './language-menu';
import { MobileNavigation } from './mobile-navigation';
import { useHeaderScrollState } from './use-header-scroll-state';

export function Header({ locale, languages, navItems, identity }: { locale: string; languages: Language[]; navItems: NavItem[]; identity: { name: string; logoUrl?: string | undefined } }) {
  const pathname = usePathname();
  const scrolled = useHeaderScrollState();
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef(pathname);
  const t = copy(locale);
  const links = navItems.length ? navItems : fallbackLinks(locale);

  const openDrawer = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDrawerMounted(true);
    window.requestAnimationFrame(() => setDrawerOpen(true));
  };
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setDrawerMounted(false);
      menuTriggerRef.current?.focus();
    }, 280);
  }, []);
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);
  useEffect(() => {
    if (previousPathRef.current !== pathname && drawerMounted) closeDrawer();
    previousPathRef.current = pathname;
  }, [closeDrawer, drawerMounted, pathname]);

  const localizedPath = (language: Language) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length) parts[0] = language.code.toLowerCase(); else parts.push(language.code.toLowerCase());
    return `/${parts.join('/')}`;
  };
  const switchLanguage = async (language: Language) => {
    track('language_switch', { to: language.code.toLowerCase() });
    const route = pathname.split('/').filter(Boolean).slice(1);
    const details = new Set(['services', 'industries', 'case-studies', 'insights', 'brands', 'products']);
    const lists = new Set([...details, 'clients', 'partners', 'certifications', 'trust-metrics', 'testimonials', 'team', 'faqs']);
    let resource: string | undefined;
    let slug: string | undefined;
    if (route[0] && route[1] && details.has(route[0])) { resource = route[0]; slug = route[1]; }
    else if (!route[0]) { resource = 'pages'; slug = 'home'; }
    else if (!lists.has(route[0])) { resource = 'pages'; slug = route.join('/'); }
    if (resource && slug) {
      try {
        const { data: body } = await apiClient.GET('/api/v1/public/{resource}/{slug}' as never, { params: { path: { resource, slug: encodeURIComponent(slug) }, query: { locale } } } as never);
        const alternates = (body as { data?: { alternates?: Record<string, string> } } | undefined)?.data?.alternates;
        const target = Object.entries(alternates ?? {}).find(([code]) => code.toLowerCase() === language.code.toLowerCase())?.[1];
        if (target) { window.location.assign(target); return; }
      } catch { /* Preserve the established same-route fallback. */ }
    }
    window.location.assign(localizedPath(language));
  };

  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <div className="container-wide header-row">
          <HeaderBrand locale={locale} identity={identity} />
          <DesktopNavigation links={links} locale={locale} pathname={pathname} />
          <div className="header-tools">
            <LanguageMenu locale={locale} languages={languages} label={t.language} onSelect={(language) => void switchLanguage(language)} />
            <ThemeToggle />
            <Link className="header-cta" href={`/${locale}/book-consultation`}>{t.consultation}<Icon name="arrow" /></Link>
            <IconButton ref={menuTriggerRef} className="mobile-menu" onClick={openDrawer} aria-expanded={drawerOpen} aria-haspopup="dialog" aria-label={t.menu}><Icon name="menu" /></IconButton>
          </div>
        </div>
      </header>
      <MobileNavigation active={drawerOpen} mounted={drawerMounted} locale={locale} languages={languages} links={links} identity={identity} labels={{ menu: t.menu, close: t.close, consultation: t.consultation, language: t.language }} onClose={closeDrawer} onLanguage={(language) => void switchLanguage(language)} />
    </>
  );
}
