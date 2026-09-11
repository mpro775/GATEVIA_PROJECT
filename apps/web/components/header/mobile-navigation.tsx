'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon, IconButton, ThemeToggle } from '@gatevia/ui';
import type { Language, NavItem } from '@/lib/api';
import { HeaderBrand } from './brand';
import { resolveUrl } from './header-utils';

const FOCUSABLE = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function MobileNavigation({ active, mounted, locale, languages, links, identity, labels, onClose, onLanguage }: {
  active: boolean;
  mounted: boolean;
  locale: string;
  languages: Language[];
  links: NavItem[];
  identity: { name: string; logoUrl?: string | undefined };
  labels: { menu: string; close: string; consultation: string; language: string };
  onClose: () => void;
  onLanguage: (language: Language) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (active) window.requestAnimationFrame(() => closeRef.current?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', key);
    };
  }, [active, mounted, onClose]);
  if (!mounted) return null;
  return (
    <div ref={rootRef} className="mobile-navigation" data-open={active} role="dialog" aria-modal="true" aria-label={labels.menu}>
      <button className="mobile-navigation__backdrop" type="button" aria-label={labels.close} onClick={onClose} tabIndex={-1} />
      <div className="mobile-drawer">
        <div className="mobile-drawer__head">
          <HeaderBrand locale={locale} identity={identity} onNavigate={onClose} />
          <IconButton ref={closeRef} onClick={onClose} aria-label={labels.close}><Icon name="close" /></IconButton>
        </div>
        <nav className="mobile-nav" aria-label={labels.menu}>
          {links.map((item, index) => {
            const expanded = expandedId === item.id;
            return item.children?.length ? (
              <div className="mobile-nav__group" key={item.id} style={{ '--nav-index': Math.min(index, 6) } as React.CSSProperties}>
                <button type="button" aria-expanded={expanded} aria-controls={`mobile-group-${item.id}`} onClick={() => setExpandedId((value) => value === item.id ? null : item.id)}>
                  <span><small>{String(index + 1).padStart(2, '0')}</small>{item.label}</span><Icon name="plus" />
                </button>
                <div id={`mobile-group-${item.id}`} className="mobile-nav__disclosure" data-open={expanded}>
                  <div>
                    {item.href && <Link onClick={onClose} href={resolveUrl(item, locale)}>{item.label}<Icon name="arrow" /></Link>}
                    {item.children.map((child) => (
                      <Link key={child.id} onClick={onClose} href={resolveUrl(child, locale)} {...(child.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{child.label}<Icon name={child.external ? 'external' : 'arrow'} /></Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.id} style={{ '--nav-index': Math.min(index, 6) } as React.CSSProperties} onClick={onClose} href={resolveUrl(item, locale)} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <small>{String(index + 1).padStart(2, '0')}</small>{item.label}<Icon name={item.external ? 'external' : 'arrow'} />
              </Link>
            );
          })}
        </nav>
        <div className="mobile-drawer__footer">
          <div className="mobile-drawer__preferences">
            <ThemeToggle />
            {languages.length > 1 && <div className="mobile-locales" aria-label={labels.language}>{languages.map((language) => <button key={language.code} type="button" aria-current={language.code.toLowerCase() === locale.toLowerCase() ? 'true' : undefined} onClick={() => onLanguage(language)}>{language.nativeName}</button>)}</div>}
          </div>
          <Link className="gv-button gv-button--primary gv-button--lg" onClick={onClose} href={`/${locale}/book-consultation`}>{labels.consultation}<Icon name="arrow" /></Link>
        </div>
      </div>
    </div>
  );
}
