'use client';
import { useEffect, useState } from 'react';
import type { Role, User } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { startAdminNavigation } from '@/lib/navigation-feedback';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';

type EditableUser = Pick<User, 'id' | 'email' | 'displayName' | 'status'> & {
  roles?: Array<Pick<Role, 'id' | 'name'>>;
};

export function UserEditor({ id, returnPath }: { id?: string; returnPath: string }) {
  const router = useRouter();
  const { can } = useAdminAuth();
  const { t } = useAdminI18n();
  const canManage = can('users.manage');
  const [user, setUser] = useState<Partial<EditableUser>>({ status: 'active' });
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Role[]>('/admin/roles?pageSize=100')
      .then((rows) => setAllRoles(rows))
      .catch(() => {});
    if (id) {
      void api<EditableUser>(`/admin/users/${id}`).then((data) => {
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
        setMessage(t('users.updated'));
      } else {
        await api<EditableUser>('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage(t('users.invited'));
      }
      startAdminNavigation();
      router.replace(returnPath);
    } catch (e) {
      console.error(e);
      setMessage(t('common.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    if (!id || !confirm(t('users.deactivateConfirm'))) return;
    await api(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'suspended' }),
    });
    setUser((u) => ({ ...u, status: 'suspended' }));
    setMessage(t('users.deactivated'));
  }

  async function reactivate() {
    if (!id) return;
    await api(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    });
    setUser((u) => ({ ...u, status: 'active' }));
    setMessage(t('users.reactivated'));
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
          <h1>{id ? t('users.edit') : t('users.invite')}</h1>
          <p>
            {id
              ? t('users.editDescription')
              : t('users.inviteDescription')}
          </p>
        </div>
        {canManage && (
          <div className="toolbar">
            <Button disabled={busy} onClick={save}>
              {id ? t('users.save') : t('users.sendInvite')}
            </Button>
            {id && user.status !== 'suspended' && (
              <button className="text-link" onClick={deactivate}>
                {t('users.deactivate')}
              </button>
            )}
            {id && user.status === 'suspended' && (
              <button className="text-link" onClick={reactivate}>
                {t('users.reactivate')}
              </button>
            )}
          </div>
        )}
      </div>

      <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="editor">
          <div className="editor-main">
            <section className="panel">
              <h2>{t('users.accountDetails')}</h2>
              <div className="field-stack">
                <Field label={t('users.email')}>
                  <Input
                    type="email"
                    value={user.email ?? ''}
                    onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
                    required
                    disabled={!!id} // Email cannot be changed after creation
                  />
                </Field>
                <Field label={t('users.displayName')}>
                  <Input
                    value={user.displayName ?? ''}
                    onChange={(e) => setUser((u) => ({ ...u, displayName: e.target.value }))}
                    required
                  />
                </Field>
              </div>
            </section>

            <section className="panel">
              <h2>{t('users.roles')}</h2>
              <div className="relation-chips">
                {allRoles.length === 0 && <span className="cell-meta">{t('users.noRoles')}</span>}
                {allRoles.map((role) => (
                  <label key={role.id} className="relation-chip" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      style={{ display: 'none' }}
                    />
                    <Badge tone={selectedRoles.includes(role.id) ? 'success' : 'neutral'}>
                      {role.name}
                    </Badge>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="editor-side">
            <section className="panel">
              <h2>{t('users.status')}</h2>
              {id ? (
                <Field label={t('users.accountStatus')}>
                  <select
                    className="gv-input"
                    value={user.status ?? 'active'}
                    onChange={(e) =>
                      setUser((u) => ({ ...u, status: e.target.value as EditableUser['status'] }))
                    }
                  >
                    <option value="active">{t('status.active')}</option>
                    <option value="invited">{t('status.invited')}</option>
                    <option value="suspended">{t('status.suspended')}</option>
                  </select>
                </Field>
              ) : (
                <p className="cell-meta">
                  {t('users.invitedNote')}
                </p>
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
