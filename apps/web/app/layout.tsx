import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
import { Analytics } from '@/components/analytics';
import { getSettings, safe } from '@/lib/api';
import { localizedSetting } from '@/lib/content';
import { JsonLd, organizationSchema } from '@/lib/seo';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = requestHeaders.get('x-gatevia-locale') ?? 'en';
  const settings = await safe(getSettings(locale), { values: {}, media: {} });
  const name = localizedSetting(settings.values, 'company.name', locale, 'GATEVIA');
  return {
    title: {
      default: localizedSetting(settings.values, 'seo.default_title', locale, name),
      template: `%s | ${name}`,
    },
    description: localizedSetting(
      settings.values,
      'seo.default_description',
      locale,
      'Saudi market access, execution and growth.',
    ),
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

const themeScript = `(()=>{try{const m=document.cookie.match(/(?:^|; )gatevia_theme=(light|dark)/);const t=m?m[1]:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch{document.documentElement.dataset.theme='dark'}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const requestHeaders = await headers();
  const locale = requestHeaders.get('x-gatevia-locale') ?? 'en';
  const direction = requestHeaders.get('x-gatevia-direction') === 'rtl' ? 'rtl' : 'ltr';
  const settings = await safe(getSettings(locale), { values: {}, media: {} });
  const values = settings.values;
  const logoId = values['company.logo_media_id'];
  const logoUrl = typeof logoId === 'string' ? settings.media[logoId]?.url : undefined;
  const organization = organizationSchema({
    name: localizedSetting(values, 'company.name', locale, 'GATEVIA'),
    legalName: localizedSetting(values, 'company.legal_name', locale),
    logoUrl,
    linkedInUrl:
      typeof values['social.linkedin'] === 'string' ? values['social.linkedin'] : undefined,
    address: localizedSetting(values, 'contact.address', locale),
    email: typeof values['contact.email'] === 'string' ? values['contact.email'] : undefined,
    phone: typeof values['contact.phone'] === 'string' ? values['contact.phone'] : undefined,
  });
  const saved = store.get('gatevia_theme')?.value;
  const theme = saved === 'light' ? 'light' : 'dark';
  return (
    <html lang={locale} dir={direction} data-theme={theme} suppressHydrationWarning>
      <body>
        {children}
        <Analytics
          gtmId={
            typeof values['analytics.gtm_id'] === 'string' ? values['analytics.gtm_id'] : undefined
          }
          ga4Id={
            typeof values['analytics.ga4_id'] === 'string' ? values['analytics.ga4_id'] : undefined
          }
        />
        <Script id="gatevia-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <JsonLd schema={organization} />
      </body>
    </html>
  );
}
