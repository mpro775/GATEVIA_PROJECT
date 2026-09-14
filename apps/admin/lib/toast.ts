export const ADMIN_TOAST_EVENT = 'gatevia:admin-toast';

export type AdminToastKind = 'success' | 'error' | 'info';

export type AdminToastPayload = {
  kind: AdminToastKind;
  message?: string;
};

export function showAdminToast(payload: AdminToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AdminToastPayload>(ADMIN_TOAST_EVENT, { detail: payload }));
}
