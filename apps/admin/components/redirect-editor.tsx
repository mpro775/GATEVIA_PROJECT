'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';

interface Redirect {
  id: string;
  source: string;
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  note?: string;
}

export function RedirectEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const [redirect, setRedirect] = useState<Partial<Redirect>>({
    statusCode: 301,
    isActive: true,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      void api<Redirect>(`/admin/redirects/${id}`).then(setRedirect);
    }
  }, [id]);

  async function save() {
    setBusy(true);
    setMessage('');
    // Basic loop / collision guard
    if (redirect.source && redirect.destination && redirect.source === redirect.destination) {
      setMessage('Source and destination cannot be the same (redirect loop).');
      setBusy(false);
      return;
    }
    try {
      if (id) {
        await api(`/admin/redirects/${id}`, { method: 'PATCH', body: JSON.stringify(redirect) });
        setMessage('Redirect updated.');
      } else {
        const saved = await api<Redirect>('/admin/redirects', { method: 'POST', body: JSON.stringify(redirect) });
        setMessage('Redirect created.');
        router.replace(`${returnPath}/${saved.id}`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!id || !confirm('Archive this redirect?')) return;
    await api(`/admin/redirects/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
    setRedirect((r) => ({ ...r, isActive: false }));
    setMessage('Redirect archived.');
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit Redirect' : 'Create Redirect'}</h1>
          <p>Map a source path to a destination URL. Avoid redirect loops.</p>
        </div>
        <div className="toolbar">
          <Button disabled={busy} onClick={save}>Save redirect</Button>
          {id && redirect.isActive && (
            <button className="text-link" onClick={archive}>Archive</button>
          )}
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          <section className="panel">
            <div className="field-stack">
              <Field label="Source path (e.g. /old-page)">
                <Input
                  dir="ltr"
                  value={redirect.source ?? ''}
                  onChange={(e) => setRedirect((r) => ({ ...r, source: e.target.value }))}
                  required
                  placeholder="/old-path"
                />
              </Field>
              <Field label="Destination URL or path">
                <Input
                  dir="ltr"
                  value={redirect.destination ?? ''}
                  onChange={(e) => setRedirect((r) => ({ ...r, destination: e.target.value }))}
                  required
                  placeholder="/new-path or https://..."
                />
              </Field>
              <Field label="HTTP status code">
                <select
                  className="gv-input"
                  value={redirect.statusCode ?? 301}
                  onChange={(e) => setRedirect((r) => ({ ...r, statusCode: Number(e.target.value) as Redirect['statusCode'] }))}
                >
                  <option value={301}>301 — Moved Permanently</option>
                  <option value={302}>302 — Found (Temporary)</option>
                  <option value={307}>307 — Temporary Redirect</option>
                  <option value={308}>308 — Permanent Redirect</option>
                </select>
              </Field>
              <Field label="Internal note (optional)">
                <Input
                  value={redirect.note ?? ''}
                  onChange={(e) => setRedirect((r) => ({ ...r, note: e.target.value }))}
                  placeholder="Reason for this redirect"
                />
              </Field>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(redirect.isActive)}
                    onChange={(e) => setRedirect((r) => ({ ...r, isActive: e.target.checked }))}
                  />{' '}
                  Active (redirect is applied on the public site)
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Status</h2>
            <Badge tone={redirect.isActive ? 'success' : 'neutral'}>
              {redirect.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {redirect.statusCode && (
              <p className="cell-meta" style={{ marginBlockStart: '.5rem' }}>
                HTTP {redirect.statusCode}
              </p>
            )}
          </section>
          {message && (
            <div
              className={`form-status${message.includes('loop') || message.includes('failed') ? ' form-status--error' : ''}`}
              role="status"
            >
              {message}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
