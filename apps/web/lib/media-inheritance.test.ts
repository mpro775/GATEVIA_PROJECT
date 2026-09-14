import { expect, test, describe } from 'vitest';

describe('Web Media Inheritance (Case E)', () => {
  test('Service Card priority simulation', () => {
    // This simulates the logic inside resource-cards.tsx for services
    const item = {
      heroMediaId: 'hero-1',
      effectiveHeroMediaId: 'cover-1',
      iconMediaId: 'icon-1',
      media: {
        'hero-1': { url: 'https://example.com/hero' },
        'cover-1': { url: 'https://example.com/cover' },
        'icon-1': { url: 'https://example.com/icon' },
      },
    };
    
    // Simulate translation resolution
    const tr = { ogMediaId: 'og-1' };
    
    // Priority: effectiveHeroMediaId, heroMediaId, iconMediaId, ogMediaId
    const ids = [item.effectiveHeroMediaId, item.heroMediaId, item.iconMediaId, tr.ogMediaId];
    
    let resolvedId = null;
    for (const id of ids) {
      if (item.media[id as keyof typeof item.media]) {
        resolvedId = id;
        break;
      }
    }
    
    expect(resolvedId).toBe('cover-1');
  });

  test('Service Detail priority simulation', () => {
    // This simulates the logic in page.tsx for detail views
    const entity = {
      heroMediaId: null,
      effectiveHeroMediaId: 'cover-123',
    };
    
    const heroMediaId = entity.effectiveHeroMediaId ?? entity.heroMediaId;
    expect(heroMediaId).toBe('cover-123');
  });
});
