'use client';
import { useEffect, useState } from 'react';
import { Button, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';

interface Setting { id: string; key: string; value: string; group: string; description?: string; isLocalized: boolean }

const SETTING_GROUPS = ['company', 'contact', 'seo', 'social', 'appearance', 'general'];

export function SettingsEditor() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState(SETTING_GROUPS[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Setting[]>('/admin/settings?pageSize=200').then((rows) => {
      setSettings(Array.isArray(rows) ? rows : []);
    });
  }, []);

  function change(key: string, value: string) {
    setChanges((prev) => ({ ...prev, [key]: value }));
  }

  function effectiveValue(setting: Setting) {
    return changes[setting.key] ?? setting.value ?? '';
  }

  async function save() {
    setBusy(true);
    setMessage('');
    const updates = Object.entries(changes);
    if (updates.length === 0) { setMessage('No changes to save.'); setBusy(false); return; }
    try {
      await Promise.all(
        updates.map(([key, value]) =>
          api('/admin/settings', { method: 'PATCH', body: JSON.stringify({ key, value }) }),
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
    const g = s.group ?? 'general';
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
                  {effectiveValue(setting).length > 80 ? (
                    <Textarea
                      value={effectiveValue(setting)}
                      onChange={(e) => change(setting.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      value={effectiveValue(setting)}
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
