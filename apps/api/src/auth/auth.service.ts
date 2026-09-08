import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const token = () => randomBytes(32).toString('base64url');

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService, private readonly queues: QueueService) {}
  private setCookies(response: Response, sessionId: string, refresh: string, csrf: string): void {
    const secure = this.config.get('APP_ENV') !== 'development';
    const domain = this.config.get<string>('SESSION_COOKIE_DOMAIN') || undefined;
    const common = { secure, sameSite: 'lax' as const, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000, ...(domain ? { domain } : {}) };
    response.cookie('gatevia_session', `${sessionId}.${refresh}`, { ...common, httpOnly: true });
    response.cookie('gatevia_csrf', csrf, { ...common, httpOnly: false });
  }
  async login(email: string, password: string, response: Response, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || user.status !== 'active' || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Invalid email or password.');
    const refresh = token(); const csrf = token();
    const session = await this.prisma.authSession.create({ data: { userId: user.id, refreshTokenHash: sha256(refresh), csrfTokenHash: sha256(csrf), userAgent: userAgent?.slice(0, 500) ?? null, ipHash: ip ? sha256(ip) : null, expiresAt: new Date(Date.now() + 7 * 86400000) } });
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    this.setCookies(response, session.id, refresh, csrf);
    return { id: user.id, email: user.email, displayName: user.displayName, mustChangePassword: user.mustChangePassword };
  }
  async refresh(sessionId: string, response: Response): Promise<void> {
    const session = await this.prisma.authSession.findUnique({ where: { id: sessionId } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException('Session expired.');
    const refresh = token(); const csrf = token();
    await this.prisma.authSession.update({ where: { id: session.id }, data: { refreshTokenHash: sha256(refresh), csrfTokenHash: sha256(csrf), expiresAt: new Date(Date.now() + 7 * 86400000) } });
    this.setCookies(response, session.id, refresh, csrf);
  }
  async logout(sessionId: string | undefined, response: Response): Promise<void> {
    if (sessionId) await this.prisma.authSession.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
    response.clearCookie('gatevia_session', { path: '/' }); response.clearCookie('gatevia_csrf', { path: '/' });
  }
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || user.status !== 'active') return;
    const raw = token();
    await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 30 * 60000) } });
    await this.queues.email.add('password-reset', { userId: user.id, token: raw }, { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 1000 });
  }
  async resetPassword(raw: string, password: string): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(raw) } });
    if (!record || record.usedAt || record.expiresAt <= new Date()) throw new UnauthorizedException('Reset token is invalid or expired.');
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash, mustChangePassword: false, status: 'active' } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.authSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }
}
