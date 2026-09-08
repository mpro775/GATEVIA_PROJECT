import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionGuard, PermissionGuard } from '../common/auth.guard';
import { CsrfGuard } from '../common/csrf.guard';
import { RequirePermissions } from '../common/permissions';
import type { GateviaRequest } from '../common/request-context';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
@ApiTags('admin/media')
@ApiCookieAuth()
@UseGuards(SessionGuard, CsrfGuard, PermissionGuard)
@Controller('admin')
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly prisma: PrismaService,
  ) {}
  @Get('media') @RequirePermissions('media.read') async list(
    @Query('page') p = '1',
    @Query('pageSize') s = '20',
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.media.list(
      Math.max(1, Number(p) || 1),
      Math.min(100, Math.max(1, Number(s) || 20)),
      q,
      status,
      folderId,
    );
  }
  @Post('media/upload-session') @RequirePermissions('media.upload') async session(
    @Body() body: { filename: string; mimeType: string; sizeBytes: number },
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.uploadSession(body, req.user!.id) };
  }
  @Post('media/:id/replace-session') @RequirePermissions('media.update') async replaceSession(
    @Param('id') id: string,
    @Body() body: { filename: string; mimeType: string; sizeBytes: number },
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.uploadSession(body, req.user!.id, id) };
  }
  @Post('media/finalize') @RequirePermissions('media.upload') async finalize(
    @Body() body: { uploadToken: string; folderId?: string },
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.finalize(body.uploadToken, req.user!.id, body.folderId) };
  }
  @Patch('media/:id') @RequirePermissions('media.update') async update(
    @Param('id') id: string,
    @Body()
    body: {
      folderId?: string | null;
      translations?: Record<
        string,
        { title?: string; altText?: string; caption?: string; decorative?: boolean }
      >;
    },
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.update(id, body, req.user!.id) };
  }
  @Get('media/:id/usages') @RequirePermissions('media.read') async usages(@Param('id') id: string) {
    return { data: await this.media.usages(id) };
  }
  @Post('media/:id/archive') @RequirePermissions('media.archive') async archive(
    @Param('id') id: string,
    @Body() body: { force?: boolean },
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.archive(id, req.user!.id, body.force) };
  }
  @Post('media/:id/retry') @RequirePermissions('media.update') async retry(
    @Param('id') id: string,
    @Req() req: GateviaRequest,
  ) {
    return { data: await this.media.retry(id, req.user!.id) };
  }
  @Get('media-folders') @RequirePermissions('media.read') async folders() {
    return {
      data: await this.prisma.mediaFolder.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { media: true, children: true } } },
      }),
    };
  }
  @Post('media-folders') @RequirePermissions('media.update') async createFolder(
    @Body() body: { name: string; parentId?: string },
  ) {
    return {
      data: await this.prisma.mediaFolder.create({
        data: { name: body.name.trim(), ...(body.parentId ? { parentId: body.parentId } : {}) },
      }),
    };
  }
  @Patch('media-folders/:id') @RequirePermissions('media.update') async updateFolder(
    @Param('id') id: string,
    @Body() body: { name?: string; parentId?: string | null },
  ) {
    return {
      data: await this.prisma.mediaFolder.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
        },
      }),
    };
  }
}
