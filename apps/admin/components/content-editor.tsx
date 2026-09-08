'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Language } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import {
  cmsDefinitions,
  fieldSchema,
  sectionSchemas,
  type CmsField,
  type SectionType,
} from '@gatevia/contracts';
import { Badge, Button, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';
import { MediaPicker } from './media-picker';
import { useAdminAuth } from './auth-context';

type RelOption = { id: string; label: string };
type TranslationMap = Record<string, Record<string, unknown>>;
interface PageSection {
  id?: string;
  sectionType: SectionType;
  isVisible: boolean;
  settings: { theme?: 'default' | 'inverse' };
  translations: Record<string, { content: Record<string, unknown> }>;
  _expanded?: boolean;
}

const SEO_FIELDS = new Set([
  'seoTitle',
  'seoDescription',
  'ogTitle',
  'ogDescription',
  'ogMediaId',
  'canonicalUrl',
  'robotsIndex',
]);
const SECTION_TYPES = Object.keys(sectionSchemas) as SectionType[];
type SectionField =
  | { key: string; label: string; kind: 'text' | 'long' | 'boolean' | 'media' | 'json' }
  | { key: string; label: string; kind: 'select'; options: string[] }
  | { key: string; label: string; kind: 'relation'; resource: string };
const BASE_SECTION_FIELDS: SectionField[] = [
  { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
  { key: 'title', label: 'Heading', kind: 'text' },
];
const SECTION_FIELDS: Record<SectionType, SectionField[]> = {
  hero: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'Body', kind: 'long' },
    { key: 'primaryCta', label: 'Primary CTA { label, href }', kind: 'json' },
    { key: 'secondaryCta', label: 'Secondary CTA { label, href }', kind: 'json' },
    { key: 'mediaId', label: 'Hero media', kind: 'media' },
  ],
  rich_text: [{ key: 'blocks', label: 'Structured content blocks', kind: 'json' }],
  text_image: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'Body', kind: 'long' },
    { key: 'mediaId', label: 'Media', kind: 'media' },
    { key: 'mediaPosition', label: 'Media position', kind: 'select', options: ['start', 'end'] },
  ],
  stats: [...BASE_SECTION_FIELDS, { key: 'items', label: 'Stats items', kind: 'json' }],
  services_grid: [
    ...BASE_SECTION_FIELDS,
    { key: 'serviceIds', label: 'Services', kind: 'relation', resource: 'services' },
    { key: 'featuredOnly', label: 'Featured only', kind: 'boolean' },
  ],
  industries_grid: [
    ...BASE_SECTION_FIELDS,
    { key: 'industryIds', label: 'Industries', kind: 'relation', resource: 'industries' },
    { key: 'featuredOnly', label: 'Featured only', kind: 'boolean' },
  ],
  process: [...BASE_SECTION_FIELDS, { key: 'steps', label: 'Process steps', kind: 'json' }],
  timeline: [...BASE_SECTION_FIELDS, { key: 'steps', label: 'Timeline steps', kind: 'json' }],
  testimonials: [
    ...BASE_SECTION_FIELDS,
    { key: 'testimonialIds', label: 'Testimonials', kind: 'relation', resource: 'testimonials' },
  ],
  case_studies: [
    ...BASE_SECTION_FIELDS,
    { key: 'caseStudyIds', label: 'Case studies', kind: 'relation', resource: 'case-studies' },
  ],
  logo_cloud: [
    ...BASE_SECTION_FIELDS,
    { key: 'clientIds', label: 'Clients', kind: 'relation', resource: 'clients' },
    { key: 'partnerIds', label: 'Partners', kind: 'relation', resource: 'partners' },
  ],
  faq: [
    ...BASE_SECTION_FIELDS,
    { key: 'faqIds', label: 'FAQs', kind: 'relation', resource: 'faqs' },
  ],
  cta: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'Body', kind: 'long' },
    { key: 'primaryCta', label: 'Primary CTA { label, href }', kind: 'json' },
  ],
  insights: [
    ...BASE_SECTION_FIELDS,
    { key: 'insightIds', label: 'Insights', kind: 'relation', resource: 'insights' },
  ],
  ecosystem: [
    ...BASE_SECTION_FIELDS,
    { key: 'brandIds', label: 'Brands', kind: 'relation', resource: 'brands' },
    { key: 'productIds', label: 'Products', kind: 'relation', resource: 'products' },
  ],
  form: [
    ...BASE_SECTION_FIELDS,
    {
      key: 'formType',
      label: 'Form type',
      kind: 'select',
      options: ['contact', 'consultation', 'assessment'],
    },
  ],
};

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function normalizeTranslations(value: unknown): TranslationMap {
  if (Array.isArray(value))
    return Object.fromEntries(
      value
        .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
        .map((row) => [String(row.locale), row]),
    );
  return value && typeof value === 'object' ? (value as TranslationMap) : {};
}
function normalizeSections(value: unknown): PageSection[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const row = raw as Record<string, unknown>;
    const translations = normalizeTranslations(row.translations);
    return {
      ...(typeof row.id === 'string' ? { id: row.id } : {}),
      sectionType: (SECTION_TYPES.includes(row.sectionType as SectionType)
        ? row.sectionType
        : 'rich_text') as SectionType,
      isVisible: row.isVisible !== false,
      settings: (row.settings as PageSection['settings']) ?? {},
      translations: Object.fromEntries(
        Object.entries(translations).map(([locale, tr]) => [
          locale,
          { content: (tr.content as Record<string, unknown>) ?? {} },
        ]),
      ),
    };
  });
}
async function loadOptions(resource: string): Promise<RelOption[]> {
  try {
    const rows = await api<
      Array<{ id: string; displayName?: string; translations?: Array<Record<string, unknown>> }>
    >(`/admin/${resource}?pageSize=100`);
    return rows.map((row) => {
      const tr = row.translations?.[0] ?? {};
      return {
        id: row.id,
        label: String(tr.title ?? tr.name ?? tr.question ?? row.displayName ?? row.id),
      };
    });
  } catch {
    return [];
  }
}

function StructuredField({
  label,
  value,
  expected,
  onChange,
}: {
  label: string;
  value: unknown;
  expected: 'array' | 'object-or-array';
  onChange: (value: unknown) => void;
}) {
  const formatted = useMemo(
    () => JSON.stringify(value ?? (expected === 'array' ? [] : {}), null, 2),
    [value, expected],
  );
  const [draft, setDraft] = useState(formatted);
  const [error, setError] = useState('');
  useEffect(() => setDraft(formatted), [formatted]);
  function commit(next: string) {
    setDraft(next);
    try {
      const parsed: unknown = JSON.parse(next);
      if (expected === 'array' && !Array.isArray(parsed))
        throw new Error('Value must be a JSON array.');
      if (expected === 'object-or-array' && (!parsed || typeof parsed !== 'object'))
        throw new Error('Value must be valid structured JSON.');
      setError('');
      onChange(parsed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid JSON.');
    }
  }
  return (
    <Field label={label}>
      <Textarea dir="ltr" value={draft} onChange={(event) => commit(event.target.value)} rows={8} />
      {error && (
        <span className="cell-meta" role="alert">
          {error}
        </span>
      )}
    </Field>
  );
}

function RelationSelect({
  label,
  options,
  selectedIds,
  onChange,
}: {
  label: string;
  options: RelOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <Field label={label}>
      <div className="relation-chips">
        {options.length === 0 && <span className="cell-meta">No options available.</span>}
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <label key={option.id} className="relation-chip" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  onChange(
                    selected
                      ? selectedIds.filter((id) => id !== option.id)
                      : [...selectedIds, option.id],
                  )
                }
                style={{ display: 'none' }}
              />
              <Badge tone={selected ? 'success' : 'neutral'}>{option.label}</Badge>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

function ContractField({
  name,
  field,
  value,
  onChange,
}: {
  name: string;
  field: CmsField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = `${humanize(name)}${field.required ? ' *' : ''}`;
  if (field.kind === 'media')
    return (
      <Field label={label}>
        <MediaPicker
          value={typeof value === 'string' ? value : ''}
          onSelect={(mediaId) => onChange(mediaId || null)}
        />
      </Field>
    );
  if (field.kind === 'boolean')
    return (
      <label>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />{' '}
        {label}
      </label>
    );
  if (field.kind === 'items' || field.kind === 'blocks')
    return (
      <StructuredField label={label} value={value ?? []} expected="array" onChange={onChange} />
    );
  if (field.kind === 'select')
    return (
      <Field label={label}>
        <select
          className="gv-input"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">— Select —</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {humanize(option)}
            </option>
          ))}
        </select>
      </Field>
    );
  if (field.kind === 'long')
    return (
      <Field label={label}>
        <Textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
      </Field>
    );
  return (
    <Field label={label}>
      <Input
        dir={
          field.kind === 'url' || field.kind === 'slug' || field.kind === 'date' ? 'ltr' : undefined
        }
        type={field.kind === 'number' ? 'number' : 'text'}
        value={String(value ?? '')}
        onChange={(event) =>
          onChange(field.kind === 'number' ? Number(event.target.value) : event.target.value)
        }
        required={field.required}
        placeholder={field.kind === 'date' ? '2026-09-08T00:00:00.000Z' : undefined}
      />
    </Field>
  );
}

function SectionsEditor({
  sections,
  locale,
  options,
  onChange,
}: {
  sections: PageSection[];
  locale: string;
  options: Record<string, RelOption[]>;
  onChange: (next: PageSection[]) => void;
}) {
  function mutate(index: number, mutation: (section: PageSection) => PageSection) {
    onChange(sections.map((section, current) => (current === index ? mutation(section) : section)));
  }
  function updateContent(index: number, key: string, value: unknown) {
    mutate(index, (section) => {
      const current = section.translations[locale]?.content ?? {};
      return {
        ...section,
        translations: {
          ...section.translations,
          [locale]: { content: { ...current, [key]: value } },
        },
      };
    });
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }
  function changeType(index: number, sectionType: SectionType) {
    mutate(index, (section) => ({
      ...section,
      sectionType,
      translations: Object.fromEntries(
        Object.keys(section.translations).map((translationLocale) => [
          translationLocale,
          { content: {} },
        ]),
      ),
    }));
  }
  return (
    <div>
      <div className="sections-editor">
        {sections.length === 0 && <p className="cell-meta">No sections yet.</p>}
        {sections.map((section, index) => {
          const content = section.translations[locale]?.content ?? {};
          return (
            <div
              key={section.id ?? index}
              className="section-row"
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <span className="section-type">{humanize(section.sectionType)}</span>
                <Badge tone={section.isVisible ? 'success' : 'neutral'}>
                  {section.isVisible ? 'Visible' : 'Hidden'}
                </Badge>
                <div className="section-actions">
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => mutate(index, (row) => ({ ...row, _expanded: !row._expanded }))}
                  >
                    {section._expanded ? 'Collapse' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => onChange(sections.filter((_, current) => current !== index))}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {section._expanded && (
                <div className="section-fields">
                  <Field label="Section type">
                    <select
                      className="gv-input"
                      value={section.sectionType}
                      onChange={(event) => changeType(index, event.target.value as SectionType)}
                    >
                      {SECTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {humanize(type)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Theme">
                    <select
                      className="gv-input"
                      value={section.settings.theme ?? 'default'}
                      onChange={(event) =>
                        mutate(index, (row) => ({
                          ...row,
                          settings: {
                            ...row.settings,
                            theme: event.target.value as 'default' | 'inverse',
                          },
                        }))
                      }
                    >
                      <option value="default">Default</option>
                      <option value="inverse">Inverse</option>
                    </select>
                  </Field>
                  <label>
                    <input
                      type="checkbox"
                      checked={section.isVisible}
                      onChange={(event) =>
                        mutate(index, (row) => ({ ...row, isVisible: event.target.checked }))
                      }
                    />{' '}
                    Visible
                  </label>
                  {(SECTION_FIELDS[section.sectionType] ?? []).map((field) => {
                    if (field.kind === 'relation')
                      return (
                        <RelationSelect
                          key={field.key}
                          label={field.label}
                          options={options[field.resource] ?? []}
                          selectedIds={
                            Array.isArray(content[field.key])
                              ? (content[field.key] as string[])
                              : []
                          }
                          onChange={(value) => updateContent(index, field.key, value)}
                        />
                      );
                    if (field.kind === 'media')
                      return (
                        <Field key={field.key} label={field.label}>
                          <MediaPicker
                            value={String(content[field.key] ?? '')}
                            onSelect={(value) => updateContent(index, field.key, value)}
                          />
                        </Field>
                      );
                    if (field.kind === 'boolean')
                      return (
                        <label key={field.key}>
                          <input
                            type="checkbox"
                            checked={Boolean(content[field.key])}
                            onChange={(event) =>
                              updateContent(index, field.key, event.target.checked)
                            }
                          />{' '}
                          {field.label}
                        </label>
                      );
                    if (field.kind === 'select')
                      return (
                        <Field key={field.key} label={field.label}>
                          <select
                            className="gv-input"
                            value={String(content[field.key] ?? '')}
                            onChange={(event) =>
                              updateContent(index, field.key, event.target.value)
                            }
                          >
                            <option value="">— Select —</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {humanize(option)}
                              </option>
                            ))}
                          </select>
                        </Field>
                      );
                    if (field.kind === 'json')
                      return (
                        <StructuredField
                          key={field.key}
                          label={field.label}
                          value={content[field.key]}
                          expected="object-or-array"
                          onChange={(value) => updateContent(index, field.key, value)}
                        />
                      );
                    return (
                      <Field key={field.key} label={field.label}>
                        {field.kind === 'long' ? (
                          <Textarea
                            value={String(content[field.key] ?? '')}
                            onChange={(event) =>
                              updateContent(index, field.key, event.target.value)
                            }
                          />
                        ) : (
                          <Input
                            value={String(content[field.key] ?? '')}
                            onChange={(event) =>
                              updateContent(index, field.key, event.target.value)
                            }
                          />
                        )}
                      </Field>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginBlockStart: '.8rem' }}>
        <Button
          type="button"
          onClick={() =>
            onChange([
              ...sections,
              {
                sectionType: 'rich_text',
                isVisible: true,
                settings: {},
                translations: { [locale]: { content: { blocks: [] } } },
                _expanded: true,
              },
            ])
          }
        >
          + Add section
        </Button>
      </div>
    </div>
  );
}

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
  const { can } = useAdminAuth();
  const definition = cmsDefinitions[resource];
  const [languages, setLanguages] = useState<Language[]>([]);
  const [locale, setLocale] = useState('');
  const [record, setRecord] = useState<Record<string, unknown>>({
    status: 'draft',
    translations: {},
    sections: [],
  });
  const [options, setOptions] = useState<Record<string, RelOption[]>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api<Language[]>('/admin/languages').then((rows) => {
      const active = rows.filter((row) => row.isActive);
      setLanguages(active);
      setLocale(active.find((row) => row.isDefault)?.code ?? active[0]?.code ?? 'en');
    });
    if (id)
      void api<Record<string, unknown>>(`/admin/${resource}/${id}`).then((data) =>
        setRecord({
          ...data,
          translations: normalizeTranslations(data.translations),
          sections: normalizeSections(data.sections),
        }),
      );
  }, [id, resource]);
  useEffect(() => {
    if (!definition) return;
    const resources = new Set(
      Object.values(definition.relations).map((relation) => relation.resource),
    );
    if (resource === 'pages')
      Object.values(SECTION_FIELDS)
        .flat()
        .forEach((field) => {
          if (field.kind === 'relation') resources.add(field.resource);
        });
    resources.forEach((relationResource) => {
      void loadOptions(relationResource).then((rows) =>
        setOptions((previous) => ({ ...previous, [relationResource]: rows })),
      );
    });
  }, [definition, resource]);

  const translations = normalizeTranslations(record.translations);
  const current = translations[locale] ?? {};
  const sections = (record.sections as PageSection[] | undefined) ?? [];
  const setSections = useCallback(
    (next: PageSection[]) => setRecord((previous) => ({ ...previous, sections: next })),
    [],
  );
  if (!definition)
    return <div className="form-status form-status--error">Unknown CMS resource: {resource}</div>;
  const activeDefinition = definition;
  const permissionDomain =
    (
      {
        'case-studies': 'case_studies',
        'team-members': 'team',
        'trust-metrics': 'trust_metrics',
        'service-categories': 'services',
      } as Record<string, string>
    )[resource] ?? resource;
  const canEdit = can(`${permissionDomain}.${id ? 'update' : 'create'}`);
  const canPublish = can(`${permissionDomain}.publish`);
  const canArchive = can(`${permissionDomain}.archive`);

  function updateTranslation(field: string, value: unknown) {
    setRecord((previous) => {
      const previousTranslations = normalizeTranslations(previous.translations);
      return {
        ...previous,
        translations: {
          ...previousTranslations,
          [locale]: { ...(previousTranslations[locale] ?? {}), [field]: value },
        },
      };
    });
  }
  function updateRoot(field: string, value: unknown) {
    setRecord((previous) => ({ ...previous, [field]: value }));
  }
  function relationIds(key: string, foreignKey: string) {
    const value = record[key];
    if (!Array.isArray(value)) return [];
    return value
      .map((item) =>
        typeof item === 'string'
          ? item
          : String((item as Record<string, unknown>)[foreignKey] ?? ''),
      )
      .filter(Boolean);
  }
  function makePayload() {
    const body: Record<string, unknown> = {};
    for (const key of Object.keys(activeDefinition.fields))
      if (record[key] !== undefined) body[key] = record[key];
    for (const [key, relation] of Object.entries(activeDefinition.relations))
      if (record[key] !== undefined)
        body[key] = relation.many ? relationIds(key, relation.foreignKey) : record[key];
    body.translations = Object.fromEntries(
      Object.entries(translations).map(([translationLocale, values]) => [
        translationLocale,
        Object.fromEntries(
          Object.keys(activeDefinition.translations)
            .filter((key) => values[key] !== undefined)
            .map((key) => [key, values[key]]),
        ),
      ]),
    );
    if (record.status === 'draft' || record.status === 'review') body.status = record.status;
    if (resource === 'pages')
      body.sections = sections.map((section) => ({
        sectionType: section.sectionType,
        isVisible: section.isVisible,
        settings: section.settings,
        translations: section.translations,
      }));
    return body;
  }
  function validate(body: Record<string, unknown>) {
    const localized = body.translations as TranslationMap;
    for (const [translationLocale, values] of Object.entries(localized)) {
      for (const [key, value] of Object.entries(values))
        fieldSchema(activeDefinition.translations[key]!).parse(value);
      if (!translationLocale) throw new Error('Choose a locale before editing translations.');
    }
    for (const section of (body.sections as PageSection[] | undefined) ?? [])
      for (const tr of Object.values(section.translations))
        sectionSchemas[section.sectionType].parse(tr.content);
  }
  async function save(publish = false): Promise<Record<string, unknown> | undefined> {
    setBusy(true);
    setMessage('');
    try {
      const body = makePayload();
      validate(body);
      const saved = id
        ? await api<Record<string, unknown>>(`/admin/${resource}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          })
        : await api<Record<string, unknown>>(`/admin/${resource}`, {
            method: 'POST',
            body: JSON.stringify(body),
          });
      const result = publish
        ? await api<Record<string, unknown>>(`/admin/${resource}/${String(saved.id)}/publish`, {
            method: 'POST',
          })
        : saved;
      setRecord({
        ...result,
        translations: normalizeTranslations(result.translations),
        sections: normalizeSections(result.sections),
      });
      setMessage(publish ? 'Published successfully.' : 'Saved successfully.');
      if (!id) router.replace(`${returnPath}/${String(saved.id)}`);
      return result;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }
  async function transition(action: 'unpublish' | 'archive') {
    if (!id) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await api<Record<string, unknown>>(`/admin/${resource}/${id}/${action}`, {
        method: 'POST',
      });
      setRecord({
        ...result,
        translations: normalizeTranslations(result.translations),
        sections: normalizeSections(result.sections),
      });
      setMessage(action === 'archive' ? 'Archived successfully.' : 'Moved to draft.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Unable to ${action}.`);
    } finally {
      setBusy(false);
    }
  }
  async function preview() {
    const saved = canEdit ? await save(false) : record;
    const previewId = String(saved?.id ?? id ?? '');
    if (!previewId) return;
    try {
      const result = await api<{ path: string }>(`/admin/${resource}/${previewId}/preview`, {
        method: 'POST',
        body: JSON.stringify({ locale }),
      });
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      window.open(`${site.replace(/\/$/, '')}${result.path}`, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Preview could not be opened.');
    }
  }
  const contentFields = Object.entries(definition.translations).filter(
    ([key]) => !SEO_FIELDS.has(key),
  );
  const seoFields = Object.entries(definition.translations).filter(([key]) => SEO_FIELDS.has(key));

  return (
    <>
      <div className="page-title">
        <div>
          <h1>
            {id ? 'Edit' : 'Create'} {humanize(resource)}
          </h1>
          <p>Fields are generated from the authoritative CMS contract.</p>
        </div>
        <div className="toolbar">
          {canEdit && (
            <Button disabled={busy} onClick={() => void save(false)}>
              Save
            </Button>
          )}
          {canPublish && record.status !== 'published' && (
            <Button disabled={busy} onClick={() => void save(true)}>
              Publish
            </Button>
          )}
          {canPublish && record.status === 'published' && id && (
            <Button disabled={busy} onClick={() => void transition('unpublish')}>
              Unpublish
            </Button>
          )}
          {canArchive && record.status !== 'archived' && id && (
            <Button disabled={busy} onClick={() => void transition('archive')}>
              Archive
            </Button>
          )}
          {(id || canEdit) && (
            <Button disabled={busy} onClick={() => void preview()}>
              Preview
            </Button>
          )}
        </div>
      </div>
      <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="editor">
          <div className="editor-main">
            <section className="panel">
              <div className="tabs" role="tablist">
                {languages.map((language) => (
                  <button
                    type="button"
                    role="tab"
                    className="tab"
                    aria-selected={locale === language.code}
                    onClick={() => setLocale(language.code)}
                    key={language.code}
                  >
                    {language.nativeName}{' '}
                    {translations[language.code] ? (
                      <Badge tone="success">Authored</Badge>
                    ) : (
                      <Badge tone="warning">Missing</Badge>
                    )}
                  </button>
                ))}
              </div>
              <div className="field-stack">
                {contentFields.map(([key, field]) => (
                  <ContractField
                    key={key}
                    name={key}
                    field={field}
                    value={current[key]}
                    onChange={(value) => updateTranslation(key, value)}
                  />
                ))}
              </div>
            </section>
            {Object.keys(definition.relations).length > 0 && (
              <section className="panel">
                <h2>Relations</h2>
                <div className="field-stack">
                  {Object.entries(definition.relations).map(([key, relation]) =>
                    relation.many ? (
                      <RelationSelect
                        key={key}
                        label={humanize(key)}
                        options={options[relation.resource] ?? []}
                        selectedIds={relationIds(key, relation.foreignKey)}
                        onChange={(ids) => updateRoot(key, ids)}
                      />
                    ) : (
                      <Field key={key} label={`${humanize(key)}${relation.required ? ' *' : ''}`}>
                        <select
                          className="gv-input"
                          value={String(record[key] ?? '')}
                          onChange={(event) => updateRoot(key, event.target.value || null)}
                        >
                          <option value="">— None —</option>
                          {(options[relation.resource] ?? []).map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ),
                  )}
                </div>
              </section>
            )}
            <section className="panel">
              <h2>Content settings</h2>
              <div className="field-stack">
                {Object.entries(definition.fields).map(([key, field]) => (
                  <ContractField
                    key={key}
                    name={key}
                    field={field}
                    value={record[key]}
                    onChange={(value) => updateRoot(key, value)}
                  />
                ))}
              </div>
            </section>
            {resource === 'pages' && (
              <section className="panel">
                <h2>Page sections — {locale}</h2>
                <p className="cell-meta">
                  Each section is validated against the central section contract for the selected
                  locale.
                </p>
                <SectionsEditor
                  sections={sections}
                  locale={locale}
                  options={options}
                  onChange={setSections}
                />
              </section>
            )}
          </div>
          <aside className="editor-side">
            <section className="panel">
              <h2>Publishing</h2>
              <Badge
                tone={
                  record.status === 'published'
                    ? 'success'
                    : record.status === 'archived'
                      ? 'danger'
                      : 'neutral'
                }
              >
                {String(record.status ?? 'draft')}
              </Badge>
              {canEdit && record.status !== 'published' && record.status !== 'archived' && (
                <Field label="Workflow status">
                  <select
                    className="gv-input"
                    value={record.status === 'review' ? 'review' : 'draft'}
                    onChange={(event) => updateRoot('status', event.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                  </select>
                </Field>
              )}
            </section>
            {seoFields.length > 0 && (
              <section className="panel">
                <h2>SEO — {locale}</h2>
                <div className="field-stack">
                  {seoFields.map(([key, field]) => (
                    <ContractField
                      key={key}
                      name={key}
                      field={field}
                      value={current[key]}
                      onChange={(value) => updateTranslation(key, value)}
                    />
                  ))}
                </div>
              </section>
            )}
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
