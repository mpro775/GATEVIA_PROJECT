import { describe, expect, it } from 'vitest';
import { sectionSchemas } from './sections.js';

const ids = [
  '5b7d69a8-43e5-4d08-a0c8-fb9bc173ba0e',
  '7a121f27-853c-4ec9-a63d-3142ea928655',
];

describe('controlled section schemas', () => {
  it('accepts unique service category references', () => {
    expect(sectionSchemas.service_category_pillars.safeParse({ categoryIds: ids }).success).toBe(true);
  });

  it('rejects duplicate and invalid category references', () => {
    expect(
      sectionSchemas.service_category_pillars.safeParse({ categoryIds: [ids[0], ids[0]] }).success,
    ).toBe(false);
    expect(
      sectionSchemas.service_category_pillars.safeParse({ categoryIds: ['not-a-uuid'] }).success,
    ).toBe(false);
  });

  it('keeps generic authored process steps valid', () => {
    expect(
      sectionSchemas.process.safeParse({ steps: [{ title: 'Discover', body: 'Assess context.' }] })
        .success,
    ).toBe(true);
  });
});
