'use client';
import { ErrorState } from '@gatevia/ui';
import { useAdminI18n } from '@/components/admin-locale-provider';
export default function Error({ reset }: { reset: () => void }) {
  const { t } = useAdminI18n();
  return (
    <main className="admin-content">
      <ErrorState
        title={t('error.title')}
        description={t('error.description')}
      />
      <button className="gv-button" onClick={reset}>
        {t('action.retry')}
      </button>
    </main>
  );
}
