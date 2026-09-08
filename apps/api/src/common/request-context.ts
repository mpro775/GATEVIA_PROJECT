import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  permissions: ReadonlySet<string>;
}

export interface GateviaRequest extends Request {
  requestId: string;
  user?: AuthenticatedUser;
  sessionId?: string;
}
