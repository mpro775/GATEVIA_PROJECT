import { describe, expect, it } from 'vitest';
import { assessmentSubmissionSchema, contactSubmissionSchema, directions, themes } from './index.js';

describe('public form contracts', () => {
  it('normalizes contact email and rejects a honeypot value', () => {
    const valid = contactSubmissionSchema.parse({ fullName: 'Valid Person', email: ' PERSON@EXAMPLE.COM ', message: 'A sufficiently detailed enquiry.', consent: true, submissionLocale: 'fr' });
    expect(valid.email).toBe('person@example.com');
    expect(contactSubmissionSchema.safeParse({ ...valid, website: 'bot' }).success).toBe(false);
  });
  it('requires a structured assessment instead of an uncontrolled payload', () => {
    const result = assessmentSubmissionSchema.safeParse({ contact: { fullName: 'Valid Person', email: 'person@example.com' }, company: { name: 'Company', countryCode: 'FR' }, business: { currentSaudiPresence: 'none', objective: 'research', timeline: '3_6_months', needs: ['research'] }, consent: true, submissionLocale: 'fr' });
    expect(result.success).toBe(true);
  });
});

describe('platform enumerations', () => {
  it('keeps theme and direction contracts closed while locales remain open', () => {
    expect(themes).toEqual(['light', 'dark']);
    expect(directions).toEqual(['ltr', 'rtl']);
    expect(contactSubmissionSchema.safeParse({ fullName: 'Valid Person', email: 'person@example.com', message: 'A sufficiently detailed enquiry.', consent: true, submissionLocale: 'zh-CN' }).success).toBe(true);
  });
});
