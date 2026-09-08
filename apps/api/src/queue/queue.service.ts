import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: IORedis;
  readonly email: Queue;
  readonly media: Queue;
  constructor(config: ConfigService) {
    this.connection = new IORedis(config.getOrThrow<string>('REDIS_URL'), { maxRetriesPerRequest: null });
    this.email = new Queue('transactional-email', { connection: this.connection });
    this.media = new Queue('media-image-process', { connection: this.connection });
  }
  async onModuleDestroy(): Promise<void> { await Promise.all([this.email.close(), this.media.close(), this.connection.quit()]); }
}
