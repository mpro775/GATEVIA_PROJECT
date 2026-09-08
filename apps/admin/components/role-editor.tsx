'use client';
import { useEffect, useState } from 'react';
import type { Permission, Role as RoleData } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';

export function RoleEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const { can } = useAdminAuth();
  const canManage = can('roles.manage');
  const [role, setRole] = useState<Partial<RoleData>>({});
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [grants, setGrants] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Permission[]>('/admin/permissions')
      .then(setPermissions)
      .catch(() => {});
    if (id) {
      void api<RoleData[]>('/admin/roles')
        .then((roles) => {
          const found = roles.find((r) => r.id === id);
          if (found) {
            setRole(found);
            setGrants(
              new Set(
                found.permissions?.flatMap((grant) =>
                  grant.permission ? [grant.permission.id] : [],
                ) ?? [],
              ),
            );
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const toggle = (permId: string) => {
    setGrants((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleGroup = (permIds: string[]) => {
    const allGranted = permIds.every((p) => grants.has(p));
    setGrants((prev) => {
      const next = new Set(prev);
      if (allGranted) permIds.forEach((p) => next.delete(p));
      else permIds.forEach((p) => next.add(p));
      return next;
    });
  };

  async function save() {
    setBusy(true);
    setMessage('');
    // Ensure key exists for creation
    const payload: { name: string; permissionIds: string[]; key?: string } = {
      name: role.name ?? '',
      permissionIds: [...grants],
    };
    if (!id && role.key) payload.key = role.key;

    try {
      if (id) {
        await api(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setMessage('Role updated.');
      } else {
        const saved = await api<RoleData>('/admin/roles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Role created.');
        router.replace(`${returnPath}/${saved.id}`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  // Group permissions by their prefix (e.g. pages.read -> pages)
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = p.key.split('.')[0] || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit Role' : 'Create Role'}</h1>
          <p>Name this role and assign its permission set.</p>
        </div>
        {canManage && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>
              Save role
            </Button>
          </div>
        )}
      </div>

      <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="editor">
          <div className="editor-main">
            <section className="panel">
              <h2>Role details</h2>
              <div className="field-stack">
                {!id && (
                  <Field label="Role key (system identifier)">
                    <Input
                      value={role.key ?? ''}
                      onChange={(e) =>
                        setRole((r) => ({
                          ...r,
                          key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        }))
                      }
                      placeholder="e.g. content_editor"
                      required
                    />
                  </Field>
                )}
                <Field label="Role name">
                  <Input
                    value={role.name ?? ''}
                    onChange={(e) => setRole((r) => ({ ...r, name: e.target.value }))}
                    required
                  />
                </Field>
              </div>
            </section>

            <section className="panel">
              <h2>Permissions</h2>
              {permissions.length === 0 && <p className="cell-meta">Loading permissions...</p>}
              {Object.entries(groupedPermissions).map(([group, perms]) => {
                const permIds = perms.map((p) => p.id);
                const allGranted = permIds.every((p) => grants.has(p));
                return (
                  <div key={group} style={{ marginBlockEnd: '1.2rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        marginBlockEnd: '.4rem',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        {group}
                      </strong>
                      <button
                        type="button"
                        className="text-link"
                        style={{ padding: '.2rem .5rem', minHeight: 'unset', fontSize: '.8rem' }}
                        onClick={() => toggleGroup(permIds)}
                      >
                        {allGranted ? 'Remove all' : 'Grant all'}
                      </button>
                    </div>
                    <div className="relation-chips">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="relation-chip"
                          style={{ cursor: 'pointer' }}
                          title={perm.description}
                        >
                          <input
                            type="checkbox"
                            checked={grants.has(perm.id)}
                            onChange={() => toggle(perm.id)}
                            style={{ display: 'none' }}
                          />
                          <Badge tone={grants.has(perm.id) ? 'success' : 'neutral'}>
                            {perm.key.split('.')[1] || perm.key}
                          </Badge>
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
