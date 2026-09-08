import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@ApiTags('health') @Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly queues: QueueService) {}
  @Get('live') live() { return { data: { status: 'ok', time: new Date().toISOString() } }; }
  @Get('ready') async ready() {
    try { await Promise.race([this.prisma.$queryRaw`SELECT 1`, new Promise((_, reject) => setTimeout(() => reject(new Error('database timeout')), 2000))]); await this.queues.email.getJobCounts('waiting', 'active', 'failed'); return { data: { status: 'ready', database: 'ok', queue: 'ok' } }; }
    catch { throw new ServiceUnavailableException('A critical dependency is unavailable.'); }
  }
}
