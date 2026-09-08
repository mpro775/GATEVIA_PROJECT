'use client';
import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState, ErrorState, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';

interface User { id: string; displayName: string; email: string }

// ─── Readable nested object display ──────────────────────────────────────────

function Readable({ value, label }: { value: unknown; label?: string }) {
  if (Array.isArray(value))
    return (
      <div>
        {label && <strong>{label}</strong>}
        <ul>
          {value.map((item, index) => (
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
        {Object.entries(value).map(([key, child]) => (
          <div key={key}>
            <dt style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '.8rem' }}>
              {key.replace(/([A-Z_])/g, ' $1').trim()}
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
  const rows: Array<[string, string]> = [
    ['Source', String(lead.utmSource ?? '—')],
    ['Medium', String(lead.utmMedium ?? '—')],
    ['Campaign', String(lead.utmCampaign ?? '—')],
    ['Term', String(lead.utmTerm ?? '—')],
    ['Content', String(lead.utmContent ?? '—')],
    ['Landing page', String(lead.landingPage ?? '—')],
    ['Referrer', String(lead.referrer ?? '—')],
    ['Source URL', String(lead.sourceUrl ?? '—')],
  ];
  return (
    <dl style={{ fontSize: '.88rem' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '.3rem', marginBlockEnd: '.4rem' }}>
          <dt style={{ color: 'var(--color-text-muted)' }}>{label}</dt>
          <dd style={{ margin: 0, wordBreak: 'break-all' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function LeadDetail({ id }: { id: string }) {
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assignBusy, setAssignBusy] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'assessment' | 'notes' | 'activity'>('details');

  async function load() {
    try {
      setLead(await api(`/admin/leads/${id}`));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void load();
    // Load assignable users
    void api<{ data: User[] }>('/admin/users?pageSize=100&status=active')
      .then((r) => setUsers(Array.isArray(r) ? r : (r as { data: User[] }).data ?? []))
      .catch(() => {});
  }, [id]);

  if (error) return <ErrorState title="Lead unavailable" description="The record does not exist or you cannot access it." />;
  if (!lead) return <p className="cell-meta">Loading…</p>;

  const assessments = (lead.assessments as Array<Record<string, unknown>>) ?? [];
  const activities = (lead.activities as Array<Record<string, unknown>>) ?? [];
  const notes = (lead.notes as Array<Record<string, unknown>>) ?? [];
  const assigned = lead.assignedTo as Record<string, string> | null | undefined;

  async function changeStatus(value: string) {
    await api(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: value }) });
    void load();
  }

  async function assign(userId: string | null) {
    setAssignBusy(true);
    try {
      await api(`/admin/leads/${id}/assign`, {
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
    if (!body) { setNoteError('Note cannot be empty.'); return; }
    try {
      await api(`/admin/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ body }) });
      (event.currentTarget as HTMLFormElement).reset();
      void load();
    } catch (e) {
      setNoteError(e instanceof Error ? e.message : 'Failed to save note.');
    }
  }

  const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
  const STATUS_TONES: Record<string, 'success' | 'danger' | 'neutral' | 'info'> = {
    new: 'info', contacted: 'neutral', qualified: 'success', proposal: 'info', won: 'success', lost: 'danger',
  };

  return (
    <>
      {/* Header */}
      <div className="page-title">
        <div>
          <h1>{String(lead.fullName)}</h1>
          <p>
            {String(lead.companyName ?? 'No company')} · {String(lead.email)}
            {lead.phone && ` · ${String(lead.phone)}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <Badge tone={STATUS_TONES[String(lead.status)] ?? 'neutral'}>{String(lead.status)}</Badge>
          <Badge>{String(lead.sourceType)}</Badge>
          {lead.duplicateOfId && <Badge tone="danger">Possible duplicate</Badge>}
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
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'notes' && notes.length > 0 && (
                  <> <Badge tone="neutral">{notes.length}</Badge></>
                )}
                {tab === 'assessment' && assessments.length > 0 && (
                  <> <Badge tone="info">{assessments.length}</Badge></>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Details */}
          {activeTab === 'details' && (
            <section className="panel">
              <h2>Contact &amp; attribution</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ marginBlockStart: 0, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Contact</h3>
                  <dl style={{ fontSize: '.88rem' }}>
                    {[
                      ['Email', lead.email],
                      ['Phone', lead.phone ?? '—'],
                      ['Country', lead.countryCode ?? '—'],
                      ['Preferred locale', lead.preferredLocale ?? '—'],
                      ['Company', lead.companyName ?? '—'],
                      ['Message', lead.message ?? '—'],
                    ].map(([label, value]) => (
                      <div key={String(label)} style={{ marginBlockEnd: '.5rem' }}>
                        <dt style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{String(label)}</dt>
                        <dd style={{ margin: 0 }}>{String(value ?? '—')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 style={{ marginBlockStart: 0, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Attribution</h3>
                  <Attribution lead={lead} />
                </div>
              </div>
            </section>
          )}

          {/* Tab: Assessment */}
          {activeTab === 'assessment' && (
            <>
              {assessments.length === 0 ? (
                <EmptyState title="No assessment data" description="This lead did not submit an assessment form." />
              ) : (
                assessments.map((assessment, index) => (
                  <section className="panel" key={String(assessment.id)}>
                    <h2>Assessment {index + 1}</h2>
                    <p className="cell-meta">
                      Version: {String(assessment.formVersion ?? '—')} ·{' '}
                      {assessment.submittedAt
                        ? new Date(String(assessment.submittedAt)).toLocaleString()
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
              <form className="panel field-stack" onSubmit={addNote}>
                <h2>Add internal note</h2>
                <Field label="Note (visible only to your team)">
                  <Textarea name="body" required maxLength={5000} placeholder="Add context, next steps or outcome…" />
                </Field>
                <Button type="submit">Add note</Button>
                {noteError && (
                  <div className="form-status form-status--error" role="alert">{noteError}</div>
                )}
              </form>
              {notes.length === 0 ? (
                <EmptyState title="No notes yet" description="Internal notes will appear here." />
              ) : (
                notes.map((note) => (
                  <section className="panel" key={String(note.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBlockEnd: '.4rem' }}>
                      <strong>
                        {String((note.author as Record<string, unknown>)?.displayName ?? 'System')}
                      </strong>
                      <span className="cell-meta">
                        {new Date(String(note.createdAt)).toLocaleString()}
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
              <h2>Activity timeline</h2>
              {activities.length === 0 ? (
                <EmptyState title="No activity yet" description="Events will appear here as this lead progresses." />
              ) : (
                <div className="timeline">
                  {activities.map((item) => (
                    <article key={String(item.id)}>
                      <strong>{String(item.type).replaceAll('_', ' ')}</strong>
                      <div className="cell-meta">
                        {new Date(String(item.createdAt)).toLocaleString()}
                        {(item.actorUserId) && ` · by user`}
                      </div>
                      {item.payload && typeof item.payload === 'object' && Object.keys(item.payload as object).length > 0 && (
                        <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginBlockStart: '.2rem' }}>
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
            <h2>Lead status</h2>
            <Field label="Status">
              <select
                className="gv-input"
                value={String(lead.status)}
                onChange={(e) => void changeStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </Field>
          </section>

          {/* Assignment */}
          <section className="panel">
            <h2>Assigned to</h2>
            {assigned && (
              <p style={{ marginBlockStart: 0, fontSize: '.9rem' }}>
                <strong>{assigned.displayName ?? assigned.email}</strong>
              </p>
            )}
            <Field label="Assign to">
              <select
                className="gv-input"
                value={assigned?.id ?? ''}
                disabled={assignBusy}
                onChange={(e) => void assign(e.target.value || null)}
              >
                <option value="">— Unassigned —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.email}
                  </option>
                ))}
              </select>
            </Field>
            {assigned && (
              <button
                className="text-link"
                style={{ marginBlockStart: '.4rem', padding: '.2rem 0', minHeight: 'unset', fontSize: '.85rem' }}
                disabled={assignBusy}
                onClick={() => void assign(null)}
              >
                Remove assignment
              </button>
            )}
          </section>

          {/* Quick info */}
          <section className="panel">
            <h2>Quick info</h2>
            <dl style={{ fontSize: '.85rem' }}>
              <dt className="cell-meta">Created</dt>
              <dd>{lead.createdAt ? new Date(String(lead.createdAt)).toLocaleString() : '—'}</dd>
              <dt className="cell-meta" style={{ marginBlockStart: '.4rem' }}>Source</dt>
              <dd>{String(lead.sourceType)}</dd>
              <dt className="cell-meta" style={{ marginBlockStart: '.4rem' }}>Source page</dt>
              <dd style={{ wordBreak: 'break-all', fontSize: '.8rem' }}>{String(lead.sourcePage ?? '—')}</dd>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
