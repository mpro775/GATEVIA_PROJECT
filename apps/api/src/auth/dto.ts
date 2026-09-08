import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(12) password!: string; }
export class ForgotPasswordDto { @IsEmail() email!: string; }
export class ResetPasswordDto { @IsString() @MinLength(32) token!: string; @IsString() @MinLength(16) password!: string; }
