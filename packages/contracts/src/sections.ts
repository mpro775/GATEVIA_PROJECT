import { z } from 'zod';
import { safeHref, richContentSchema } from './cms.js';

const link = z.object({ label: z.string().max(120), href: safeHref });
const base = z.object({
  eyebrow: z.string().max(120).optional(),
  title: z.string().max(240).optional(),
});
export const sectionSchemas = {
  hero: base.extend({
    body: z.string().max(2000).optional(),
    primaryCta: link.optional(),
    secondaryCta: link.optional(),
    mediaId: z.string().uuid().optional(),
  }),
  rich_text: z.object({ blocks: richContentSchema }),
  text_image: base.extend({
    body: z.string().max(10000),
    mediaId: z.string().uuid(),
    mediaPosition: z.enum(['start', 'end']).default('end'),
  }),
  stats: base.extend({
    items: z
      .array(
        z.object({
          label: z.string().max(120),
          value: z.string().max(40),
          suffix: z.string().max(20).optional(),
        }),
      )
      .max(12),
  }),
  services_grid: base.extend({
    serviceIds: z.array(z.string().uuid()).max(12),
    featuredOnly: z.boolean().optional(),
  }),
  industries_grid: base.extend({
    industryIds: z.array(z.string().uuid()).max(12),
    featuredOnly: z.boolean().optional(),
  }),
  process: base.extend({
    steps: z.array(z.object({ title: z.string().max(160), body: z.string().max(1000) })).max(12),
  }),
  timeline: base.extend({
    steps: z
      .array(
        z.object({
          title: z.string().max(160),
          body: z.string().max(1000),
          marker: z.string().max(40).optional(),
        }),
      )
      .max(20),
  }),
  testimonials: base.extend({ testimonialIds: z.array(z.string().uuid()).max(12) }),
  case_studies: base.extend({ caseStudyIds: z.array(z.string().uuid()).max(12) }),
  logo_cloud: base.extend({
    clientIds: z.array(z.string().uuid()).max(30),
    partnerIds: z.array(z.string().uuid()).max(30),
  }),
  faq: base.extend({ faqIds: z.array(z.string().uuid()).max(30) }),
  cta: base.extend({ body: z.string().max(1000).optional(), primaryCta: link }),
  insights: base.extend({ insightIds: z.array(z.string().uuid()).max(12) }),
  ecosystem: base.extend({
    brandIds: z.array(z.string().uuid()).max(12),
    productIds: z.array(z.string().uuid()).max(12),
  }),
  form: base.extend({ formType: z.enum(['contact', 'consultation', 'assessment']) }),
} as const;

export type SectionType = keyof typeof sectionSchemas;
export function validateSectionContent(type: string, content: unknown): void {
  const schema = sectionSchemas[type as SectionType];
  if (!schema) throw new Error(`Unsupported controlled section type: ${type}`);
  schema.parse(content);
}
