import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(input: { actorUserId?: string; action: string; entityType: string; entityId?: string; requestId?: string; summary?: Record<string, unknown> }): Promise<void> {
    await this.prisma.auditLog.create({ data: { actorUserId: input.actorUserId, action: input.action, entityType: input.entityType, entityId: input.entityId, requestId: input.requestId, summary: input.summary } });
  }
}
