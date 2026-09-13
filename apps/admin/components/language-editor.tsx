'use client';
import { useEffect, useState } from 'react';
import type { Language as LangData } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';

export function LanguageEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const { can } = useAdminAuth();
  const { t } = useAdminI18n();
  const canManage = can('languages.manage');
  const [lang, setLang] = useState<Partial<LangData>>({
    direction: 'ltr',
    isDefault: false,
    isActive: true,
    sortOrder: 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      void api<LangData[]>('/admin/languages').then((rows) => {
        const selected = rows.find((row) => row.id === id);
        if (selected) setLang(selected);
        else setMessage(t('language.notFound') ?? 'Language was not found.');
      });
    }
  }, [id, t]);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      if (id) {
        await api(`/admin/languages/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: lang.name,
            nativeName: lang.nativeName,
            direction: lang.direction,
            sortOrder: lang.sortOrder,
          }),
        });
        await api(`/admin/languages/${id}/${lang.isActive ? 'activate' : 'deactivate'}`, {
          method: 'POST',
        });
        if (lang.isDefault) await api(`/admin/languages/${id}/set-default`, { method: 'POST' });
        setMessage(t('language.updated') ?? 'Language updated.');
      } else {
        const saved = await api<LangData>('/admin/languages', {
          method: 'POST',
          body: JSON.stringify({
            code: lang.code,
            name: lang.name,
            nativeName: lang.nativeName,
            direction: lang.direction,
            sortOrder: lang.sortOrder,
          }),
        });
        if (!lang.isActive)
          await api(`/admin/languages/${saved.id}/deactivate`, { method: 'POST' });
        if (lang.isDefault)
          await api(`/admin/languages/${saved.id}/set-default`, { method: 'POST' });
        setMessage(t('language.created') ?? 'Language created.');
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
          <h1>{id ? (t('language.edit') ?? 'Edit Language') : (t('language.add') ?? 'Add Language')}</h1>
          <p>{t('language.description') ?? 'Configure locale code, display names, text direction and enabled state.'}</p>
        </div>
        {canManage && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>
              {t('language.save') ?? 'Save language'}
            </Button>
          </div>
        )}
      </div>

      <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="editor">
          <div className="editor-main">
            <section className="panel">
              <div className="field-stack">
                <Field label={t('language.code') ?? "Locale code (e.g. en, ar-SA)"}>
                  <Input
                    dir="ltr"
                    value={lang.code ?? ''}
                    onChange={(e) => setLang((l) => ({ ...l, code: e.target.value }))}
                    required
                  />
                </Field>
                <Field label={t('language.englishName') ?? "English name (e.g. Arabic)"}>
                  <Input
                    value={lang.name ?? ''}
                    onChange={(e) => setLang((l) => ({ ...l, name: e.target.value }))}
                    required
                  />
                </Field>
                <Field label={t('language.nativeName') ?? "Native name (e.g. العربية)"}>
                  <Input
                    value={lang.nativeName ?? ''}
                    onChange={(e) => setLang((l) => ({ ...l, nativeName: e.target.value }))}
                    required
                  />
                </Field>
                <Field label={t('language.direction') ?? "Text direction"}>
                  <select
                    className="gv-input"
                    value={lang.direction ?? 'ltr'}
                    onChange={(e) =>
                      setLang((l) => ({ ...l, direction: e.target.value as 'ltr' | 'rtl' }))
                    }
                  >
                    <option value="ltr">{t('language.ltr') ?? 'Left-to-right (LTR)'}</option>
                    <option value="rtl">{t('language.rtl') ?? 'Right-to-left (RTL)'}</option>
                  </select>
                </Field>
                <Field label={t('language.sortOrder') ?? "Sort order"}>
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
                      checked={Boolean(lang.isActive)}
                      onChange={(e) =>
                        setLang((l) => ({
                          ...l,
                          isActive: e.target.checked,
                          ...(e.target.checked ? {} : { isDefault: false }),
                        }))
                      }
                    />{' '}
                    {t('language.enabled') ?? 'Enabled (visible on public site)'}
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(lang.isDefault)}
                      disabled={!lang.isActive}
                      onChange={(e) => setLang((l) => ({ ...l, isDefault: e.target.checked }))}
                    />{' '}
                    {t('language.default') ?? 'Default language'}{' '}
                    <span className="cell-meta">{t('language.defaultNote') ?? '(only one language should be default)'}</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <aside className="editor-side">
            <section className="panel">
              <h2>{t('users.status')}</h2>
              <Badge tone={lang.isActive ? 'success' : 'neutral'}>
                {lang.isActive ? (t('status.active') ?? 'Active') : (t('status.inactive') ?? 'Inactive')}
              </Badge>
              {lang.isDefault && (
                <div style={{ marginBlockStart: '.5rem' }}>
                  <Badge tone="warning">{t('language.default') ?? 'Default'}</Badge>
                </div>
              )}
            </section>
            {message && (
              <div className="form-status" role="status">
                {message}
              </div>
            )}
          </aside>
        </div>
      </fieldset>
    </>
  );
}
