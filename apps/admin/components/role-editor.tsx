'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';

// Representative set of system permissions aligned with API contract.
// In production the full list is fetched from /admin/permissions.
const PERMISSION_GROUPS: Array<{ group: string; permissions: string[] }> = [
  {
    group: 'Content',
    permissions: [
      'content:read', 'content:create', 'content:update', 'content:delete',
      'content:publish', 'content:archive',
    ],
  },
  {
    group: 'Media',
    permissions: ['media:read', 'media:upload', 'media:update', 'media:delete'],
  },
  {
    group: 'Leads',
    permissions: [
      'leads:read', 'leads:assign', 'leads:update_status',
      'leads:note', 'leads:export',
    ],
  },
  {
    group: 'Users',
    permissions: ['users:read', 'users:create', 'users:update', 'users:deactivate'],
  },
  {
    group: 'Roles',
    permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
  },
  {
    group: 'System',
    permissions: [
      'audit:read', 'languages:manage', 'navigation:manage',
      'settings:read', 'settings:write', 'redirects:manage',
    ],
  },
];

interface RoleData { id: string; name: string; description?: string; permissions?: string[] }

export function RoleEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Partial<RoleData>>({});
  const [grants, setGrants] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      void api<RoleData>(`/admin/roles/${id}`).then((data) => {
        setRole(data);
        setGrants(new Set(data.permissions ?? []));
      });
    }
  }, [id]);

  const toggle = (perm: string) => {
    setGrants((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm); else next.add(perm);
      return next;
    });
  };

  const toggleGroup = (perms: string[]) => {
    const allGranted = perms.every((p) => grants.has(p));
    setGrants((prev) => {
      const next = new Set(prev);
      if (allGranted) perms.forEach((p) => next.delete(p));
      else perms.forEach((p) => next.add(p));
      return next;
    });
  };

  async function save() {
    setBusy(true);
    setMessage('');
    const payload = { name: role.name, description: role.description, permissions: [...grants] };
    try {
      if (id) {
        await api(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setMessage('Role updated.');
      } else {
        const saved = await api<RoleData>('/admin/roles', { method: 'POST', body: JSON.stringify(payload) });
        setMessage('Role created.');
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
          <h1>{id ? 'Edit Role' : 'Create Role'}</h1>
          <p>Name this role and assign its permission set.</p>
        </div>
        <div className="toolbar">
          <Button disabled={busy} onClick={save}>Save role</Button>
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          <section className="panel">
            <h2>Role details</h2>
            <div className="field-stack">
              <Field label="Role name">
                <Input
                  value={role.name ?? ''}
                  onChange={(e) => setRole((r) => ({ ...r, name: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Description">
                <Input
                  value={role.description ?? ''}
                  onChange={(e) => setRole((r) => ({ ...r, description: e.target.value }))}
                />
              </Field>
            </div>
          </section>

          <section className="panel">
            <h2>Permissions</h2>
            {PERMISSION_GROUPS.map(({ group, permissions }) => {
              const allGranted = permissions.every((p) => grants.has(p));
              return (
                <div key={group} style={{ marginBlockEnd: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBlockEnd: '.4rem' }}>
                    <strong style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {group}
                    </strong>
                    <button
                      type="button"
                      className="text-link"
                      style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.8rem' }}
                      onClick={() => toggleGroup(permissions)}
                    >
                      {allGranted ? 'Remove all' : 'Grant all'}
                    </button>
                  </div>
                  <div className="relation-chips">
                    {permissions.map((perm) => (
                      <label key={perm} className="relation-chip" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={grants.has(perm)}
                          onChange={() => toggle(perm)}
                          style={{ display: 'none' }}
                        />
                        <Badge tone={grants.has(perm) ? 'success' : 'neutral'}>{perm}</Badge>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Summary</h2>
            <p className="cell-meta">{grants.size} permissions granted</p>
          </section>
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div>
    </>
  );
}
