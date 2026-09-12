'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import type { NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';
import { isRouteActive, resolveUrl } from './header-utils';
import { MegaMenu } from './mega-menu';

export function DesktopNavigation({ links, locale, pathname }: { links: NavItem[]; locale: string; pathname: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    const closeWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const trigger = navRef.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"]');
        setOpenId(null);
        trigger?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithKeyboard);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithKeyboard);
    };
  }, []);
  useEffect(() => setOpenId(null), [pathname]);
  return (
    <nav ref={navRef} className="desktop-nav" aria-label={copy(locale).mainNavigation}>
      {links.map((item) => {
        const active = isRouteActive(pathname, item, locale);
        const hasChildren = Boolean(item.children?.length);
        const isOpen = openId === item.id;
        return (
          <div className={`nav-item${active ? ' is-active' : ''}`} key={item.id} data-menu-open={isOpen}>
            {hasChildren ? (
              <button type="button" aria-expanded={isOpen} aria-controls={`menu-${item.id}`} onClick={() => setOpenId((value) => (value === item.id ? null : item.id))}>
                {item.label}<Icon name="chevron" />
              </button>
            ) : (
              <Link href={resolveUrl(item, locale)} aria-current={active ? 'page' : undefined} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {item.label}{item.external && <Icon name="external" />}
              </Link>
            )}
            {hasChildren && <MegaMenu item={item} locale={locale} open={isOpen} onNavigate={() => setOpenId(null)} />}
          </div>
        );
      })}
    </nav>
  );
}
