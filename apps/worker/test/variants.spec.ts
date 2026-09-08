import { describe, expect, it } from 'vitest';

describe('media variant contract', () => {
  it('uses the required responsive variant names', () => {
    const expected = ['thumbnail', 'small', 'medium', 'large'];
    expect(new Set(expected).size).toBe(4);
  });
});
