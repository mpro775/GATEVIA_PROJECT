import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import type { NavItem } from '@/lib/api';
import { resolveUrl } from './header-utils';

export function MegaMenu({ item, locale, open, onNavigate }: { item: NavItem; locale: string; open: boolean; onNavigate: () => void }) {
  return (
    <div id={`menu-${item.id}`} className="mega-menu" data-open={open} aria-hidden={!open}>
      <div className="mega-menu__intro">
        <span className="eyebrow">GATEVIA</span>
        <strong>{item.label}</strong>
        <span className="mega-menu__line" aria-hidden="true" />
      </div>
      <div className="mega-menu__links">
        {item.href && (
          <Link href={resolveUrl(item, locale)} tabIndex={open ? undefined : -1} onClick={onNavigate} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <span>00</span><strong>{item.label}</strong><Icon name="arrow" />
          </Link>
        )}
        {(item.children ?? []).map((child, index) => (
          <Link key={child.id} href={resolveUrl(child, locale)} tabIndex={open ? undefined : -1} onClick={onNavigate} {...(child.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <span>{String(index + 1).padStart(2, '0')}</span><strong>{child.label}</strong><Icon name={child.external ? 'external' : 'arrow'} />
          </Link>
        ))}
      </div>
    </div>
  );
}
