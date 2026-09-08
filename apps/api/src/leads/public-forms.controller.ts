import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';

@ApiTags('public/forms')
@Controller('public/forms')
export class PublicFormsController {
  constructor(private readonly leads: LeadsService) {}
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @Post('contact')
  async contact(@Body() input: unknown, @Headers('idempotency-key') key = '') {
    return { data: await this.leads.submit('contact', input, key) };
  }
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @Post('consultation')
  async consultation(@Body() input: unknown, @Headers('idempotency-key') key = '') {
    return { data: await this.leads.submit('consultation', input, key) };
  }
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @Post('market-entry-assessment')
  async assessment(@Body() input: unknown, @Headers('idempotency-key') key = '') {
    return { data: await this.leads.submit('assessment', input, key) };
  }
}
