import 'reflect-metadata';
import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication, setupOpenApi } from './bootstrap';

Sentry.init({
  ...(process.env.SENTRY_DSN ? { dsn: process.env.SENTRY_DSN } : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
  tracesSampleRate: 1.0,
});

async function main() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApplication(app);
  setupOpenApi(app);
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on ${port}`, 'Bootstrap');
}
void main();
