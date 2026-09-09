import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionGuard, PermissionGuard } from '../common/auth.guard';
import { CsrfGuard } from '../common/csrf.guard';
import { RequirePermissions } from '../common/permissions';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin/audit')
@ApiCookieAuth()
@UseGuards(SessionGuard, CsrfGuard, PermissionGuard)
@RequirePermissions('audit.read')
@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async list(@Query('page') pageRaw = '1', @Query('pageSize') sizeRaw = '20') {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(sizeRaw) || 20));
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, displayName: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  }
}
