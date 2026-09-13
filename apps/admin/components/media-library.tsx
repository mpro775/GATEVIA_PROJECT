'use client';
import { useEffect, useRef, useState } from 'react';
import type {
  Language,
  Media as MediaRow,
  MediaUsage as Usage,
  UploadSession,
} from '@gatevia/api-client';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Skeleton,
  Textarea,
} from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';
import { AdminFilterBar } from './admin-filter-bar';
import { MediaBrowserPagination, MediaBrowserTile, MediaFolderNavigation, useMediaBrowser } from './media-browser';

type DrawerTab = 'meta' | 'translations' | 'variants' | 'usages';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: string | number): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function statusTone(status: string): 'success' | 'danger' | 'neutral' | 'warning' {
  if (status === 'ready') return 'success';
  if (status === 'processing') return 'warning';
  if (status === 'archived' || status === 'failed') return 'danger';
  return 'neutral';
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function MediaDrawer({
  row,
  onClose,
  onRefresh,
  onArchive,
  canUpdate,
  canArchive,
}: {
  row: MediaRow;
  onClose: () => void;
  onRefresh: () => void;
  onArchive: () => void;
  canUpdate: boolean;
  canArchive: boolean;
}) {
  const { t, formatDate, formatNumber } = useAdminI18n();
  const [tab, setTab] = useState<DrawerTab>('meta');
  const [usages, setUsages] = useState<Usage[] | null>(null);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [translations, setTranslations] = useState<
    Record<string, { title: string; altText: string; caption: string; decorative: boolean }>
  >(
    Object.fromEntries(
      (row.translations ?? []).map((t) => [
        t.locale,
        {
          title: t.title ?? '',
          altText: t.altText ?? '',
          caption: t.caption ?? '',
          decorative: t.decorative ?? false,
        },
      ]),
    ),
  );
  const [transLocale, setTransLocale] = useState('en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const replaceRef = useRef<HTMLInputElement>(null);

  // Load usages when tab is opened
  useEffect(() => {
    if (tab === 'usages' && usages === null) {
      setUsagesLoading(true);
      void api<Usage[]>(`/admin/media/${row.id}/usages`)
        .then((data) => setUsages(Array.isArray(data) ? data : []))
        .catch(() => setUsages([]))
        .finally(() => setUsagesLoading(false));
    }
  }, [tab, row.id, usages]);

  useEffect(() => {
    void api<Language[]>('/admin/languages')
      .then((items) => {
        const active = items.filter((item) => item.isActive);
        setLanguages(active);
        setTransLocale((current) =>
          active.some((item) => item.code === current)
            ? current
            : (active.find((item) => item.isDefault)?.code ?? active[0]?.code ?? current),
        );
      })
      .catch(() =>
        setLanguages(
          (row.translations ?? []).map((item, index) => ({
            id: `fallback-${item.locale}`,
            code: item.locale,
            name: item.locale,
            nativeName: item.locale,
            direction: 'ltr',
            isActive: true,
            isDefault: false,
            sortOrder: index,
          })),
        ),
      );
  }, [row.translations]);

  const currentTrans = translations[transLocale] ?? {
    title: '',
    altText: '',
    caption: '',
    decorative: false,
  };

  function updateTrans(field: string, value: string | boolean) {
    setTranslations((prev) => ({
      ...prev,
      [transLocale]: {
        ...(prev[transLocale] ?? { title: '', altText: '', caption: '', decorative: false }),
        [field]: value,
      },
    }));
  }

  async function saveTranslations() {
    setBusy(true);
    setMessage('');
    try {
      await api(`/admin/media/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ translations }),
      });
      setMessage(t('media.saved'));
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('media.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function triggerReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const session = await api<UploadSession>(`/admin/media/${row.id}/replace-session`, {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
      });
      const res = await fetch(session.url, { method: 'PUT', headers: session.headers, body: file });
      if (!res.ok) throw new Error(t('media.uploadFailed') ?? 'Upload failed');
      await api('/admin/media/finalize', {
        method: 'POST',
        body: JSON.stringify({ uploadToken: session.uploadToken }),
      });
      setMessage(t('media.replaced') ?? 'File replaced. Processing…');
      onRefresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : (t('media.replaceFailed') ?? 'Replace failed.'));
    } finally {
      setBusy(false);
      if (replaceRef.current) replaceRef.current.value = '';
    }
  }

  async function retryProcessing() {
    setBusy(true);
    setMessage('');
    try {
      await api(`/admin/media/${row.id}/retry`, { method: 'POST' });
      setMessage(t('media.retryQueued'));
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('media.retryFailed'));
    } finally {
      setBusy(false);
    }
  }

  const thumb = row.variants?.find(
    (v) => v.variantKey === 'thumbnail' || v.variantKey === 'webp_thumb',
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0 0 0 auto',
        width: 'min(480px, 100vw)',
        background: 'var(--color-bg-surface)',
        borderInlineStart: '1px solid var(--color-border-default)',
        overflowY: 'auto',
        zIndex: 50,
        padding: '1.2rem',
        boxShadow: '-4px 0 24px rgba(0,0,0,.18)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('media.detail')}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBlockEnd: '1rem',
        }}
      >
        <strong style={{ fontSize: '1rem' }}>{t('media.detail')}</strong>
        <button
          className="text-link"
          style={{ padding: '.3rem .6rem', minHeight: 'unset' }}
          onClick={onClose}
        >
          ✕ {t('action.close')}
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          borderRadius: '.55rem',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBlockEnd: '1rem',
        }}
      >
        {thumb?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb.url}
            alt={row.originalFilename}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: '3rem' }}>
            {isImage(row.mimeType) ? '🖼️' : row.mimeType.startsWith('video/') ? '🎬' : '📄'}
          </span>
        )}
      </div>

      {/* Status badge + actions */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBlockEnd: '1rem' }}>
        <Badge tone={statusTone(row.status)}>{t(`status.${row.status}` as Parameters<typeof t>[0], row.status)}</Badge>
        {canUpdate && row.status === 'failed' && (
          <button
            className="text-link"
            style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.85rem' }}
            onClick={retryProcessing}
            disabled={busy}
          >
            {t('media.retryProcessing')}
          </button>
        )}
        {canArchive && row.status !== 'archived' && (
          <button
            className="text-link"
            style={{
              padding: '.2rem .5rem',
              minHeight: 'unset',
              fontSize: '.85rem',
              color: 'var(--color-danger)',
            }}
            onClick={() => {
              if (
                confirm(
                  t('media.archiveConfirm'),
                )
              )
                onArchive();
            }}
          >
            {t('action.archive')}
          </button>
        )}
        {canUpdate && (
          <label
            className="text-link"
            style={{
              padding: '.2rem .5rem',
              minHeight: 'unset',
              fontSize: '.85rem',
              cursor: 'pointer',
            }}
          >
            {t('media.replaceFile')}
            <input
              ref={replaceRef}
              type="file"
              hidden
              onChange={triggerReplace}
              accept="image/*,application/pdf,video/mp4,video/webm"
            />
          </label>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" style={{ marginBlockEnd: '.8rem' }}>
        {(['meta', 'translations', 'variants', 'usages'] as const).map((tabKey) => (
          <button
            key={tabKey}
            role="tab"
            className="tab"
            aria-selected={tab === tabKey}
            onClick={() => setTab(tabKey)}
            style={{ textTransform: 'capitalize' }}
          >
            {t(`media.${tabKey}` as Parameters<typeof t>[0], tabKey)}
          </button>
        ))}
      </div>

      {/* Tab: meta */}
      {tab === 'meta' && (
        <dl style={{ fontSize: '.88rem' }}>
          {[
            [t('media.filename'), row.originalFilename],
            [t('media.mimeType'), row.mimeType],
            [t('media.size'), formatBytes(row.sizeBytes)],
            [t('media.folder'), row.folder?.name ?? '—'],
            [t('media.uploaded'), row.createdAt ? formatDate(row.createdAt) : '—'],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ marginBlockEnd: '.5rem' }}>
              <dt style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '.78rem' }}>
                {String(label)}
              </dt>
              <dd style={{ margin: 0 }}>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Tab: translations (alt text, caption, title) */}
      {tab === 'translations' && (
        <div className="field-stack">
          <div className="tabs" role="tablist">
            {languages.map((language) => (
              <button
                key={language.code}
                role="tab"
                className="tab"
                aria-selected={transLocale === language.code}
                onClick={() => setTransLocale(language.code)}
              >
                {language.nativeName}
              </button>
            ))}
          </div>
          <fieldset disabled={!canUpdate} style={{ border: 0, padding: 0, margin: 0 }}>
            <Field label={t('media.displayTitle')}>
              <Input
                value={currentTrans.title}
                onChange={(e) => updateTrans('title', e.target.value)}
              />
            </Field>
            <Field label={t('media.altText')}>
              <Textarea
                value={currentTrans.altText}
                onChange={(e) => updateTrans('altText', e.target.value)}
                maxLength={500}
              />
            </Field>
            <Field label={t('media.caption')}>
              <Textarea
                value={currentTrans.caption}
                onChange={(e) => updateTrans('caption', e.target.value)}
                maxLength={1000}
              />
            </Field>
            <label>
              <input
                type="checkbox"
                checked={currentTrans.decorative}
                onChange={(e) => updateTrans('decorative', e.target.checked)}
              />{' '}
              {t('media.decorative')}
            </label>
            {canUpdate && (
              <Button disabled={busy} onClick={saveTranslations}>
                {t('media.saveTranslations')}
              </Button>
            )}
          </fieldset>
          {message && (
            <div className="form-status" role="status">
              {message}
            </div>
          )}
        </div>
      )}

      {/* Tab: variants */}
      {tab === 'variants' && (
        <>
          {(row.variants ?? []).length === 0 ? (
            <EmptyState
              title={t('media.noVariants')}
              description={t('media.noVariantsDescription')}
            />
          ) : (
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {(row.variants ?? []).map((v, i) => (
                <div key={i} className="section-row" style={{ fontSize: '.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{v.variantKey}</span>
                  {v.width && v.height && (
                    <span className="cell-meta">
                      {v.width}×{v.height}
                    </span>
                  )}
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                      style={{ fontSize: '.8rem', padding: '.1rem .3rem', minHeight: 'unset' }}
                    >
                      {t('action.view')}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: usages */}
      {tab === 'usages' && (
        <>
          {usagesLoading ? (
            <div>
              <Skeleton />
              <br />
              <Skeleton width="60%" />
            </div>
          ) : usages === null || usages.length === 0 ? (
            <EmptyState
              title={t('media.noUsages')}
              description={t('media.noUsagesDescription')}
            />
          ) : (
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <p className="cell-meta">
                {formatNumber(usages.length)} {t('media.blockingReferences') ?? 'blocking reference(s) found. Remove these usages before archiving this media.'}
              </p>
              {usages.map((usage, i) => (
                <div key={i} className="section-row" style={{ fontSize: '.85rem' }}>
                  <Badge tone="neutral">{usage.type}</Badge>
                  <span>{usage.label ?? usage.id}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main MediaLibrary ────────────────────────────────────────────────────────

export function MediaLibrary({
  selectMode = false,
  onSelect,
}: {
  selectMode?: boolean;
  onSelect?: (id: string) => void;
}) {
  const { can } = useAdminAuth();
  const { t } = useAdminI18n();
  const canUpload = can('media.upload');
  const canUpdate = can('media.update');
  const canArchive = can('media.archive');
  const browser = useMediaBrowser({ pageSize: 40 });
  const { rows, folders, loading, q, status: statusFilter, folderId, page, meta } = browser;
  const [actionError, setError] = useState('');
  const error = actionError || browser.error;
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<MediaRow | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [newFolderName, setNewFolderName] = useState('');

  const load = browser.reload;
  const loadFolders = browser.reloadFolders;
  const setPage = browser.setPage;
  const setQ = browser.setQ;
  const setStatusFilter = browser.setStatus;
  const setFolderId = browser.setFolderId;

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setBusy(true);
    setError('');
    for (const file of files) {
      try {
        const session = await api<UploadSession>('/admin/media/upload-session', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            folderId,
          }),
        });
        const res = await fetch(session.url, {
          method: 'PUT',
          headers: session.headers,
          body: file,
        });
        if (!res.ok) throw new Error(t('media.uploadFailed') ?? 'Object upload failed');
        await api('/admin/media/finalize', {
          method: 'POST',
          body: JSON.stringify({ uploadToken: session.uploadToken, folderId }),
        });
      } catch {
        setError((t('media.uploadFailedFor') ?? `Upload failed for {fileName}.`).replace('{fileName}', file.name));
      }
    }
    setBusy(false);
    event.target.value = '';
    void load();
  }

  async function archive(id: string) {
    try {
      await api(`/admin/media/${id}/archive`, { method: 'POST' });
      setSelected(null);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : (t('media.archiveFailed') ?? 'Archive failed.'));
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      await api('/admin/media-folders', {
        method: 'POST',
        body: JSON.stringify({ name: newFolderName.trim(), parentId: folderId || undefined }),
      });
      setNewFolderName('');
      void loadFolders();
    } catch {
      setError(t('media.createFolderFailed') ?? 'Failed to create folder.');
    }
  }

  function handleSelect(row: MediaRow) {
    if (selectMode && onSelect) {
      onSelect(row.id);
    } else {
      setSelected((prev) => (prev?.id === row.id ? null : row));
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{t('media.title')}</h1>
          <p>{t('media.description')}</p>
        </div>
        {canUpload && (
          <div className="toolbar">
            <label className="gv-button">
              {busy ? t('action.uploading') : t('action.upload')}
              <input
                type="file"
                multiple
                hidden
                disabled={busy}
                accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,video/mp4,video/webm"
                onChange={(e) => void upload(e)}
              />
            </label>
          </div>
        )}
      </div>

      <div className="media-browser-layout">
        {/* Folder sidebar */}
        <div><MediaFolderNavigation folders={folders} folderId={folderId} onFolder={setFolderId}/>
          {canUpdate && (
            <div className="media-browser-new-folder">
              <input
                className="gv-input"
                style={{ flex: 1, fontSize: '.8rem', padding: '.3rem .5rem' }}
                placeholder={t('media.newFolder')}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void createFolder();
                }}
              />
              <button
                className="text-link"
                style={{ padding: '.3rem .5rem', minHeight: 'unset' }}
                onClick={createFolder}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div>
          {/* Toolbar */}
          <AdminFilterBar hasActiveFilters={Boolean(q || statusFilter)} onReset={browser.reset} actions={
            <div className="media-browser-view-toggle">
              <button className="text-link" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>{t('media.grid')}</button>
              <button className="text-link" aria-pressed={view === 'list'} onClick={() => setView('list')}>{t('media.list')}</button>
            </div>
          }>
            <input
              className="gv-input admin-filter-bar__search"
              type="search"
              placeholder={t('media.search')}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="gv-input admin-filter-bar__control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label={t('filter.status')}
            >
              <option value="">{t('filter.allStatuses')}</option>
              <option value="ready">{t('status.ready')}</option>
              <option value="processing">{t('status.processing')}</option>
              <option value="failed">{t('status.failed')}</option>
              <option value="archived">{t('status.archived')}</option>
            </select>
          </AdminFilterBar>

          {error && <ErrorState title={t('media.error')} description={error} />}

          {loading ? (
            <div className="panel">
              <Skeleton />
              <br />
              <Skeleton width="70%" />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title={t('media.noMedia')} description={t('media.noMediaDescription')} />
          ) : view === 'grid' ? (
            <div className="media-browser-grid">
              {rows.map((row) => (
                <MediaBrowserTile
                  key={row.id}
                  row={row}
                  selected={selected?.id === row.id}
                  onSelect={() => handleSelect(row)}
                />
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('media.filename')}</th>
                    <th>{t('media.type')}</th>
                    <th>{t('media.size')}</th>
                    <th>{t('media.status')}</th>
                    <th>{t('media.folder')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelect(row)}
                    >
                      <td>
                        <div className="cell-main">{row.originalFilename}</div>
                      </td>
                      <td>
                        <span className="cell-meta">{row.mimeType}</span>
                      </td>
                      <td>{formatBytes(row.sizeBytes)}</td>
                      <td>
                        <Badge tone={statusTone(row.status)}>{t(`status.${row.status}` as Parameters<typeof t>[0], row.status)}</Badge>
                      </td>
                      <td>{row.folder?.name ?? '—'}</td>
                      <td>
                        <button
                          className="text-link"
                          style={{ padding: '.2rem .4rem', minHeight: 'unset' }}
                        >
                          {t('action.details')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <MediaBrowserPagination page={page} pageCount={meta.pageCount} total={meta.total} onPage={setPage}/>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 49 }}
            onClick={() => setSelected(null)}
          />
          <MediaDrawer
            row={selected}
            onClose={() => setSelected(null)}
            onRefresh={() => void load()}
            onArchive={() => void archive(selected.id)}
            canUpdate={canUpdate}
            canArchive={canArchive}
          />
        </>
      )}
    </>
  );
}
