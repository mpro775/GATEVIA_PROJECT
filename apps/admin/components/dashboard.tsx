'use client';
import { useEffect, useState } from 'react';
import { Card, ErrorState, Skeleton } from '@gatevia/ui';
import { apiEnvelope } from '@/lib/api';
import { useAdminI18n } from './admin-locale-provider';
export function Dashboard() {
  const { t, formatNumber } = useAdminI18n();
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    void apiEnvelope<Record<string, unknown>>('/admin/leads?pageSize=100')
      .then((result) => setRows(result.data))
      .catch(() => setError(true));
  }, []);
  if (error)
    return (
      <ErrorState
        title={t('state.loadRecordsFailed')}
        description={t('state.connectionHelp')}
      />
    );
  const data = rows ?? [];
  const count = (status: string) => data.filter((item) => item.status === status).length;
  return (
    <>
      <div className="page-title">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.description')}</p>
        </div>
      </div>
      <div className="metric-grid">
        {[
          [t('dashboard.totalLeads'), rows ? data.length : null],
          [t('dashboard.newLeads'), rows ? count('new') : null],
          [t('dashboard.qualified'), rows ? count('qualified') : null],
          [t('dashboard.proposals'), rows ? count('proposal') : null],
        ].map(([label, value]) => (
          <Card className="metric" key={String(label)}>
            <span>{label}</span>
            {value === null ? <Skeleton width="50%" /> : <strong>{formatNumber(Number(value))}</strong>}
          </Card>
        ))}
      </div>
    </>
  );
}
