'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState, ErrorState, Pagination, Skeleton } from '@gatevia/ui';
import { cmsDefinitions } from '@gatevia/contracts';
import { apiEnvelope } from '@/lib/api';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';

interface Props {
  title: string;
  resource: string;
  basePath: string;
  kind?: 'content' | 'lead' | 'audit' | 'language' | 'user' | 'role';
  source?: 'contact' | 'consultation' | 'assessment';
}

const display = (row: Record<string, unknown>) => {
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
      'Untitled',
  );
};

type DomainFilter = {
  key: 'categoryId' | 'industryId' | 'serviceId';
  label: string;
  resource: string;
};

export function DataTable({ title, resource, basePath, kind = 'content', source }: Props) {
  const { can } = useAdminAuth();
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
        ['categoryId', 'Category'],
        ['industryId', 'Industry'],
        ['serviceId', 'Service'],
      ] as const
    ).flatMap(([key, label]) => {
      const relation =
        definition.relations[key] ??
        Object.values(definition.relations).find((item) => item.many && item.foreignKey === key);
      return relation ? [{ key, label, resource: relation.resource }] : [];
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
          return [filter.key, rows.data] as const;
        } catch {
          return [filter.key, []] as const;
        }
      }),
    ).then((entries) => setDomainOptions(Object.fromEntries(entries)));
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
  async function archiveSelected() {
    if (!selected.length || !confirm(`Archive ${selected.length} selected record(s)?`)) return;
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
          <h1>{title}</h1>
          <p>Search, filter and manage records with server-side pagination.</p>
        </div>
        {canCreate && (
          <Link className="gv-button" href={`${basePath}/new`}>
            {kind === 'user'
              ? 'Invite user'
              : kind === 'role'
                ? 'Create role'
                : kind === 'language'
                  ? 'Add language'
                  : 'Create record'}
          </Link>
        )}
      </div>

      <div className="toolbar">
        <input
          className="gv-input search-input"
          type="search"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search"
        />
        {statusOptions.length > 0 && (
          <select
            className="gv-input"
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        )}
        {(isCmsContent || kind === 'lead' || kind === 'user') && (
          <select
            className="gv-input"
            aria-label="Sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="-updatedAt">Recently updated</option>
            <option value="updatedAt">Oldest updated</option>
            <option value="-createdAt">Newest created</option>
            <option value="createdAt">Oldest created</option>
          </select>
        )}
        {isCmsContent && (
          <>
            {definition?.fields.featured && (
              <select
                className="gv-input"
                aria-label="Featured filter"
                value={featured}
                onChange={(event) => {
                  setFeatured(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All records</option>
                <option value="true">Featured</option>
                <option value="false">Not featured</option>
              </select>
            )}
            {domainFilters.map((filter) => (
              <select
                key={filter.key}
                className="gv-input"
                aria-label={`${filter.label} filter`}
                value={domainValues[filter.key] ?? ''}
                onChange={(event) => {
                  setDomainValues((previous) => ({
                    ...previous,
                    [filter.key]: event.target.value,
                  }));
                  setPage(1);
                }}
              >
                <option value="">All {filter.label.toLowerCase()} records</option>
                {(domainOptions[filter.key] ?? []).map((row) => (
                  <option key={String(row.id)} value={String(row.id)}>
                    {display(row)}
                  </option>
                ))}
              </select>
            ))}
            <select
              className="gv-input"
              aria-label="Translation locale"
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Any language</option>
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.nativeName}
                </option>
              ))}
            </select>
            <select
              className="gv-input"
              aria-label="Translation completeness"
              value={completeness}
              onChange={(event) => {
                setCompleteness(event.target.value);
                setPage(1);
              }}
              disabled={!locale}
            >
              <option value="">Any completeness</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing</option>
            </select>
          </>
        )}
        {canBulkArchive && selected.length > 0 && (
          <Button onClick={() => void archiveSelected()}>
            Archive selected ({selected.length})
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState
          title="Unable to load records"
          description="Check your connection or access permissions."
        />
      ) : !state ? (
        <div className="panel">
          <Skeleton />
          <br />
          <Skeleton width="70%" />
        </div>
      ) : state.rows.length === 0 ? (
        <EmptyState
          title="No records yet"
          description="Create the first approved record when content is ready."
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
                        aria-label="Select all visible records"
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
                  <th>Name</th>
                  <th>Status / Type</th>
                  <th>Translations</th>
                  <th>Updated</th>
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
                          aria-label={`Select ${display(row)}`}
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
                      <div className="cell-main">{display(row)}</div>
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
                        {String(row.status ?? row.sourceType ?? row.action ?? 'active')}
                      </Badge>
                    </td>
                    <td>{Array.isArray(row.translations) ? row.translations.length : '—'}</td>
                    <td>
                      {row.updatedAt || row.createdAt
                        ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                            new Date(String(row.updatedAt ?? row.createdAt)),
                          )
                        : '—'}
                    </td>
                    <td>
                      <Link className="text-link" href={`${basePath}/${String(row.id)}`}>
                        {kind === 'audit' ? 'View' : 'Open'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={state.pageCount || 1} onPage={setPage} />
        </>
      )}
    </>
  );
}
