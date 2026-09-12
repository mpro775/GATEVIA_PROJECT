import { ar } from './ar';
import { en } from './en';
import { adminIntlLocale, type AdminLocale } from './config';

export type TranslationKey = keyof typeof en;

export function translate(locale: AdminLocale, key: TranslationKey, fallback?: string): string {
  return (locale === 'ar' ? ar[key] : undefined) ?? en[key] ?? fallback ?? key;
}

export function formatAdminDate(locale: AdminLocale, value: Date | string | number): string {
  return new Intl.DateTimeFormat(adminIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(value));
}

export function formatAdminNumber(locale: AdminLocale, value: number): string {
  return new Intl.NumberFormat(adminIntlLocale(locale)).format(value);
}

export * from './config';
