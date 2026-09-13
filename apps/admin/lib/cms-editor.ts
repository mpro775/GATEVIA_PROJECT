import { fieldSchema, normalizeCmsFieldRecord, type CmsDefinition } from '@gatevia/contracts';
import { isTranslationKey, type TranslationKey } from '@/lib/i18n';

export function relationOptionLabel(
  row: { id: string; displayName?: string; translations?: Array<Record<string, unknown>> },
  locale: string,
) {
  const translations = row.translations ?? [];
  const translation =
    translations.find((item) => item.locale === locale) ?? translations[0] ?? {};
  return String(
    translation.title ??
      translation.name ??
      translation.question ??
      row.displayName ??
      row.id,
  );
}

export type TranslationMap = Record<string, Record<string, unknown>>;

interface EditorSection {
  sectionType: string;
  isVisible: boolean;
  settings: unknown;
  translations: unknown;
}

export function makeCmsEditorPayload({
  definition,
  record,
  translations,
  sections,
  includeSections,
}: {
  definition: CmsDefinition;
  record: Record<string, unknown>;
  translations: TranslationMap;
  sections: EditorSection[];
  includeSections: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const rootValues = Object.fromEntries(
    Object.keys(definition.fields)
      .filter((key) => record[key] !== undefined)
      .map((key) => [key, record[key]]),
  );
  Object.assign(body, normalizeCmsFieldRecord(definition.fields, rootValues));

  for (const [key, relation] of Object.entries(definition.relations)) {
    if (record[key] === undefined) continue;
    if (!relation.many) {
      body[key] = record[key];
      continue;
    }
    const value = record[key];
    body[key] = Array.isArray(value)
      ? value
          .map((item) =>
            typeof item === 'string'
              ? item
              : String((item as Record<string, unknown>)[relation.foreignKey] ?? ''),
          )
          .filter(Boolean)
      : [];
  }

  body.translations = Object.fromEntries(
    Object.entries(translations).map(([locale, values]) => {
      const included = Object.fromEntries(
        Object.keys(definition.translations)
          .filter((key) => values[key] !== undefined)
          .map((key) => [key, values[key]]),
      );
      return [locale, normalizeCmsFieldRecord(definition.translations, included)];
    }),
  );
  if (record.status === 'draft' || record.status === 'review') body.status = record.status;
  if (includeSections)
    body.sections = sections.map(
      ({ sectionType, isVisible, settings, translations: localized }) => ({
        sectionType,
        isVisible,
        settings,
        translations: localized,
      }),
    );
  return body;
}

export function validateCmsEditorFields({
  definition,
  body,
  isCreate,
  t,
}: {
  definition: CmsDefinition;
  body: Record<string, unknown>;
  isCreate: boolean;
  t: (key: TranslationKey, fallback?: string) => string;
}): string[] {
  const issues: string[] = [];
  const humanize = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  
  for (const [key, field] of Object.entries(definition.fields)) {
    const value = body[key];
    const translationKey = `field.${key}`;
    const fieldLabel = isTranslationKey(translationKey) ? t(translationKey) : humanize(key);
    if (value === undefined) {
      if (isCreate && field.required) issues.push(`${fieldLabel}: ${t('validation.required')}`);
      continue;
    }
    const result = fieldSchema(field).safeParse(value);
    if (!result.success)
      issues.push(...result.error.issues.map((issue) => {
        let msg = issue.message;
        if (msg === 'Required') msg = t('validation.required');
        if (msg === 'Use a local path or an approved URL protocol.') msg = t('validation.invalidUrl');
        if (msg === 'Choose an allowed value.') msg = t('validation.invalidValue');
        return `${fieldLabel}: ${msg}`;
      }));
  }
  const translations = body.translations as TranslationMap;
  for (const [locale, values] of Object.entries(translations)) {
    if (!locale) {
      issues.push(t('validation.chooseLocale'));
      continue;
    }
    for (const [key, value] of Object.entries(values)) {
      const field = definition.translations[key];
      const translationKey = `field.${key}`;
      const fieldLabel = isTranslationKey(translationKey) ? t(translationKey) : humanize(key);
      if (!field) {
        issues.push(`${locale} - ${fieldLabel}: ${t('validation.unknownField')}`);
        continue;
      }
      const result = fieldSchema(field).safeParse(value);
      if (!result.success)
        issues.push(...result.error.issues.map((issue) => {
          let msg = issue.message;
          if (msg === 'Required') msg = t('validation.required');
          if (msg === 'Use a local path or an approved URL protocol.') msg = t('validation.invalidUrl');
          if (msg === 'Choose an allowed value.') msg = t('validation.invalidValue');
          return `${locale} - ${fieldLabel}: ${msg}`;
        }));
    }
  }
  return issues;
}

export function formatCmsValidationError(issues: string[], t: (key: TranslationKey, fallback?: string) => string): string {
  const visible = issues.slice(0, 3);
  const remaining = issues.length - visible.length;
  return `${t('contentEditor.cannotSave')} ${visible.join(' ')}${remaining > 0 ? ` (+${remaining})` : ''}`;
}
