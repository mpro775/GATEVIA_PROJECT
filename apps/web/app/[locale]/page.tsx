import type { Metadata } from 'next';
import { EmptyState } from '@gatevia/ui';
import { PageHero, SectionRenderer } from '@/components/content';
import { getLanguages, getPage, safe } from '@/lib/api';
import { translation } from '@/lib/content';
import { buildMetadata, JsonLd, websiteSchema } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [page, languages] = await Promise.all([
    safe(getPage(locale, 'home'), {}),
    safe(getLanguages(), []),
  ]);
  const tr = translation(page);
  return buildMetadata({
    title: String(tr.seoTitle ?? tr.title ?? 'GATEVIA'),
    description: String(tr.seoDescription ?? tr.excerpt ?? 'Saudi market access, execution and growth.'),
    canonical: `/${locale}`,
    locale,
    languages,
    imageUrl: tr.seoImageUrl ? String(tr.seoImageUrl) : undefined,
  });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await safe(getPage(locale, 'home'), {});
  const tr = translation(page);

  if (!page.id)
    return (
      <>
        <JsonLd schema={websiteSchema()} />
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
      <JsonLd schema={websiteSchema()} />
      <PageHero translation={tr} locale={locale} home />
      <SectionRenderer sections={page.sections} locale={locale} />
    </>
  );
}
