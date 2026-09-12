'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ADMIN_LOCALE_COOKIE,
  adminDirection,
  formatAdminDate,
  formatAdminNumber,
  translate,
  type AdminLocale,
  type TranslationKey,
} from '@/lib/i18n';

type AdminI18n = {
  locale: AdminLocale;
  dir: 'ltr' | 'rtl';
  t: (key: TranslationKey, fallback?: string) => string;
  setLocale: (locale: AdminLocale) => void;
  formatDate: (value: Date | string | number) => string;
  formatNumber: (value: number) => string;
};

const Context = createContext<AdminI18n | null>(null);

export function AdminLocaleProvider({ initialLocale, children }: { initialLocale: AdminLocale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale);
  const value = useMemo<AdminI18n>(() => ({
    locale,
    dir: adminDirection(locale),
    t: (key, fallback) => translate(locale, key, fallback),
    setLocale(next) {
      setLocaleState(next);
      document.cookie = `${ADMIN_LOCALE_COOKIE}=${next}; Path=/; SameSite=Lax; Max-Age=31536000`;
      document.documentElement.lang = next;
      document.documentElement.dir = adminDirection(next);
      router.refresh();
    },
    formatDate: (input) => formatAdminDate(locale, input),
    formatNumber: (input) => formatAdminNumber(locale, input),
  }), [locale, router]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAdminI18n(): AdminI18n {
  const value = useContext(Context);
  if (!value) throw new Error('useAdminI18n must be used inside AdminLocaleProvider');
  return value;
}
