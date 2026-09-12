import { describe, expect, it } from 'vitest';
import { groupServicesByCategory } from './home-services-grouping';

const categories = [
  {
    id: 'growth',
    sortOrder: 30,
    coverMediaId: 'growth-cover',
    iconMediaId: 'growth-icon',
    translations: [{ name: 'Growth' }],
  },
  {
    id: 'access',
    sortOrder: 10,
    coverMediaId: 'access-cover',
    iconMediaId: 'access-icon',
    translations: [{ name: 'Market Access' }],
  },
  { id: 'execution', sortOrder: 20, translations: [{ name: 'Execution' }] },
];

describe('Home service category grouping', () => {
  it('groups shuffled and uneven services by real category IDs while preserving service order', () => {
    const services = [
      { id: 'g1', categoryId: 'growth' },
      { id: 'a1', categoryId: 'access' },
      { id: 'a2', categoryId: 'access' },
      { id: 'e1', categoryId: 'execution' },
      { id: 'a3', categoryId: 'access' },
      { id: 'g2', categoryId: 'growth' },
    ];
    const stages = groupServicesByCategory(services, categories);
    expect(stages.map((stage) => stage.key)).toEqual(['access', 'execution', 'growth']);
    expect(stages[0]!.items.map((item) => item.id)).toEqual(['a1', 'a2', 'a3']);
    expect(stages[1]!.items).toHaveLength(1);
    expect(stages[2]!.items).toHaveLength(2);
  });

  it('takes labels and media metadata from categories and never assigns a missing category by index', () => {
    const stages = groupServicesByCategory(
      [{ id: 'orphan' }, { id: 'a1', categoryId: 'access' }],
      categories,
    );
    expect(stages).toHaveLength(1);
    expect(stages[0]!.label).toBe('Market Access');
    expect(stages[0]!.category.coverMediaId).toBe('access-cover');
    expect(stages[0]!.category.iconMediaId).toBe('access-icon');
    expect(stages[0]!.items.map((item) => item.id)).toEqual(['a1']);
  });

  it('uses localized names supplied by the CMS', () => {
    const localized = categories.map((category) => ({
      ...category,
      translations: [{ name: category.id === 'access' ? 'دخول السوق' : category.translations[0]!.name }],
    }));
    expect(groupServicesByCategory([{ categoryId: 'access' }], localized)[0]!.label).toBe(
      'دخول السوق',
    );
  });
});
