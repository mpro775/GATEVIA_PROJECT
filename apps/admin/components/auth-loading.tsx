'use client';
import { useAdminI18n } from './admin-locale-provider';

export function AuthLoading() {
  const { t } = useAdminI18n();
  return <p>{t('common.loading') ?? 'Loading…'}</p>;
}
