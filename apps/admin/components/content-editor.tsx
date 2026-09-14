'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, type Language } from '@gatevia/api-client';
import { useRouter } from 'next/navigation';
import {
  cmsDefinitions,
  sectionSchemas,
  type CmsField,
  type SectionType,
} from '@gatevia/contracts';
import { Badge, Button, Field, Input, Textarea } from '@gatevia/ui';
import { api } from '@/lib/api';
import { startAdminNavigation } from '@/lib/navigation-feedback';
import { showAdminToast } from '@/lib/toast';
import {
  formatCmsValidationError,
  makeCmsEditorPayload,
  relationOptionLabel,
  validateCmsEditorFields,
  type TranslationMap,
} from '@/lib/cms-editor';
import { MediaPicker } from './media-picker';
import { useAdminAuth } from './auth-context';
import { useAdminI18n } from './admin-locale-provider';

type RelOption = { id: string; label: string };
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
  | { key: string; label: string; kind: 'process_steps' }
  | { key: string; label: string; kind: 'select'; options: string[] }
  | { key: string; label: string; kind: 'relation'; resource: string };
const BASE_SECTION_FIELDS: SectionField[] = [
  { key: 'eyebrow', label: 'field.eyebrow', kind: 'text' },
  { key: 'title', label: 'field.heading', kind: 'text' },
];
const SECTION_FIELDS: Record<SectionType, SectionField[]> = {
  hero: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'field.body', kind: 'long' },
    { key: 'primaryCta', label: 'field.primaryCtaJson', kind: 'json' },
    { key: 'secondaryCta', label: 'field.secondaryCtaJson', kind: 'json' },
    { key: 'mediaId', label: 'field.heroMedia', kind: 'media' },
  ],
  rich_text: [{ key: 'blocks', label: 'field.blocks', kind: 'json' }],
  text_image: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'field.body', kind: 'long' },
    { key: 'mediaId', label: 'field.media', kind: 'media' },
    { key: 'mediaPosition', label: 'field.mediaPosition', kind: 'select', options: ['start', 'end'] },
  ],
  stats: [...BASE_SECTION_FIELDS, { key: 'items', label: 'field.statsItems', kind: 'json' }],
  services_grid: [
    ...BASE_SECTION_FIELDS,
    { key: 'serviceIds', label: 'field.services', kind: 'relation', resource: 'services' },
    { key: 'featuredOnly', label: 'field.featuredOnly', kind: 'boolean' },
  ],
  industries_grid: [
    ...BASE_SECTION_FIELDS,
    { key: 'industryIds', label: 'field.industries', kind: 'relation', resource: 'industries' },
    { key: 'featuredOnly', label: 'field.featuredOnly', kind: 'boolean' },
  ],
  process: [
    ...BASE_SECTION_FIELDS,
    { key: 'steps', label: 'field.processSteps', kind: 'process_steps' },
  ],
  service_category_pillars: [
    ...BASE_SECTION_FIELDS,
    {
      key: 'categoryIds',
      label: 'field.serviceCategories',
      kind: 'relation',
      resource: 'service-categories',
    },
  ],
  timeline: [...BASE_SECTION_FIELDS, { key: 'steps', label: 'field.timelineSteps', kind: 'json' }],
  testimonials: [
    ...BASE_SECTION_FIELDS,
    { key: 'testimonialIds', label: 'field.testimonials', kind: 'relation', resource: 'testimonials' },
  ],
  case_studies: [
    ...BASE_SECTION_FIELDS,
    { key: 'caseStudyIds', label: 'field.caseStudies', kind: 'relation', resource: 'case-studies' },
  ],
  logo_cloud: [
    ...BASE_SECTION_FIELDS,
    { key: 'clientIds', label: 'field.clients', kind: 'relation', resource: 'clients' },
    { key: 'partnerIds', label: 'field.partners', kind: 'relation', resource: 'partners' },
  ],
  faq: [
    ...BASE_SECTION_FIELDS,
    { key: 'faqIds', label: 'field.faqs', kind: 'relation', resource: 'faqs' },
  ],
  cta: [
    ...BASE_SECTION_FIELDS,
    { key: 'body', label: 'field.body', kind: 'long' },
    { key: 'primaryCta', label: 'field.primaryCtaJson', kind: 'json' },
    { key: 'mediaId', label: 'field.ctaVisual', kind: 'media' },
  ],
  insights: [
    ...BASE_SECTION_FIELDS,
    { key: 'insightIds', label: 'field.insights', kind: 'relation', resource: 'insights' },
  ],
  ecosystem: [
    ...BASE_SECTION_FIELDS,
    { key: 'brandIds', label: 'field.brands', kind: 'relation', resource: 'brands' },
    { key: 'productIds', label: 'field.products', kind: 'relation', resource: 'products' },
  ],
  form: [
    ...BASE_SECTION_FIELDS,
    {
      key: 'formType',
      label: 'field.formType',
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
const MEDIA_FIELD_LABELS: Record<string, string> = {
  iconMediaId: 'field.iconMedia',
  coverMediaId: 'field.coverMedia',
  heroMediaId: 'field.heroMedia',
  ogMediaId: 'field.ogMedia',
  downloadableMediaId: 'field.downloadableMedia',
  photoMediaId: 'field.photoMedia',
  logoMediaId: 'field.logoMedia',
  mediaId: 'field.media',
};

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
async function loadOptions(resource: string, locale: string): Promise<RelOption[]> {
  try {
    const rows = await api<
      Array<{ id: string; displayName?: string; translations?: Array<Record<string, unknown>> }>
    >(`/admin/${resource}?pageSize=100`);
    return rows.map((row) => {
      return {
        id: row.id,
        label: relationOptionLabel(row, locale),
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
  const { t } = useAdminI18n();
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
        throw new Error(t('contentEditor.invalidJsonArray'));
      if (expected === 'object-or-array' && (!parsed || typeof parsed !== 'object'))
        throw new Error(t('contentEditor.invalidJsonStructured'));
      setError('');
      onChange(parsed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('contentEditor.invalidJson'));
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
  const { t } = useAdminI18n();
  return (
    <Field label={label}>
      <div className="relation-chips">
        {options.length === 0 && <span className="cell-meta">{t('contentEditor.noOptions')}</span>}
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

type ProcessStep = { title: string; body: string; mediaId?: string };

function ProcessStepsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (steps: ProcessStep[]) => void;
}) {
  const { t } = useAdminI18n();
  const steps: ProcessStep[] = Array.isArray(value)
    ? value.map((raw) => {
        const step = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          title: String(step.title ?? ''),
          body: String(step.body ?? ''),
          ...(typeof step.mediaId === 'string' && step.mediaId ? { mediaId: step.mediaId } : {}),
        };
      })
    : [];

  function update(index: number, patch: Partial<ProcessStep>) {
    onChange(steps.map((step, current) => (current === index ? { ...step, ...patch } : step)));
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <Field label={label}>
      <div className="sections-editor">
        {steps.map((step, index) => (
          <div className="section-row" key={index} style={{ display: 'grid', gap: '.7rem' }}>
            <Field label={`${t('contentEditor.step')} ${index + 1} ${t('contentEditor.title')}`}>
              <Input
                value={step.title}
                onChange={(event) => update(index, { title: event.target.value })}
              />
            </Field>
            <Field label={`${t('contentEditor.step')} ${index + 1} ${t('contentEditor.body')}`}>
              <Textarea
                value={step.body}
                onChange={(event) => update(index, { body: event.target.value })}
              />
            </Field>
            <Field label={`${t('contentEditor.step')} ${index + 1} ${t('contentEditor.image')}`}>
              <MediaPicker
                value={step.mediaId ?? ''}
                acceptMimePrefix="image/"
                onSelect={(mediaId) => {
                  if (mediaId) update(index, { mediaId });
                  else {
                    const next = steps.map((item, current) => {
                      if (current !== index) return item;
                      const withoutMedia = { ...item };
                      delete withoutMedia.mediaId;
                      return withoutMedia;
                    });
                    onChange(next);
                  }
                }}
              />
            </Field>
            <div className="toolbar">
              <Button
                type="button"
                variant="secondary"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                {t('contentEditor.moveUp')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => move(index, 1)}
                disabled={index === steps.length - 1}
              >
                {t('contentEditor.moveDown')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onChange(steps.filter((_, current) => current !== index))}
              >
                {t('action.delete')}
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={steps.length >= 12}
          onClick={() => onChange([...steps, { title: '', body: '' }])}
        >
          {t('contentEditor.addSection')}
        </Button>
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
  const { t } = useAdminI18n();
  const baseLabel = MEDIA_FIELD_LABELS[name] 
    ? t(MEDIA_FIELD_LABELS[name] as Parameters<typeof t>[0]) 
    : (t(`field.${name}` as Parameters<typeof t>[0]) !== `field.${name}` 
        ? t(`field.${name}` as Parameters<typeof t>[0]) 
        : (t(`relation.${name}` as Parameters<typeof t>[0]) !== `relation.${name}` 
            ? t(`relation.${name}` as Parameters<typeof t>[0]) 
            : humanize(name)));
  const label = `${baseLabel}${field.required ? ' *' : ''}`;
  if (field.kind === 'media')
    return (
      <Field label={label}>
        <MediaPicker
          value={typeof value === 'string' ? value : ''}
          acceptMimePrefix={name === 'downloadableMediaId' ? undefined : 'image/'}
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
          <option value="">{t('contentEditor.select')}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {t(`option.${option}` as Parameters<typeof t>[0]) || humanize(option)}
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
  const { t } = useAdminI18n();
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
        {sections.length === 0 && <p className="cell-meta">{t('contentEditor.noSections')}</p>}
        {sections.map((section, index) => {
          const content = section.translations[locale]?.content ?? {};
          return (
            <div
              key={section.id ?? index}
              className="section-row"
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <span className="section-type">{t(`sectionType.${section.sectionType}` as Parameters<typeof t>[0]) || humanize(section.sectionType)}</span>
                <Badge tone={section.isVisible ? 'success' : 'neutral'}>
                  {section.isVisible ? t('contentEditor.visible') : t('contentEditor.hidden')}
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
                    {section._expanded ? t('contentEditor.collapse') : t('action.edit')}
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => onChange(sections.filter((_, current) => current !== index))}
                  >
                    {t('action.delete')}
                  </button>
                </div>
              </div>
              {section._expanded && (
                <div className="section-fields">
                  <Field label={t('contentEditor.sectionType')}>
                    <select
                      className="gv-input"
                      value={section.sectionType}
                      onChange={(event) => changeType(index, event.target.value as SectionType)}
                    >
                      {SECTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(`sectionType.${type}` as Parameters<typeof t>[0]) || humanize(type)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('contentEditor.theme')}>
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
                      <option value="default">{t('contentEditor.themeDefault')}</option>
                      <option value="inverse">{t('contentEditor.themeInverse')}</option>
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
                    {t('contentEditor.visible')}
                  </label>
                  {(SECTION_FIELDS[section.sectionType] ?? []).map((field) => {
                    const fieldLabel = t(field.label as Parameters<typeof t>[0]) !== field.label 
                      ? t(field.label as Parameters<typeof t>[0]) 
                      : field.label;
                    if (field.kind === 'relation')
                      return (
                        <RelationSelect
                          key={field.key}
                          label={fieldLabel}
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
                        <Field key={field.key} label={fieldLabel}>
                          <MediaPicker
                            value={String(content[field.key] ?? '')}
                            acceptMimePrefix="image/"
                            onSelect={(value) => {
                              if (value) updateContent(index, field.key, value);
                              else {
                                mutate(index, (row) => {
                                  const current = row.translations[locale]?.content ?? {};
                                  const withoutMedia = { ...current };
                                  delete withoutMedia[field.key];
                                  return {
                                    ...row,
                                    translations: {
                                      ...row.translations,
                                      [locale]: { content: withoutMedia },
                                    },
                                  };
                                });
                              }
                            }}
                          />
                        </Field>
                      );
                    if (field.kind === 'process_steps')
                      return (
                        <ProcessStepsEditor
                          key={field.key}
                          label={fieldLabel}
                          value={content[field.key]}
                          onChange={(value) => updateContent(index, field.key, value)}
                        />
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
                          {fieldLabel}
                        </label>
                      );
                    if (field.kind === 'select')
                      return (
                        <Field key={field.key} label={fieldLabel}>
                          <select
                            className="gv-input"
                            value={String(content[field.key] ?? '')}
                            onChange={(event) =>
                              updateContent(index, field.key, event.target.value)
                            }
                          >
                            <option value="">{t('contentEditor.select')}</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {t(`option.${option}` as Parameters<typeof t>[0]) || humanize(option)}
                              </option>
                            ))}
                          </select>
                        </Field>
                      );
                    if (field.kind === 'json')
                      return (
                        <StructuredField
                          key={field.key}
                          label={fieldLabel}
                          value={content[field.key]}
                          expected="object-or-array"
                          onChange={(value) => updateContent(index, field.key, value)}
                        />
                      );
                    return (
                      <Field key={field.key} label={fieldLabel}>
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
          + {t('contentEditor.addSection')}
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
  const { t } = useAdminI18n();
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
  const [messageIsError, setMessageIsError] = useState(false);

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
    let cancelled = false;
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
      void loadOptions(relationResource, locale).then((rows) => {
        if (!cancelled)
          setOptions((previous) => ({ ...previous, [relationResource]: rows }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [definition, resource, locale]);

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
    return makeCmsEditorPayload({
      definition: activeDefinition,
      record,
      translations,
      sections,
      includeSections: resource === 'pages',
    });
  }
  function validate(body: Record<string, unknown>) {
    const issues = validateCmsEditorFields({ definition: activeDefinition, body, isCreate: !id, t });
    for (const section of (body.sections as PageSection[] | undefined) ?? [])
      for (const [translationLocale, tr] of Object.entries(section.translations)) {
        const result = sectionSchemas[section.sectionType].safeParse(tr.content);
        if (!result.success)
          issues.push(
            ...result.error.issues.map(
              (issue) =>
                `${translationLocale} ${humanize(section.sectionType)} section: ${issue.message}`,
            ),
          );
      }
    if (issues.length > 0) throw new Error(formatCmsValidationError(issues, t));
  }
  async function save(publish = false, returnAfterSave = true): Promise<Record<string, unknown> | undefined> {
    setBusy(true);
    setMessage('');
    setMessageIsError(false);
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
      setMessage(publish ? t('contentEditor.published') : t('media.saved'));
      if (returnAfterSave) {
        startAdminNavigation();
        router.replace(returnPath);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('contentEditor.cannotSave');
      setMessageIsError(true);
      setMessage(errorMessage);
      if (!(error instanceof ApiError)) showAdminToast({ kind: 'error', message: errorMessage });
    } finally {
      setBusy(false);
    }
  }
  async function transition(action: 'unpublish' | 'archive') {
    if (!id) return;
    setBusy(true);
    setMessage('');
    setMessageIsError(false);
    try {
      const result = await api<Record<string, unknown>>(`/admin/${resource}/${id}/${action}`, {
        method: 'POST',
      });
      setRecord({
        ...result,
        translations: normalizeTranslations(result.translations),
        sections: normalizeSections(result.sections),
      });
      setMessage(action === 'archive' ? t('contentEditor.archived') : t('contentEditor.movedToDraft'));
    } catch (error) {
      setMessageIsError(true);
      setMessage(action === 'archive' ? t('contentEditor.archiveFailed') : t('contentEditor.unpublishFailed'));
    } finally {
      setBusy(false);
    }
  }
  async function preview() {
    const saved = canEdit ? await save(false, false) : record;
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
      setMessageIsError(true);
      setMessage(error instanceof Error ? error.message : t('contentEditor.previewError'));
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
            {id ? t('action.edit') : t('action.create')} {
              t((
                {
                  pages: 'nav.pages', services: 'nav.services', 'service-categories': 'nav.serviceCategories',
                  industries: 'nav.industries', 'case-studies': 'nav.caseStudies', insights: 'nav.insights',
                  faqs: 'nav.faqs', 'team-members': 'nav.team', clients: 'nav.clients', partners: 'nav.partners',
                  brands: 'nav.brands', products: 'nav.products', testimonials: 'nav.testimonials',
                  certifications: 'nav.certifications', 'trust-metrics': 'nav.trustMetrics', leads: 'nav.leads',
                  users: 'nav.users', roles: 'nav.roles', languages: 'nav.languages', redirects: 'nav.redirects',
                  'audit-logs': 'nav.audit',
                } as Record<string, Parameters<typeof t>[0]>
              )[resource] ?? (humanize(resource) as Parameters<typeof t>[0]))
            }
          </h1>
          <p>{t('contentEditor.fieldsGenerated')}</p>
        </div>
        <div className="toolbar">
          {canEdit && (
            <Button disabled={busy} onClick={() => void save(false)}>
              {t('action.save')}
            </Button>
          )}
          {canPublish && record.status !== 'published' && (
            <Button disabled={busy} onClick={() => void save(true)}>
              {t('contentEditor.publishing')}
            </Button>
          )}
          {canPublish && record.status === 'published' && id && (
            <Button disabled={busy} onClick={() => void transition('unpublish')}>
              {t('contentEditor.unpublish')}
            </Button>
          )}
          {canArchive && record.status !== 'archived' && id && (
            <Button disabled={busy} onClick={() => void transition('archive')}>
              {t('action.archive')}
            </Button>
          )}
          {(id || canEdit) && (
            <Button disabled={busy} onClick={() => void preview()}>
              {t('action.view')}
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
                      <Badge tone="success">{t('contentEditor.authored')}</Badge>
                    ) : (
                      <Badge tone="warning">{t('contentEditor.missing')}</Badge>
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
                <h2>{t('contentEditor.relations')}</h2>
                <div className="field-stack">
                  {Object.entries(definition.relations).map(([key, relation]) =>
                    relation.many ? (
                      <RelationSelect
                        key={key}
                        label={t(`relation.${key}` as Parameters<typeof t>[0]) !== `relation.${key}` ? t(`relation.${key}` as Parameters<typeof t>[0]) : humanize(key)}
                        options={options[relation.resource] ?? []}
                        selectedIds={relationIds(key, relation.foreignKey)}
                        onChange={(ids) => updateRoot(key, ids)}
                      />
                    ) : (
                      <Field key={key} label={`${t(`relation.${key}` as Parameters<typeof t>[0]) !== `relation.${key}` ? t(`relation.${key}` as Parameters<typeof t>[0]) : humanize(key)}${relation.required ? ' *' : ''}`}>
                        <select
                          className="gv-input"
                          value={String(record[key] ?? '')}
                          onChange={(event) => updateRoot(key, event.target.value || null)}
                        >
                          <option value="">{t('contentEditor.none')}</option>
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
              <h2>{t('contentEditor.contentSettings')}</h2>
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
                <h2>{t('contentEditor.pageSections')} — {locale}</h2>
                <p className="cell-meta">
                  {t('contentEditor.fieldsGenerated')}
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
              <h2>{t('contentEditor.publishing')}</h2>
              <Badge
                tone={
                  record.status === 'published'
                    ? 'success'
                    : record.status === 'archived'
                      ? 'danger'
                      : 'neutral'
                }
              >
                {t(`status.${String(record.status ?? 'draft')}` as Parameters<typeof t>[0])}
              </Badge>
              {canEdit && record.status !== 'published' && record.status !== 'archived' && (
                <Field label={t('contentEditor.workflowStatus')}>
                  <select
                    className="gv-input"
                    value={record.status === 'review' ? 'review' : 'draft'}
                    onChange={(event) => updateRoot('status', event.target.value)}
                  >
                    <option value="draft">{t('status.draft')}</option>
                    <option value="review">{t('status.review')}</option>
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
              <div
                className={`form-status${messageIsError ? ' form-status--error' : ''}`}
                role={messageIsError ? 'alert' : 'status'}
              >
                {message}
              </div>
            )}
          </aside>
        </div>
      </fieldset>
    </>
  );
}
