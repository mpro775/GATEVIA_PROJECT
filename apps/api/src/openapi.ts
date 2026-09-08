import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { configureApplication, setupOpenApi } from './bootstrap';

const documentationEnvironment: Record<string, string> = {
  APP_ENV: 'test',
  DATABASE_URL: 'postgresql://openapi:openapi@localhost:5432/openapi?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  AUTH_SESSION_SECRET: 'openapi-only-session-secret-000000000000',
  CSRF_SECRET: 'openapi-only-csrf-secret-000000000000000',
  ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:3001',
  ADMIN_URL: 'http://localhost:3001',
  API_URL: 'http://localhost:3002',
};

async function generate() {
  for (const [key, value] of Object.entries(documentationEnvironment)) process.env[key] ??= value;
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
    preview: true,
  });
  configureApplication(app);
  const document = setupOpenApi(app);
  await writeFile(resolve(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

void generate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
