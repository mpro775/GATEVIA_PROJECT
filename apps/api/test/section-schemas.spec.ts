import { describe, expect, it } from 'vitest';
import { sectionSchemas, validateSectionContent } from '../src/content/section-schemas';

describe('controlled page sections', () => {
  it('contains the contract allowlist', () => expect(Object.keys(sectionSchemas).sort()).toEqual(['case_studies','cta','faq','form','hero','industries_grid','logo_cloud','process','rich_text','services_grid','stats','testimonials','text_image','timeline'].sort()));
  it('rejects arbitrary HTML sections', () => expect(() => validateSectionContent('html', { html: '<script>alert(1)</script>' })).toThrow());
  it('accepts a localized CTA section', () => expect(() => validateSectionContent('cta', { title: 'Next step', primaryCta: { label: 'Talk to us', href: '/contact' } })).not.toThrow());
});
