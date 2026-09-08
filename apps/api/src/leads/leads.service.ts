import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { assessmentSubmissionSchema, consultationSubmissionSchema, contactSubmissionSchema } from '@gatevia/contracts';
import type { AssessmentSubmission, ConsultationSubmission, ContactSubmission } from '@gatevia/contracts';
import type { LeadSource, LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AuditService } from '../audit/audit.service';

type FormInput = ContactSubmission | ConsultationSubmission | AssessmentSubmission;
/** Recursively produces a canonical JSON string with all object keys sorted at every depth level. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const sorted = Object.keys(value as Record<string, unknown>).sort();
  return `{${sorted.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
}
const stableHash = (input: unknown) => createHash('sha256').update(stableStringify(input)).digest('hex');

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService, private readonly queues: QueueService, private readonly audit: AuditService) {}

  private parse(kind: LeadSource, input: unknown): FormInput {
    const schema = kind === 'contact' ? contactSubmissionSchema : kind === 'consultation' ? consultationSubmissionSchema : assessmentSubmissionSchema;
    const result = schema.safeParse(input);
    if (!result.success) throw new UnprocessableEntityException(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
    return result.data;
  }

  async submit(kind: Extract<LeadSource, 'contact' | 'consultation' | 'assessment'>, rawInput: unknown, idempotencyKey: string) {
    const input = this.parse(kind, rawInput);
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new UnprocessableEntityException('A valid Idempotency-Key is required.');
    const endpoint = `forms/${kind}`; const requestHash = stableHash(input);
    const existing = await this.prisma.idempotencyRecord.findUnique({ where: { key_endpoint: { key: idempotencyKey, endpoint } } });
    if (existing) {
      if (existing.requestHash !== requestHash) throw new ConflictException('Idempotency key was already used with another payload.');
      return existing.response;
    }

    const contact = 'contact' in input ? input.contact : input;
    const company = kind === 'assessment' && 'company' in input ? input.company : undefined;
    const potentialDuplicate = await this.prisma.lead.findFirst({ where: { OR: [{ email: contact.email }, ...(('phone' in contact && contact.phone) ? [{ phone: contact.phone }] : [])] }, orderBy: { createdAt: 'desc' }, select: { id: true } });
    const result = await this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({ data: {
        fullName: contact.fullName,
        companyName: company?.name ?? ('companyName' in input ? input.companyName : undefined),
        email: contact.email,
        phone: 'phone' in contact ? contact.phone : undefined,
        countryCode: company?.countryCode ?? ('countryCode' in input ? input.countryCode : undefined),
        preferredLocale: input.preferredLocale,
        submissionLocale: input.submissionLocale,
        industryId: kind === 'assessment' && 'business' in input ? input.business.industryId : undefined,
        serviceId: kind === 'consultation' && 'serviceId' in input ? input.serviceId : undefined,
        message: kind === 'assessment' && 'business' in input ? input.business.notes : ('message' in input ? input.message : undefined),
        sourceType: kind,
        sourcePage: input.sourcePage,
        sourceUrl: input.sourceUrl,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmTerm: input.utmTerm,
        utmContent: input.utmContent,
        referrer: input.referrer,
        landingPage: input.landingPage,
        duplicateOfId: potentialDuplicate?.id,
      } });
      if (kind === 'assessment') await tx.assessment.create({ data: { leadId: lead.id, formVersion: 'v1', answers: input as unknown as Prisma.InputJsonValue, submittedAt: new Date() } });
      await tx.leadActivity.create({ data: { leadId: lead.id, type: kind === 'assessment' ? 'assessment_submitted' : 'created', payload: { source: kind, duplicateSignaled: Boolean(potentialDuplicate) } } });
      const response = { submissionId: lead.id, received: true };
      await tx.idempotencyRecord.create({ data: { key: idempotencyKey, endpoint, requestHash, response, expiresAt: new Date(Date.now() + 86400000) } });
      await tx.notificationDelivery.create({ data: { type: 'new_lead', recipient: 'configured-in-environment', provider: 'configured', status: 'pending', relatedEntityType: 'lead', relatedEntityId: lead.id } });
      return response;
    });
    await this.queues.email.add('new-lead', { leadId: result.submissionId }, { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 1000 });
    return result;
  }

  async list(query: { page?: string; pageSize?: string; status?: string; source?: string; q?: string }) {
    const page = Math.max(1, Number(query.page) || 1); const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: Prisma.LeadWhereInput = {
      ...(query.status ? { status: query.status as LeadStatus } : {}),
      ...(query.source ? { sourceType: query.source as LeadSource } : {}),
      ...(query.q ? { OR: [{ fullName: { contains: query.q, mode: 'insensitive' } }, { companyName: { contains: query.q, mode: 'insensitive' } }, { email: { contains: query.q, mode: 'insensitive' } }, { phone: { contains: query.q } }] } : {}),
    };
    const [data, total] = await this.prisma.$transaction([this.prisma.lead.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { id: true, displayName: true } }, service: { include: { translations: true } }, industry: { include: { translations: true } } } }), this.prisma.lead.count({ where })]);
    return { data, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  }
  async detail(id: string) { return this.prisma.lead.findUniqueOrThrow({ where: { id }, include: { assignedTo: { select: { id: true, displayName: true } }, notes: { include: { author: { select: { id: true, displayName: true } } }, orderBy: { createdAt: 'desc' } }, activities: { orderBy: { createdAt: 'desc' } }, assessments: true, service: { include: { translations: true } }, industry: { include: { translations: true } } } }); }
  async updateStatus(id: string, status: LeadStatus, actorId: string, requestId: string) { const before = await this.prisma.lead.findUniqueOrThrow({ where: { id }, select: { status: true } }); const lead = await this.prisma.$transaction(async (tx) => { const updated = await tx.lead.update({ where: { id }, data: { status } }); await tx.leadActivity.create({ data: { leadId: id, actorUserId: actorId, type: 'status_changed', payload: { from: before.status, to: status } } }); return updated; }); await this.audit.record({ actorUserId: actorId, action: 'lead.status_changed', entityType: 'lead', entityId: id, requestId, summary: { from: before.status, to: status } }); return lead; }
  async assign(id: string, assignedToUserId: string | null, actorId: string, requestId: string) { const lead = await this.prisma.$transaction(async (tx) => { const updated = await tx.lead.update({ where: { id }, data: { assignedToUserId } }); await tx.leadActivity.create({ data: { leadId: id, actorUserId: actorId, type: 'assigned', payload: { assignedToUserId } } }); return updated; }); await this.audit.record({ actorUserId: actorId, action: 'lead.assigned', entityType: 'lead', entityId: id, requestId, summary: { assignedToUserId } }); return lead; }
  async note(id: string, body: string, actorId: string, requestId: string) { if (!body.trim() || body.length > 5000) throw new UnprocessableEntityException('Note must be between 1 and 5000 characters.'); const note = await this.prisma.$transaction(async (tx) => { const created = await tx.leadNote.create({ data: { leadId: id, authorUserId: actorId, body: body.trim() } }); await tx.leadActivity.create({ data: { leadId: id, actorUserId: actorId, type: 'note_added', payload: { noteId: created.id } } }); return created; }); await this.audit.record({ actorUserId: actorId, action: 'lead.note_added', entityType: 'lead', entityId: id, requestId }); return note; }
}
