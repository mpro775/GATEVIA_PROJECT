import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ProblemDetailsFilter } from './common/problem.filter';
import { applyOpenApiContracts } from './openapi-contract';

export function configureApplication(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim());
      callback(
        origin && !allowed.includes(origin) ? new Error('Origin is not allowed') : null,
        true,
      );
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key', 'X-Request-ID'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
}

export function setupOpenApi(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('GATEVIA API')
    .setDescription('GATEVIA V1 public and administration REST API')
    .setVersion('1.0.0')
    .addCookieAuth('gatevia_session')
    .build();
  const document = applyOpenApiContracts(
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controller, method) => `${controller}_${method}`,
    }),
  );
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/openapi.json' });
  return document;
}
