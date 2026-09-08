import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { ContentModule } from './content/content.module';
import { LanguagesModule } from './languages/languages.module';
import { MediaModule } from './media/media.module';
import { IdentityModule } from './identity/identity.module';
import { requestIdMiddleware } from './common/request-id.middleware';
import { validateEnvironment } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]),
    PrismaModule,
    QueueModule,
    AuditModule,
    AuthModule,
    HealthModule,
    LeadsModule,
    LanguagesModule,
    MediaModule,
    IdentityModule,
    ContentModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(requestIdMiddleware).forRoutes('*');
  }
}
