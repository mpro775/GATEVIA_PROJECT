'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@gatevia/ui';
import { api } from '@/lib/api';

const groups = [
  [
    'Content',
    [
      ['Pages', 'content/pages'],
      ['Services', 'content/services'],
      ['Service Categories', 'content/service-categories'],
      ['Industries', 'content/industries'],
      ['Case Studies', 'content/case-studies'],
      ['Insights', 'content/insights'],
      ['FAQs', 'content/faqs'],
      ['Team', 'content/team-members'],
    ],
  ],
  [
    'Trust & Ecosystem',
    [
      ['Clients', 'trust/clients'],
      ['Partners', 'trust/partners'],
      ['Brands', 'trust/brands'],
      ['Products & Ventures', 'trust/products'],
      ['Testimonials', 'trust/testimonials'],
      ['Certifications', 'trust/certifications'],
      ['Trust Metrics', 'trust/trust-metrics'],
    ],
  ],
  [
    'Sales',
    [
      ['Leads', 'sales/leads'],
      ['Consultation Requests', 'sales/consultation'],
      ['Assessments', 'sales/assessments'],
    ],
  ],
  [['Media', [['Media Library', 'media']]]],
  [
    'Website',
    [
      ['Navigation', 'website/navigation'],
      ['Languages', 'website/languages'],
      ['SEO & Settings', 'website/settings'],
      ['Redirects', 'website/redirects'],
    ],
  ],
  [
    'System',
    [
      ['Users', 'system/users'],
      ['Roles & Permissions', 'system/roles'],
      ['Audit Log', 'system/audit-logs'],
    ],
  ],
] as const;

function SidebarContent({ pathname, onNavClick }: { pathname: string; onNavClick?: () => void }) {
  return (
    <>
      <Link href="/dashboard" className="admin-brand" onClick={onNavClick}>
        <span>▰</span> GATEVIA
      </Link>
      {groups.map(([label, items]) => (
        <nav className="nav-group" key={String(label)}>
          <h2>{String(label)}</h2>
          {(items as ReadonlyArray<readonly [string, string]>).map(([name, path]) => (
            <Link
              aria-current={pathname.startsWith(`/${path}`) ? 'page' : undefined}
              href={`/${path}`}
              key={path}
              onClick={onNavClick}
            >
              {name}
            </Link>
          ))}
        </nav>
      ))}
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

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
        <div
          className="mobile-overlay"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        ref={drawerRef}
        className={`sidebar sidebar--mobile${mobileOpen ? ' sidebar--open' : ''}`}
        aria-label="Mobile navigation"
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
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        <SidebarContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <button
            className="gv-theme-toggle mobile-nav"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <span>Administration</span>
          <div className="header-tools">
            <ThemeToggle />
            <button className="text-link" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
