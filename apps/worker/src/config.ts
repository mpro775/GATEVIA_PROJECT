const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) return `mock-${key.toLowerCase()}`;
    throw new Error(`Missing required environment value: ${key}`);
  }
  return value;
};
export const config = {
  redisUrl: required('REDIS_URL'),
  r2: {
    endpoint: required('R2_ENDPOINT'),
    region: process.env.R2_REGION ?? 'auto',
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    bucket: required('R2_BUCKET'),
  },
  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'console',
    apiKey: process.env.EMAIL_API_KEY,
    from: process.env.EMAIL_FROM ?? '',
    recipients: (process.env.LEAD_NOTIFICATION_RECIPIENTS ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  },
  appEnv: process.env.APP_ENV ?? 'development',
  adminUrl: process.env.ADMIN_URL ?? '',
};
