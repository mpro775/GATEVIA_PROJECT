import { Body, Controller, Get, Headers, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from './dto';
import { CsrfGuard } from '../common/csrf.guard';
import { SessionGuard } from '../common/auth.guard';
import type { GateviaRequest } from '../common/request-context';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Throttle({ default: { ttl: 60000, limit: 5 } }) @Post('login') async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
  ) {
    return { data: await this.auth.login(input.email, input.password, response, userAgent, ip) };
  }
  @Throttle({ default: { ttl: 60000, limit: 3 } }) @Post('forgot-password') async forgot(
    @Body() input: ForgotPasswordDto,
  ) {
    await this.auth.forgotPassword(input.email);
    return { data: { accepted: true } };
  }
  @Throttle({ default: { ttl: 60000, limit: 5 } }) @Post('reset-password') async reset(
    @Body() input: ResetPasswordDto,
  ) {
    await this.auth.resetPassword(input.token, input.password);
    return { data: { reset: true } };
  }
  @ApiCookieAuth() @UseGuards(SessionGuard, CsrfGuard) @Post('refresh') async refresh(
    @Req() request: GateviaRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.refresh(request.sessionId!, response);
    return { data: { refreshed: true } };
  }
  @ApiCookieAuth() @UseGuards(SessionGuard, CsrfGuard) @Post('logout') async logout(
    @Req() request: GateviaRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(request.sessionId, response);
    return { data: { loggedOut: true } };
  }
  @ApiCookieAuth() @UseGuards(SessionGuard) @Get('me') me(@Req() request: GateviaRequest) {
    const user = request.user!;
    return {
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        permissions: [...user.permissions],
      },
    };
  }
}
