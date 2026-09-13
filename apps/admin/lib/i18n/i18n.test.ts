import { describe, expect, it } from 'vitest';
import { adminDirection, normalizeAdminLocale, translate } from '.';
import { en } from './en';
import { ar } from './ar';

describe('admin i18n', () => {
  it('normalizes locale values', () => {
    expect(normalizeAdminLocale('en')).toBe('en');
    expect(normalizeAdminLocale('ar')).toBe('ar');
    expect(normalizeAdminLocale('unknown')).toBe('en');
  });
  it('provides direction', () => {
    expect(adminDirection('en')).toBe('ltr');
    expect(adminDirection('ar')).toBe('rtl');
  });
  it('falls back to English when Arabic is missing', () => {
    const key = 'missing.key' as unknown as keyof typeof en;
    expect(translate('ar', key, 'Fallback')).toBe('Fallback');
    expect(translate('ar', key)).toBe('missing.key');
  });
  it('has 100% parity between Arabic and English dictionaries', () => {
    // This is tested by the compiler because `ar.ts` uses `Record<keyof typeof en, string>`,
    // but we can add a runtime assertion just in case.
    const enKeys = Object.keys(en).sort();
    const arKeys = Object.keys(ar).sort();
    const missingInArabic = enKeys.filter(k => !arKeys.includes(k));
    const missingInEnglish = arKeys.filter(k => !enKeys.includes(k));

    console.log(`Missing in Arabic: ${missingInArabic.length}`);
    console.log(`Missing in English: ${missingInEnglish.length}`);
    expect(missingInArabic).toEqual([]);
    expect(missingInEnglish).toEqual([]);
  });
});
