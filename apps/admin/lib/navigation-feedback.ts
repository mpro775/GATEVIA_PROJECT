export const ADMIN_NAVIGATION_START_EVENT = 'gatevia:admin-navigation-start';

export function startAdminNavigation() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ADMIN_NAVIGATION_START_EVENT));
}
