import type { NextConfig } from 'next';
import path from 'node:path';

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "'self'";

const configuredImageOrigins = [
  process.env.NEXT_PUBLIC_MEDIA_URL,
  process.env.R2_PUBLIC_BASE_URL,
  process.env.NEXT_PUBLIC_API_URL,

  // GATEVIA production media origin.
  // Keep this explicit because Next.js image remotePatterns are
  // evaluated at build time and runtime env injection is not enough.
  'https://pub-25bf82d6ba2c491cbe3600f1087ec32c.r2.dev',
].filter((value): value is string => Boolean(value));

const remotePatterns = configuredImageOrigins.flatMap((value) => {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return [];
    }

    return [
      {
        protocol: url.protocol.slice(0, -1) as 'http' | 'https',
        hostname: url.hostname,
        port: url.port,
        pathname: '/**',
      },
    ];
  } catch {
    return [];
  }
});

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../..'),

  transpilePackages: [
    '@gatevia/ui',
    '@gatevia/contracts',
    '@gatevia/api-client',
  ],

  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };

    return config;
  },

  images: {
    remotePatterns,
  },

  headers() {
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' ${apiOrigin} https://*.sentry.io https://www.google-analytics.com; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
