import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { AdminLocaleProvider } from '@/components/admin-locale-provider';
import { ToastProvider } from '@/components/toast-provider';
import { expoArabic } from './fonts';
import { adminDirection, normalizeAdminLocale } from '@/lib/i18n';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'GATEVIA Admin', template: '%s | GATEVIA Admin' },
  robots: { index: false, follow: false },
};
const script = `(()=>{try{const m=document.cookie.match(/(?:^|; )gatevia_theme=(light|dark)/);const t=m?m[1]:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch{document.documentElement.dataset.theme='dark'}})()`;
export default async function Layout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const saved = store.get('gatevia_theme')?.value;
  const locale = normalizeAdminLocale(store.get('gatevia_admin_locale')?.value);
  return (
    <html
      lang={locale}
      dir={adminDirection(locale)}
      className={locale.startsWith('ar') ? expoArabic.variable : undefined}
      data-theme={saved === 'light' ? 'light' : 'dark'}
      suppressHydrationWarning
    >
      <body>
        <AdminLocaleProvider initialLocale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </AdminLocaleProvider>
        <Script id="admin-theme" strategy="beforeInteractive">
          {script}
        </Script>
      </body>
    </html>
  );
}
