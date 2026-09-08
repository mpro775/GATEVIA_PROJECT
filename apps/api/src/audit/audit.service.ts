import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(input: {
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    requestId?: string;
    summary?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
        ...(input.entityId ? { entityId: input.entityId } : {}),
        ...(input.requestId ? { requestId: input.requestId } : {}),
        ...(input.summary ? { summary: input.summary as Prisma.InputJsonValue } : {}),
      },
    });
  }
}
