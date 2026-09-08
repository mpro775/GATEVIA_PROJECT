import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../common/auth.guard'; import { CsrfGuard } from '../common/csrf.guard'; import type { GateviaRequest } from '../common/request-context'; import { AdminContentService } from './admin-content.service'; import { ResourcePolicyService } from './resource-policy.service';

@ApiTags('admin/content') @ApiCookieAuth() @UseGuards(SessionGuard, CsrfGuard) @Controller('admin/:resource')
export class AdminContentController {
  constructor(private readonly content: AdminContentService, private readonly policy: ResourcePolicyService) {}
  @Get() async list(@Param('resource') resource: string, @Query() query: { page?: string; pageSize?: string; status?: string; q?: string }, @Req() request: GateviaRequest) { this.policy.assert(request, resource, 'read'); return this.content.list(resource, query); }
  @Post() async create(@Param('resource') resource: string, @Body() body: Record<string, unknown>, @Req() request: GateviaRequest) { this.policy.assert(request, resource, ['navigation', 'redirects', 'settings'].includes(resource) ? 'manage' : 'create'); return { data: await this.content.create(resource, body, request.user!.id, request.requestId) }; }
  @Get(':id') async detail(@Param('resource') resource: string, @Param('id') id: string, @Req() request: GateviaRequest) { this.policy.assert(request, resource, 'read'); return { data: await this.content.detail(resource, id) }; }
  @Patch(':id') async update(@Param('resource') resource: string, @Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: GateviaRequest) { this.policy.assert(request, resource, ['navigation', 'redirects', 'settings'].includes(resource) ? 'manage' : 'update'); return { data: await this.content.update(resource, id, body, request.user!.id, request.requestId) }; }
  @Post(':id/publish') async publish(@Param('resource') resource: string, @Param('id') id: string, @Req() request: GateviaRequest) { this.policy.assert(request, resource, 'publish'); return { data: await this.content.transition(resource, id, 'published', request.user!.id, request.requestId) }; }
  @Post(':id/unpublish') async unpublish(@Param('resource') resource: string, @Param('id') id: string, @Req() request: GateviaRequest) { this.policy.assert(request, resource, 'publish'); return { data: await this.content.transition(resource, id, 'draft', request.user!.id, request.requestId) }; }
  @Post(':id/archive') async archive(@Param('resource') resource: string, @Param('id') id: string, @Req() request: GateviaRequest) { this.policy.assert(request, resource, 'archive'); return { data: await this.content.transition(resource, id, 'archived', request.user!.id, request.requestId) }; }
}

