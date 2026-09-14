import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicContentService } from './public-content.service';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Service Category Cover Media Inheritance', () => {
  let service: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PublicContentService,
        { provide: PrismaService, useValue: { language: { findMany: vi.fn().mockResolvedValue([]) }, media: { findFirst: vi.fn() } } },
        { provide: ConfigService, useValue: { getOrThrow: vi.fn() } },
      ],
    }).compile();

    service = moduleRef.get(PublicContentService);
    service.languages = vi.fn().mockResolvedValue([{ code: 'en' }, { code: 'ar' }]);
    service.media = vi.fn().mockImplementation((id: string) => Promise.resolve({ id, url: `https://example.com/${id}` }));
  });

  it('Case A: service.heroMediaId exists', async () => {
    const row = {
      id: 'service-1',
      heroMediaId: 'd3b07384-d113-4f51-b847-19d2688f117c',
      category: { coverMediaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      translations: [{ locale: 'en' }],
    };
    const result = await service.present('services', row, 'en');
    expect(result.effectiveHeroMediaId).toBe('d3b07384-d113-4f51-b847-19d2688f117c');
    expect(result.media['d3b07384-d113-4f51-b847-19d2688f117c']).toBeDefined();
  });

  it('Case B: service.heroMediaId is null, category exists', async () => {
    const row = {
      id: 'service-2',
      heroMediaId: null,
      category: { coverMediaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      translations: [{ locale: 'en' }],
    };
    const result = await service.present('services', row, 'en');
    expect(result.effectiveHeroMediaId).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    expect(result.media['f47ac10b-58cc-4372-a567-0e02b2c3d479']).toBeDefined(); // Case D: media map contains inherited category media
  });

  it('Case C: both null', async () => {
    const row = {
      id: 'service-3',
      heroMediaId: null,
      category: { coverMediaId: null },
      translations: [{ locale: 'en' }],
    };
    const result = await service.present('services', row, 'en');
    expect(result.effectiveHeroMediaId).toBeNull();
  });
});
