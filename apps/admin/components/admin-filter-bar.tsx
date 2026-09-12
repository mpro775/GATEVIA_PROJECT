'use client';
import { useAdminI18n } from './admin-locale-provider';

export function AdminFilterBar({ children, advanced, actions, activeAdvancedCount = 0, onReset, hasActiveFilters = false }: {
  children: React.ReactNode;
  advanced?: React.ReactNode;
  actions?: React.ReactNode;
  activeAdvancedCount?: number;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}) {
  const { t, formatNumber } = useAdminI18n();
  return (
    <section className="admin-filter-bar" aria-label={t('action.search')}>
      <div className="admin-filter-bar__primary">{children}</div>
      {(advanced || actions || hasActiveFilters) && (
        <div className="admin-filter-bar__actions">
          {advanced && (
            <details className="admin-filter-bar__more">
              <summary className="text-link">{t('filter.more')}{activeAdvancedCount ? ` (${formatNumber(activeAdvancedCount)})` : ''}</summary>
              <div className="admin-filter-bar__advanced">{advanced}</div>
            </details>
          )}
          {hasActiveFilters && onReset && <button type="button" className="text-link" onClick={onReset}>{t('action.reset')}</button>}
          {actions}
        </div>
      )}
    </section>
  );
}
