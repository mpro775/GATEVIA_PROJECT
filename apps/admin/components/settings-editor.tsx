'use client';
import { useEffect, useState } from 'react';
import { Button, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';

interface Setting { id: string; key: string; value: any; category: string; isPublic: boolean; description?: string }

const SETTING_GROUPS = ['company', 'contact', 'seo', 'social', 'appearance', 'general'];

export function SettingsEditor() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [activeGroup, setActiveGroup] = useState(SETTING_GROUPS[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Setting[]>('/admin/settings?pageSize=200').then((rows) => {
      setSettings(Array.isArray(rows) ? rows : []);
    });
  }, []);

  function change(key: string, value: string) {
    let parsed = value;
    try {
      parsed = JSON.parse(value);
    } catch {
      // keep as string
    }
    setChanges((prev) => ({ ...prev, [key]: parsed }));
  }

  function effectiveValueString(setting: Setting) {
    const val = changes[setting.key] !== undefined ? changes[setting.key] : setting.value;
    return typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
  }

  async function save() {
    setBusy(true);
    setMessage('');
    const updates = Object.entries(changes);
    if (updates.length === 0) { setMessage('No changes to save.'); setBusy(false); return; }
    try {
      await Promise.all(
        updates.map(([key, value]) =>
          api(`/admin/settings/${encodeURIComponent(key)}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
        ),
      );
      setSettings((prev) => prev.map((s) => (changes[s.key] !== undefined ? { ...s, value: changes[s.key] } : s)));
      setChanges({});
      setMessage('Settings saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    const g = s.category ?? 'general';
    acc[g] = acc[g] ?? [];
    acc[g].push(s);
    return acc;
  }, {});

  const groups = [...new Set([...SETTING_GROUPS, ...Object.keys(grouped)])];
  const visibleSettings = grouped[activeGroup] ?? [];

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Global Settings</h1>
          <p>Manage site-wide configuration: company info, SEO defaults, social links and appearance.</p>
        </div>
        <div className="toolbar">
          <Button disabled={busy} onClick={save}>
            Save {Object.keys(changes).length > 0 ? `(${Object.keys(changes).length} changes)` : ''}
          </Button>
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          <section className="panel">
            <div className="tabs" role="tablist">
              {groups.map((g) => (
                <button
                  key={g}
                  role="tab"
                  className="tab"
                  aria-selected={activeGroup === g}
                  onClick={() => setActiveGroup(g)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="field-stack" style={{ marginBlockStart: '1rem' }}>
              {visibleSettings.length === 0 && (
                <p className="cell-meta">No settings in this group.</p>
              )}
              {visibleSettings.map((setting) => (
                <Field key={setting.key} label={`${setting.key}${setting.description ? ` — ${setting.description}` : ''}`}>
                  {effectiveValueString(setting).length > 80 ? (
                    <Textarea
                      value={effectiveValueString(setting)}
                      onChange={(e) => change(setting.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      value={effectiveValueString(setting)}
                      onChange={(e) => change(setting.key, e.target.value)}
                    />
                  )}
                  {changes[setting.key] !== undefined && (
                    <span className="cell-meta" style={{ color: 'var(--color-accent)' }}>Modified</span>
                  )}
                </Field>
              ))}
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Status</h2>
            <p className="cell-meta">{settings.length} total settings loaded.</p>
            {Object.keys(changes).length > 0 && (
              <p className="cell-meta" style={{ color: 'var(--color-accent)' }}>
                {Object.keys(changes).length} unsaved change(s).
              </p>
            )}
          </section>
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div>
    </>
  );
}
