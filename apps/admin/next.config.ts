import type { NextConfig } from 'next';
import path from 'node:path';
const api = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "'self'";
const config: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  transpilePackages: ['@gatevia/ui', '@gatevia/contracts', '@gatevia/api-client'],
  webpack(value) {
    value.resolve.extensionAlias = {
      ...value.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return value;
  },
  headers() {
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' ${api} https://*.sentry.io https://*.r2.cloudflarestorage.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]);
  },
};
export default config;
