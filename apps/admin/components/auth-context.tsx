'use client';

import { createContext, useContext } from 'react';
import type { AuthUser as AdminUser } from '@gatevia/api-client';

export type { AdminUser };

const AuthContext = createContext<AdminUser | null>(null);

export function AdminAuthProvider({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const user = useContext(AuthContext);
  if (!user) throw new Error('AdminAuthProvider is missing.');
  const permissions = new Set(user.permissions);
  return {
    user,
    can: (permission: string) => permissions.has(permission),
    canAny: (...required: string[]) => required.some((permission) => permissions.has(permission)),
  };
}
