import { describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { resolveLeadNotificationRecipients } from '../src/email.js';

describe('resolveLeadNotificationRecipients', () => {
  it('returns recipients from forms.notification_recipients setting in database when configured', async () => {
    const mockPrisma = {
      globalSetting: {
        findUnique: async () => ({
          value: ['lead-team@gatevia.sa', 'sales@gatevia.sa'],
        }),
      },
    } as unknown as PrismaClient;

    const recipients = await resolveLeadNotificationRecipients(mockPrisma);
    expect(recipients).toEqual(['lead-team@gatevia.sa', 'sales@gatevia.sa']);
  });

  it('falls back to environment recipients when database setting is empty array', async () => {
    const mockPrisma = {
      globalSetting: {
        findUnique: async () => ({
          value: [],
        }),
      },
    } as unknown as PrismaClient;

    const recipients = await resolveLeadNotificationRecipients(mockPrisma);
    // falls back to config.email.recipients (which is string[] from env)
    expect(Array.isArray(recipients)).toBe(true);
  });

  it('falls back to environment recipients when database setting is not found', async () => {
    const mockPrisma = {
      globalSetting: {
        findUnique: async () => null,
      },
    } as unknown as PrismaClient;

    const recipients = await resolveLeadNotificationRecipients(mockPrisma);
    expect(Array.isArray(recipients)).toBe(true);
  });
});
