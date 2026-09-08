'use client';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, EmptyState, ErrorState, Field, Input, Skeleton, Textarea } from '@gatevia/ui';
import { api, apiEnvelope } from '@/lib/api';

interface MediaRow {
  id: string;
  originalFilename: string;
  mimeType: string;
  status: string;
  sizeBytes: string | number;
  folderId?: string | null;
  folder?: { id: string; name: string } | null;
  translations?: Array<{ locale: string; title?: string; altText?: string; caption?: string; decorative?: boolean }>;
  variants?: Array<{ variantKey: string; url?: string; width?: number; height?: number }>;
  createdAt?: string;
  uploadedById?: string;
}

interface Folder { id: string; name: string; parentId?: string | null }

type DrawerTab = 'meta' | 'translations' | 'variants' | 'usages';

interface Usage { type: string; id: string; label?: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: string | number): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function isImage(mime: string) { return mime.startsWith('image/'); }

function statusTone(status: string): 'success' | 'danger' | 'neutral' | 'info' {
  if (status === 'ready') return 'success';
  if (status === 'processing') return 'info';
  if (status === 'archived' || status === 'failed') return 'danger';
  return 'neutral';
}

// ─── Media Tile ───────────────────────────────────────────────────────────────

function MediaTile({ row, selected, onClick }: { row: MediaRow; selected: boolean; onClick: () => void }) {
  const thumb = row.variants?.find((v) => v.variantKey === 'thumbnail' || v.variantKey === 'webp_thumb');
  return (
    <article
      className="media-tile"
      onClick={onClick}
      style={{
        border: selected ? '2px solid var(--color-accent)' : '2px solid var(--color-border-default)',
        borderRadius: '.55rem',
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--color-bg-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {thumb?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb.url}
            alt={row.originalFilename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <span style={{ fontSize: '2rem', color: 'var(--color-text-muted)' }}>
            {isImage(row.mimeType) ? '🖼️' : row.mimeType.startsWith('video/') ? '🎬' : '📄'}
          </span>
        )}
      </div>
      <div style={{ padding: '.5rem .6rem', flex: 1 }}>
        <div style={{ fontSize: '.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.originalFilename}
        </div>
        <div className="cell-meta" style={{ fontSize: '.72rem', marginBlockStart: '.2rem' }}>
          {formatBytes(row.sizeBytes)} · <Badge tone={statusTone(row.status)}>{row.status}</Badge>
        </div>
      </div>
    </article>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function MediaDrawer({
  row,
  onClose,
  onRefresh,
  onArchive,
}: {
  row: MediaRow;
  onClose: () => void;
  onRefresh: () => void;
  onArchive: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>('meta');
  const [usages, setUsages] = useState<Usage[] | null>(null);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, { title: string; altText: string; caption: string; decorative: boolean }>>(
    Object.fromEntries(
      (row.translations ?? []).map((t) => [
        t.locale,
        { title: t.title ?? '', altText: t.altText ?? '', caption: t.caption ?? '', decorative: t.decorative ?? false },
      ]),
    ),
  );
  const [transLocale, setTransLocale] = useState('en');
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

  const currentTrans = translations[transLocale] ?? { title: '', altText: '', caption: '', decorative: false };

  function updateTrans(field: string, value: string | boolean) {
    setTranslations((prev) => ({
      ...prev,
      [transLocale]: { ...(prev[transLocale] ?? { title: '', altText: '', caption: '', decorative: false }), [field]: value },
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
      setMessage('Saved.');
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
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
      const session = await api<{ url: string; headers: Record<string, string>; uploadToken: string }>(
        `/admin/media/${row.id}/replace-session`,
        {
          method: 'POST',
          body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
        },
      );
      const res = await fetch(session.url, { method: 'PUT', headers: session.headers, body: file });
      if (!res.ok) throw new Error('Upload failed');
      await api('/admin/media/finalize', { method: 'POST', body: JSON.stringify({ uploadToken: session.uploadToken }) });
      setMessage('File replaced. Processing…');
      onRefresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Replace failed.');
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
      setMessage('Retry enqueued.');
      onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Retry failed.');
    } finally {
      setBusy(false);
    }
  }

  const thumb = row.variants?.find((v) => v.variantKey === 'thumbnail' || v.variantKey === 'webp_thumb');
  const LOCALES = ['en', 'ar-SA'];

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
      aria-label="Media detail"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: '1rem' }}>
        <strong style={{ fontSize: '1rem' }}>Media detail</strong>
        <button className="text-link" style={{ padding: '.3rem .6rem', minHeight: 'unset' }} onClick={onClose}>
          ✕ Close
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
          <img src={thumb.url} alt={row.originalFilename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '3rem' }}>
            {isImage(row.mimeType) ? '🖼️' : row.mimeType.startsWith('video/') ? '🎬' : '📄'}
          </span>
        )}
      </div>

      {/* Status badge + actions */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBlockEnd: '1rem' }}>
        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
        {row.status === 'failed' && (
          <button className="text-link" style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.85rem' }} onClick={retryProcessing} disabled={busy}>
            Retry processing
          </button>
        )}
        {row.status !== 'archived' && (
          <button
            className="text-link"
            style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.85rem', color: 'var(--color-danger)' }}
            onClick={() => {
              if (confirm('Archive this media? This may affect content referencing it.')) onArchive();
            }}
          >
            Archive
          </button>
        )}
        <label
          className="text-link"
          style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.85rem', cursor: 'pointer' }}
        >
          Replace file
          <input ref={replaceRef} type="file" hidden onChange={triggerReplace} accept="image/*,application/pdf,video/mp4,video/webm" />
        </label>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" style={{ marginBlockEnd: '.8rem' }}>
        {(['meta', 'translations', 'variants', 'usages'] as const).map((t) => (
          <button key={t} role="tab" className="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: meta */}
      {tab === 'meta' && (
        <dl style={{ fontSize: '.88rem' }}>
          {[
            ['Filename', row.originalFilename],
            ['MIME type', row.mimeType],
            ['Size', formatBytes(row.sizeBytes)],
            ['Folder', row.folder?.name ?? '—'],
            ['Uploaded', row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ marginBlockEnd: '.5rem' }}>
              <dt style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '.78rem' }}>{String(label)}</dt>
              <dd style={{ margin: 0 }}>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Tab: translations (alt text, caption, title) */}
      {tab === 'translations' && (
        <div className="field-stack">
          <div className="tabs" role="tablist">
            {LOCALES.map((lc) => (
              <button key={lc} role="tab" className="tab" aria-selected={transLocale === lc} onClick={() => setTransLocale(lc)}>
                {lc}
              </button>
            ))}
          </div>
          <Field label="Title (display name)">
            <Input value={currentTrans.title} onChange={(e) => updateTrans('title', e.target.value)} />
          </Field>
          <Field label="Alt text (accessibility)">
            <Textarea value={currentTrans.altText} onChange={(e) => updateTrans('altText', e.target.value)} maxLength={500} />
          </Field>
          <Field label="Caption">
            <Textarea value={currentTrans.caption} onChange={(e) => updateTrans('caption', e.target.value)} maxLength={1000} />
          </Field>
          <label>
            <input type="checkbox" checked={currentTrans.decorative} onChange={(e) => updateTrans('decorative', e.target.checked)} />{' '}
            Decorative (no alt text needed for screen readers)
          </label>
          <Button disabled={busy} onClick={saveTranslations}>Save translations</Button>
          {message && <div className="form-status" role="status">{message}</div>}
        </div>
      )}

      {/* Tab: variants */}
      {tab === 'variants' && (
        <>
          {(row.variants ?? []).length === 0 ? (
            <EmptyState title="No variants" description="Image variants are generated automatically after upload." />
          ) : (
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {(row.variants ?? []).map((v, i) => (
                <div key={i} className="section-row" style={{ fontSize: '.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{v.variantKey}</span>
                  {v.width && v.height && (
                    <span className="cell-meta">{v.width}×{v.height}</span>
                  )}
                  {v.url && (
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: '.8rem', padding: '.1rem .3rem', minHeight: 'unset' }}>
                      View
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
            <div><Skeleton /><br /><Skeleton width="60%" /></div>
          ) : usages === null || usages.length === 0 ? (
            <EmptyState title="No usages found" description="This media is not referenced by any content. It is safe to archive." />
          ) : (
            <div style={{ display: 'grid', gap: '.5rem' }}>
              <p className="cell-meta">{usages.length} reference(s) found — archiving will remove this media from those locations.</p>
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

export function MediaLibrary({ selectMode = false, onSelect }: { selectMode?: boolean; onSelect?: (id: string) => void }) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [newFolderName, setNewFolderName] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const query = [
        `page=${page}`,
        `pageSize=40`,
        q ? `q=${encodeURIComponent(q)}` : '',
        statusFilter ? `status=${encodeURIComponent(statusFilter)}` : '',
        folderId ? `folderId=${encodeURIComponent(folderId)}` : '',
      ].filter(Boolean).join('&');
      const result = await apiEnvelope<MediaRow>(`/admin/media?${query}`);
      setRows(result.data);
      setPageCount(result.meta.pageCount);
    } catch {
      setError('The Media Library could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    try {
      const result = await api<Folder[]>('/admin/media-folders');
      setFolders(Array.isArray(result) ? result : []);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    void load();
    void loadFolders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, statusFilter, folderId]);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setBusy(true);
    setError('');
    for (const file of files) {
      try {
        const session = await api<{ url: string; headers: Record<string, string>; uploadToken: string }>(
          '/admin/media/upload-session',
          { method: 'POST', body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size, folderId }) },
        );
        const res = await fetch(session.url, { method: 'PUT', headers: session.headers, body: file });
        if (!res.ok) throw new Error('Object upload failed');
        await api('/admin/media/finalize', {
          method: 'POST',
          body: JSON.stringify({ uploadToken: session.uploadToken, folderId }),
        });
      } catch {
        setError(`Upload failed for ${file.name}.`);
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
      setError(e instanceof Error ? e.message : 'Archive failed.');
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      await api('/admin/media-folders', { method: 'POST', body: JSON.stringify({ name: newFolderName.trim(), parentId: folderId || undefined }) });
      setNewFolderName('');
      void loadFolders();
    } catch { setError('Failed to create folder.'); }
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
          <h1>Media Library</h1>
          <p>Upload, organise and manage all approved media assets.</p>
        </div>
        <div className="toolbar">
          <label className="gv-button">
            {busy ? 'Uploading…' : 'Upload files'}
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* Folder sidebar */}
        <aside className="panel" style={{ position: 'sticky', top: '5rem' }}>
          <h2 style={{ marginBlockStart: 0 }}>Folders</h2>
          <button
            className={`text-link${!folderId ? ' nav-group a[aria-current]' : ''}`}
            style={{ display: 'block', width: '100%', textAlign: 'start', padding: '.4rem .5rem', borderRadius: '.35rem', background: !folderId ? 'var(--color-bg-elevated)' : 'transparent' }}
            onClick={() => { setFolderId(null); setPage(1); }}
          >
            All files
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              className="text-link"
              style={{ display: 'block', width: '100%', textAlign: 'start', padding: '.4rem .5rem', borderRadius: '.35rem', background: folderId === folder.id ? 'var(--color-bg-elevated)' : 'transparent' }}
              onClick={() => { setFolderId(folder.id); setPage(1); }}
            >
              📁 {folder.name}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '.3rem', marginBlockStart: '1rem' }}>
            <input
              className="gv-input"
              style={{ flex: 1, fontSize: '.8rem', padding: '.3rem .5rem' }}
              placeholder="New folder…"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void createFolder(); }}
            />
            <button className="text-link" style={{ padding: '.3rem .5rem', minHeight: 'unset' }} onClick={createFolder}>+</button>
          </div>
        </aside>

        {/* Main content */}
        <div>
          {/* Toolbar */}
          <div className="toolbar" style={{ marginBlockEnd: '1rem' }}>
            <input
              className="gv-input search-input"
              type="search"
              placeholder="Search files…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
            <select
              className="gv-input"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              aria-label="Status filter"
            >
              <option value="">All statuses</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="archived">Archived</option>
            </select>
            <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '.3rem' }}>
              <button className="text-link" style={{ padding: '.3rem .5rem', minHeight: 'unset', background: view === 'grid' ? 'var(--color-bg-elevated)' : '' }} onClick={() => setView('grid')}>Grid</button>
              <button className="text-link" style={{ padding: '.3rem .5rem', minHeight: 'unset', background: view === 'list' ? 'var(--color-bg-elevated)' : '' }} onClick={() => setView('list')}>List</button>
            </div>
          </div>

          {error && <ErrorState title="Media error" description={error} />}

          {loading ? (
            <div className="panel"><Skeleton /><br /><Skeleton width="70%" /></div>
          ) : rows.length === 0 ? (
            <EmptyState title="No media found" description="Upload the first approved asset." />
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '.8rem' }}>
              {rows.map((row) => (
                <MediaTile key={row.id} row={row} selected={selected?.id === row.id} onClick={() => handleSelect(row)} />
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Folder</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => handleSelect(row)}>
                      <td><div className="cell-main">{row.originalFilename}</div></td>
                      <td><span className="cell-meta">{row.mimeType}</span></td>
                      <td>{formatBytes(row.sizeBytes)}</td>
                      <td><Badge tone={statusTone(row.status)}>{row.status}</Badge></td>
                      <td>{row.folder?.name ?? '—'}</td>
                      <td><button className="text-link" style={{ padding: '.2rem .4rem', minHeight: 'unset' }}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBlockStart: '1rem' }}>
              <button className="text-link" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="cell-meta">Page {page} / {pageCount}</span>
              <button className="text-link" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
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
          />
        </>
      )}
    </>
  );
}
