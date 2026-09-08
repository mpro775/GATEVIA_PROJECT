import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength, validateSync } from 'class-validator';

enum RuntimeEnvironment { development = 'development', test = 'test', staging = 'staging', production = 'production' }

class Environment {
  @IsEnum(RuntimeEnvironment) APP_ENV: RuntimeEnvironment = RuntimeEnvironment.development;
  @IsString() @IsNotEmpty() DATABASE_URL!: string;
  @IsString() @IsNotEmpty() REDIS_URL!: string;
  @IsString() @MinLength(32) AUTH_SESSION_SECRET!: string;
  @IsString() @MinLength(32) CSRF_SECRET!: string;
  @IsString() @IsNotEmpty() ALLOWED_ORIGINS!: string;
  @IsUrl({ require_tld: false }) ADMIN_URL!: string;
  @IsUrl({ require_tld: false }) API_URL!: string;
  @IsOptional() @IsString() SENTRY_DSN?: string;
}

export function validateEnvironment(input: Record<string, unknown>): Record<string, unknown> {
  const config = plainToInstance(Environment, input, { enableImplicitConversion: true });
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length) throw new Error(`Invalid environment configuration: ${errors.map((error) => error.property).join(', ')}`);
  return input;
}
