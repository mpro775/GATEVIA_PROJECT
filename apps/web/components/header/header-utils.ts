import type { NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';

export function fallbackLinks(locale: string): NavItem[] {
  const t = copy(locale);
  return [
    { id: 'home', label: t.home, href: `/${locale}`, external: false },
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

function canonicalInternalUrl(item: NavItem, locale: string): string | undefined {
  if (!item.href || item.external) return undefined;
  const resolved = resolveUrl(item, locale).replace(/\/$/, '');
  return resolved || `/${locale}`;
}

export function cleanChildren(item: NavItem, locale: string): NavItem[] {
  const parent = canonicalInternalUrl(item, locale);
  const seen = new Set<string>();
  return (item.children ?? []).filter((child) => {
    const url = canonicalInternalUrl(child, locale);
    if (url && parent && url === parent) return false;
    const key = url ?? `${child.external ? 'external:' : 'item:'}${child.href ?? child.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function prepareMainNavigation(items: NavItem[], locale: string): NavItem[] {
  const t = copy(locale);
  const source = items.length ? items : fallbackLinks(locale);
  const consultation = `/${locale}/book-consultation`.replace(/\/$/, '');
  const withoutDuplicatedCta = source.filter((item) => canonicalInternalUrl(item, locale) !== consultation);
  const hasHome = withoutDuplicatedCta.some((item) => canonicalInternalUrl(item, locale) === `/${locale}`);
  const normalized = withoutDuplicatedCta.map((item) => ({
    ...item,
    children: cleanChildren(item, locale),
  }));
  return hasHome
    ? normalized
    : [
        { id: 'gatevia-home', label: t.home, href: `/${locale}`, external: false },
        ...normalized,
      ];
}

export function isRouteActive(pathname: string, item: NavItem, locale: string): boolean {
  const routes = [item, ...cleanChildren(item, locale)]
    .filter((entry) => entry.href && !entry.external)
    .map((entry) => resolveUrl(entry, locale).replace(/\/$/, ''));
  const current = pathname.replace(/\/$/, '');
  return routes.some((route) => current === route || (route !== `/${locale}` && current.startsWith(`${route}/`)));
}
