import { text, translation } from '../../lib/content';

export type ServiceStage = {
  key: string;
  label: string;
  category: Record<string, unknown>;
  items: Record<string, unknown>[];
};

export function groupServicesByCategory(
  items: Record<string, unknown>[],
  categories: Record<string, unknown>[],
): ServiceStage[] {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const item of items) {
    const categoryId = text(item.categoryId);
    if (!categoryId) continue;
    const group = groups.get(categoryId) ?? [];
    group.push(item);
    groups.set(categoryId, group);
  }

  return categories
    .filter((category) => groups.has(text(category.id)))
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((category) => ({
      key: text(category.id),
      label: text(translation(category).name),
      category,
      items: groups.get(text(category.id)) ?? [],
    }));
}
