'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ADMIN_NAVIGATION_START_EVENT } from '@/lib/navigation-feedback';
import { useAdminI18n } from './admin-locale-provider';

export function NavigationFeedback() {
  const pathname = usePathname();
  const { t } = useAdminI18n();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
  }, [pathname]);

  useEffect(() => {
    let fallbackTimer: number | undefined;
    const start = () => {
      setActive(true);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(() => setActive(false), 10000);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname === window.location.pathname) return;
      start();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener(ADMIN_NAVIGATION_START_EVENT, start);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener(ADMIN_NAVIGATION_START_EVENT, start);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, []);

  if (!active) return null;
  return (
    <div className="admin-navigation-feedback" role="status" aria-live="polite" aria-label={t('common.loading')}>
      <div className="admin-navigation-progress" />
      <div className="admin-navigation-feedback__label">
        <span className="admin-spinner" aria-hidden="true" />
        {t('common.loading')}
      </div>
    </div>
  );
}
