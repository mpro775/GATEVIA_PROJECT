import { describe, expect, it, vi } from 'vitest';
import { AdminContentService } from '../src/content/admin-content.service';

const categoryId = '5b7d69a8-43e5-4d08-a0c8-fb9bc173ba0e';
const publishedService = {
  id: 'service-id',
  categoryId,
  translations: [
    {
      locale: 'en',
      title: 'Service',
      slug: 'service',
      shortDescription: 'Short description',
      overview: 'Overview',
    },
    {
      locale: 'ar-SA',
      title: 'خدمة',
      slug: 'خدمة',
      shortDescription: 'وصف مختصر',
      overview: 'نظرة عامة',
    },
  ],
};

function subject(category: unknown) {
  const prisma = {
    language: {
      findMany: vi.fn().mockResolvedValue([
        { code: 'en', isActive: true },
        { code: 'ar-SA', isActive: true },
      ]),
    },
    serviceCategory: { findFirst: vi.fn().mockResolvedValue(category) },
  };
  return new AdminContentService(prisma as never, {} as never, {} as never);
}

describe('service publication category integrity', () => {
  it('rejects publication when the category is not published', async () => {
    const service = subject(null) as unknown as {
      assertPublish(resource: string, row: Record<string, unknown>): Promise<void>;
    };
    await expect(service.assertPublish('services', publishedService)).rejects.toThrow(
      'Publish the service category',
    );
  });

  it('rejects publication when the category lacks an authored service locale', async () => {
    const service = subject({ translations: [{ locale: 'en' }] }) as unknown as {
      assertPublish(resource: string, row: Record<string, unknown>): Promise<void>;
    };
    await expect(service.assertPublish('services', publishedService)).rejects.toThrow(
      'matching active translations',
    );
  });

  it('accepts a published category translated for every authored service locale', async () => {
    const service = subject({ translations: [{ locale: 'en' }, { locale: 'ar-SA' }] }) as unknown as {
      assertPublish(resource: string, row: Record<string, unknown>): Promise<void>;
    };
    await expect(service.assertPublish('services', publishedService)).resolves.toBeUndefined();
  });
});
