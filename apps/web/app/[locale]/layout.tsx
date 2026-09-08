import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { getLanguages, getNavigation, getSettings, safe } from '@/lib/api';
import { localizedSetting } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const languages = await safe(getLanguages(), [
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' as const, isDefault: true },
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' as const, isDefault: false },
  ]);
  const language = languages.find((item) => item.code.toLowerCase() === locale.toLowerCase());
  if (!language) notFound();

  const lc = language.code.toLowerCase();

  // Fetch navigation from CMS; empty arrays are safe fallbacks
  const [mainNav, footerNav, settings] = await Promise.all([
    getNavigation('main', lc),
    getNavigation('footer', lc),
    safe(getSettings(language.code), { values: {}, media: {} }),
  ]);
  const logoId = settings.values['company.logo_media_id'];
  const identity = {
    name: localizedSetting(settings.values, 'company.name', language.code, 'GATEVIA'),
    logoUrl: typeof logoId === 'string' ? settings.media[logoId]?.url : undefined,
    email: typeof settings.values['contact.email'] === 'string' ? settings.values['contact.email'] : undefined,
    phone: typeof settings.values['contact.phone'] === 'string' ? settings.values['contact.phone'] : undefined,
    linkedInUrl: typeof settings.values['social.linkedin'] === 'string' ? settings.values['social.linkedin'] : undefined,
  };

  return (
    <div dir={language.direction} lang={language.code}>
      <a className="skip-link" href="#main">
        {copy(language.code).skip}
      </a>
      <Header locale={lc} languages={languages} navItems={mainNav} identity={identity} />
      <main id="main">{children}</main>
      <Footer locale={lc} navItems={footerNav} identity={identity} />
    </div>
  );
}
