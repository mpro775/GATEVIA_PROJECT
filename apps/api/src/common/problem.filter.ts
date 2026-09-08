import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import type { GateviaRequest } from './request-context';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);
  catch(error: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<GateviaRequest>();
    const response = context.getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = error instanceof HttpException ? error.getResponse() : null;
    const details = typeof exceptionResponse === 'object' && exceptionResponse !== null ? exceptionResponse as Record<string, unknown> : {};
    const rawMessage = details.message;
    const detail = status >= 500 ? 'An unexpected error occurred.' : Array.isArray(rawMessage) ? 'One or more fields are invalid.' : String(rawMessage ?? exceptionResponse ?? 'Request failed.');
    if (status >= 500) {
      import('@sentry/node').then(Sentry => {
        Sentry.captureException(error, { extra: { requestId: request.requestId, route: request.originalUrl } });
      });
      this.logger.error(JSON.stringify({ requestId: request.requestId, route: request.originalUrl, error: error instanceof Error ? error.name : 'UnknownError' }));
    }
    response.status(status).type('application/problem+json').send({
      type: `https://gatevia.example/problems/${status === 422 ? 'validation-error' : 'request-error'}`,
      title: status >= 500 ? 'Internal server error' : HttpStatus[status] ?? 'Request error',
      status,
      detail,
      instance: request.originalUrl,
      requestId: request.requestId,
      ...(Array.isArray(rawMessage) ? { errors: { request: rawMessage.map(String) } } : {}),
    });
  }
}
