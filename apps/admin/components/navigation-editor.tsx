'use client';
import { useEffect, useState } from 'react';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';

interface Language { code: string; name: string; }
interface NavMenu { id: string; key: string; location: string; status: 'draft' | 'review' | 'published' | 'archived'; items: NavItem[] }
interface NavItem {
  id: string;
  parentId: string | null;
  itemType: 'internal' | 'external';
  internalEntityType: string;
  internalEntityId: string;
  externalUrl: string;
  visible: boolean;
  translations: Record<string, { label: string }>;
  _expanded?: boolean;
}

function normalizeItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const item = raw as NavItem & { translations: unknown };
    const translations = Array.isArray(item.translations)
      ? Object.fromEntries(
          item.translations
            .filter((row): row is { locale: string; label: string } => Boolean(row) && typeof row === 'object' && typeof (row as { locale?: unknown }).locale === 'string')
            .map((row) => [row.locale, { label: row.label ?? '' }]),
        )
      : item.translations && typeof item.translations === 'object'
        ? item.translations as Record<string, { label: string }>
        : {};
    return { ...item, translations, _expanded: false } as NavItem;
  });
}

function normalizeMenu(menu: NavMenu): NavMenu {
  return { ...menu, items: normalizeItems(menu.items) };
}

const emptyItem = (): NavItem => ({
  id: crypto.randomUUID(),
  parentId: null,
  itemType: 'external',
  internalEntityType: 'pages',
  internalEntityId: '',
  externalUrl: '',
  visible: true,
  translations: {},
  _expanded: true,
});

export function NavigationEditor() {
  const { can } = useAdminAuth();
  const canManage = can('navigation.manage');
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [selected, setSelected] = useState<NavMenu | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [entities, setEntities] = useState<Record<string, { id: string, label: string }[]>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<NavMenu[]>('/admin/navigation?pageSize=50').then((rows) => setMenus((rows || []).map(normalizeMenu)));
    void api<Language[]>('/public/languages').then(setLanguages);
    // Fetch common entities for picker
    const fetchEntities = async () => {
      const types = ['pages', 'services', 'industries', 'case-studies', 'insights'];
      const map: Record<string, { id: string, label: string }[]> = {};
      await Promise.all(types.map(async (t) => {
        try {
          const res = await api<{ id: string, translations?: { title?: string, name?: string }[] }[]>(`/admin/${t}?pageSize=100`);
          map[t] = (res || []).map(r => ({ id: r.id, label: r.translations?.[0]?.title || r.translations?.[0]?.name || r.id }));
        } catch { map[t] = []; }
      }));
      setEntities(map);
    };
    void fetchEntities();
  }, []);

  async function selectMenu(menu: NavMenu) {
    try {
      const full = await api<NavMenu>(`/admin/navigation/${menu.id}`);
      setSelected(normalizeMenu(full));
      setMessage('');
    } catch {
      setMessage('Failed to load menu details.');
    }
  }

  function updateItem(index: number, field: keyof NavItem, value: unknown) {
    if (!selected) return;
    const items = [...selected.items];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, [field]: value };
    setSelected({ ...selected, items });
  }
  
  function updateTranslation(index: number, locale: string, label: string) {
    if (!selected) return;
    const items = [...selected.items];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, translations: { ...current.translations, [locale]: { label } } };
    setSelected({ ...selected, items });
  }

  function addItem() {
    if (!selected) return;
    const items = [...selected.items, emptyItem()];
    setSelected({ ...selected, items });
  }

  function removeItem(index: number) {
    if (!selected || !confirm('Remove this item?')) return;
    const removedId = selected.items[index]?.id;
    const items = selected.items
      .filter((_, i) => i !== index)
      .map((item) => item.parentId === removedId ? { ...item, parentId: null } : item);
    setSelected({ ...selected, items });
  }

  function moveItem(index: number, dir: -1 | 1) {
    if (!selected) return;
    const items = [...selected.items];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const current = items[index]; const destination = items[target];
    if (!current || !destination) return;
    items[index] = destination; items[target] = current;
    setSelected({ ...selected, items });
  }

  async function save(): Promise<NavMenu | undefined> {
    if (!selected) return;
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        key: selected.key,
        location: selected.location,
        status: selected.status === 'published' || selected.status === 'archived' ? undefined : selected.status,
        items: selected.items.map(item => ({
          id: item.id || crypto.randomUUID(),
          parentId: item.parentId || null,
          itemType: item.itemType,
          internalEntityType: item.itemType === 'internal' ? item.internalEntityType : null,
          internalEntityId: item.itemType === 'internal' ? item.internalEntityId : null,
          externalUrl: item.itemType === 'external' ? item.externalUrl : null,
          visible: item.visible,
          translations: item.translations,
        }))
      };
      
      const saved = await api<NavMenu>(`/admin/navigation/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const normalized = normalizeMenu(saved);
      setMenus((prev) => prev.map((m) => (m.id === normalized.id ? normalized : m)));
      setSelected(normalized);
      setMessage('Navigation saved.');
      return normalized;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  async function transition(action: 'publish' | 'unpublish' | 'archive') {
    if (!selected) return;
    setBusy(true);
    setMessage('');
    try {
      const saved = await save();
      if (!saved) return;
      const updated = await api<NavMenu>(`/admin/navigation/${selected.id}/${action}`, { method: 'POST' });
      const full = normalizeMenu(await api<NavMenu>(`/admin/navigation/${updated.id}`));
      setSelected(full);
      setMenus((previous) => previous.map((menu) => menu.id === full.id ? full : menu));
      setMessage(`Navigation ${action === 'publish' ? 'published' : action === 'unpublish' ? 'unpublished' : 'archived'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Unable to ${action} navigation.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Navigation Builder</h1>
          <p>Edit menus and their items. Changes take effect after saving and publishing.</p>
        </div>
        {selected && canManage && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>Save navigation</Button>
            {selected.status !== 'published' && <Button disabled={busy} onClick={() => void transition('publish')}>Publish</Button>}
            {selected.status === 'published' && <Button disabled={busy} onClick={() => void transition('unpublish')}>Unpublish</Button>}
            {selected.status !== 'archived' && <Button disabled={busy} onClick={() => void transition('archive')}>Archive</Button>}
          </div>
        )}
      </div>

      <div className="editor">
        <div className="editor-main">
          {/* Menu selector */}
          <section className="panel">
            <h2>Menus</h2>
            <div className="tabs" role="tablist">
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  role="tab"
                  className="tab"
                  aria-selected={selected?.id === menu.id}
                  onClick={() => void selectMenu(menu)}
                >
                  {menu.key}{' '}
                  <Badge tone={menu.status === 'published' ? 'success' : 'neutral'}>
                    {menu.status}
                  </Badge>
                </button>
              ))}
              {menus.length === 0 && (
                <span className="cell-meta">No navigation menus found.</span>
              )}
            </div>
          </section>

          {/* Items editor */}
          {selected && (
            <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}><section className="panel">
              <h2>Items — {selected.key}</h2>
              <div style={{ marginBlockEnd: '.8rem' }}>
                <p className="cell-meta">Location: {selected.location}</p>
              </div>

              <div className="sections-editor">
                {selected.items.length === 0 && (
                  <p className="cell-meta">No items yet.</p>
                )}
                {selected.items.map((item, i) => (
                  <div key={item.id} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: '.9rem' }}>
                        {(languages[0]?.code ? item.translations[languages[0].code]?.label : '') || '(untitled)'}
                      </span>
                      <Badge tone={item.itemType === 'internal' ? 'warning' : 'neutral'}>
                        {item.itemType}
                      </Badge>
                      <Badge tone={item.visible ? 'success' : 'neutral'}>
                        {item.visible ? 'Visible' : 'Hidden'}
                      </Badge>
                      <div className="section-actions">
                        <button
                          type="button"
                          className="text-link"
                          style={{ padding: '.2rem .4rem', minHeight: 'unset' }}
                          onClick={() => moveItem(i, -1)}
                          disabled={i === 0}
                        >↑</button>
                        <button
                          type="button"
                          className="text-link"
                          style={{ padding: '.2rem .4rem', minHeight: 'unset' }}
                          onClick={() => moveItem(i, 1)}
                          disabled={i === selected.items.length - 1}
                        >↓</button>
                        <button
                          type="button"
                          className="text-link"
                          style={{ padding: '.2rem .4rem', minHeight: 'unset' }}
                          onClick={() => updateItem(i, '_expanded', !item._expanded)}
                        >
                          {item._expanded ? 'Collapse' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className="text-link"
                          style={{ padding: '.2rem .4rem', minHeight: 'unset', color: 'var(--color-danger)' }}
                          onClick={() => removeItem(i)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {item._expanded && (
                      <div className="section-fields">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          {languages.map((lang) => (
                            <Field key={lang.code} label={`Label (${lang.code})`}>
                              <Input
                                value={item.translations[lang.code]?.label || ''}
                                onChange={(e) => updateTranslation(i, lang.code, e.target.value)}
                                required
                              />
                            </Field>
                          ))}
                        </div>
                        
                        <Field label="Link Type">
                          <select 
                            className="gv-input"
                            value={item.itemType} 
                            onChange={(e) => updateItem(i, 'itemType', e.target.value)}
                          >
                            <option value="internal">Internal Content</option>
                            <option value="external">External URL</option>
                          </select>
                        </Field>

                        {item.itemType === 'internal' ? (
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}><Field label="Content Type">
                              <select
                                className="gv-input"
                                value={item.internalEntityType}
                                onChange={(e) => {
                                  updateItem(i, 'internalEntityType', e.target.value);
                                  updateItem(i, 'internalEntityId', '');
                                }}
                              >
                                <option value="pages">Pages</option>
                                <option value="services">Services</option>
                                <option value="industries">Industries</option>
                                <option value="case-studies">Case Studies</option>
                                <option value="insights">Insights</option>
                              </select>
                            </Field></div>
                            <div style={{ flex: 2 }}><Field label="Target Item">
                              <select
                                className="gv-input"
                                value={item.internalEntityId}
                                onChange={(e) => updateItem(i, 'internalEntityId', e.target.value)}
                              >
                                <option value="">-- Select Item --</option>
                                {(entities[item.internalEntityType] || []).map(ent => (
                                  <option key={ent.id} value={ent.id}>{ent.label}</option>
                                ))}
                              </select>
                            </Field></div>
                          </div>
                        ) : (
                          <Field label="External URL (must start with http:// or https://)">
                            <Input
                              dir="ltr"
                              type="url"
                              value={item.externalUrl || ''}
                              onChange={(e) => updateItem(i, 'externalUrl', e.target.value)}
                            />
                          </Field>
                        )}

                        <Field label="Parent item">
                          <select
                            className="gv-input"
                            value={item.parentId ?? ''}
                            onChange={(event) => updateItem(i, 'parentId', event.target.value || null)}
                          >
                            <option value="">— Top level —</option>
                            {selected.items
                              .filter((candidate) => candidate.id !== item.id && candidate.parentId !== item.id)
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {(languages[0]?.code ? candidate.translations[languages[0].code]?.label : '') || '(untitled)'}
                                </option>
                              ))}
                          </select>
                        </Field>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.visible}
                              onChange={(e) => updateItem(i, 'visible', e.target.checked)}
                            />{' '}
                            Visible in menu
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginBlockStart: '.8rem' }}>
                <Button type="button" onClick={addItem}>+ Add item</Button>
              </div>
            </section></fieldset>
          )}
        </div>

        <aside className="editor-side">
          {selected && (
            <section className="panel">
              <h2>{selected.key}</h2>
              <p className="cell-meta">{selected.items.length} item(s)</p>
              <Badge tone={selected.status === 'published' ? 'success' : 'neutral'}>
                {selected.status}
              </Badge>
            </section>
          )}
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div>
    </>
  );
}
