'use client';
import { useEffect, useState } from 'react';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';

interface NavMenu { id: string; key: string; label: string; isActive: boolean; items: NavItem[] }
interface NavItem {
  id?: string;
  label: string;
  url: string;
  isExternal: boolean;
  isVisible: boolean;
  sortOrder: number;
  children?: NavItem[];
  _expanded?: boolean;
}

const emptyItem = (): NavItem => ({
  label: '',
  url: '',
  isExternal: false,
  isVisible: true,
  sortOrder: 0,
  children: [],
  _expanded: true,
});

export function NavigationEditor() {
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [selected, setSelected] = useState<NavMenu | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<NavMenu[]>('/admin/navigation?pageSize=50').then((rows) => {
      setMenus(Array.isArray(rows) ? rows : []);
    });
  }, []);

  function selectMenu(menu: NavMenu) {
    setSelected(JSON.parse(JSON.stringify(menu)) as NavMenu);
    setMessage('');
  }

  function updateItem(index: number, field: keyof NavItem, value: unknown) {
    if (!selected) return;
    const items = [...selected.items];
    items[index] = { ...items[index], [field]: value };
    setSelected({ ...selected, items });
  }

  function addItem() {
    if (!selected) return;
    const items = [...selected.items, { ...emptyItem(), sortOrder: selected.items.length }];
    setSelected({ ...selected, items });
  }

  function removeItem(index: number) {
    if (!selected || !confirm('Remove this item?')) return;
    const items = selected.items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, sortOrder: i }));
    setSelected({ ...selected, items });
  }

  function moveItem(index: number, dir: -1 | 1) {
    if (!selected) return;
    const items = [...selected.items];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setSelected({ ...selected, items: items.map((item, i) => ({ ...item, sortOrder: i })) });
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    setMessage('');
    try {
      const saved = await api<NavMenu>(`/admin/navigation/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: selected.isActive, items: selected.items }),
      });
      setMenus((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
      setSelected(JSON.parse(JSON.stringify(saved)) as NavMenu);
      setMessage('Navigation saved.');
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
          <h1>Navigation Builder</h1>
          <p>Edit menus and their items. Changes take effect after saving and publishing.</p>
        </div>
        {selected && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>Save navigation</Button>
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
                  onClick={() => selectMenu(menu)}
                >
                  {menu.key}{' '}
                  <Badge tone={menu.isActive ? 'success' : 'neutral'}>
                    {menu.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </button>
              ))}
              {menus.length === 0 && (
                <span className="cell-meta">No navigation menus found. Create them via the API seed.</span>
              )}
            </div>
          </section>

          {/* Items editor */}
          {selected && (
            <section className="panel">
              <h2>Items — {selected.key}</h2>
              <div style={{ marginBlockEnd: '.8rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.isActive}
                    onChange={(e) => setSelected({ ...selected, isActive: e.target.checked })}
                  />{' '}
                  Menu active / published
                </label>
              </div>

              <div className="sections-editor">
                {selected.items.length === 0 && (
                  <p className="cell-meta">No items yet.</p>
                )}
                {selected.items.map((item, i) => (
                  <div key={i} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: '.9rem' }}>
                        {item.label || '(untitled)'}
                      </span>
                      <Badge tone={item.isVisible ? 'success' : 'neutral'}>
                        {item.isVisible ? 'Visible' : 'Hidden'}
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
                        <Field label="Label">
                          <Input
                            value={item.label}
                            onChange={(e) => updateItem(i, 'label', e.target.value)}
                            required
                          />
                        </Field>
                        <Field label="URL / Path">
                          <Input
                            dir="ltr"
                            value={item.url}
                            onChange={(e) => updateItem(i, 'url', e.target.value)}
                            required
                          />
                        </Field>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.isExternal}
                              onChange={(e) => updateItem(i, 'isExternal', e.target.checked)}
                            />{' '}
                            External link (opens in new tab)
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.isVisible}
                              onChange={(e) => updateItem(i, 'isVisible', e.target.checked)}
                            />{' '}
                            Visible
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
            </section>
          )}
        </div>

        <aside className="editor-side">
          {selected && (
            <section className="panel">
              <h2>{selected.key}</h2>
              <p className="cell-meta">{selected.items.length} item(s)</p>
              <Badge tone={selected.isActive ? 'success' : 'neutral'}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </section>
          )}
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div>
    </>
  );
}
