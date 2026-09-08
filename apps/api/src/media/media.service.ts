import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { extname } from 'node:path';
import { PrismaService } from '../prisma/prisma.service'; import { QueueService } from '../queue/queue.service'; import { AuditService } from '../audit/audit.service';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/webm']);
const safeName = (name: string) => name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(-180);

@Injectable()
export class MediaService {
  private readonly s3: S3Client; private readonly bucket: string; private readonly secret: string;
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly queues: QueueService, private readonly audit: AuditService) {
    this.bucket = config.getOrThrow<string>('R2_BUCKET'); this.secret = config.getOrThrow<string>('AUTH_SESSION_SECRET');
    this.s3 = new S3Client({ endpoint: config.getOrThrow<string>('R2_ENDPOINT'), region: config.get('R2_REGION') ?? 'auto', credentials: { accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'), secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY') } });
  }
  private max(mime: string): number { if (mime.startsWith('image/')) return Number(this.config.get('MAX_IMAGE_BYTES') ?? 10485760); if (mime.startsWith('video/')) return Number(this.config.get('MAX_VIDEO_BYTES') ?? 209715200); return Number(this.config.get('MAX_DOCUMENT_BYTES') ?? 26214400); }
  private validate(filename: string, mimeType: string, sizeBytes: number): void { const extension = extname(filename).toLowerCase(); if (!allowed.has(mimeType) || !extension || sizeBytes <= 0 || sizeBytes > this.max(mimeType)) throw new BadRequestException('File type or size is not allowed.'); const expected: Record<string, string[]> = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'], 'image/avif': ['.avif'], 'application/pdf': ['.pdf'], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] }; if (expected[mimeType] && !expected[mimeType]!.includes(extension)) throw new BadRequestException('Filename extension does not match the declared MIME type.'); }
  private sign(payload: string): string { return createHmac('sha256', this.secret).update(payload).digest('base64url'); }
  async uploadSession(input: { filename: string; mimeType: string; sizeBytes: number }, actorId: string, replaceMediaId?: string) { this.validate(input.filename, input.mimeType, input.sizeBytes); if (replaceMediaId) await this.prisma.media.findUniqueOrThrow({ where: { id: replaceMediaId } }); const storageKey = `original/${new Date().getUTCFullYear()}/${randomUUID()}${extname(input.filename).toLowerCase()}`; const expiry = Date.now() + 15 * 60000; const payload = Buffer.from(JSON.stringify({ storageKey, ...input, actorId, expiry, replaceMediaId })).toString('base64url'); const uploadToken = `${payload}.${this.sign(payload)}`; const url = await getSignedUrl(this.s3, new PutObjectCommand({ Bucket: this.bucket, Key: storageKey, ContentType: input.mimeType, ContentLength: input.sizeBytes, Metadata: { uploader: actorId } }), { expiresIn: 900 }); return { url, method: 'PUT', headers: { 'Content-Type': input.mimeType }, uploadToken, expiresAt: new Date(expiry).toISOString() }; }
  private verify(raw: string, actorId: string): { storageKey: string; filename: string; mimeType: string; sizeBytes: number; replaceMediaId?: string } { const [payload, signature] = raw.split('.'); if (!payload || !signature) throw new BadRequestException('Upload token is invalid.'); const expected = Buffer.from(this.sign(payload)); const supplied = Buffer.from(signature); if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new BadRequestException('Upload token is invalid.'); const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { storageKey: string; filename: string; mimeType: string; sizeBytes: number; actorId: string; expiry: number; replaceMediaId?: string }; if (data.actorId !== actorId || data.expiry < Date.now()) throw new BadRequestException('Upload token is expired or invalid.'); return data; }
  async finalize(uploadToken: string, actorId: string, folderId?: string) { const data = this.verify(uploadToken, actorId); const object = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: data.storageKey })); if (Number(object.ContentLength) !== data.sizeBytes || object.ContentType !== data.mimeType) throw new BadRequestException('Uploaded object metadata does not match the approved upload.'); const values = { folderId, storageProvider: 'r2', bucket: this.bucket, storageKey: data.storageKey, originalFilename: data.filename, normalizedFilename: safeName(data.filename), mimeType: data.mimeType, extension: extname(data.filename).slice(1).toLowerCase(), sizeBytes: BigInt(data.sizeBytes), status: data.mimeType.startsWith('image/') ? 'processing' as const : 'ready' as const, uploadedById: actorId }; const media = data.replaceMediaId ? await this.prisma.$transaction(async (tx) => { const current = await tx.media.findUniqueOrThrow({ where: { id: data.replaceMediaId } }); await tx.mediaVariant.deleteMany({ where: { mediaId: current.id } }); const updated = await tx.media.update({ where: { id: current.id }, data: values }); await this.queues.media.add('cleanup-replaced-object', { bucket: current.bucket, storageKey: current.storageKey }); return updated; }) : await this.prisma.media.create({ data: values }); if (data.mimeType.startsWith('image/')) await this.queues.media.add('process', { mediaId: media.id }, { attempts: 3, backoff: { type: 'exponential', delay: 3000 } }); await this.audit.record({ actorUserId: actorId, action: data.replaceMediaId ? 'media.replaced' : 'media.finalized', entityType: 'media', entityId: media.id }); return media; }
  async list(page = 1, pageSize = 20, q?: string, status?: string) { const where = { ...(status ? { status: status as 'ready' } : {}), ...(q ? { OR: [{ originalFilename: { contains: q, mode: 'insensitive' as const } }, { normalizedFilename: { contains: q, mode: 'insensitive' as const } }] } : {}) }; const [data, total] = await this.prisma.$transaction([this.prisma.media.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' }, include: { translations: true, variants: true, folder: true } }), this.prisma.media.count({ where })]); return { data, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } }; }
  async usages(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media was not found.');

    const [
      // Pages
      pageTranslations,
      // Services
      servicesHero,
      servicesIcon,
      // Industries
      industriesHero,
      // Case studies
      casesHero,
      casesCover,
      // Insights
      insightsCover,
      insightsDownloadable,
      // Team
      teamMembers,
      // Clients
      clients,
      // Partners
      partners,
      // Brands
      brandsLogo,
      brandsCover,
      // Products/Ventures
      productsLogo,
      productsHero,
      // Testimonials
      testimonials,
      // Certifications
      certifications,
      // Media variants (self-reference safety)
      variants,
    ] = await Promise.all([
      // Page OG media
      this.prisma.pageTranslation.findMany({ where: { ogMediaId: id }, select: { pageId: true, title: true, locale: true } }),
      // Service hero
      this.prisma.service.findMany({ where: { heroMediaId: id }, select: { id: true } }),
      // Service icon
      this.prisma.service.findMany({ where: { iconMediaId: id }, select: { id: true } }),
      // Industry hero
      this.prisma.industry.findMany({ where: { heroMediaId: id }, select: { id: true } }),
      // Case study hero
      this.prisma.caseStudy.findMany({ where: { heroMediaId: id }, select: { id: true } }),
      // Case study cover
      this.prisma.caseStudy.findMany({ where: { coverMediaId: id }, select: { id: true } }),
      // Insight cover
      this.prisma.insight.findMany({ where: { coverMediaId: id }, select: { id: true } }),
      // Insight downloadable
      this.prisma.insight.findMany({ where: { downloadableMediaId: id }, select: { id: true } }),
      // Team member photo
      this.prisma.teamMember.findMany({ where: { photoMediaId: id }, select: { id: true } }),
      // Client logo
      this.prisma.client.findMany({ where: { logoMediaId: id }, select: { id: true } }),
      // Partner logo
      this.prisma.partner.findMany({ where: { logoMediaId: id }, select: { id: true } }),
      // Brand logo
      this.prisma.brand.findMany({ where: { logoMediaId: id }, select: { id: true } }),
      // Brand cover
      this.prisma.brand.findMany({ where: { coverMediaId: id }, select: { id: true } }),
      // Product logo
      this.prisma.product.findMany({ where: { logoMediaId: id }, select: { id: true } }),
      // Product hero
      this.prisma.product.findMany({ where: { heroMediaId: id }, select: { id: true } }),
      // Testimonial avatar
      this.prisma.testimonial.findMany({ where: { avatarMediaId: id }, select: { id: true } }),
      // Certification logo
      this.prisma.certification.findMany({ where: { logoMediaId: id }, select: { id: true } }),
      // Variant parent (safety: if this IS a processed variant source)
      this.prisma.mediaVariant.findMany({ where: { mediaId: id }, select: { id: true, variantType: true } }),
    ]);

    return [
      ...pageTranslations.map((x) => ({ type: 'page.og', id: x.pageId, label: `${x.title ?? x.pageId} (${x.locale})` })),
      ...servicesHero.map((x) => ({ type: 'service.hero', id: x.id })),
      ...servicesIcon.map((x) => ({ type: 'service.icon', id: x.id })),
      ...industriesHero.map((x) => ({ type: 'industry.hero', id: x.id })),
      ...casesHero.map((x) => ({ type: 'case-study.hero', id: x.id })),
      ...casesCover.map((x) => ({ type: 'case-study.cover', id: x.id })),
      ...insightsCover.map((x) => ({ type: 'insight.cover', id: x.id })),
      ...insightsDownloadable.map((x) => ({ type: 'insight.downloadable', id: x.id })),
      ...teamMembers.map((x) => ({ type: 'team-member.photo', id: x.id })),
      ...clients.map((x) => ({ type: 'client.logo', id: x.id })),
      ...partners.map((x) => ({ type: 'partner.logo', id: x.id })),
      ...brandsLogo.map((x) => ({ type: 'brand.logo', id: x.id })),
      ...brandsCover.map((x) => ({ type: 'brand.cover', id: x.id })),
      ...productsLogo.map((x) => ({ type: 'product.logo', id: x.id })),
      ...productsHero.map((x) => ({ type: 'product.hero', id: x.id })),
      ...testimonials.map((x) => ({ type: 'testimonial.avatar', id: x.id })),
      ...certifications.map((x) => ({ type: 'certification.logo', id: x.id })),
      ...variants.map((x) => ({ type: `media.variant.${x.variantType}`, id: x.id })),
    ];
  }
  async archive(id: string, actorId: string, force = false) { const usages = await this.usages(id); if (usages.length && !force) throw new ConflictException({ message: 'Media is currently referenced.', usages }); const row = await this.prisma.media.update({ where: { id }, data: { status: 'archived' } }); await this.audit.record({ actorUserId: actorId, action: 'media.archived', entityType: 'media', entityId: id, summary: { usageCount: usages.length } }); return row; }
  async update(id: string, input: { folderId?: string | null; translations?: Record<string, { title?: string; altText?: string; caption?: string; decorative?: boolean }> }, actorId: string) { const translations = Object.entries(input.translations ?? {}); const row = await this.prisma.media.update({ where: { id }, data: { folderId: input.folderId, translations: { upsert: translations.map(([locale, data]) => ({ where: { mediaId_locale: { mediaId: id, locale } }, create: { locale, ...data }, update: data })) } }, include: { translations: true, variants: true } }); await this.audit.record({ actorUserId: actorId, action: 'media.updated', entityType: 'media', entityId: id }); return row; }
}
