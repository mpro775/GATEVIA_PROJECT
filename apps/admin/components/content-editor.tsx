'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';
import { MediaPicker } from './media-picker';

interface Language { code: string; nativeName: string; isDefault: boolean }
type RelOption = { id: string; label: string };

// ─── Domain field definitions ──────────────────────────────────────────────

interface DomainDef {
  /** Extra relation multi-selects */
  relations?: Array<{ field: string; label: string; endpoint: string }>;
  /** Extra single-select relations */
  singleRelations?: Array<{ field: string; label: string; endpoint: string }>;
  /** Extra media pickers */
  mediaPickers?: Array<{ field: string; label: string }>;
  /** Extra translation text fields beyond defaults */
  extraTranslationFields?: Array<{ field: string; label: string; type?: 'input' | 'textarea' }>;
  /** Extra root-level text/number fields */
  extraRootFields?: Array<{ field: string; label: string; type?: 'input' | 'number' | 'textarea' }>;
  /** Whether to show Page Sections editor */
  hasSections?: boolean;
}

const CMS_DEFINITIONS: Record<string, DomainDef> = {
  services: {
    singleRelations: [{ field: 'categoryId', label: 'Service Category', endpoint: '/admin/service-categories' }],
    relations: [
      { field: 'industries', label: 'Industries', endpoint: '/admin/industries' },
      { field: 'caseStudies', label: 'Case Studies', endpoint: '/admin/case-studies' },
      { field: 'insights', label: 'Insights', endpoint: '/admin/insights' },
      { field: 'faqs', label: 'FAQs', endpoint: '/admin/faqs' },
    ],
    mediaPickers: [
      { field: 'iconMediaId', label: 'Icon' },
      { field: 'heroMediaId', label: 'Hero Image' },
    ],
    extraTranslationFields: [
      { field: 'whoFor', label: 'Who is this for', type: 'textarea' },
      { field: 'problems', label: 'Problems we solve', type: 'textarea' },
      { field: 'deliverables', label: 'Deliverables', type: 'textarea' },
      { field: 'process', label: 'Process', type: 'textarea' },
      { field: 'benefits', label: 'Benefits', type: 'textarea' },
      { field: 'timeline', label: 'Timeline', type: 'textarea' },
    ],
    extraRootFields: [{ field: 'sortOrder', label: 'Sort Order', type: 'number' }],
  },
  'service-categories': {
    extraRootFields: [{ field: 'sortOrder', label: 'Sort Order', type: 'number' }],
  },
  industries: {
    relations: [
      { field: 'services', label: 'Services', endpoint: '/admin/services' },
      { field: 'caseStudies', label: 'Case Studies', endpoint: '/admin/case-studies' },
      { field: 'insights', label: 'Insights', endpoint: '/admin/insights' },
    ],
    mediaPickers: [{ field: 'heroMediaId', label: 'Hero Image' }],
    extraRootFields: [{ field: 'sortOrder', label: 'Sort Order', type: 'number' }],
  },
  'case-studies': {
    relations: [
      { field: 'services', label: 'Services', endpoint: '/admin/services' },
      { field: 'industries', label: 'Industries', endpoint: '/admin/industries' },
    ],
    mediaPickers: [
      { field: 'heroMediaId', label: 'Hero Image' },
      { field: 'coverMediaId', label: 'Cover Image' },
    ],
    extraTranslationFields: [
      { field: 'challenge', label: 'Challenge', type: 'textarea' },
      { field: 'approach', label: 'Approach', type: 'textarea' },
      { field: 'results', label: 'Results', type: 'textarea' },
    ],
  },
  insights: {
    singleRelations: [{ field: 'categoryId', label: 'Insight Category', endpoint: '/admin/insight-categories' }],
    relations: [
      { field: 'services', label: 'Related Services', endpoint: '/admin/services' },
      { field: 'industries', label: 'Related Industries', endpoint: '/admin/industries' },
      { field: 'tags', label: 'Tags', endpoint: '/admin/insight-tags' },
    ],
    mediaPickers: [{ field: 'heroMediaId', label: 'Hero / OG Image' }],
    extraTranslationFields: [{ field: 'content', label: 'Full Content', type: 'textarea' }],
  },
  pages: {
    hasSections: true,
    mediaPickers: [{ field: 'heroMediaId', label: 'Hero Image' }],
  },
  'team-members': {
    mediaPickers: [{ field: 'photoMediaId', label: 'Photo' }],
    extraTranslationFields: [
      { field: 'role', label: 'Role / Title', type: 'input' },
      { field: 'bio', label: 'Bio', type: 'textarea' },
    ],
  },
  clients: {
    mediaPickers: [{ field: 'logoMediaId', label: 'Logo' }],
    extraTranslationFields: [{ field: 'description', label: 'Description', type: 'textarea' }],
    extraRootFields: [{ field: 'website', label: 'Website URL', type: 'input' }],
  },
  partners: {
    mediaPickers: [{ field: 'logoMediaId', label: 'Logo' }],
    extraTranslationFields: [{ field: 'description', label: 'Description', type: 'textarea' }],
    extraRootFields: [{ field: 'website', label: 'Website URL', type: 'input' }],
  },
  brands: {
    mediaPickers: [
      { field: 'logoMediaId', label: 'Logo' },
      { field: 'coverMediaId', label: 'Cover Image' },
    ],
    extraTranslationFields: [{ field: 'description', label: 'Description', type: 'textarea' }],
    extraRootFields: [{ field: 'website', label: 'Website URL', type: 'input' }],
  },
  products: {
    mediaPickers: [
      { field: 'logoMediaId', label: 'Logo' },
      { field: 'heroMediaId', label: 'Hero Image' },
    ],
    extraTranslationFields: [{ field: 'description', label: 'Full Description', type: 'textarea' }],
    extraRootFields: [{ field: 'website', label: 'Website URL', type: 'input' }],
  },
  testimonials: {
    mediaPickers: [{ field: 'avatarMediaId', label: 'Author Photo' }],
    extraTranslationFields: [
      { field: 'quote', label: 'Quote', type: 'textarea' },
      { field: 'authorName', label: 'Author Name', type: 'input' },
      { field: 'authorTitle', label: 'Author Title', type: 'input' },
      { field: 'authorCompany', label: 'Company', type: 'input' },
    ],
  },
  certifications: {
    mediaPickers: [{ field: 'logoMediaId', label: 'Certification Logo' }],
    extraTranslationFields: [{ field: 'issuingBody', label: 'Issuing Body', type: 'input' }],
    extraRootFields: [{ field: 'expiresAt', label: 'Expiry Date (ISO)', type: 'input' }],
  },
  'trust-metrics': {
    extraTranslationFields: [
      { field: 'value', label: 'Value (e.g. 50+)', type: 'input' },
      { field: 'label', label: 'Label', type: 'input' },
    ],
    extraRootFields: [{ field: 'sortOrder', label: 'Sort Order', type: 'number' }],
  },
  faqs: {
    extraTranslationFields: [{ field: 'answer', label: 'Answer', type: 'textarea' }],
  },
};

const ALLOWED_SECTION_TYPES = [
  'hero', 'stats', 'rich_text', 'services_grid', 'industries_grid',
  'case_studies_grid', 'insights_grid', 'testimonials', 'trust_logos',
  'faq', 'cta', 'team_grid', 'partners_grid', 'brands_grid',
  'value_proposition', 'three_pillars', 'how_we_work', 'ecosystem',
];

// ─── Helpers ──────────────────────────────────────────────────────────────

async function loadOptions(endpoint: string): Promise<RelOption[]> {
  try {
    const rows = await api<{ id: string; translations?: Array<{ title?: string; name?: string; question?: string }> }[]>(`${endpoint}?pageSize=200`);
    return rows.map((r) => ({
      id: r.id,
      label: r.translations?.[0]?.title ?? r.translations?.[0]?.name ?? r.translations?.[0]?.question ?? r.id,
    }));
  } catch {
    return [];
  }
}

// ─── Page Sections Sub-Editor ─────────────────────────────────────────────

interface PageSection {
  id?: string;
  sectionType: string;
  sortOrder: number;
  enabled: boolean;
  translations?: Array<{ locale: string; content: Record<string, unknown> }>;
  _expanded?: boolean;
}

function SectionsEditor({
  sections,
  onChange,
}: {
  sections: PageSection[];
  onChange: (next: PageSection[]) => void;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((s, i) => ({ ...s, sortOrder: i })));
  };

  const toggle = (index: number) => {
    const next = [...sections];
    next[index] = { ...next[index], _expanded: !next[index]._expanded };
    onChange(next);
  };

  const remove = (index: number) => {
    if (!confirm('Delete this section?')) return;
    const next = sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i }));
    onChange(next);
  };

  const addSection = () => {
    onChange([
      ...sections,
      {
        sectionType: 'rich_text',
        sortOrder: sections.length,
        enabled: true,
        translations: [],
        _expanded: true,
      },
    ]);
  };

  const updateField = (index: number, field: string, value: unknown) => {
    const next = [...sections];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const updateContent = (index: number, key: string, value: string) => {
    const next = [...sections];
    const tr = next[index].translations ?? [];
    const existing = tr[0] ?? { locale: 'en', content: {} };
    next[index] = {
      ...next[index],
      translations: [{ ...existing, content: { ...(existing.content ?? {}), [key]: value } }],
    };
    onChange(next);
  };

  return (
    <div>
      <div className="sections-editor">
        {sections.length === 0 && (
          <p className="cell-meta">No sections yet. Add a section to build this page.</p>
        )}
        {sections.map((section, i) => {
          const content = (section.translations?.[0]?.content ?? {}) as Record<string, string>;
          return (
            <div key={i} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <span className="section-type">{section.sectionType.replaceAll('_', ' ')}</span>
                <Badge tone={section.enabled ? 'success' : 'neutral'}>
                  {section.enabled ? 'Visible' : 'Hidden'}
                </Badge>
                <div className="section-actions">
                  <button
                    type="button"
                    className="text-link"
                    style={{ padding: '.3rem .5rem', minHeight: 'unset' }}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ padding: '.3rem .5rem', minHeight: 'unset' }}
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ padding: '.3rem .5rem', minHeight: 'unset' }}
                    onClick={() => toggle(i)}
                  >
                    {section._expanded ? 'Collapse' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ padding: '.3rem .5rem', minHeight: 'unset', color: 'var(--color-danger)' }}
                    onClick={() => remove(i)}
                    aria-label="Delete section"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {section._expanded && (
                <div className="section-fields">
                  <Field label="Section Type">
                    <select
                      className="gv-input"
                      value={section.sectionType}
                      onChange={(e) => updateField(i, 'sectionType', e.target.value)}
                    >
                      {ALLOWED_SECTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Visibility">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => updateField(i, 'enabled', e.target.checked)}
                      />
                      Enabled / visible
                    </label>
                  </Field>
                  <Field label="Heading">
                    <Input value={content.title ?? ''} onChange={(e) => updateContent(i, 'title', e.target.value)} />
                  </Field>
                  <Field label="Body / Subtitle">
                    <Textarea value={content.body ?? ''} onChange={(e) => updateContent(i, 'body', e.target.value)} />
                  </Field>
                  {(section.sectionType === 'cta') && (
                    <>
                      <Field label="CTA Label">
                        <Input value={content.ctaLabel ?? ''} onChange={(e) => updateContent(i, 'ctaLabel', e.target.value)} />
                      </Field>
                      <Field label="CTA URL">
                        <Input dir="ltr" value={content.ctaUrl ?? ''} onChange={(e) => updateContent(i, 'ctaUrl', e.target.value)} />
                      </Field>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginBlockStart: '.8rem' }}>
        <Button type="button" onClick={addSection}>
          + Add section
        </Button>
      </div>
    </div>
  );
}

// ─── Relation multi-select ────────────────────────────────────────────────

function RelationSelect({
  field,
  label,
  options,
  selectedIds,
  onChange,
}: {
  field: string;
  label: string;
  options: RelOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };
  return (
    <Field label={label}>
      <div className="relation-chips">
        {options.length === 0 && <span className="cell-meta">No options available.</span>}
        {options.map((opt) => (
          <label key={opt.id} className="relation-chip" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              style={{ display: 'none' }}
            />
            <Badge tone={selectedIds.includes(opt.id) ? 'success' : 'neutral'}>{opt.label}</Badge>
          </label>
        ))}
      </div>
      <input type="hidden" name={field} value={selectedIds.join(',')} />
    </Field>
  );
}

// ─── Main ContentEditor ───────────────────────────────────────────────────

export function ContentEditor({
  resource,
  id,
  returnPath,
}: {
  resource: string;
  id?: string;
  returnPath: string;
}) {
  const router = useRouter();
  const def = CMS_DEFINITIONS[resource] ?? {};

  const [languages, setLanguages] = useState<Language[]>([]);
  const [locale, setLocale] = useState('');
  const [record, setRecord] = useState<Record<string, unknown>>({ status: 'draft', translations: {} });
  const [relOptions, setRelOptions] = useState<Record<string, RelOption[]>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Load languages + record
  useEffect(() => {
    void api<Language[]>('/admin/languages').then((rows) => {
      setLanguages(rows);
      setLocale(rows.find((x) => x.isDefault)?.code ?? rows[0]?.code ?? 'en');
    });
    if (id) {
      void api<Record<string, unknown>>(`/admin/${resource}/${id}`).then((data) => {
        const translations = Object.fromEntries(
          (data.translations as Array<Record<string, unknown>> ?? []).map((row) => [String(row.locale), row]),
        );
        setRecord({ ...data, translations });
      });
    }
  }, [id, resource]);

  // Load relation options
  useEffect(() => {
    const toLoad = [
      ...(def.relations ?? []),
      ...(def.singleRelations ?? []),
    ];
    toLoad.forEach(({ field, endpoint }) => {
      void loadOptions(endpoint).then((opts) => {
        setRelOptions((prev) => ({ ...prev, [field]: opts }));
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const translations = record.translations as Record<string, Record<string, unknown>>;
  const current = translations?.[locale] ?? {};

  function updateTranslation(field: string, value: string) {
    setRecord((prev) => ({
      ...prev,
      translations: {
        ...(prev.translations as object),
        [locale]: { ...((prev.translations as Record<string, object>)?.[locale] ?? {}), [field]: value },
      },
    }));
  }

  function updateRoot(field: string, value: unknown) {
    setRecord((prev) => ({ ...prev, [field]: value }));
  }

  function getRelIds(field: string): string[] {
    const val = record[field];
    if (Array.isArray(val)) return val.map((v: unknown) => (typeof v === 'object' && v !== null ? String((v as { id?: unknown }).id ?? '') : String(v)));
    return [];
  }

  const sections = (record.sections as PageSection[] | undefined) ?? [];
  const setSections = useCallback((next: PageSection[]) => {
    setRecord((prev) => ({ ...prev, sections: next }));
  }, []);

  async function save(publish = false) {
    setBusy(true);
    setMessage('');
    const payload = { ...record };
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    try {
      const saved = id
        ? await api<Record<string, unknown>>(`/admin/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api<Record<string, unknown>>(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(payload) });
      if (publish) await api(`/admin/${resource}/${String(saved.id)}/publish`, { method: 'POST' });
      setMessage(publish ? 'Published successfully.' : 'Draft saved.');
      if (!id) router.replace(`${returnPath}/${String(saved.id)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>{id ? 'Edit' : 'Create'} {resource.replaceAll('-', ' ')}</h1>
          <p>Maintain translations, publishing state, SEO and relations.</p>
        </div>
        <div className="toolbar">
          <Button disabled={busy} onClick={() => void save(false)}>Save draft</Button>
          <Button disabled={busy} onClick={() => void save(true)}>Publish</Button>
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          {/* Translation panel */}
          <section className="panel">
            <div className="tabs" role="tablist">
              {languages.map((lang) => (
                <button
                  role="tab"
                  className="tab"
                  aria-selected={locale === lang.code}
                  onClick={() => setLocale(lang.code)}
                  key={lang.code}
                >
                  {lang.nativeName}{' '}
                  {translations?.[lang.code]?.title || translations?.[lang.code]?.name
                    ? <Badge tone="success">Complete</Badge>
                    : <Badge tone="warning">Missing</Badge>}
                </button>
              ))}
            </div>

            <div className="field-stack">
              <Field label="Title / Name">
                <Input
                  value={String(current.title ?? current.name ?? '')}
                  onChange={(e) => updateTranslation('title', e.target.value)}
                  required
                />
              </Field>
              <Field label="Localized slug">
                <Input
                  dir="ltr"
                  value={String(current.slug ?? '')}
                  onChange={(e) => updateTranslation('slug', e.target.value)}
                  required
                />
              </Field>
              <Field label="Short description / Excerpt">
                <Textarea
                  value={String(current.excerpt ?? current.shortDescription ?? '')}
                  onChange={(e) => updateTranslation('excerpt', e.target.value)}
                />
              </Field>
              <Field label="Overview / Content">
                <Textarea
                  value={String(current.overview ?? current.content ?? '')}
                  onChange={(e) => updateTranslation('overview', e.target.value)}
                />
              </Field>

              {/* Domain-specific translation fields */}
              {def.extraTranslationFields?.map(({ field, label, type }) => (
                <Field key={field} label={label}>
                  {type === 'textarea' ? (
                    <Textarea
                      value={String(current[field] ?? '')}
                      onChange={(e) => updateTranslation(field, e.target.value)}
                    />
                  ) : (
                    <Input
                      value={String(current[field] ?? '')}
                      onChange={(e) => updateTranslation(field, e.target.value)}
                    />
                  )}
                </Field>
              ))}
            </div>
          </section>

          {/* Relations panel */}
          {(def.singleRelations?.length || def.relations?.length || def.mediaPickers?.length) && (
            <section className="panel">
              <h2>Relations &amp; media</h2>

              {/* Single relations */}
              {def.singleRelations?.map(({ field, label }) => (
                <Field key={field} label={label}>
                  <select
                    className="gv-input"
                    value={String(record[field] ?? '')}
                    onChange={(e) => updateRoot(field, e.target.value || null)}
                  >
                    <option value="">— None —</option>
                    {(relOptions[field] ?? []).map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </Field>
              ))}

              {/* Multi relations */}
              {def.relations?.map(({ field, label }) => (
                <RelationSelect
                  key={field}
                  field={field}
                  label={label}
                  options={relOptions[field] ?? []}
                  selectedIds={getRelIds(field)}
                  onChange={(ids) => updateRoot(field, ids)}
                />
              ))}

              {/* Media pickers */}
              {def.mediaPickers?.map(({ field, label }) => (
                <div key={field}>
                  <p className="cell-meta">{label}</p>
                  <MediaPicker
                    value={String(record[field] ?? '')}
                    onSelect={(mediaId) => updateRoot(field, mediaId)}
                  />
                </div>
              ))}

              {/* Default hero picker for resources without specific mediaPickers */}
              {!def.mediaPickers && (
                <div>
                  <p className="cell-meta">Hero image</p>
                  <MediaPicker
                    value={String(record.heroMediaId ?? '')}
                    onSelect={(heroMediaId) => updateRoot('heroMediaId', heroMediaId)}
                  />
                </div>
              )}
            </section>
          )}

          {/* Page sections editor */}
          {def.hasSections && (
            <section className="panel">
              <h2>Page Sections</h2>
              <p className="cell-meta">
                Build the page by adding and arranging sections. Each section type has its own content fields.
              </p>
              <SectionsEditor sections={sections} onChange={setSections} />
            </section>
          )}

          {/* Domain root fields */}
          {def.extraRootFields && def.extraRootFields.length > 0 && (
            <section className="panel">
              <h2>Additional settings</h2>
              <div className="field-stack">
                {def.extraRootFields.map(({ field, label, type }) => (
                  <Field key={field} label={label}>
                    <Input
                      type={type === 'number' ? 'number' : 'text'}
                      value={String(record[field] ?? '')}
                      onChange={(e) => updateRoot(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="editor-side">
          <section className="panel">
            <h2>Publishing</h2>
            <Field label="Status">
              <select
                className="gv-input"
                value={String(record.status ?? 'draft')}
                onChange={(e) => updateRoot('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <label>
              <input
                type="checkbox"
                checked={Boolean(record.featured)}
                onChange={(e) => updateRoot('featured', e.target.checked)}
              />{' '}
              Featured
            </label>
          </section>

          <section className="panel">
            <h2>SEO</h2>
            <Field label="SEO title">
              <Input
                value={String(current.seoTitle ?? '')}
                onChange={(e) => updateTranslation('seoTitle', e.target.value)}
              />
            </Field>
            <Field label="Meta description">
              <Textarea
                value={String(current.seoDescription ?? '')}
                onChange={(e) => updateTranslation('seoDescription', e.target.value)}
              />
            </Field>
            <Field label="OG Image">
              <MediaPicker
                value={String(record.ogMediaId ?? record.seoMediaId ?? '')}
                onSelect={(mediaId) => updateRoot('ogMediaId', mediaId)}
              />
            </Field>
          </section>

          {message && (
            <div className="form-status" role="status">
              {message}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
