'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';

interface LangData {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export function LanguageEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const [lang, setLang] = useState<Partial<LangData>>({
    direction: 'ltr',
    isDefault: false,
    isEnabled: true,
    sortOrder: 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      void api<LangData>(`/admin/languages/${id}`).then(setLang);
    }
  }, [id]);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      if (id) {
        await api(`/admin/languages/${id}`, { method: 'PATCH', body: JSON.stringify(lang) });
        setMessage('Language updated.');
      } else {
        const saved = await api<LangData>('/admin/languages', { method: 'POST', body: JSON.stringify(lang) });
        setMessage('Language created.');
        router.replace(`${returnPath}/${saved.id}`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit Language' : 'Add Language'}</h1>
          <p>Configure locale code, display names, text direction and enabled state.</p>
        </div>
        <div className="toolbar">
          <Button disabled={busy} onClick={save}>Save language</Button>
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          <section className="panel">
            <div className="field-stack">
              <Field label="Locale code (e.g. en, ar-SA)">
                <Input
                  dir="ltr"
                  value={lang.code ?? ''}
                  onChange={(e) => setLang((l) => ({ ...l, code: e.target.value }))}
                  required
                />
              </Field>
              <Field label="English name (e.g. Arabic)">
                <Input
                  value={lang.name ?? ''}
                  onChange={(e) => setLang((l) => ({ ...l, name: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Native name (e.g. العربية)">
                <Input
                  value={lang.nativeName ?? ''}
                  onChange={(e) => setLang((l) => ({ ...l, nativeName: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Text direction">
                <select
                  className="gv-input"
                  value={lang.direction ?? 'ltr'}
                  onChange={(e) => setLang((l) => ({ ...l, direction: e.target.value as 'ltr' | 'rtl' }))}
                >
                  <option value="ltr">Left-to-right (LTR)</option>
                  <option value="rtl">Right-to-left (RTL)</option>
                </select>
              </Field>
              <Field label="Sort order">
                <Input
                  type="number"
                  value={String(lang.sortOrder ?? 0)}
                  onChange={(e) => setLang((l) => ({ ...l, sortOrder: Number(e.target.value) }))}
                />
              </Field>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(lang.isEnabled)}
                    onChange={(e) => setLang((l) => ({ ...l, isEnabled: e.target.checked }))}
                  />{' '}
                  Enabled (visible on public site)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(lang.isDefault)}
                    onChange={(e) => setLang((l) => ({ ...l, isDefault: e.target.checked }))}
                  />{' '}
                  Default language{' '}
                  <span className="cell-meta">(only one language should be default)</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Status</h2>
            <Badge tone={lang.isEnabled ? 'success' : 'neutral'}>
              {lang.isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {lang.isDefault && (
              <div style={{ marginBlockStart: '.5rem' }}>
                <Badge tone="info">Default</Badge>
              </div>
            )}
          </section>
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div>
    </>
  );
}
