import type { NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';

export function fallbackLinks(locale: string): NavItem[] {
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

export function resolveUrl(item: NavItem, locale: string): string {
  const href = item.href || '';
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(`/${locale}`)) return href;
  return `/${locale}${href.startsWith('/') ? '' : '/'}${href}`;
}

export function isRouteActive(pathname: string, item: NavItem, locale: string): boolean {
  const routes = [item, ...(item.children ?? [])]
    .filter((entry) => entry.href && !entry.external)
    .map((entry) => resolveUrl(entry, locale));
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
