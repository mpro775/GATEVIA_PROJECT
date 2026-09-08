import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { GateviaRequest } from '../common/request-context';

const domains: Record<string, string> = {
  pages: 'pages',
  'service-categories': 'services',
  services: 'services',
  industries: 'industries',
  'case-studies': 'case_studies',
  insights: 'insights',
  'insight-categories': 'insights',
  tags: 'insights',
  faqs: 'faqs',
  'team-members': 'team',
  clients: 'clients',
  partners: 'partners',
  brands: 'brands',
  products: 'products',
  testimonials: 'testimonials',
  certifications: 'certifications',
  'trust-metrics': 'trust_metrics',
  navigation: 'navigation',
  redirects: 'redirects',
  settings: 'settings',
};

@Injectable()
export class ResourcePolicyService {
  assert(
    request: GateviaRequest,
    resource: string,
    action: 'read' | 'create' | 'update' | 'publish' | 'archive' | 'manage',
  ): void {
    const domain = domains[resource];
    if (!domain) throw new NotFoundException('Unknown resource.');
    const permission =
      ['navigation', 'redirects', 'settings'].includes(domain) && action !== 'read'
        ? `${domain}.manage`
        : `${domain}.${action}`;
    if (!request.user?.permissions.has(permission))
      throw new ForbiddenException('You do not have permission to perform this action.');
  }
}
