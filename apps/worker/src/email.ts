import type { PrismaClient } from '@prisma/client';
import { config } from './config.js';
export interface Mail {
  to: string[];
  subject: string;
  text: string;
}
export interface EmailProvider {
  send(mail: Mail): Promise<{ id: string }>;
}
class ConsoleProvider implements EmailProvider {
  send(mail: Mail) {
    process.stdout.write(
      JSON.stringify({
        level: 'info',
        event: 'email_simulated',
        toCount: mail.to.length,
        subject: mail.subject,
      }) + '\n',
    );
    return Promise.resolve({ id: `console-${Date.now()}` });
  }
}
class ResendProvider implements EmailProvider {
  async send(mail: Mail) {
    if (!config.email.apiKey) throw new Error('EMAIL_API_KEY is required for Resend');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.email.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.email.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
      }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    return (await response.json()) as { id: string };
  }
}
export const provider: EmailProvider =
  config.email.provider === 'resend' ? new ResendProvider() : new ConsoleProvider();
export async function sendIdentityEmail(
  prisma: PrismaClient,
  job: 'password-reset' | 'admin-invitation',
  userId: string,
  token: string,
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, displayName: true },
  });
  const path = job === 'admin-invitation' ? 'accept-invitation' : 'reset-password';
  const actionUrl = `${config.adminUrl}/${path}?token=${encodeURIComponent(token)}`;
  await provider.send({
    to: [user.email],
    subject:
      job === 'admin-invitation'
        ? 'Your GATEVIA administration invitation'
        : 'Reset your GATEVIA administration password',
    text: `Hello ${user.displayName},\n\nUse this one-time link to ${job === 'admin-invitation' ? 'activate your account' : 'reset your password'}:\n${actionUrl}\n\nIf you did not request this, ignore this message.`,
  });
}
export async function resolveLeadNotificationRecipients(prisma: PrismaClient): Promise<string[]> {
  try {
    const setting = await prisma.globalSetting.findUnique({
      where: { key: 'forms.notification_recipients' },
      select: { value: true },
    });
    if (setting && Array.isArray(setting.value)) {
      const dbRecipients = (setting.value as unknown[])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((s) => s.trim());
      if (dbRecipients.length > 0) {
        return dbRecipients;
      }
    }
  } catch (error) {
    process.stderr.write(
      `Failed to load notification recipients from database: ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
  return config.email.recipients;
}

export async function sendLeadNotification(prisma: PrismaClient, leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
    select: { id: true, fullName: true, companyName: true, sourceType: true, createdAt: true },
  });
  const delivery = await prisma.notificationDelivery.findFirst({
    where: {
      relatedEntityType: 'lead',
      relatedEntityId: leadId,
      status: { in: ['pending', 'queued'] },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (delivery)
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: 'queued' },
    });

  const recipients = await resolveLeadNotificationRecipients(prisma);
  if (recipients.length === 0) {
    if (delivery)
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: 'failed', errorCode: 'no_recipients' },
      });
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'notification_failed',
        payload: { reason: 'No lead notification recipients configured in database or environment.' },
      },
    });
    return;
  }

  try {
    const result = await provider.send({
      to: recipients,
      subject: `New ${lead.sourceType} request`,
      text: `A new request was saved.\nLead: ${lead.id}\nName: ${lead.fullName}\nCompany: ${lead.companyName ?? '—'}\nOpen: ${config.adminUrl}/sales/leads/${lead.id}`,
    });
    if (delivery)
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: 'sent', providerMessageId: result.id },
      });
    await prisma.leadActivity.create({
      data: { leadId, type: 'notification_sent', payload: { deliveryId: delivery?.id ?? null } },
    });
  } catch (error) {
    if (delivery)
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: 'failed', errorCode: error instanceof Error ? error.name : 'unknown' },
      });
    await prisma.leadActivity.create({
      data: { leadId, type: 'notification_failed', payload: { deliveryId: delivery?.id ?? null } },
    });
    throw error;
  }
}
