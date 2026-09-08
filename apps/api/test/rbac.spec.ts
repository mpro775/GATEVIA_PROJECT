import { describe, expect, it } from 'vitest';
import { grants } from '../../../prisma/seed/catalog';

describe('required role behavior', () => {
  const allowed = (role: keyof typeof grants, permission: string) => grants[role].includes(permission);
  it('matches the negative RBAC matrix', () => {
    expect(allowed('viewer', 'pages.publish')).toBe(false);
    expect(allowed('sales', 'pages.update')).toBe(false);
    expect(allowed('content_manager', 'roles.manage')).toBe(false);
    expect(allowed('super_admin', 'roles.manage')).toBe(true);
  });
});
