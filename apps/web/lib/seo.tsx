import type { Metadata } from 'next';
import type { Language } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const BRAND = 'GATEVIA';

// ─── Metadata builder ─────────────────────────────────────────────────────────

export interface SeoInput {
  title?: string | undefined;
  description?: string | undefined;
  canonical: string;
  locale: string;
  languages?: Language[] | undefined;
  localizedAlternates?: Record<string, string> | undefined;
  siteName?: string | undefined;
  imageUrl?: string | undefined;
  imageAlt?: string | undefined;
  type?: 'website' | 'article' | undefined;
  publishedAt?: string | undefined;
  updatedAt?: string | undefined;
  noindex?: boolean | undefined;
}

export function buildMetadata(input: SeoInput): Metadata {
  const brand = input.siteName ?? BRAND;
  const title = input.title ? `${input.title} | ${brand}` : brand;
  const description = input.description ?? '';
  const url = new URL(input.canonical, SITE).toString();

  const alternates: Metadata['alternates'] = {
    canonical: url,
    languages: input.localizedAlternates
      ? Object.fromEntries(Object.entries(input.localizedAlternates).map(([locale, path]) => [locale, new URL(path, SITE).toString()]))
      : input.languages
      ? Object.fromEntries(
          input.languages
            .filter(Boolean)
            .map((l) => {
              const lc = l.code.toLowerCase();
              // Derive alternate URL: swap /en/ or /ar-sa/ prefix
              const altUrl = url.replace(new RegExp(`/${input.locale.toLowerCase()}(/|$)`), `/${lc}$1`);
              return [l.code, altUrl];
            }),
        )
      : undefined,
  };

  const openGraph: Metadata['openGraph'] = {
    type: input.type ?? 'website',
    title,
    description,
    url,
    siteName: brand,
    locale: input.locale,
    images: input.imageUrl
      ? [{ url: input.imageUrl, alt: input.imageAlt ?? title, width: 1200, height: 630 }]
      : [],
    ...(input.type === 'article' && input.publishedAt
      ? { publishedTime: input.publishedAt, modifiedTime: input.updatedAt ?? input.publishedAt }
      : {}),
  };

  const twitter: Metadata['twitter'] = {
    card: 'summary_large_image',
    title,
    description,
    ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
  };

  return {
    title,
    description,
    alternates,
    openGraph,
    twitter,
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

// ─── JSON-LD schemas ──────────────────────────────────────────────────────────

/** Organization — goes on every page, injected at root layout level */
export function organizationSchema(input: { name?: string | undefined; legalName?: string | undefined; logoUrl?: string | undefined; linkedInUrl?: string | undefined; address?: string | undefined; email?: string | undefined; phone?: string | undefined } = {}) {
  const name = input.name ?? BRAND;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name,
    legalName: input.legalName,
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      url: input.logoUrl ?? `${SITE}/logo.png`,
    },
    sameAs: [
      input.linkedInUrl ?? process.env.NEXT_PUBLIC_LINKEDIN_URL,
      process.env.NEXT_PUBLIC_TWITTER_URL,
    ].filter(Boolean),
    address: input.address ? { '@type': 'PostalAddress', streetAddress: input.address } : undefined,
    email: input.email || undefined,
    telephone: input.phone || undefined,
  };
}

/** WebSite with SearchAction — goes on the home page */
export function websiteSchema(name = BRAND) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name,
    publisher: { '@id': `${SITE}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/en/insights?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Service schema */
export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
  locale: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: `${SITE}${input.url}`,
    provider: { '@id': `${SITE}/#organization` },
    serviceType: input.category ?? input.name,
    areaServed: { '@type': 'Country', name: 'Saudi Arabia', '@id': 'https://www.wikidata.org/wiki/Q851' },
    inLanguage: input.locale,
  };
}

/** Article schema — for insights / blog posts */
export function articleSchema(input: {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string | undefined;
  publishedAt: string;
  updatedAt?: string | undefined;
  locale: string;
  authorName?: string | undefined;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: `${SITE}${input.url}`,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    inLanguage: input.locale,
    author: input.authorName
      ? { '@type': 'Person', name: input.authorName }
      : { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${input.url}` },
  };
}

/** FAQ schema */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Breadcrumb schema */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.url}`,
    })),
  };
}

/** Case study — LocalBusiness / CreativeWork variant */
export function caseStudySchema(input: {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string | undefined;
  publishedAt?: string | undefined;
  locale: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: input.headline,
    description: input.description,
    url: `${SITE}${input.url}`,
    image: input.imageUrl ?? undefined,
    datePublished: input.publishedAt ?? undefined,
    inLanguage: input.locale,
    author: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
  };
}

// ─── JsonLd component (server) ────────────────────────────────────────────────

export function JsonLd({ schema }: { schema: object | object[] }) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
