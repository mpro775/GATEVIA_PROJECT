'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';
import { AdminLanguageToggle } from './admin-language-toggle';
import { NavigationFeedback } from './navigation-feedback';
import { startAdminNavigation } from '@/lib/navigation-feedback';
import type { TranslationKey } from '@/lib/i18n';

const groups: ReadonlyArray<
  readonly [TranslationKey, ReadonlyArray<readonly [TranslationKey, string]>]
> = [
  [
    'nav.content',
    [
      ['nav.pages', 'content/pages'],
      ['nav.services', 'content/services'],
      ['nav.serviceCategories', 'content/service-categories'],
      ['nav.industries', 'content/industries'],
      ['nav.caseStudies', 'content/case-studies'],
      ['nav.insights', 'content/insights'],
      ['nav.faqs', 'content/faqs'],
      ['nav.team', 'content/team-members'],
    ],
  ],
  [
    'nav.trust',
    [
      ['nav.clients', 'trust/clients'],
      ['nav.partners', 'trust/partners'],
      ['nav.brands', 'trust/brands'],
      ['nav.products', 'trust/products'],
      ['nav.testimonials', 'trust/testimonials'],
      ['nav.certifications', 'trust/certifications'],
      ['nav.trustMetrics', 'trust/trust-metrics'],
    ],
  ],
  [
    'nav.sales',
    [
      ['nav.leads', 'sales/leads'],
      ['nav.consultation', 'sales/consultation'],
      ['nav.assessments', 'sales/assessments'],
    ],
  ],
  ['nav.media', [['nav.mediaLibrary', 'media']]],
  [
    'nav.website',
    [
      ['nav.navigation', 'website/navigation'],
      ['nav.languages', 'website/languages'],
      ['nav.settings', 'website/settings'],
      ['nav.redirects', 'website/redirects'],
    ],
  ],
  [
    'nav.system',
    [
      ['nav.users', 'system/users'],
      ['nav.roles', 'system/roles'],
      ['nav.audit', 'system/audit-logs'],
    ],
  ],
] as const;

const pathPermission: Record<string, string> = {
  'content/pages': 'pages.read',
  'content/services': 'services.read',
  'content/service-categories': 'services.read',
  'content/industries': 'industries.read',
  'content/case-studies': 'case_studies.read',
  'content/insights': 'insights.read',
  'content/faqs': 'faqs.read',
  'content/team-members': 'team.read',
  'trust/clients': 'clients.read',
  'trust/partners': 'partners.read',
  'trust/brands': 'brands.read',
  'trust/products': 'products.read',
  'trust/testimonials': 'testimonials.read',
  'trust/certifications': 'certifications.read',
  'trust/trust-metrics': 'trust_metrics.read',
  'sales/leads': 'leads.read',
  'sales/consultation': 'leads.read',
  'sales/assessments': 'leads.read',
  media: 'media.read',
  'website/navigation': 'navigation.read',
  'website/languages': 'languages.read',
  'website/settings': 'settings.read',
  'website/redirects': 'redirects.read',
  'system/users': 'users.read',
  'system/roles': 'roles.read',
  'system/audit-logs': 'audit.read',
};

function SidebarContent({ pathname, onNavClick }: { pathname: string; onNavClick?: () => void }) {
  const { can } = useAdminAuth();
  const { t } = useAdminI18n();
  return (
    <>
      <Link
        href="/dashboard"
        className="admin-brand"
        {...(onNavClick ? { onClick: onNavClick } : {})}
      >
        <span>▰</span> GATEVIA
      </Link>
      {groups.map(([label, items]) => {
        const visibleItems = items.filter(
          ([, path]) => can(pathPermission[path]!),
        );
        if (!visibleItems.length) return null;
        return (
          <nav className="nav-group" key={String(label)}>
            <h2>{t(label)}</h2>
            {visibleItems.map(([name, path]) => (
              <Link
                aria-current={pathname.startsWith(`/${path}`) ? 'page' : undefined}
                href={`/${path}`}
                key={path}
                {...(onNavClick ? { onClick: onNavClick } : {})}
              >
                {t(name)}
              </Link>
            ))}
          </nav>
        );
      })}
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { t, dir } = useAdminI18n();

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (mobileOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [mobileOpen]);

  function goBack() {
    startAdminNavigation();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 3) {
      router.push(`/${parts.slice(0, -1).join('/')}`);
      return;
    }
    router.push('/dashboard');
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
    }
  }

  return (
    <div className="admin-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        ref={drawerRef}
        className={`sidebar sidebar--mobile${mobileOpen ? ' sidebar--open' : ''}`}
        aria-label={t('app.mobileNavigation')}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        hidden={!mobileOpen}
      >
        <div className="mobile-drawer-header">
          <span className="admin-brand">
            <span>▰</span> GATEVIA
          </span>
          <button
            className="gv-theme-toggle"
            aria-label={t('app.closeNavigation')}
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        <SidebarContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div className="topbar__leading">
            <button
              className="gv-theme-toggle mobile-nav"
              aria-label={t('app.openNavigation')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            {pathname !== '/dashboard' && (
              <button type="button" className="admin-back-button" onClick={goBack}>
                <span aria-hidden="true">{dir === 'rtl' ? '→' : '←'}</span>
                {t('action.back')}
              </button>
            )}
            <span className="topbar__title">{t('app.administration')}</span>
          </div>
          <div className="header-tools">
            <AdminLanguageToggle />
            <ThemeToggle />
            <button className="text-link" onClick={logout}>
              {t('app.signOut')}
            </button>
          </div>
        </header>
        <NavigationFeedback />
        {children}
      </div>
    </div>
  );
}
