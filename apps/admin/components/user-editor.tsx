'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';

interface User {
  id: string;
  email: string;
  displayName: string;
  status: string;
  roles?: Array<{ id: string; name: string }>;
}
interface Role { id: string; name: string }

export function UserEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const { can } = useAdminAuth(); const canManage = can('users.manage');
  const [user, setUser] = useState<Partial<User>>({ status: 'active' });
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Role[]>('/admin/roles?pageSize=100').then((rows) => setAllRoles(rows)).catch(() => {});
    if (id) {
      void api<User>(`/admin/users/${id}`).then((data) => {
        setUser(data);
        setSelectedRoles((data.roles ?? []).map((r) => r.id));
      });
    }
  }, [id]);

  async function save() {
    setBusy(true);
    setMessage('');
    const payload: Record<string, unknown> = {
      displayName: user.displayName,
      roleIds: selectedRoles,
    };
    if (id) {
      payload.status = user.status;
    } else {
      payload.email = user.email; // Only sent on creation
    }
    
    try {
      if (id) {
        await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setMessage('User updated.');
      } else {
        const saved = await api<User>('/admin/users', { method: 'POST', body: JSON.stringify(payload) });
        setMessage('User invited successfully.');
        router.replace(`${returnPath}/${saved.id}`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    if (!id || !confirm('Deactivate this user?')) return;
    await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'suspended' }) });
    setUser((u) => ({ ...u, status: 'suspended' }));
    setMessage('User deactivated.');
  }

  async function reactivate() {
    if (!id) return;
    await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) });
    setUser((u) => ({ ...u, status: 'active' }));
    setMessage('User reactivated.');
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId],
    );
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit User' : 'Invite User'}</h1>
          <p>{id ? 'Manage account details, roles and access status.' : 'Send an invitation email to a new team member.'}</p>
        </div>
        {canManage && <div className="toolbar">
          <Button disabled={busy} onClick={save}>
            {id ? 'Save changes' : 'Send invitation'}
          </Button>
          {id && user.status !== 'suspended' && (
            <button className="text-link" onClick={deactivate}>Deactivate</button>
          )}
          {id && user.status === 'suspended' && (
            <button className="text-link" onClick={reactivate}>Reactivate</button>
          )}
        </div>}
      </div>

      <fieldset disabled={!canManage} style={{border:0,padding:0,margin:0,minWidth:0}}><div className="editor">
        <div className="editor-main">
          <section className="panel">
            <h2>Account details</h2>
            <div className="field-stack">
              <Field label="Email">
                <Input
                  type="email"
                  value={user.email ?? ''}
                  onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
                  required
                  disabled={!!id} // Email cannot be changed after creation
                />
              </Field>
              <Field label="Display name">
                <Input
                  value={user.displayName ?? ''}
                  onChange={(e) => setUser((u) => ({ ...u, displayName: e.target.value }))}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="panel">
            <h2>Roles</h2>
            <div className="relation-chips">
              {allRoles.length === 0 && <span className="cell-meta">No roles found.</span>}
              {allRoles.map((role) => (
                <label key={role.id} className="relation-chip" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    style={{ display: 'none' }}
                  />
                  <Badge tone={selectedRoles.includes(role.id) ? 'success' : 'neutral'}>{role.name}</Badge>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Status</h2>
            {id ? (
              <Field label="Account status">
                <select
                  className="gv-input"
                  value={user.status ?? 'active'}
                  onChange={(e) => setUser((u) => ({ ...u, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            ) : (
              <p className="cell-meta">Status will be set to <strong>invited</strong> upon creation.</p>
            )}
          </section>
          {message && <div className="form-status" role="status">{message}</div>}
        </aside>
      </div></fieldset>
    </>
  );
}
