'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Media, MediaFolder } from '@gatevia/api-client';
import { Badge, EmptyState, ErrorState, Skeleton } from '@gatevia/ui';
import { api, apiEnvelope } from '@/lib/api';
import { AdminFilterBar } from './admin-filter-bar';
import { useAdminI18n } from './admin-locale-provider';

export type MediaBrowserView = 'grid' | 'list';

export function useMediaBrowser({ pageSize, initialStatus = '', mimePrefix }: { pageSize: number; initialStatus?: string; mimePrefix?: string }) {
  const { t } = useAdminI18n();
  const [rows, setRows] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [folderId, setFolderIdState] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, pageSize, total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    void api<MediaFolder[]>('/admin/media-folders').then((data) => setFolders(Array.isArray(data) ? data : [])).catch(() => setFolders([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedQ) query.set('q', debouncedQ);
    if (status) query.set('status', status);
    if (folderId) query.set('folderId', folderId);
    if (mimePrefix) query.set('mimePrefix', mimePrefix);
    setLoading(true); setError('');
    void apiEnvelope<Media>(`/admin/media?${query}`, { signal: controller.signal })
      .then((result) => { setRows(result.data); setMeta(result.meta); })
      .catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(reason instanceof Error ? reason.message : t('common.requestFailed') ?? 'Request failed'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, pageSize, debouncedQ, status, folderId, mimePrefix, reloadToken, t]);

  const setFolderId = useCallback((value: string | null) => { setFolderIdState(value); setPage(1); }, []);
  const search = useCallback((value: string) => { setQ(value); setPage(1); }, []);
  const changeStatus = useCallback((value: string) => { setStatus(value); setPage(1); }, []);
  const reset = useCallback(() => { setQ(''); setDebouncedQ(''); setStatus(initialStatus); setFolderIdState(null); setPage(1); }, [initialStatus]);
  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  const reloadFolders = useCallback(() => void api<MediaFolder[]>('/admin/media-folders').then(setFolders), []);
  return { rows, folders, q, status, folderId, page, meta, loading, error, setQ: search, setStatus: changeStatus, setFolderId, setPage, reset, reload, reloadFolders };
}

function statusTone(status: string): 'success' | 'danger' | 'neutral' | 'warning' {
  if (status === 'ready') return 'success';
  if (status === 'processing') return 'warning';
  if (status === 'archived' || status === 'failed') return 'danger';
  return 'neutral';
}

export function MediaBrowserTile({ row, selected, onSelect, onDoubleClick }: { row: Media; selected: boolean; onSelect: () => void; onDoubleClick?: () => void }) {
  const { t } = useAdminI18n();
  const thumb = row.variants?.find((variant) => variant.variantKey === 'thumbnail' || variant.variantKey === 'webp_thumb');
  const src = thumb?.url ?? row.url;
  return <button type="button" className="media-browser-tile" aria-pressed={selected} onClick={onSelect} onDoubleClick={onDoubleClick}>
    <span className="media-browser-tile__preview">{src && row.mimeType.startsWith('image/') ? (
      // Source thumbnails are already optimized media variants.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" />
    ) : <span aria-hidden="true" className="media-browser-tile__icon">{row.mimeType.startsWith('video/') ? '🎬' : row.mimeType === 'application/pdf' ? 'PDF' : '📄'}</span>}</span>
    <span className="media-browser-tile__body"><strong title={row.originalFilename}>{row.originalFilename}</strong><span className="cell-meta">{row.mimeType.split('/')[1]?.toUpperCase()} · <Badge tone={statusTone(row.status)}>{t(`status.${row.status}` as Parameters<typeof t>[0], row.status)}</Badge></span></span>
    {selected && <span className="media-browser-tile__check" aria-label={t('media.selected')}>✓</span>}
  </button>;
}

export function MediaFolderNavigation({ folders, folderId, onFolder }: { folders: MediaFolder[]; folderId: string | null; onFolder: (id: string | null) => void }) {
  const { t } = useAdminI18n();
  return <aside className="media-browser-folders" aria-label={t('media.folders')}><h2>{t('media.folders')}</h2><select className="gv-input media-browser-folders__select" value={folderId ?? ''} onChange={(event) => onFolder(event.target.value || null)}><option value="">{t('media.allFiles')}</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><div className="media-browser-folders__list"><button type="button" aria-current={!folderId ? 'page' : undefined} onClick={() => onFolder(null)}>▣ {t('media.allFiles')}</button>{folders.map((folder) => <button type="button" key={folder.id} aria-current={folderId === folder.id ? 'page' : undefined} onClick={() => onFolder(folder.id)}>📁 {folder.name}</button>)}</div></aside>;
}

export function MediaBrowserPagination({ page, pageCount, total, onPage }: { page: number; pageCount: number; total: number; onPage: (page: number) => void }) {
  const { t, formatNumber } = useAdminI18n();
  return <footer className="media-browser-pagination"><span>{formatNumber(total)} {t('media.assets')}</span><div><button type="button" className="text-link" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ {t('action.previous')}</button><span>{t('media.page')} {formatNumber(page)} / {formatNumber(Math.max(pageCount, 1))}</span><button type="button" className="text-link" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>{t('action.next')} ›</button></div></footer>;
}

export function MediaBrowser({ selectedId, onSelected, onConfirm, mimePrefix, pageSize = 24 }: { selectedId?: string; onSelected: (row: Media) => void; onConfirm?: (row: Media) => void; mimePrefix?: string; pageSize?: number }) {
  const { t } = useAdminI18n();
  const browser = useMediaBrowser({ pageSize, initialStatus: 'ready', ...(mimePrefix ? { mimePrefix } : {}) });
  const [view, setView] = useState<MediaBrowserView>('grid');
  return <div className="media-browser-layout"><MediaFolderNavigation folders={browser.folders} folderId={browser.folderId} onFolder={browser.setFolderId}/><div className="media-browser-main"><AdminFilterBar hasActiveFilters={Boolean(browser.q || browser.folderId)} onReset={browser.reset} actions={<div className="media-browser-view-toggle"><button type="button" className="text-link" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>{t('media.grid')}</button><button type="button" className="text-link" aria-pressed={view === 'list'} onClick={() => setView('list')}>{t('media.list')}</button></div>}><input className="gv-input admin-filter-bar__search" type="search" value={browser.q} onChange={(event) => browser.setQ(event.target.value)} placeholder={t('media.search')}/></AdminFilterBar>{browser.error ? <ErrorState title={t('media.error')} description={browser.error}/> : browser.loading ? <div className="panel"><Skeleton/><br/><Skeleton width="70%"/></div> : browser.rows.length === 0 ? <EmptyState title={t('media.noMedia')} description={t('media.noMediaDescription')}/> : view === 'grid' ? <div className="media-browser-grid">{browser.rows.map((row) => <MediaBrowserTile key={row.id} row={row} selected={row.id === selectedId} onSelect={() => onSelected(row)} onDoubleClick={() => onConfirm?.(row)}/>)}</div> : <div className="media-browser-list">{browser.rows.map((row) => <MediaBrowserTile key={row.id} row={row} selected={row.id === selectedId} onSelect={() => onSelected(row)} onDoubleClick={() => onConfirm?.(row)}/>)}</div>}<MediaBrowserPagination page={browser.page} pageCount={browser.meta.pageCount} total={browser.meta.total} onPage={browser.setPage}/></div></div>;
}
