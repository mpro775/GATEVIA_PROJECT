'use client';
import { useCallback, useEffect, useState } from 'react';
import type { User } from '@gatevia/api-client';
import { Badge, Button, EmptyState, ErrorState, Field, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';

// ─── Readable nested object display ──────────────────────────────────────────

function humanizeKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function Readable({ value, label }: { value: unknown; label?: string }) {
  const { t } = useAdminI18n();
  if (Array.isArray(value))
    return (
      <div>
        {label && <strong>{label}</strong>}
        <ul>
          {(value as unknown[]).map((item: unknown, index) => (
            <li key={index}>
              <Readable value={item} />
            </li>
          ))}
        </ul>
      </div>
    );
  if (value && typeof value === 'object')
    return (
      <dl>
        {Object.entries(value as Record<string, unknown>).map(([key, child]: [string, unknown]) => (
          <div key={key}>
            <dt style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '.8rem' }}>
              {t(`field.${key}` as Parameters<typeof t>[0], humanizeKey(key))}
            </dt>
            <dd style={{ margin: '0 0 .5rem 0' }}>
              <Readable value={child} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return <span>{String(value ?? '—')}</span>;
}

// ─── UTM attribution display ──────────────────────────────────────────────────

function Attribution({ lead }: { lead: Record<string, unknown> }) {
  const { t } = useAdminI18n();
  const rows: Array<[string, string]> = [
    [t('leads.utmSource'), String(lead.utmSource ?? '—')],
    [t('leads.utmMedium'), String(lead.utmMedium ?? '—')],
    [t('leads.utmCampaign'), String(lead.utmCampaign ?? '—')],
    [t('leads.utmTerm'), String(lead.utmTerm ?? '—')],
    [t('leads.utmContent'), String(lead.utmContent ?? '—')],
    [t('leads.utmLandingPage'), String(lead.landingPage ?? '—')],
    [t('leads.utmReferrer'), String(lead.referrer ?? '—')],
    [t('leads.utmSourceUrl'), String(lead.sourceUrl ?? '—')],
  ];
  return (
    <dl style={{ fontSize: '.88rem' }}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            gap: '.3rem',
            marginBlockEnd: '.4rem',
          }}
        >
          <dt style={{ color: 'var(--color-text-muted)' }}>{label}</dt>
          <dd style={{ margin: 0, wordBreak: 'break-all' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function LeadDetail({ id }: { id: string }) {
  const { can } = useAdminAuth();
  const { t, formatDate } = useAdminI18n();
  const canStatus = can('leads.update_status');
  const canAssign = can('leads.assign');
  const canNote = can('leads.note');
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assignBusy, setAssignBusy] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'assessment' | 'notes' | 'activity'>(
    'details',
  );

  const load = useCallback(async () => {
    try {
      setLead(await api(`/admin/leads/${id}`));
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    void load();
    // Load assignable users
    void api<User[]>('/admin/users?pageSize=100&status=active')
      .then(setUsers)
      .catch(() => {});
  }, [load]);

  if (error)
    return (
      <ErrorState
        title={t('leads.notFound')}
        description={t('leads.notFoundDesc')}
      />
    );
  if (!lead) return <p className="cell-meta">{t('common.loading')}</p>;

  const assessments = (lead.assessments as Array<Record<string, unknown>>) ?? [];
  const activities = (lead.activities as Array<Record<string, unknown>>) ?? [];
  const notes = (lead.notes as Array<Record<string, unknown>>) ?? [];
  const assigned = lead.assignedTo as Record<string, string> | null | undefined;

  async function changeStatus(value: string) {
    await api(`/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: value }),
    });
    void load();
  }

  async function assign(userId: string | null) {
    setAssignBusy(true);
    try {
      await api(`/admin/leads/${id}/assignee`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedToUserId: userId || null }),
      });
      void load();
    } finally {
      setAssignBusy(false);
    }
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoteError('');
    const form = new FormData(event.currentTarget);
    const body = String(form.get('body') ?? '').trim();
    if (!body) {
      setNoteError(t('leads.noteEmpty'));
      return;
    }
    try {
      await api(`/admin/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ body }) });
      event.currentTarget.reset();
      void load();
    } catch (e) {
      setNoteError(t('leads.noteFailed'));
    }
  }

  const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
  const STATUS_TONES: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
    new: 'warning',
    contacted: 'neutral',
    qualified: 'success',
    proposal: 'warning',
    won: 'success',
    lost: 'danger',
  };

  return (
    <>
      {/* Header */}
      <div className="page-title">
        <div>
          <h1>{String(lead.fullName)}</h1>
          <p>
            {String(lead.companyName || t('leads.noCompany'))} · {String(lead.email)}
            {Boolean(lead.phone) && ` · ${String(lead.phone)}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <Badge tone={STATUS_TONES[String(lead.status)] ?? 'neutral'}>{t(`status.${String(lead.status)}` as Parameters<typeof t>[0])}</Badge>
          <Badge>{String(lead.sourceType)}</Badge>
          {Boolean(lead.duplicateOfId) && <Badge tone="danger">{t('leads.possibleDuplicate')}</Badge>}
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          {/* Tabs */}
          <div className="tabs" role="tablist">
            {(['details', 'assessment', 'notes', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                className="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {t(`leads.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as Parameters<typeof t>[0])}
                {tab === 'notes' && notes.length > 0 && (
                  <>
                    {' '}
                    <Badge tone="neutral">{notes.length}</Badge>
                  </>
                )}
                {tab === 'assessment' && assessments.length > 0 && (
                  <>
                    {' '}
                    <Badge tone="warning">{assessments.length}</Badge>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Details */}
          {activeTab === 'details' && (
            <section className="panel">
              <h2>{t('leads.contactAttribution')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h3
                    style={{
                      marginBlockStart: 0,
                      fontSize: '.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    {t('leads.contact')}
                  </h3>
                  <dl style={{ fontSize: '.88rem' }}>
                    {[
                      [t('users.email'), lead.email],
                      [t('leads.phone'), lead.phone ?? '—'],
                      [t('leads.country'), lead.countryCode ?? '—'],
                      [t('leads.preferredLocale'), lead.preferredLocale ?? '—'],
                      [t('leads.company'), lead.companyName ?? '—'],
                      [t('leads.message'), lead.message ?? '—'],
                    ].map(([label, value]) => (
                      <div key={String(label)} style={{ marginBlockEnd: '.5rem' }}>
                        <dt style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {String(label)}
                        </dt>
                        <dd style={{ margin: 0 }}>{String(value ?? '—')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3
                    style={{
                      marginBlockStart: 0,
                      fontSize: '.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    {t('leads.attribution')}
                  </h3>
                  <Attribution lead={lead} />
                </div>
              </div>
            </section>
          )}

          {/* Tab: Assessment */}
          {activeTab === 'assessment' && (
            <>
              {assessments.length === 0 ? (
                <EmptyState
                  title={t('leads.noAssessment')}
                  description={t('leads.noAssessmentDesc')}
                />
              ) : (
                assessments.map((assessment, index) => (
                  <section className="panel" key={String(assessment.id)}>
                    <h2>{t('leads.tabAssessment')} {index + 1}</h2>
                    <p className="cell-meta">
                      {t('leads.version')}: {String(assessment.formVersion ?? '—')} ·{' '}
                      {assessment.submittedAt
                        ? formatDate(String(assessment.submittedAt))
                        : '—'}
                    </p>
                    <Readable value={assessment.answers} />
                  </section>
                ))
              )}
            </>
          )}

          {/* Tab: Notes */}
          {activeTab === 'notes' && (
            <>
              {canNote && (
                <form className="panel field-stack" onSubmit={addNote}>
                  <h2>{t('leads.addInternalNote')}</h2>
                  <Field label={t('leads.noteVisibleToTeam')}>
                    <Textarea
                      name="body"
                      required
                      maxLength={5000}
                      placeholder={t('leads.addContext')}
                    />
                  </Field>
                  <Button type="submit">{t('leads.addNote')}</Button>
                  {noteError && (
                    <div className="form-status form-status--error" role="alert">
                      {noteError}
                    </div>
                  )}
                </form>
              )}
              {notes.length === 0 ? (
                <EmptyState title={t('leads.noNotes')} description={t('leads.noNotesDesc')} />
              ) : (
                notes.map((note) => (
                  <section className="panel" key={String(note.id)}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBlockEnd: '.4rem',
                      }}
                    >
                      <strong>
                        {String((note.author as Record<string, unknown>)?.displayName ?? t('leads.system'))}
                      </strong>
                      <span className="cell-meta">
                        {formatDate(String(note.createdAt))}
                      </span>
                    </div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{String(note.body)}</p>
                  </section>
                ))
              )}
            </>
          )}

          {/* Tab: Activity */}
          {activeTab === 'activity' && (
            <section className="panel">
              <h2>{t('leads.activityTimeline')}</h2>
              {activities.length === 0 ? (
                <EmptyState
                  title={t('leads.noActivity')}
                  description={t('leads.noActivityDesc')}
                />
              ) : (
                <div className="timeline">
                  {activities.map((item) => (
                    <article key={String(item.id)}>
                      <strong>{t(`activity.${String(item.type)}` as Parameters<typeof t>[0], humanizeKey(String(item.type)))}</strong>
                      <div className="cell-meta">
                        {formatDate(String(item.createdAt))}
                        {Boolean(item.actorUserId) && ` · ${t('leads.byUser')}`}
                      </div>
                      {Boolean(item.payload) &&
                        typeof item.payload === 'object' &&
                        Object.keys(item.payload as object).length > 0 && (
                          <div
                            style={{
                              fontSize: '.8rem',
                              color: 'var(--color-text-muted)',
                              marginBlockStart: '.2rem',
                            }}
                          >
                            <Readable value={item.payload} />
                          </div>
                        )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="editor-side">
          {/* Status */}
          <section className="panel">
            <h2>{t('leads.leadStatus')}</h2>
            <Field label={t('users.status')}>
              <select
                className="gv-input"
                value={String(lead.status)}
                disabled={!canStatus}
                onChange={(e) => void changeStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}` as Parameters<typeof t>[0])}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          {/* Assignment */}
          <section className="panel">
            <h2>{t('leads.assignedTo')}</h2>
            {assigned && (
              <p style={{ marginBlockStart: 0, fontSize: '.9rem' }}>
                <strong>{assigned.displayName ?? assigned.email}</strong>
              </p>
            )}
            <Field label={t('leads.assignTo')}>
              <select
                className="gv-input"
                value={assigned?.id ?? ''}
                disabled={assignBusy || !canAssign}
                onChange={(e) => void assign(e.target.value || null)}
              >
                <option value="">{t('leads.unassigned')}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.email}
                  </option>
                ))}
              </select>
            </Field>
            {canAssign && assigned && (
              <button
                className="text-link"
                style={{
                  marginBlockStart: '.4rem',
                  padding: '.2rem 0',
                  minHeight: 'unset',
                  fontSize: '.85rem',
                }}
                disabled={assignBusy}
                onClick={() => void assign(null)}
              >
                {t('leads.removeAssignment')}
              </button>
            )}
          </section>

          {/* Quick info */}
          <section className="panel">
            <h2>{t('leads.quickInfo')}</h2>
            <dl style={{ fontSize: '.85rem' }}>
              <dt className="cell-meta">{t('leads.created')}</dt>
              <dd>{lead.createdAt ? formatDate(String(lead.createdAt)) : '—'}</dd>
              <dt className="cell-meta" style={{ marginBlockStart: '.4rem' }}>
                {t('leads.source')}
              </dt>
              <dd>{String(lead.sourceType)}</dd>
              <dt className="cell-meta" style={{ marginBlockStart: '.4rem' }}>
                {t('leads.sourcePage')}
              </dt>
              <dd style={{ wordBreak: 'break-all', fontSize: '.8rem' }}>
                {String(lead.sourcePage ?? '—')}
              </dd>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
