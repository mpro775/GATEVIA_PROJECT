import { describe, expect, it } from 'vitest';
import { adminDirection, formatAdminDate, normalizeAdminLocale, translate } from '.';

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
  it('falls back to English', () => {
    expect(translate('ar', 'media.assets')).toBe('أصل');
    expect(translate('ar', 'action.view')).toBe('عرض');
  });
  it('uses the selected date locale', () => {
    expect(formatAdminDate('en', '2026-09-13')).not.toBe(formatAdminDate('ar', '2026-09-13'));
  });
});
