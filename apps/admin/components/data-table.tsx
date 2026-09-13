'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState, ErrorState, Pagination, Skeleton } from '@gatevia/ui';
import { cmsDefinitions } from '@gatevia/contracts';
import { apiEnvelope } from '@/lib/api';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';
import { AdminFilterBar } from './admin-filter-bar';
import type { TranslationKey } from '@/lib/i18n';

const resourceTitleKeys: Partial<Record<string, TranslationKey>> = {
  pages: 'nav.pages', services: 'nav.services', 'service-categories': 'nav.serviceCategories',
  industries: 'nav.industries', 'case-studies': 'nav.caseStudies', insights: 'nav.insights',
  faqs: 'nav.faqs', 'team-members': 'nav.team', clients: 'nav.clients', partners: 'nav.partners',
  brands: 'nav.brands', products: 'nav.products', testimonials: 'nav.testimonials',
  certifications: 'nav.certifications', 'trust-metrics': 'nav.trustMetrics', leads: 'nav.leads',
  users: 'nav.users', roles: 'nav.roles', languages: 'nav.languages', redirects: 'nav.redirects',
  'audit-logs': 'nav.audit',
};

interface Props {
  title: string;
  titleKey?: TranslationKey | undefined;
  resource: string;
  basePath: string;
  kind?: 'content' | 'lead' | 'audit' | 'language' | 'user' | 'role';
  source?: 'contact' | 'consultation' | 'assessment';
}

const display = (row: Record<string, unknown>, untitledFallback = 'Untitled') => {
  const tr = Array.isArray(row.translations)
    ? (row.translations[0] as Record<string, unknown> | undefined)
    : undefined;
  return String(
    tr?.title ??
      tr?.name ??
      tr?.question ??
      row.fullName ??
      row.displayName ??
      row.email ??
      row.key ??
      row.action ??
      row.originalFilename ??
      untitledFallback,
  );
};

type DomainFilter = {
  key: 'categoryId' | 'industryId' | 'serviceId';
  labelKey: TranslationKey;
  resource: string;
};

export function DataTable({ title, titleKey, resource, basePath, kind = 'content', source }: Props) {
  const { can } = useAdminAuth();
  const { t, formatDate, formatNumber } = useAdminI18n();
  const effectiveTitleKey = titleKey ?? resourceTitleKeys[resource];
  const localizedTitle = effectiveTitleKey ? t(effectiveTitleKey, title) : title;
  const definition = cmsDefinitions[resource];
  const isCmsContent = kind === 'content' && Boolean(definition);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('-updatedAt');
  const [featured, setFeatured] = useState('');
  const [completeness, setCompleteness] = useState('');
  const [locale, setLocale] = useState('');
  const [languages, setLanguages] = useState<Array<{ code: string; nativeName: string }>>([]);
  const [domainValues, setDomainValues] = useState<Record<string, string>>({});
  const [domainOptions, setDomainOptions] = useState<Record<string, Record<string, unknown>[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<{ rows: Record<string, unknown>[]; pageCount: number } | null>(
    null,
  );
  const [error, setError] = useState(false);

  const domainFilters = useMemo<DomainFilter[]>(() => {
    if (!isCmsContent) return [];
    if (!definition) return [];
    return (
      [
        { key: 'categoryId', labelKey: 'filter.category' },
        { key: 'industryId', labelKey: 'filter.industry' },
        { key: 'serviceId', labelKey: 'filter.service' },
      ] as const
    ).flatMap(({ key, labelKey }) => {
      const relation =
        definition.relations[key] ??
        Object.values(definition.relations).find((item) => item.many && item.foreignKey === key);
      return relation ? [{ key, labelKey, resource: relation.resource }] : [];
    });
  }, [definition, isCmsContent]);
  const statusOptions =
    kind === 'lead'
      ? ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
      : kind === 'user'
        ? ['active', 'invited', 'suspended']
        : isCmsContent && resource !== 'tags'
          ? ['draft', 'review', 'published', 'archived']
          : [];
  const domainQuery = useMemo(
    () =>
      Object.entries(domainValues)
        .filter(([, value]) => value)
        .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
        .join(''),
    [domainValues],
  );
  const query = useMemo(
    () =>
      `?page=${page}&pageSize=20${q ? `&q=${encodeURIComponent(q)}` : ''}${statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : ''}${source ? `&source=${source}` : ''}${isCmsContent ? `${sort ? `&sort=${sort}` : ''}${featured ? `&featured=${featured}` : ''}${completeness && locale ? `&completeness=${completeness}&locale=${encodeURIComponent(locale)}` : ''}${domainQuery}` : ''}${kind === 'lead' || kind === 'user' ? `&sort=${encodeURIComponent(sort)}` : ''}`,
    [
      page,
      q,
      statusFilter,
      source,
      sort,
      featured,
      completeness,
      locale,
      isCmsContent,
      kind,
      domainQuery,
    ],
  );

  useEffect(() => {
    if (isCmsContent)
      void api<Array<{ code: string; nativeName: string }>>('/admin/languages')
        .then(setLanguages)
        .catch(() => undefined);
  }, [isCmsContent]);

  useEffect(() => {
    setDomainValues({});
    setDomainOptions({});
    if (!domainFilters.length) return;
    void Promise.all(
      domainFilters.map(async (filter) => {
        try {
          const rows = await apiEnvelope<Record<string, unknown>>(
            `/admin/${filter.resource}?page=1&pageSize=100&sort=-updatedAt`,
          );
          return [filter.key, rows.data] as [typeof filter.key, Record<string, unknown>[]];
        } catch {
          return [filter.key, []] as [typeof filter.key, Record<string, unknown>[]];
        }
      }),
    ).then((entries) => {
      const optionsMap: Record<string, Record<string, unknown>[]> = {};
      for (const [filterKey, data] of entries) {
        optionsMap[filterKey] = data;
      }
      setDomainOptions(optionsMap);
    });
  }, [domainFilters]);

  useEffect(() => {
    setState(null);
    setError(false);
    void apiEnvelope<Record<string, unknown>>(`/admin/${resource}${query}`)
      .then((result) => setState({ rows: result.data, pageCount: result.meta.pageCount }))
      .catch(() => setError(true));
  }, [resource, query]);

  const handleSearch = (value: string) => {
    setQ(value);
    setPage(1);
  };

  const handleStatus = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const permissionDomain =
    (
      {
        'case-studies': 'case_studies',
        'team-members': 'team',
        'trust-metrics': 'trust_metrics',
        'service-categories': 'services',
      } as Record<string, string>
    )[resource] ?? resource;
  const createPermission =
    resource === 'users'
      ? 'users.manage'
      : resource === 'roles'
        ? 'roles.manage'
        : resource === 'languages'
          ? 'languages.manage'
          : resource === 'redirects'
            ? 'redirects.manage'
            : `${permissionDomain}.create`;
  const canCreate = !['lead', 'audit'].includes(kind) && can(createPermission);
  const canBulkArchive = isCmsContent && can(`${permissionDomain}.archive`);
  const advancedCount = [featured, completeness, locale, ...Object.values(domainValues)].filter(Boolean).length;
  const hasActiveFilters = Boolean(q || statusFilter || sort !== '-updatedAt' || advancedCount);
  function resetFilters() {
    setQ(''); setStatusFilter(''); setSort('-updatedAt'); setFeatured('');
    setCompleteness(''); setLocale(''); setDomainValues({}); setPage(1);
  }
  async function archiveSelected() {
    if (!selected.length || !confirm(`${t('action.archiveSelected')} (${formatNumber(selected.length)})`)) return;
    await Promise.all(
      selected.map((id) => api(`/admin/${resource}/${id}/archive`, { method: 'POST' })),
    );
    setSelected([]);
    setState(null);
    const result = await apiEnvelope<Record<string, unknown>>(`/admin/${resource}${query}`);
    setState({ rows: result.data, pageCount: result.meta.pageCount });
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{localizedTitle}</h1>
          <p>{t('filter.description')}</p>
        </div>
        {canCreate && (
          <Link className="gv-button" href={`${basePath}/new`}>
            {kind === 'user'
              ? t('action.inviteUser')
              : kind === 'role'
                ? t('action.createRole')
                : kind === 'language'
                  ? t('action.addLanguage')
                  : t('action.createRecord')}
          </Link>
        )}
      </div>

      <AdminFilterBar
        activeAdvancedCount={advancedCount}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        advanced={isCmsContent ? <>
          {definition?.fields.featured && <select className="gv-input admin-filter-bar__control" aria-label={t('filter.featured')} value={featured} onChange={(event) => { setFeatured(event.target.value); setPage(1); }}><option value="">{t('filter.allRecords')}</option><option value="true">{t('filter.featured')}</option><option value="false">{t('filter.notFeatured')}</option></select>}
          {domainFilters.map((filter) => <select key={filter.key} className="gv-input admin-filter-bar__control" aria-label={t(filter.labelKey)} value={domainValues[filter.key] ?? ''} onChange={(event) => { setDomainValues((previous) => ({ ...previous, [filter.key]: event.target.value })); setPage(1); }}>
            <option value="">{
              filter.key === 'categoryId' ? t('filter.allCategories') :
              filter.key === 'industryId' ? t('filter.allIndustries') :
              t('filter.allServices')
            }</option>
            {(domainOptions[filter.key] ?? []).map((row) => <option key={String(row.id)} value={String(row.id)}>{display(row, t('common.untitled'))}</option>)}</select>)}
          <select className="gv-input admin-filter-bar__control" aria-label={t('filter.anyLanguage')} value={locale} onChange={(event) => { setLocale(event.target.value); setPage(1); }}><option value="">{t('filter.anyLanguage')}</option>{languages.map((language) => <option key={language.code} value={language.code}>{language.nativeName}</option>)}</select>
          <select className="gv-input admin-filter-bar__control" aria-label={t('filter.anyCompleteness')} value={completeness} onChange={(event) => { setCompleteness(event.target.value); setPage(1); }} disabled={!locale}><option value="">{t('filter.anyCompleteness')}</option><option value="complete">{t('filter.complete')}</option><option value="partial">{t('filter.partial')}</option><option value="missing">{t('filter.missing')}</option></select>
        </> : undefined}
        actions={canBulkArchive && selected.length > 0 ? <Button onClick={() => void archiveSelected()}>{t('action.archive')} ({formatNumber(selected.length)})</Button> : undefined}
      >
        <input
          className="gv-input admin-filter-bar__search"
          type="search"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('action.search')}
        />
        {statusOptions.length > 0 && (
          <select
            className="gv-input admin-filter-bar__control"
            aria-label={t('filter.status')}
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value)}
          >
            <option value="">{t('filter.allStatuses')}</option>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}` as Parameters<typeof t>[0], value.replaceAll('_', ' '))}
              </option>
            ))}
          </select>
        )}
        {(isCmsContent || kind === 'lead' || kind === 'user') && (
          <select
            className="gv-input admin-filter-bar__control"
            aria-label={t('filter.sort')}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="-updatedAt">{t('filter.recentlyUpdated')}</option>
            <option value="updatedAt">{t('filter.oldestUpdated')}</option>
            <option value="-createdAt">{t('filter.newestCreated')}</option>
            <option value="createdAt">{t('filter.oldestCreated')}</option>
          </select>
        )}
      </AdminFilterBar>

      {error ? (
        <ErrorState
          title={t('state.loadRecordsFailed')}
          description={t('state.connectionHelp')}
        />
      ) : !state ? (
        <div className="panel">
          <Skeleton />
          <br />
          <Skeleton width="70%" />
        </div>
      ) : state.rows.length === 0 ? (
        <EmptyState
          title={t('state.noRecords')}
          description={t('state.noRecordsDescription')}
        />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {canBulkArchive && (
                    <th>
                      <input
                        type="checkbox"
                      aria-label={t('table.selectAll')}
                        checked={
                          Boolean(state.rows.length) &&
                          state.rows.every((row) => selected.includes(String(row.id)))
                        }
                        onChange={(event) =>
                          setSelected(
                            event.target.checked ? state.rows.map((row) => String(row.id)) : [],
                          )
                        }
                      />
                    </th>
                  )}
                  <th>{t('table.name')}</th>
                  <th>{t('table.statusType')}</th>
                  <th>{t('table.translations')}</th>
                  <th>{t('table.updated')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row) => (
                  <tr key={String(row.id)}>
                    {canBulkArchive && (
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`${t('table.selectRecord')}: ${display(row)}`}
                          checked={selected.includes(String(row.id))}
                          onChange={(event) =>
                            setSelected((previous) =>
                              event.target.checked
                                ? [...previous, String(row.id)]
                                : previous.filter((id) => id !== String(row.id)),
                            )
                          }
                        />
                      </td>
                    )}
                    <td>
                      <div className="cell-main">{display(row, t('common.untitled'))}</div>
                      <div className="cell-meta">
                        {String(row.email ?? row.entityType ?? row.id)}
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={
                          row.status === 'published' || row.status === 'active'
                            ? 'success'
                            : row.status === 'archived' || row.status === 'suspended'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {t(`status.${String(row.status ?? 'active')}` as Parameters<typeof t>[0], String(row.status ?? row.sourceType ?? row.action ?? 'active'))}
                      </Badge>
                    </td>
                    <td>{Array.isArray(row.translations) ? row.translations.length : '—'}</td>
                    <td>
                      {row.updatedAt || row.createdAt
                        ? formatDate(String(row.updatedAt ?? row.createdAt))
                        : '—'}
                    </td>
                    <td>
                      <Link className="text-link" href={`${basePath}/${String(row.id)}`}>
                        {kind === 'audit' ? t('action.view') : t('action.open')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageCount={state.pageCount || 1}
            onPage={setPage}
            previousLabel={t('action.previous')}
            nextLabel={t('action.next')}
            ariaLabel={t('pagination.label')}
          />
        </>
      )}
    </>
  );
}
