import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { GateviaRequest } from './request-context';
import { PrismaService } from '../prisma/prisma.service';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GateviaRequest>();
    if (SAFE.has(request.method)) return true;
    const header = request.header('x-csrf-token');
    const cookie = request.cookies?.gatevia_csrf as string | undefined;
    if (!header || !cookie || header !== cookie || !request.sessionId) throw new ForbiddenException('CSRF validation failed.');
    const session = await this.prisma.authSession.findUnique({ where: { id: request.sessionId }, select: { csrfTokenHash: true } });
    const presented = createHash('sha256').update(header).digest();
    if (!session || !timingSafeEqual(presented, Buffer.from(session.csrfTokenHash, 'hex'))) throw new ForbiddenException('CSRF validation failed.');
    return true;
  }
}
