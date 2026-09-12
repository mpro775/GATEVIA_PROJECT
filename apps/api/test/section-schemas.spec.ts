import { describe, expect, it } from 'vitest';
import { sectionSchemas, validateSectionContent } from '../src/content/section-schemas';

describe('controlled page sections', () => {
  it('contains the contract allowlist', () =>
    expect(Object.keys(sectionSchemas).sort()).toEqual(
      [
        'case_studies',
        'cta',
        'ecosystem',
        'faq',
        'form',
        'hero',
        'industries_grid',
        'insights',
        'logo_cloud',
        'process',
        'rich_text',
        'service_category_pillars',
        'services_grid',
        'stats',
        'testimonials',
        'text_image',
        'timeline',
      ].sort(),
    ));
  it('rejects arbitrary HTML sections', () =>
    expect(() => validateSectionContent('html', { html: '<script>alert(1)</script>' })).toThrow());
  it('accepts a localized CTA section', () =>
    expect(() =>
      validateSectionContent('cta', {
        title: 'Next step',
        primaryCta: { label: 'Talk to us', href: '/contact' },
      }),
    ).not.toThrow());

  it('accepts optional media for process steps and CTA sections', () => {
    const mediaId = '11111111-1111-4111-8111-111111111111';
    expect(() =>
      validateSectionContent('process', {
        title: 'Three pillars',
        steps: [{ title: 'Access', body: 'Enter the market.', mediaId }],
      }),
    ).not.toThrow();
    expect(() =>
      validateSectionContent('cta', {
        title: 'Next step',
        primaryCta: { label: 'Talk to us', href: '/contact' },
        mediaId,
      }),
    ).not.toThrow();
  });

  it('rejects invalid process-step and CTA media IDs', () => {
    expect(() =>
      validateSectionContent('process', {
        steps: [{ title: 'Access', body: 'Enter the market.', mediaId: 'not-a-uuid' }],
      }),
    ).toThrow();
    expect(() =>
      validateSectionContent('cta', {
        primaryCta: { label: 'Talk to us', href: '/contact' },
        mediaId: 'not-a-uuid',
      }),
    ).toThrow();
  });

  it('keeps legacy process and CTA payloads valid without media', () => {
    expect(() =>
      validateSectionContent('process', {
        steps: [{ title: 'Access', body: 'Enter the market.' }],
      }),
    ).not.toThrow();
    expect(() =>
      validateSectionContent('cta', {
        primaryCta: { label: 'Talk to us', href: '/contact' },
      }),
    ).not.toThrow();
  });
});
