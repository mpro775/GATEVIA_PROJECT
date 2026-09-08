import { z } from 'zod';

export type FieldKind = 'text' | 'long' | 'slug' | 'url' | 'number' | 'boolean' | 'date' | 'media' | 'blocks' | 'items' | 'select';
export interface CmsField { kind: FieldKind; required?: boolean; options?: string[] }
export interface CmsRelation { resource: string; foreignKey: string; many?: boolean; required?: boolean }
export interface CmsDefinition { model: string; parent?: string; permission: string; fields: Record<string, CmsField>; translations: Record<string, CmsField>; relations: Record<string, CmsRelation> }
const f = (kind: FieldKind, required = false): CmsField => ({ kind, required });
const select = (...options: string[]): CmsField => ({ kind: 'select', options });
const common = { featured: f('boolean'), sortOrder: f('number') };
const seo = { seoTitle: f('text'), seoDescription: f('long'), ogTitle: f('text'), ogDescription: f('long'), ogMediaId: f('media'), canonicalUrl: f('url'), robotsIndex: f('boolean') };
const named = { name: f('text', true), slug: f('slug', true) };
const titled = { title: f('text', true), slug: f('slug', true) };
const relation = (resource: string, foreignKey: string, many = true, required = false): CmsRelation => ({ resource, foreignKey, many, required });
export const cmsDefinitions: Record<string, CmsDefinition> = {
  pages: { model: 'page', parent: 'pageId', permission: 'pages', fields: { featured: f('boolean'), pageType: f('text', true), templateKey: f('text', true) }, translations: { ...titled, excerpt: f('long'), ...seo }, relations: { faqs: relation('faqs', 'faqId') } },
  'service-categories': { model: 'serviceCategory', parent: 'categoryId', permission: 'services', fields: { iconMediaId: f('media'), sortOrder: f('number') }, translations: { ...named, description: f('long') }, relations: {} },
  services: { model: 'service', parent: 'serviceId', permission: 'services', fields: { ...common, heroMediaId: f('media'), iconMediaId: f('media') }, translations: { ...titled, shortDescription: f('long', true), overview: f('long', true), whoFor: f('items'), problems: f('items'), deliverables: f('items'), process: f('items'), benefits: f('items'), timelineText: f('text'), ctaLabel: f('text'), ...seo }, relations: { categoryId: relation('service-categories', 'id', false, true), industries: relation('industries', 'industryId'), caseStudies: relation('case-studies', 'caseStudyId'), insights: relation('insights', 'insightId'), faqs: relation('faqs', 'faqId') } },
  industries: { model: 'industry', parent: 'industryId', permission: 'industries', fields: { ...common, heroMediaId: f('media') }, translations: { ...named, shortDescription: f('long', true), overview: f('long', true), challenges: f('items'), opportunities: f('items'), ctaLabel: f('text'), ...seo }, relations: { services: relation('services', 'serviceId'), caseStudies: relation('case-studies', 'caseStudyId'), insights: relation('insights', 'insightId') } },
  'case-studies': { model: 'caseStudy', parent: 'caseStudyId', permission: 'case_studies', fields: { ...common, anonymized: f('boolean'), countryCode: f('text'), heroMediaId: f('media') }, translations: { ...titled, clientLabel: f('text'), context: f('long', true), challenge: f('long', true), objectives: f('items'), solution: f('long', true), process: f('items'), results: f('items'), metrics: f('items'), testimonialText: f('long'), ...seo }, relations: { clientId: relation('clients', 'id', false), services: relation('services', 'serviceId'), industries: relation('industries', 'industryId'), gallery: relation('media', 'mediaId') } },
  insights: { model: 'insight', parent: 'insightId', permission: 'insights', fields: { featured: f('boolean'), type: select('article', 'guide', 'report'), publishedAt: f('date'), coverMediaId: f('media'), downloadableMediaId: f('media') }, translations: { ...titled, excerpt: f('long', true), content: f('blocks', true), ...seo }, relations: { categoryId: relation('insight-categories', 'id', false), authorUserId: relation('users', 'id', false), tags: relation('tags', 'tagId'), services: relation('services', 'serviceId'), industries: relation('industries', 'industryId') } },
  'insight-categories': { model: 'insightCategory', parent: 'categoryId', permission: 'insights', fields: { sortOrder: f('number') }, translations: named, relations: {} },
  tags: { model: 'tag', parent: 'tagId', permission: 'insights', fields: { key: f('text', true) }, translations: named, relations: {} },
  faqs: { model: 'faq', parent: 'faqId', permission: 'faqs', fields: { categoryKey: f('text'), sortOrder: f('number') }, translations: { question: f('text', true), answer: f('long', true) }, relations: { services: relation('services', 'serviceId'), pages: relation('pages', 'pageId') } },
  'team-members': { model: 'teamMember', parent: 'memberId', permission: 'team', fields: { photoMediaId: f('media'), linkedinUrl: f('url'), sortOrder: f('number') }, translations: { name: f('text', true), position: f('text', true), bio: f('long', true) }, relations: {} },
  clients: { model: 'client', parent: 'clientId', permission: 'clients', fields: { ...common, logoMediaId: f('media'), website: f('url'), countryCode: f('text'), publicVisibility: f('boolean') }, translations: { name: f('text', true), shortDescription: f('long') }, relations: { industryId: relation('industries', 'id', false) } },
  partners: { model: 'partner', parent: 'partnerId', permission: 'partners', fields: { ...common, logoMediaId: f('media'), website: f('url'), countryCode: f('text'), startDate: f('date'), publicVisibility: f('boolean'), partnerType: select('strategic', 'delivery', 'technology', 'research', 'government_ecosystem', 'other') }, translations: { name: f('text', true), description: f('long') }, relations: {} },
  brands: { model: 'brand', parent: 'brandId', permission: 'brands', fields: { ...common, logoMediaId: f('media'), coverMediaId: f('media'), countryCode: f('text'), website: f('url'), relationshipType: select('owned', 'subsidiary', 'managed', 'affiliate', 'investment', 'other') }, translations: { ...named, shortDescription: f('long', true), fullDescription: f('long', true), ...seo }, relations: { industryId: relation('industries', 'id', false) } },
  products: { model: 'productVenture', parent: 'productVentureId', permission: 'products', fields: { ...common, logoMediaId: f('media'), website: f('url'), productType: select('product', 'platform', 'venture'), launchStatus: select('concept', 'building', 'active', 'private_beta', 'public', 'paused', 'archived'), relationshipType: select('owned', 'subsidiary', 'managed', 'affiliate', 'investment', 'other') }, translations: { ...named, shortDescription: f('long', true), fullDescription: f('long', true), keyFeatures: f('items'), ...seo }, relations: { industryId: relation('industries', 'id', false), gallery: relation('media', 'mediaId') } },
  testimonials: { model: 'testimonial', parent: 'testimonialId', permission: 'testimonials', fields: { ...common, personName: f('text', true), personRole: f('text'), companyName: f('text'), countryCode: f('text'), logoMediaId: f('media'), consentConfirmed: f('boolean') }, translations: { quote: f('long', true) }, relations: { clientId: relation('clients', 'id', false), caseStudyId: relation('case-studies', 'id', false) } },
  certifications: { model: 'certification', parent: 'certificationId', permission: 'certifications', fields: { logoMediaId: f('media'), issuer: f('text', true), certificateNumber: f('text'), validFrom: f('date'), validUntil: f('date'), verificationUrl: f('url'), publicVisibility: f('boolean'), sortOrder: f('number') }, translations: { name: f('text', true), description: f('long') }, relations: {} },
  'trust-metrics': { model: 'trustMetric', parent: 'trustMetricId', permission: 'trust_metrics', fields: { value: f('text', true), suffix: f('text'), evidenceNoteInternal: f('long'), publicVisibility: f('boolean'), sortOrder: f('number') }, translations: { label: f('text', true) }, relations: {} },
};

export const safeHref = z.string().max(2000).refine(value => /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s()-]+|\/(?!\/)[^\\\s]*)$/i.test(value), 'Use a local path or an approved URL protocol.');
export const richBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().max(10000) }),
  z.object({ type: z.literal('heading'), text: z.string().max(240), level: z.number().int().min(2).max(4).default(2) }),
  z.object({ type: z.literal('list'), items: z.array(z.string().max(2000)).max(100), ordered: z.boolean().optional() }),
  z.object({ type: z.literal('link'), text: z.string().max(500), href: safeHref }),
  z.object({ type: z.literal('quote'), text: z.string().max(5000), attribution: z.string().max(240).optional() }),
  z.object({ type: z.literal('image'), mediaId: z.string().uuid() }),
  z.object({ type: z.literal('callout'), text: z.string().max(5000) }),
  z.object({ type: z.literal('table'), headers: z.array(z.string().max(240)).max(12), rows: z.array(z.array(z.string().max(2000)).max(12)).max(100) }),
  z.object({ type: z.literal('embed'), provider: z.enum(['youtube', 'vimeo']), videoId: z.string().regex(/^[\w-]{6,20}$/) }),
]);
export const richContentSchema = z.array(richBlockSchema).max(200);
export const contentItemsSchema = z.array(z.union([z.string().max(4000), z.object({ title: z.string().max(240).optional(), body: z.string().max(4000).optional(), label: z.string().max(240).optional(), value: z.string().max(240).optional(), suffix: z.string().max(40).optional() }).strict()])).max(100);
export function fieldSchema(field: CmsField): z.ZodTypeAny {
  switch (field.kind) {
    case 'boolean': return z.boolean();
    case 'number': return z.number().int().min(0).max(1000000);
    case 'media': return z.string().uuid().nullable();
    case 'url': return safeHref.or(z.literal('')).nullable();
    case 'date': return z.string().datetime({ offset: true }).nullable();
    case 'blocks': return richContentSchema;
    case 'items': return contentItemsSchema;
    case 'select': return z.string().refine(v => field.options?.includes(v), 'Choose an allowed value.');
    case 'slug': return z.string().trim().min(1).max(240).regex(/^[\p{L}\p{N}_-]+$/u);
    default: return z.string().trim().min(field.required ? 1 : 0).max(field.kind === 'long' ? 30000 : 500);
  }
}
export function translationCompleteness(def: CmsDefinition, translation?: Record<string, unknown>) {
  const required = Object.entries(def.translations).filter(([, field]) => field.required).map(([key]) => key);
  const missing = required.filter(key => !translation?.[key] || (Array.isArray(translation[key]) && !translation[key].length));
  return { status: !translation ? 'missing' : missing.length ? 'partial' : 'complete', missing };
}
