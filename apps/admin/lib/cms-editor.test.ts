import { describe, expect, it } from 'vitest';
import { cmsDefinitions } from '@gatevia/contracts';
import {
  formatCmsValidationError,
  makeCmsEditorPayload,
  relationOptionLabel,
  validateCmsEditorFields,
} from './cms-editor';

const heroMediaId = '5b7d69a8-43e5-4d08-a0c8-fb9bc173ba0e';

function industryPayload(overrides: Record<string, unknown> = {}) {
  const definition = cmsDefinitions.industries!;
  const body = makeCmsEditorPayload({
    definition,
    record: {
      status: 'draft',
      featured: false,
      sortOrder: 0,
      heroMediaId,
      translations: {},
      ...overrides,
    },
    translations: {
      en: {
        name: 'Industry',
        slug: 'industry',
        shortDescription: 'Short description',
        overview: 'Overview',
        challenges: [],
        opportunities: [],
        ctaLabel: null,
        seoTitle: null,
        seoDescription: null,
        ogTitle: null,
        ogDescription: null,
        canonicalUrl: null,
        ogMediaId: null,
        robotsIndex: true,
      },
    },
    sections: [],
    includeSections: false,
  });
  return { definition, body };
}

describe('CMS editor payloads', () => {
  it('selects relation labels for the current locale with a deterministic fallback', () => {
    const row = {
      id: 'category',
      translations: [
        { locale: 'en', name: 'Growth' },
        { locale: 'ar-SA', name: 'النمو' },
      ],
    };
    expect(relationOptionLabel(row, 'ar-SA')).toBe('النمو');
    expect(relationOptionLabel(row, 'fr')).toBe('Growth');
  });

  it('preserves Service Category cover media and explicit clears', () => {
    const definition = cmsDefinitions['service-categories']!;
    const translations = {
      en: { name: 'Market Access', slug: 'market-access', description: 'Description' },
    };
    const record = {
      status: 'draft',
      sortOrder: 10,
      iconMediaId: null,
      coverMediaId: heroMediaId,
    };
    const withCover = makeCmsEditorPayload({
      definition,
      record,
      translations,
      sections: [],
      includeSections: false,
    });
    expect(withCover.coverMediaId).toBe(heroMediaId);
    const cleared = makeCmsEditorPayload({
      definition,
      record: { ...record, coverMediaId: '' },
      translations,
      sections: [],
      includeSections: false,
    });
    expect(cleared.coverMediaId).toBeNull();
  });

  it('preserves categoryIds in page section payloads', () => {
    const categoryIds = [heroMediaId];
    const body = makeCmsEditorPayload({
      definition: cmsDefinitions.pages!,
      record: { status: 'draft', featured: false, pageType: 'home', templateKey: 'home' },
      translations: { en: { title: 'Home', slug: 'home' } },
      sections: [
        {
          sectionType: 'service_category_pillars',
          isVisible: true,
          settings: {},
          translations: { en: { content: { title: 'Pillars', categoryIds } } },
        },
      ],
      includeSections: true,
    });
    const section = (body.sections as Array<Record<string, unknown>>)[0]!;
    const sectionTranslations = section.translations as Record<
      string,
      { content: Record<string, unknown> }
    >;
    expect(sectionTranslations.en!.content.categoryIds).toEqual(categoryIds);
  });
  it('allows an Industry hero media PATCH payload with nullable SEO fields', () => {
    const { definition, body } = industryPayload();
    expect(body.heroMediaId).toBe(heroMediaId);
    expect((body.translations as Record<string, Record<string, unknown>>).en!.seoTitle).toBeNull();
    expect(validateCmsEditorFields({ definition, body, isCreate: false })).toEqual([]);
  });

  it('keeps explicit text and media clears in the payload as null', () => {
    const { definition, body } = industryPayload({ heroMediaId: null });
    const cleared = makeCmsEditorPayload({
      definition,
      record: { ...body, heroMediaId: null },
      translations: {
        en: {
          ...((body.translations as Record<string, Record<string, unknown>>).en ?? {}),
          seoTitle: '',
        },
      },
      sections: [],
      includeSections: false,
    });
    expect(cleared.heroMediaId).toBeNull();
    expect(
      (cleared.translations as Record<string, Record<string, unknown>>).en!.seoTitle,
    ).toBeNull();
    expect(validateCmsEditorFields({ definition, body: cleared, isCreate: false })).toEqual([]);
  });

  it('returns field-addressed validation feedback instead of failing silently', () => {
    const { definition, body } = industryPayload();
    (body.translations as Record<string, Record<string, unknown>>).en!.seoTitle = 42;
    const issues = validateCmsEditorFields({ definition, body, isCreate: false });
    expect(issues[0]).toContain('en.seoTitle');
    expect(formatCmsValidationError(issues)).toMatch(/^Cannot save content\. en\.seo Title:/);
  });
});
