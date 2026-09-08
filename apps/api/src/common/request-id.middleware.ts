import { randomUUID } from 'node:crypto';
import type { NextFunction, Response } from 'express';
import type { GateviaRequest } from './request-context';

export function requestIdMiddleware(request: GateviaRequest, response: Response, next: NextFunction): void {
  const incoming = request.header('x-request-id');
  request.requestId = incoming?.slice(0, 128) || randomUUID();
  response.setHeader('x-request-id', request.requestId);
  next();
}
