export const roles = ['super_admin', 'content_manager', 'marketing', 'sales', 'viewer'] as const;

const domains = {
  dashboard: ['read'],
  pages: ['read', 'create', 'update', 'publish', 'archive'],
  services: ['read', 'create', 'update', 'publish', 'archive'],
  industries: ['read', 'create', 'update', 'publish', 'archive'],
  case_studies: ['read', 'create', 'update', 'publish', 'archive'],
  insights: ['read', 'create', 'update', 'publish', 'archive'],
  faqs: ['read', 'create', 'update', 'publish', 'archive'],
  team: ['read', 'create', 'update', 'publish', 'archive'],
  clients: ['read', 'create', 'update', 'publish', 'archive'],
  partners: ['read', 'create', 'update', 'publish', 'archive'],
  brands: ['read', 'create', 'update', 'publish', 'archive'],
  products: ['read', 'create', 'update', 'publish', 'archive'],
  testimonials: ['read', 'create', 'update', 'publish', 'archive'],
  certifications: ['read', 'create', 'update', 'publish', 'archive'],
  trust_metrics: ['read', 'create', 'update', 'publish', 'archive'],
  media: ['read', 'upload', 'update', 'archive', 'delete_permanent'],
  leads: ['read', 'update_status', 'assign', 'note', 'export'],
  languages: ['read', 'manage'],
  navigation: ['read', 'manage'],
  redirects: ['read', 'manage'],
  settings: ['read', 'manage'],
  users: ['read', 'manage'],
  roles: ['read', 'manage'],
  audit: ['read'],
} as const;

export const permissions = Object.entries(domains).flatMap(([domain, actions]) => actions.map((action) => `${domain}.${action}`));

const readPermissions = permissions.filter((permission) => permission.endsWith('.read'));
const cmsDomains = ['pages', 'services', 'industries', 'case_studies', 'insights', 'faqs', 'team', 'clients', 'partners', 'brands', 'products', 'testimonials', 'certifications', 'trust_metrics'];
const cmsPermissions = permissions.filter((permission) => cmsDomains.some((domain) => permission.startsWith(`${domain}.`)));

export const grants: Record<(typeof roles)[number], string[]> = {
  super_admin: permissions,
  content_manager: [...cmsPermissions, 'dashboard.read', 'media.read', 'media.upload', 'media.update', 'media.archive', 'languages.read', 'navigation.read'],
  marketing: [...cmsPermissions, 'dashboard.read', 'media.read', 'media.upload', 'media.update', 'languages.read', 'navigation.read', 'navigation.manage', 'settings.read'],
  sales: [...readPermissions.filter((permission) => !permission.startsWith('users.') && !permission.startsWith('roles.') && !permission.startsWith('audit.')), 'leads.update_status', 'leads.assign', 'leads.note'],
  viewer: readPermissions.filter((permission) => !permission.startsWith('leads.') && !permission.startsWith('users.') && !permission.startsWith('roles.') && !permission.startsWith('audit.')),
};
