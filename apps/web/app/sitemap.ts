import type { MetadataRoute } from 'next';
import { getLanguages, getList, safe } from '@/lib/api';
import { translation } from '@/lib/content';
const listingResources = [
  'services',
  'industries',
  'case-studies',
  'insights',
  'brands',
  'products',
  'clients',
  'partners',
  'certifications',
  'trust-metrics',
  'testimonials',
  'team',
  'faqs',
];
const detailResources = new Set([
  'services',
  'industries',
  'case-studies',
  'insights',
  'brands',
  'products',
]);
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const languageResult = await safe(getLanguages(), []);
  const languages = Array.isArray(languageResult) ? languageResult : [];
  const routes: MetadataRoute.Sitemap = [];
  for (const language of languages) {
    const locale = language.code.toLowerCase();
    routes.push({ url: `${base}/${locale}`, changeFrequency: 'weekly', priority: 1 });
    for (const resource of listingResources) {
      routes.push({
        url: `${base}/${locale}/${resource}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      if (!detailResources.has(resource)) continue;
      const itemResult = await safe(getList(resource, language.code, '&pageSize=100'), []);
      const items = Array.isArray(itemResult) ? itemResult : [];
      for (const item of items) {
        const slug = translation(item).slug;
        if (slug)
          routes.push({
            url: `${base}/${locale}/${resource}/${slug}`,
            lastModified:
              typeof item.updatedAt === 'string' || typeof item.updatedAt === 'number'
                ? new Date(item.updatedAt)
                : undefined,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
      }
    }
    const pageResult = await safe(getList('pages', language.code, '&pageSize=100'), []);
    const pages = Array.isArray(pageResult) ? pageResult : [];
    for (const page of pages) {
      const slug = translation(page).slug;
      if (slug && slug !== 'home')
        routes.push({
          url: `${base}/${locale}/${slug}`,
          lastModified:
            typeof page.updatedAt === 'string' || typeof page.updatedAt === 'number'
              ? new Date(page.updatedAt)
              : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
    }
  }
  return routes;
}
