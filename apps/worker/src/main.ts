import * as Sentry from '@sentry/node';
import { PrismaClient } from '@prisma/client'; import { Worker } from 'bullmq'; import { Redis } from 'ioredis'; import { config } from './config.js'; import { cleanupObject, processImage } from './media.js'; import { sendIdentityEmail, sendLeadNotification } from './email.js';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

const prisma=new PrismaClient();const emailConnection=new Redis(config.redisUrl,{maxRetriesPerRequest:null});const mediaConnection=new Redis(config.redisUrl,{maxRetriesPerRequest:null});
const emailWorker=new Worker('transactional-email',async job=>{const data=job.data as Record<string,unknown>;if(job.name==='new-lead')await sendLeadNotification(prisma,String(data.leadId));else if(job.name==='password-reset'||job.name==='admin-invitation')await sendIdentityEmail(prisma,job.name,String(data.userId),String(data.token))},{connection:emailConnection,concurrency:5});
const mediaWorker=new Worker('media-image-process',async job=>{const data=job.data as Record<string,unknown>;return job.name==='cleanup-replaced-object'?cleanupObject(String(data.bucket),String(data.storageKey)):processImage(prisma,String(data.mediaId))},{connection:mediaConnection,concurrency:2,lockDuration:120000});
for(const worker of [emailWorker,mediaWorker])worker.on('failed',(job,error)=>{
  Sentry.captureException(error, { extra: { jobName: job?.name, jobId: job?.id, queue: worker.name } });
  process.stderr.write(JSON.stringify({level:'error',queue:worker.name,jobId:job?.id,error:error.name})+'\n');
});
async function shutdown(){await Promise.all([emailWorker.close(),mediaWorker.close()]);await Promise.all([emailConnection.quit(),mediaConnection.quit()]);await prisma.$disconnect()}
process.on('SIGTERM',()=>void shutdown().then(()=>process.exit(0)));process.on('SIGINT',()=>void shutdown().then(()=>process.exit(0)));
process.stdout.write(JSON.stringify({level:'info',event:'worker_started',queues:['transactional-email','media-image-process']})+'\n');
