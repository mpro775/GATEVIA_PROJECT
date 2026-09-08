import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/auth/auth.service';
import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../src/prisma/prisma.service';
import type { QueueService } from '../src/queue/queue.service';
import type { CookieOptions, Response } from 'express';

interface RecordedCookie {
  name: string;
  val: string;
  options: CookieOptions;
}

interface RecordedClearCookie {
  name: string;
  options: CookieOptions;
}

describe('AuthService Cookie Management', () => {
  function createService(env: Record<string, string | undefined>) {
    const config = {
      get: vi.fn((key: string) => env[key]),
    } as unknown as ConfigService;
    const prisma = {
      authSession: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;
    const queues = {} as QueueService;
    return { service: new AuthService(prisma, config, queues), prisma };
  }

  function createMockResponse() {
    const cookies: RecordedCookie[] = [];
    const cleared: RecordedClearCookie[] = [];
    const res = {
      cookie: vi.fn((name: string, val: string, options: CookieOptions) => {
        cookies.push({ name, val, options });
        return res;
      }),
      clearCookie: vi.fn((name: string, options: CookieOptions) => {
        cleared.push({ name, options });
        return res;
      }),
    } as unknown as Response;
    return { res, cookies, cleared };
  }

  it('unifies cookie options when setting and clearing with SESSION_COOKIE_DOMAIN', async () => {
    const { service } = createService({
      APP_ENV: 'production',
      SESSION_COOKIE_DOMAIN: '.gatevia.sa',
    });
    const { res, cookies, cleared } = createMockResponse();

    const setCookies = Reflect.get(service, 'setCookies') as (
      response: Response,
      sessionId: string,
      refresh: string,
      csrf: string,
    ) => void;
    setCookies.call(service, res, 'sess-123', 'ref-456', 'csrf-789');

    expect(cookies).toHaveLength(2);
    const sessionCookie = cookies.find((c) => c.name === 'gatevia_session');
    const csrfCookie = cookies.find((c) => c.name === 'gatevia_csrf');
    expect(sessionCookie).toBeDefined();
    expect(csrfCookie).toBeDefined();

    expect(sessionCookie?.options).toMatchObject({
      domain: '.gatevia.sa',
      secure: true,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    });
    expect(csrfCookie?.options).toMatchObject({
      domain: '.gatevia.sa',
      secure: true,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    });

    await service.logout('sess-123', res);

    const clearedSessionWithDomain = cleared.find(
      (c) => c.name === 'gatevia_session' && c.options.domain === '.gatevia.sa',
    );
    const clearedCsrfWithDomain = cleared.find(
      (c) => c.name === 'gatevia_csrf' && c.options.domain === '.gatevia.sa',
    );

    expect(clearedSessionWithDomain).toBeDefined();
    expect(clearedSessionWithDomain?.options).toMatchObject({
      domain: '.gatevia.sa',
      secure: true,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    });

    expect(clearedCsrfWithDomain).toBeDefined();
    expect(clearedCsrfWithDomain?.options).toMatchObject({
      domain: '.gatevia.sa',
      secure: true,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    });
  });

  it('unifies cookie options when SESSION_COOKIE_DOMAIN is not set', async () => {
    const { service } = createService({
      APP_ENV: 'development',
      SESSION_COOKIE_DOMAIN: undefined,
    });
    const { res, cookies, cleared } = createMockResponse();

    const setCookies = Reflect.get(service, 'setCookies') as (
      response: Response,
      sessionId: string,
      refresh: string,
      csrf: string,
    ) => void;
    setCookies.call(service, res, 'sess-123', 'ref-456', 'csrf-789');

    const sessionCookie = cookies.find((c) => c.name === 'gatevia_session');
    const csrfCookie = cookies.find((c) => c.name === 'gatevia_csrf');
    expect(sessionCookie).toBeDefined();
    expect(csrfCookie).toBeDefined();

    expect(sessionCookie?.options.domain).toBeUndefined();
    expect(sessionCookie?.options.secure).toBe(false);
    expect(sessionCookie?.options.sameSite).toBe('lax');
    expect(sessionCookie?.options.path).toBe('/');
    expect(sessionCookie?.options.httpOnly).toBe(true);

    expect(csrfCookie?.options.domain).toBeUndefined();
    expect(csrfCookie?.options.secure).toBe(false);
    expect(csrfCookie?.options.sameSite).toBe('lax');
    expect(csrfCookie?.options.path).toBe('/');
    expect(csrfCookie?.options.httpOnly).toBe(false);

    await service.logout('sess-123', res);

    const clearedSession = cleared.find((c) => c.name === 'gatevia_session');
    const clearedCsrf = cleared.find((c) => c.name === 'gatevia_csrf');
    expect(clearedSession).toBeDefined();
    expect(clearedCsrf).toBeDefined();

    expect(clearedSession?.options.domain).toBeUndefined();
    expect(clearedSession?.options.secure).toBe(false);
    expect(clearedSession?.options.sameSite).toBe('lax');
    expect(clearedSession?.options.path).toBe('/');
    expect(clearedSession?.options.httpOnly).toBe(true);

    expect(clearedCsrf?.options.domain).toBeUndefined();
    expect(clearedCsrf?.options.secure).toBe(false);
    expect(clearedCsrf?.options.sameSite).toBe('lax');
    expect(clearedCsrf?.options.path).toBe('/');
    expect(clearedCsrf?.options.httpOnly).toBe(false);
  });
});
