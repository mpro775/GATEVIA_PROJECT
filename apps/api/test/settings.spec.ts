import { describe, expect, it } from 'vitest';
import { settingSchemas } from '../src/content/website-content.service';

describe('Global Settings Validation', () => {
  it('validates analytics.ga4_id format', () => {
    const schema = settingSchemas['analytics.ga4_id'];
    expect(() => schema.parse('G-12345ABCDE')).not.toThrow();
    expect(() => schema.parse('')).not.toThrow();
    expect(() => schema.parse('invalid-id')).toThrow();
    expect(() => schema.parse('UA-123456-1')).toThrow();
  });

  it('validates analytics.gtm_id format', () => {
    const schema = settingSchemas['analytics.gtm_id'];
    expect(() => schema.parse('GTM-ABCDEF1')).not.toThrow();
    expect(() => schema.parse('')).not.toThrow();
    expect(() => schema.parse('invalid-gtm')).toThrow();
    expect(() => schema.parse('G-12345')).toThrow();
  });
});
