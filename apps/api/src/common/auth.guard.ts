import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { GateviaRequest } from './request-context';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions';

const hash = (value: string) => createHash('sha256').update(value).digest();

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GateviaRequest>();
    const raw = request.cookies?.gatevia_session as string | undefined;
    const [sessionId, token] = raw?.split('.') ?? [];
    if (!sessionId || !token) throw new UnauthorizedException('Authentication required.');
    const session = await this.prisma.authSession.findFirst({ where: { id: sessionId, revokedAt: null, expiresAt: { gt: new Date() }, user: { status: 'active' } }, include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } } });
    if (!session || !timingSafeEqual(hash(token), Buffer.from(session.refreshTokenHash, 'hex'))) throw new UnauthorizedException('Session expired.');
    const permissions = new Set(session.user.roles.flatMap((entry) => entry.role.permissions.map((grant) => grant.permission.key)));
    request.user = { id: session.user.id, email: session.user.email, displayName: session.user.displayName, permissions };
    request.sessionId = session.id;
    return true;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    const request = context.switchToHttp().getRequest<GateviaRequest>();
    return required.every((permission) => request.user?.permissions.has(permission));
  }
}
