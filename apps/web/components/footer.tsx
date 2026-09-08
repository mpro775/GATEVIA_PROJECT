import Link from 'next/link';
import type { NavItem } from '@/lib/api';
import { copy } from '@/lib/ui-copy';

function resolveUrl(item: NavItem, locale: string): string {
  if (/^https?:\/\//.test(item.url)) return item.url;
  if (item.url.startsWith(`/${locale}`)) return item.url;
  return `/${locale}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
}

// Fallback structure used only if CMS footer navigation is empty.
function FallbackFooter({ locale }: { locale: string }) {
  const t = copy(locale);
  return (
    <div className="footer-grid">
      <div>
        <div className="footer-title">{t.footer}</div>
        <p>Saudi market access, execution and growth.</p>
      </div>
      <div className="footer-links">
        <strong>{t.services}</strong>
        <Link href={`/${locale}/services`}>{t.services}</Link>
        <Link href={`/${locale}/industries`}>{t.industries}</Link>
      </div>
      <div className="footer-links">
        <strong>{t.about}</strong>
        <Link href={`/${locale}/about`}>{t.about}</Link>
        <Link href={`/${locale}/team`}>Team</Link>
        <Link href={`/${locale}/partners`}>Partners</Link>
      </div>
      <div className="footer-links">
        <strong>Contact</strong>
        <Link href={`/${locale}/contact`}>Contact</Link>
        <Link href={`/${locale}/book-consultation`}>{t.consultation}</Link>
      </div>
    </div>
  );
}

export function Footer({ locale, navItems }: { locale: string; navItems: NavItem[] }) {
  const t = copy(locale);

  // Group CMS footer items by their top-level label (items with children become columns,
  // items without children go into a flat list).
  const hasNav = navItems.length > 0;

  return (
    <footer className="site-footer">
      <div className="container">
        {hasNav ? (
          <div className="footer-grid">
            <div>
              <div className="footer-title">{t.footer}</div>
              <p>Saudi market access, execution and growth.</p>
            </div>
            {/* Render CMS top-level items as columns if they have children,
                otherwise render them as a flat list of links */}
            {navItems.some((item) => item.children && item.children.length > 0) ? (
              navItems.map((item) => (
                <div key={item.url} className="footer-links">
                  <strong>{item.label}</strong>
                  {(item.children ?? []).filter((c) => c.isVisible !== false).map((child) => (
                    <Link
                      key={child.url}
                      href={resolveUrl(child, locale)}
                      {...(child.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))
            ) : (
              <div className="footer-links">
                {navItems.filter((item) => item.isVisible !== false).map((item) => (
                  <Link
                    key={item.url}
                    href={resolveUrl(item, locale)}
                    {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <FallbackFooter locale={locale} />
        )}

        <div className="legal-row">
          <span>© {new Date().getFullYear()} GATEVIA</span>
          <span>
            <Link href={`/${locale}/privacy`}>Privacy</Link>
            {' · '}
            <Link href={`/${locale}/terms`}>Terms</Link>
            {' · '}
            <Link href={`/${locale}/cookie-policy`}>Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
