import type { Metadata } from 'next';
import { EmptyState } from '@gatevia/ui';
import { PageHero, SectionRenderer } from '@/components/content';
import { getLanguages, getPage, getSettings, safe } from '@/lib/api';
import { localizedSetting, resolvedMediaUrl, translation } from '@/lib/content';
import { buildMetadata, JsonLd, websiteSchema } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [page, languages, settings] = await Promise.all([
    safe(getPage(locale, 'home'), {}),
    safe(getLanguages(), []),
    safe(getSettings(locale), { values: {}, media: {} }),
  ]);
  const tr = translation(page);
  const defaultOgId = settings.values['seo.default_og_media_id'];
  const imageUrl =
    resolvedMediaUrl(page, tr.ogMediaId) ??
    (typeof defaultOgId === 'string' ? settings.media[defaultOgId]?.url : undefined);
  const siteName = localizedSetting(settings.values, 'company.name', locale, 'GATEVIA');
  return buildMetadata({
    title: String(
      tr.seoTitle ??
        tr.title ??
        localizedSetting(settings.values, 'seo.default_title', locale, siteName),
    ),
    description: String(
      tr.seoDescription ??
        tr.excerpt ??
        localizedSetting(
          settings.values,
          'seo.default_description',
          locale,
          'Saudi market access, execution and growth.',
        ),
    ),
    canonical: String(tr.canonicalUrl ?? `/${locale}`),
    locale,
    languages,
    localizedAlternates: page.alternates as Record<string, string> | undefined,
    imageUrl,
    siteName,
    noindex: tr.robotsIndex === false,
  });
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale } = await params;
  const { preview } = await searchParams;
  const [page, settings] = await Promise.all([
    safe(getPage(locale, 'home', preview), {}),
    safe(getSettings(locale), { values: {}, media: {} }),
  ]);
  const tr = translation(page);
  const siteName = localizedSetting(settings.values, 'company.name', locale, 'GATEVIA');
  const hasSectionHero =
    Array.isArray(page.sections) &&
    page.sections.some((section) => (section as Record<string, unknown>).sectionType === 'hero');

  if (!page.id)
    return (
      <>
        <JsonLd schema={websiteSchema(siteName)} />
        <PageHero translation={{ title: 'GATEVIA' }} locale={locale} home />
        <section className="section">
          <div className="container">
            <EmptyState title="Coming soon" description="Our website is being set up." />
          </div>
        </section>
      </>
    );

  return (
    <>
      <JsonLd schema={websiteSchema(siteName)} />
      {!hasSectionHero && <PageHero translation={tr} locale={locale} home />}
      <SectionRenderer sections={page.sections} locale={locale} />
    </>
  );
}
