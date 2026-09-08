'use client'; 
import Script from 'next/script'; 
import { useEffect } from 'react';

export function track(event: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event, ...properties });
}

export function Analytics({ gtmId, ga4Id }: { gtmId?: string; ga4Id?: string }) {
  const gtm = gtmId || process.env.NEXT_PUBLIC_GTM_ID;
  const ga4 = ga4Id || process.env.NEXT_PUBLIC_GA4_ID;
  
  useEffect(() => {
    // 1. Landing page attribution
    if (!sessionStorage.getItem('gatevia_landing')) {
      sessionStorage.setItem('gatevia_landing', location.href);
    }
    
    // 2. Global click tracking (CTA & Downloads)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      
      // CTA click
      if (anchor.classList.contains('gv-button') || anchor.closest('.hero-actions')) {
        track('cta_click', { url: anchor.href, label: anchor.textContent?.trim() || '' });
      }
      // Report / File download
      if (anchor.hasAttribute('download') || anchor.href.endsWith('.pdf')) {
        track('report_download', { url: anchor.href, label: anchor.textContent?.trim() || '' });
      }
    };
    
    // 3. Theme switch tracking
    const onTheme = (e: Event) => {
      const next = (e as CustomEvent).detail;
      track('theme_switch', { theme: next });
    };
    
    document.addEventListener('click', onClick);
    window.addEventListener('gatevia:theme', onTheme);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('gatevia:theme', onTheme);
    };
  }, []);
  
  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}',{send_page_view:true});`}
          </Script>
        </>
      )}
    </>
  );
}
