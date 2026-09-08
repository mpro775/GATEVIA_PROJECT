import { z } from 'zod';
export * from './cms.js';

export const contentStatuses = ['draft', 'review', 'published', 'archived'] as const;
export const contentStatusSchema = z.enum(contentStatuses);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const directions = ['ltr', 'rtl'] as const;
export const directionSchema = z.enum(directions);
export type Direction = z.infer<typeof directionSchema>;

export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];

export const leadSources = [
  'contact',
  'consultation',
  'assessment',
  'landing_page',
  'manual',
] as const;
export const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ApiEnvelope<T> = { data: T };
export type Paginated<T> = ApiEnvelope<T[]> & {
  meta: { page: number; pageSize: number; total: number; pageCount: number };
};

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: Record<string, string[]>;
}

const attribution = {
  sourcePage: z.string().max(500).optional(),
  sourceUrl: z.string().url().max(2000).optional(),
  submissionLocale: z.string().min(2).max(16),
  preferredLocale: z.string().min(2).max(16).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  referrer: z.string().max(2000).optional(),
  landingPage: z.string().max(2000).optional(),
  website: z.string().max(0).optional(),
};

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional(),
  countryCode: z.string().trim().max(8).optional(),
  subject: z.string().trim().max(180).optional(),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal(true),
  ...attribution,
});

export const consultationSubmissionSchema = contactSubmissionSchema.omit({ subject: true }).extend({
  serviceId: z.string().uuid().optional(),
  companyStage: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
});

export const assessmentSubmissionSchema = z.object({
  contact: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().trim().max(40).optional(),
  }),
  company: z.object({
    name: z.string().trim().min(2).max(160),
    website: z.string().url().max(500).optional(),
    countryCode: z.string().max(8),
    size: z.string().max(80).optional(),
  }),
  business: z.object({
    industryId: z.string().uuid().optional(),
    currentSaudiPresence: z.string().max(300),
    objective: z.enum(['research', 'setup', 'partner_search', 'growth', 'other']),
    timeline: z.enum(['immediate', '1_3_months', '3_6_months', '6_plus_months']),
    needs: z
      .array(
        z.enum(['company_formation', 'licensing', 'research', 'local_partner', 'gtm', 'other']),
      )
      .min(1),
    notes: z.string().max(3000).optional(),
  }),
  consent: z.literal(true),
  ...attribution,
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type ConsultationSubmission = z.infer<typeof consultationSubmissionSchema>;
export type AssessmentSubmission = z.infer<typeof assessmentSubmissionSchema>;

export function normalizeVideoEmbed(
  value: string,
): { provider: 'youtube' | 'vimeo'; videoId: string } | null {
  try {
    const url = new URL(value);
    if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
      const videoId =
        url.hostname === 'youtu.be'
          ? url.pathname.slice(1)
          : (url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).at(-1) ?? '');
      return /^[a-zA-Z0-9_-]{6,20}$/.test(videoId) ? { provider: 'youtube', videoId } : null;
    }
    if (['vimeo.com', 'www.vimeo.com'].includes(url.hostname)) {
      const videoId = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
      return /^\d{6,12}$/.test(videoId) ? { provider: 'vimeo', videoId } : null;
    }
  } catch {
    return null;
  }
  return null;
}

export * from './sections.js';
