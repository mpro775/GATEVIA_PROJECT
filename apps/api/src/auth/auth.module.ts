import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionGuard, PermissionGuard } from '../common/auth.guard';
import { CsrfGuard } from '../common/csrf.guard';
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, PermissionGuard, CsrfGuard],
  exports: [SessionGuard, PermissionGuard, CsrfGuard],
})
export class AuthModule {}
