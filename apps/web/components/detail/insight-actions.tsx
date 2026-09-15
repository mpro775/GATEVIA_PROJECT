'use client';

import { useState } from 'react';

export function InsightActions({ locale, title }: { locale: string; title: string }) {
  const arabic = locale.startsWith('ar');
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(arabic ? 'انسخ الرابط' : 'Copy link', url);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(arabic ? 'انسخ الرابط' : 'Copy link', window.location.href);
    }
  };

  return (
    <div className="insight-detail__actions">
      <button type="button" onClick={() => void share()}>{arabic ? 'مشاركة' : 'Share'}</button>
      <button type="button" onClick={() => void copyLink()}>{copied ? (arabic ? 'تم النسخ' : 'Copied') : (arabic ? 'نسخ الرابط' : 'Copy link')}</button>
    </div>
  );
}
