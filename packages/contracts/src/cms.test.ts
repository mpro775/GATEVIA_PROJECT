import { describe, expect, it } from 'vitest';
import {
  cmsDefinitions,
  fieldSchema,
  normalizeCmsFieldRecord,
  normalizeCmsFieldValue,
} from './cms.js';

describe('CMS field storage contracts', () => {
  it('accepts database null for optional text, URL, date, and media fields', () => {
    const industry = cmsDefinitions.industries!;
    expect(fieldSchema(industry.translations.seoTitle!).safeParse(null).success).toBe(true);
    expect(fieldSchema(industry.translations.canonicalUrl!).safeParse(null).success).toBe(true);
    expect(fieldSchema(industry.translations.ogMediaId!).safeParse(null).success).toBe(true);
    expect(fieldSchema(industry.fields.heroMediaId!).safeParse(null).success).toBe(true);
    expect(fieldSchema(cmsDefinitions.partners!.fields.startDate!).safeParse(null).success).toBe(
      true,
    );
  });

  it('does not weaken required or non-null defaulted field validation', () => {
    const industry = cmsDefinitions.industries!;
    expect(fieldSchema(industry.translations.name!).safeParse(null).success).toBe(false);
    expect(fieldSchema(industry.translations.name!).safeParse('').success).toBe(false);
    expect(fieldSchema(industry.fields.featured!).safeParse(null).success).toBe(false);
    expect(fieldSchema(industry.fields.sortOrder!).safeParse(null).success).toBe(false);
    expect(cmsDefinitions.insights!.fields.type!.required).toBe(true);
    expect(fieldSchema(cmsDefinitions.insights!.fields.type!).safeParse('').success).toBe(false);
  });

  it('normalizes an explicit optional scalar clear to null and preserves undefined', () => {
    const fields = cmsDefinitions.industries!.translations;
    expect(normalizeCmsFieldValue(fields.seoTitle!, '')).toBeNull();
    expect(normalizeCmsFieldValue(fields.seoTitle!, undefined)).toBeUndefined();
    expect(normalizeCmsFieldValue(fields.name!, '')).toBe('');
    expect(
      normalizeCmsFieldRecord(fields, {
        name: 'Industry',
        seoTitle: '',
        seoDescription: null,
      }),
    ).toEqual({ name: 'Industry', seoTitle: null, seoDescription: null });
  });
});
