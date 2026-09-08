import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { LeadStatus } from '@prisma/client';
import { SessionGuard, PermissionGuard } from '../common/auth.guard'; import { CsrfGuard } from '../common/csrf.guard'; import { RequirePermissions } from '../common/permissions'; import type { GateviaRequest } from '../common/request-context'; import { LeadsService } from './leads.service';

@ApiTags('admin/leads') @ApiCookieAuth() @UseGuards(SessionGuard, CsrfGuard, PermissionGuard) @Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly leads: LeadsService) {}
  @Get() @RequirePermissions('leads.read') async list(@Query() query: { page?: string; pageSize?: string; status?: string; source?: string; q?: string; sort?: string }) { return this.leads.list(query); }
  @Get(':id') @RequirePermissions('leads.read') async detail(@Param('id') id: string) { return { data: await this.leads.detail(id) }; }
  @Patch(':id/status') @RequirePermissions('leads.update_status') async status(@Param('id') id: string, @Body() body: { status: LeadStatus }, @Req() request: GateviaRequest) { return { data: await this.leads.updateStatus(id, body.status, request.user!.id, request.requestId) }; }
  @Patch(':id/assignee') @RequirePermissions('leads.assign') async assign(@Param('id') id: string, @Body() body: { assignedToUserId: string | null }, @Req() request: GateviaRequest) { return { data: await this.leads.assign(id, body.assignedToUserId, request.user!.id, request.requestId) }; }
  @Post(':id/notes') @RequirePermissions('leads.note') async note(@Param('id') id: string, @Body() body: { body: string }, @Req() request: GateviaRequest) { return { data: await this.leads.note(id, body.body, request.user!.id, request.requestId) }; }
  @Get(':id/activities') @RequirePermissions('leads.read') async activities(@Param('id') id: string) { const lead = await this.leads.detail(id); return { data: lead.activities }; }
}
