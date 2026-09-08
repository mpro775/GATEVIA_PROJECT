import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { validateSectionContent } from './section-schemas';

interface Delegate {
  findMany(args: Record<string, unknown>): Promise<unknown[]>;
  count(args: Record<string, unknown>): Promise<number>;
  findUnique(args: Record<string, unknown>): Promise<unknown | null>;
  create(args: Record<string, unknown>): Promise<{ id: string }>;
  update(args: Record<string, unknown>): Promise<{ id: string }>;
}

const delegateKeys = {
  pages: 'page', 'service-categories': 'serviceCategory', services: 'service', industries: 'industry', 'case-studies': 'caseStudy', insights: 'insight', 'insight-categories': 'insightCategory', tags: 'tag', faqs: 'faq', 'team-members': 'teamMember', clients: 'client', partners: 'partner', brands: 'brand', products: 'productVenture', testimonials: 'testimonial', certifications: 'certification', 'trust-metrics': 'trustMetric', navigation: 'navigationMenu', redirects: 'redirect', settings: 'globalSetting',
} as const;
type Resource = keyof typeof delegateKeys;

const jsonFields = new Set(['content', 'settings', 'whoFor', 'problems', 'deliverables', 'process', 'benefits', 'challenges', 'opportunities', 'objectives', 'results', 'metrics', 'keyFeatures', 'value']);
function clean(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return key.toLowerCase().includes('html') || key === 'overview' || key === 'answer' ? sanitizeHtml(value, { allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'br'], allowedAttributes: { a: ['href', 'target', 'rel'] }, allowedSchemes: ['http', 'https', 'mailto', 'tel'] }) : value.trim();
  if (Array.isArray(value)) return value.map((item) => clean(item, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, clean(child, childKey)]));
  return value;
}

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  private delegate(resource: string): Delegate {
    const key = delegateKeys[resource as Resource];
    if (!key) throw new NotFoundException('Unknown resource.');
    return (this.prisma as unknown as Record<string, Delegate>)[key]!;
  }
  private include(resource: string): Record<string, unknown> {
    if (resource === 'redirects' || resource === 'settings') return {};
    if (resource === 'navigation') return { items: { include: { translations: true, children: { include: { translations: true } } }, orderBy: { sortOrder: 'asc' } } };
    return { translations: true };
  }
  private normalizeData(resource: string, raw: Record<string, unknown>, mode: 'create' | 'update'): Record<string, unknown> {
    const data = clean(raw) as Record<string, unknown>;
    const translations = data.translations;
    delete data.translations;
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      const rows = Object.entries(translations as Record<string, unknown>).map(([locale, fields]) => {
        const row = { ...(fields as Record<string, unknown>), locale };
        for (const internal of ['id', 'pageId', 'categoryId', 'serviceId', 'industryId', 'caseStudyId', 'insightId', 'tagId', 'faqId', 'memberId', 'clientId', 'partnerId', 'brandId', 'productVentureId', 'testimonialId', 'certificationId', 'trustMetricId']) delete row[internal];
        if (['service-categories', 'industries', 'clients', 'partners', 'brands', 'products', 'certifications'].includes(resource) && !row.name && row.title) row.name = row.title;
        if (resource === 'faqs' && !row.question && row.title) row.question = row.title;
        if (resource === 'team-members' && !row.name && row.title) row.name = row.title;
        if (!row.shortDescription && row.excerpt && ['services', 'industries', 'brands', 'products'].includes(resource)) row.shortDescription = row.excerpt;
        if (resource === 'service-categories' && !row.description && row.excerpt) row.description = row.excerpt;
        if (resource === 'partners' && !row.description && row.excerpt) row.description = row.excerpt;
        if (resource === 'faqs' && !row.answer && row.overview) row.answer = row.overview;
        if (resource === 'team-members') { row.position ??= ''; row.bio ??= row.overview ?? ''; }
        if (resource === 'services') { row.shortDescription ??= ''; row.overview ??= ''; }
        if (resource === 'industries') { row.shortDescription ??= ''; row.overview ??= ''; }
        if (resource === 'case-studies') { row.context ??= ''; row.challenge ??= ''; row.solution ??= ''; }
        if (resource === 'insights') { row.excerpt ??= ''; row.content ??= []; }
        if (resource === 'brands' || resource === 'products') { row.shortDescription ??= ''; row.fullDescription ??= row.overview ?? ''; }
        if (resource === 'testimonials') row.quote ??= row.overview ?? '';
        return row;
      });
      data.translations = mode === 'create' ? { create: rows } : { upsert: rows.map((row) => ({ where: { [`${this.translationParentKey(resource)}_locale`]: { [this.translationParentKey(resource)]: raw.id, locale: row.locale } }, create: row, update: row })) };
    }
    if (resource === 'pages') { data.pageType ??= 'standard'; data.templateKey ??= 'default'; }
    if (resource === 'insights') data.type ??= 'article';
    if (resource === 'partners') data.partnerType ??= 'other';
    if (resource === 'brands') data.relationshipType ??= 'other';
    if (resource === 'products') { data.productType ??= 'venture'; data.launchStatus ??= 'concept'; data.relationshipType ??= 'other'; }
    if (resource === 'testimonials') { data.personName ??= 'Pending approval'; data.consentConfirmed ??= false; }
    if (resource === 'certifications') data.issuer ??= '';
    if (resource === 'trust-metrics') data.value ??= '';
    if (resource === 'pages' && Array.isArray(data.sections)) {
      for (const section of data.sections as Array<Record<string, unknown>>) {
        const type = String(section.sectionType); const localized = section.translations as Record<string, { content: unknown }> | undefined;
        for (const translation of Object.values(localized ?? {})) validateSectionContent(type, translation.content);
      }
    }
    for (const field of jsonFields) if (field in data && data[field] === undefined) delete data[field];
    return data;
  }
  private translationParentKey(resource: string): string {
    return ({ pages: 'pageId', 'service-categories': 'categoryId', services: 'serviceId', industries: 'industryId', 'case-studies': 'caseStudyId', insights: 'insightId', 'insight-categories': 'categoryId', tags: 'tagId', faqs: 'faqId', 'team-members': 'memberId', clients: 'clientId', partners: 'partnerId', brands: 'brandId', products: 'productVentureId', testimonials: 'testimonialId', certifications: 'certificationId', 'trust-metrics': 'trustMetricId' } as Record<string, string>)[resource] ?? 'id';
  }
  async list(resource: string, query: { page?: string; pageSize?: string; status?: string; q?: string }) {
    const page = Math.max(1, Number(query.page) || 1); const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: Record<string, unknown> = { ...(query.status ? { status: query.status } : {}) };
    const orderBy = ['redirects', 'settings'].includes(resource) ? { updatedAt: 'desc' } : ['pages', 'case-studies', 'insights'].includes(resource) ? { createdAt: 'desc' } : resource === 'tags' ? { key: 'asc' } : { sortOrder: 'asc' };
    const [data, total] = await Promise.all([this.delegate(resource).findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy, include: this.include(resource) }), this.delegate(resource).count({ where })]);
    return { data, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  }
  async detail(resource: string, id: string) { const data = await this.delegate(resource).findUnique({ where: { id }, include: this.include(resource) }); if (!data) throw new NotFoundException('Resource was not found.'); return data; }
  async create(resource: string, raw: Record<string, unknown>, actorUserId: string, requestId: string) {
    try { const record = await this.delegate(resource).create({ data: this.normalizeData(resource, raw, 'create'), include: this.include(resource) }); await this.audit.record({ actorUserId, action: `${resource}.created`, entityType: resource, entityId: record.id, requestId }); return record; } catch (error) { if (String(error).includes('Unique constraint')) throw new ConflictException('A record with the same unique value already exists.'); throw error; }
  }
  async update(resource: string, id: string, raw: Record<string, unknown>, actorUserId: string, requestId: string) {
    if ('id' in raw) throw new BadRequestException('The id field cannot be changed.');
    const record = await this.delegate(resource).update({ where: { id }, data: this.normalizeData(resource, { ...raw, id }, 'update'), include: this.include(resource) });
    await this.audit.record({ actorUserId, action: `${resource}.updated`, entityType: resource, entityId: id, requestId }); return record;
  }
  async transition(resource: string, id: string, status: 'published' | 'archived', actorUserId: string, requestId: string) {
    const record = await this.delegate(resource).update({ where: { id }, data: { status, ...(status === 'published' ? { publishedAt: new Date() } : {}) }, include: this.include(resource) });
    await this.audit.record({ actorUserId, action: `${resource}.${status}`, entityType: resource, entityId: id, requestId }); return record;
  }
}
