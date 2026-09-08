import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'gatevia:permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
