'use client';
import { useEffect, useState } from 'react';
import type { Redirect } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';

export function RedirectEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const { can } = useAdminAuth();
  const canManage = can('redirects.manage');
  const [redirect, setRedirect] = useState<Partial<Redirect>>({
    statusCode: 301,
    active: true,
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
    if (
      redirect.sourcePath &&
      redirect.destinationPath &&
      redirect.sourcePath === redirect.destinationPath
    ) {
      setMessage('Source and destination cannot be the same (redirect loop).');
      setBusy(false);
      return;
    }
    try {
      if (id) {
        await api(`/admin/redirects/${id}`, { method: 'PATCH', body: JSON.stringify(redirect) });
        setMessage('Redirect updated.');
      } else {
        const saved = await api<Redirect>('/admin/redirects', {
          method: 'POST',
          body: JSON.stringify(redirect),
        });
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
    await api(`/admin/redirects/${id}/archive`, { method: 'POST' });
    setRedirect((r) => ({ ...r, active: false }));
    setMessage('Redirect archived.');
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit Redirect' : 'Create Redirect'}</h1>
          <p>Map a source path to a destination URL. Avoid redirect loops.</p>
        </div>
        {canManage && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>
              Save redirect
            </Button>
            {id && redirect.active && (
              <button className="text-link" onClick={archive}>
                Archive
              </button>
            )}
          </div>
        )}
      </div>

      <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="editor">
          <div className="editor-main">
            <section className="panel">
              <div className="field-stack">
                <Field label="Source path (e.g. /old-page)">
                  <Input
                    dir="ltr"
                    value={redirect.sourcePath ?? ''}
                    onChange={(e) => setRedirect((r) => ({ ...r, sourcePath: e.target.value }))}
                    required
                    placeholder="/old-path"
                  />
                </Field>
                <Field label="Destination URL or path">
                  <Input
                    dir="ltr"
                    value={redirect.destinationPath ?? ''}
                    onChange={(e) =>
                      setRedirect((r) => ({ ...r, destinationPath: e.target.value }))
                    }
                    required
                    placeholder="/new-path or https://..."
                  />
                </Field>
                <Field label="HTTP status code">
                  <select
                    className="gv-input"
                    value={redirect.statusCode ?? 301}
                    onChange={(e) =>
                      setRedirect((r) => ({
                        ...r,
                        statusCode: Number(e.target.value) as Redirect['statusCode'],
                      }))
                    }
                  >
                    <option value={301}>301 — Moved Permanently</option>
                    <option value={302}>302 — Found (Temporary)</option>
                    <option value={307}>307 — Temporary Redirect</option>
                    <option value={308}>308 — Permanent Redirect</option>
                  </select>
                </Field>
                <Field label="Locale (optional)">
                  <Input
                    dir="ltr"
                    value={redirect.locale ?? ''}
                    onChange={(e) =>
                      setRedirect((r) => {
                        const next = { ...r };
                        if (e.target.value) {
                          next.locale = e.target.value;
                        } else {
                          delete next.locale;
                        }
                        return next;
                      })
                    }
                    placeholder="e.g. en, ar-SA"
                  />
                </Field>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(redirect.active)}
                      onChange={(e) => setRedirect((r) => ({ ...r, active: e.target.checked }))}
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
              <Badge tone={redirect.active ? 'success' : 'neutral'}>
                {redirect.active ? 'Active' : 'Inactive'}
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
      </fieldset>
    </>
  );
}
