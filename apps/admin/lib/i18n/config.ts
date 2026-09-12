export const ADMIN_LOCALE_COOKIE = 'gatevia_admin_locale';
export const ADMIN_LOCALES = ['en', 'ar'] as const;
export const DEFAULT_ADMIN_LOCALE = 'en' as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export function normalizeAdminLocale(value: string | null | undefined): AdminLocale {
  return value === 'ar' ? 'ar' : DEFAULT_ADMIN_LOCALE;
}

export function adminDirection(locale: AdminLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function adminIntlLocale(locale: AdminLocale): string {
  return locale === 'ar' ? 'ar-SA' : 'en';
}
