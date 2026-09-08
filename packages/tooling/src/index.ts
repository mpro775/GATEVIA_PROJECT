export const normalizeLocale = (locale: string) => locale.trim().replace('_', '-');
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const safeExternalProtocols = new Set(['https:', 'http:']);
export function isSafeExternalUrl(value: string): boolean { try { return safeExternalProtocols.has(new URL(value).protocol); } catch { return false; } }
