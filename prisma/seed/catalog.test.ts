import { describe, expect, it } from 'vitest';
import { grants, permissions, roles } from './catalog';

describe('RBAC seed matrix', () => {
  it('grants every permission to Super Admin', () => expect(new Set(grants.super_admin)).toEqual(new Set(permissions)));
  it('prevents Sales from changing pages or roles', () => {
    expect(grants.sales).toContain('leads.update_status');
    expect(grants.sales).not.toContain('pages.update');
    expect(grants.sales).not.toContain('roles.manage');
  });
  it('keeps Viewer read only', () => expect(grants.viewer.every((permission) => permission.endsWith('.read'))).toBe(true));
  it('defines every granted permission in the permission catalog', () => {
    for (const role of roles) for (const grant of grants[role]) expect(permissions).toContain(grant);
  });
});
