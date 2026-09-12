'use client';
import { useAdminI18n } from './admin-locale-provider';

export function AdminLanguageToggle() {
  const { locale, setLocale } = useAdminI18n();
  const next = locale === 'en' ? 'ar' : 'en';
  return <button type="button" className="text-link admin-language-toggle" lang={next} dir={next === 'ar' ? 'rtl' : 'ltr'} onClick={() => setLocale(next)}>{locale === 'en' ? 'العربية' : 'English'}</button>;
}
