'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminAuthProvider, type AdminUser } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';
const routePermissions: Array<[RegExp, string]> = [
  [/^\/dashboard/, 'dashboard.read'],
  [/^\/content\/pages/, 'pages.read'],
  [/^\/content\/(services|service-categories)/, 'services.read'],
  [/^\/content\/industries/, 'industries.read'],
  [/^\/content\/case-studies/, 'case_studies.read'],
  [/^\/content\/insights/, 'insights.read'],
  [/^\/content\/faqs/, 'faqs.read'],
  [/^\/content\/team-members/, 'team.read'],
  [/^\/trust\/clients/, 'clients.read'],
  [/^\/trust\/partners/, 'partners.read'],
  [/^\/trust\/brands/, 'brands.read'],
  [/^\/trust\/products/, 'products.read'],
  [/^\/trust\/testimonials/, 'testimonials.read'],
  [/^\/trust\/certifications/, 'certifications.read'],
  [/^\/trust\/trust-metrics/, 'trust_metrics.read'],
  [/^\/sales\//, 'leads.read'],
  [/^\/media/, 'media.read'],
  [/^\/website\/navigation/, 'navigation.read'],
  [/^\/website\/languages/, 'languages.read'],
  [/^\/website\/settings/, 'settings.read'],
  [/^\/website\/redirects/, 'redirects.read'],
  [/^\/system\/users/, 'users.read'],
  [/^\/system\/roles/, 'roles.read'],
  [/^\/system\/audit-logs/, 'audit.read'],
];
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { t } = useAdminI18n();
  const [user, setUser] = useState<AdminUser | null>(null);
  useEffect(() => {
    void api<AdminUser>('/auth/me')
      .then(setUser)
      .catch(() => router.replace(`/login?next=${encodeURIComponent(path)}`));
  }, [path, router]);
  if (!user)
    return (
      <main className="admin-content" aria-busy="true">
        {t('auth.checkingSession')}
      </main>
    );
  const required = routePermissions.find(([pattern]) => pattern.test(path))?.[1];
  if (required && !user.permissions.includes(required))
    return (
      <main className="admin-content">
        <div className="form-status form-status--error">
          <h1>{t('auth.accessDenied')}</h1>
          <p>{t('auth.noPermission')}</p>
        </div>
      </main>
    );
  return <AdminAuthProvider user={user}>{children}</AdminAuthProvider>;
}
