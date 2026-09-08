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
  const languages = await safe(getLanguages(), []);
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
      const items = await safe(getList(resource, language.code, '&pageSize=100'), []);
      for (const item of items) {
        const slug = translation(item).slug;
        if (slug)
          routes.push({
            url: `${base}/${locale}/${resource}/${slug}`,
            lastModified: item.updatedAt ? new Date(String(item.updatedAt)) : undefined,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
      }
    }
    const pages = await safe(getList('pages', language.code, '&pageSize=100'), []);
    for (const page of pages) {
      const slug = translation(page).slug;
      if (slug && slug !== 'home')
        routes.push({
          url: `${base}/${locale}/${slug}`,
          lastModified: page.updatedAt ? new Date(String(page.updatedAt)) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
    }
  }
  return routes;
}
