import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicContentService } from '../src/content/public-content.service';

const categoryId = '5b7d69a8-43e5-4d08-a0c8-fb9bc173ba0e';
const coverMediaId = '7a121f27-853c-4ec9-a63d-3142ea928655';

function languageApi() {
  return {
    findFirst: vi.fn().mockResolvedValue({ code: 'en' }),
    findMany: vi.fn().mockResolvedValue([
      { code: 'en', isActive: true, isDefault: true, sortOrder: 0 },
    ]),
  };
}

function serviceRow() {
  return {
    id: 'service-id',
    categoryId,
    heroMediaId: null,
    iconMediaId: null,
    featured: true,
    sortOrder: 10,
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    translations: [{ locale: 'en', title: 'Service', slug: 'service' }],
  };
}

afterEach(() => vi.restoreAllMocks());

describe('public content category serialization', () => {
  it('emits the real scalar categoryId and filters services through a public translated category', async () => {
    const findMany = vi.fn().mockResolvedValue([serviceRow()]);
    const prisma = {
      language: languageApi(),
      service: { findMany, count: vi.fn().mockResolvedValue(1) },
    };
    const service = new PublicContentService(prisma as never, {} as never);
    const result = await service.list('services', { locale: 'en', page: '1', pageSize: '20' });
    expect(result.data[0]!.categoryId).toBe(categoryId);
    expect(typeof result.data[0]!.categoryId).toBe('string');
    expect(findMany.mock.calls[0]![0].where.category).toEqual({
      is: { status: 'published', translations: { some: { locale: 'en' } } },
    });
  });

  it('keeps categoryId scalar in detail and puts the expanded category object under related', async () => {
    const category = {
      id: categoryId,
      iconMediaId: null,
      coverMediaId: null,
      sortOrder: 10,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      translations: [{ locale: 'en', name: 'Market Access', slug: 'market-access' }],
    };
    const prisma = {
      language: languageApi(),
      service: { findFirst: vi.fn().mockResolvedValue(serviceRow()) },
      serviceCategory: {
        findMany: vi.fn().mockResolvedValue([category]),
        count: vi.fn().mockResolvedValue(1),
      },
    };
    const service = new PublicContentService(prisma as never, {} as never);
    const result = await service.detail('services', 'en', 'service');
    expect(result.categoryId).toBe(categoryId);
    expect(Array.isArray(result.categoryId)).toBe(false);
    expect((result.related as Record<string, unknown>).categoryId).toMatchObject({ id: categoryId });
  });

  it('embeds ordered service categories with cover media in the Home pillar collection', async () => {
    vi.stubEnv('R2_PUBLIC_BASE_URL', 'https://media.example.test');
    const page = {
      id: 'page-id',
      featured: true,
      pageType: 'home',
      templateKey: 'home',
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      translations: [{ locale: 'en', title: 'Home', slug: 'home' }],
      sections: [
        {
          id: 'section-id',
          sectionType: 'service_category_pillars',
          isVisible: true,
          settings: {},
          translations: [{ locale: 'en', content: { categoryIds: [categoryId] } }],
        },
      ],
      faqs: [],
    };
    const category = {
      id: categoryId,
      iconMediaId: null,
      coverMediaId,
      sortOrder: 10,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      translations: [{ locale: 'en', name: 'Market Access', slug: 'market-access' }],
    };
    const prisma = {
      language: languageApi(),
      page: { findFirst: vi.fn().mockResolvedValue(page) },
      serviceCategory: {
        findMany: vi.fn().mockResolvedValue([category]),
        count: vi.fn().mockResolvedValue(1),
      },
      media: {
        findFirst: vi.fn().mockResolvedValue({
          id: coverMediaId,
          originalFilename: 'cover.jpg',
          storageKey: 'covers/cover.jpg',
          mimeType: 'image/jpeg',
          status: 'ready',
          sizeBytes: 100n,
          width: 1200,
          height: 800,
          translations: [],
          variants: [],
        }),
      },
    };
    const service = new PublicContentService(prisma as never, {} as never);
    const result = await service.detail('pages', 'en', 'home');
    const section = (result.sections as Array<Record<string, unknown>>)[0]!;
    const collections = section.collections as Record<string, Array<Record<string, unknown>>>;
    expect(collections['service-categories']![0]).toMatchObject({ id: categoryId, coverMediaId });
    expect(
      (collections['service-categories']![0]!.media as Record<string, unknown>)[coverMediaId],
    ).toMatchObject({ url: 'https://media.example.test/covers/cover.jpg' });
  });
});
