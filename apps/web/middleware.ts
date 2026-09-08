import { NextRequest, NextResponse } from 'next/server';
import { resolveApiUrl, type Language, type RedirectMatch } from '@gatevia/api-client';

// ─── Why fetch() and not client.GET() here? ───────────────────────────────────
// Next.js middleware runs on the Edge Runtime. openapi-fetch works on Edge, but
// the `next: { revalidate, tags }` cache options on fetch() are Next.js-specific
// extensions that are NOT forwarded through openapi-fetch's typed call layer.
// Keeping native fetch() here is intentional: it preserves ISR + cache tags
// while still using the generated types (Language, RedirectMatch) from
// @gatevia/api-client for response-body assertions.
// ─────────────────────────────────────────────────────────────────────────────

const API = resolveApiUrl(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1');

export async function middleware(request: NextRequest) {
  const pathname =
    request.nextUrl.pathname.length > 1
      ? request.nextUrl.pathname.replace(/\/$/, '')
      : request.nextUrl.pathname;

  const [redirect, languages] = await Promise.all([
    fetch(`${API}/public/redirect?path=${encodeURIComponent(pathname)}`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) =>
        response.ok ? ((await response.json()) as { data: RedirectMatch | null }).data : null,
      )
      .catch(() => null),
    fetch(`${API}/public/languages`, { headers: { Accept: 'application/json' } })
      .then(async (response) =>
        response.ok ? ((await response.json()) as { data: Language[] }).data : [],
      )
      .catch(() => [] as Language[]),
  ]);

  if (redirect) {
    const destination = request.nextUrl.clone();
    destination.pathname = redirect.destinationPath;
    return NextResponse.redirect(destination, redirect.statusCode);
  }

  const segment = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  const language = languages.find((item) => item.code.toLowerCase() === segment) ??
    languages.find((item) => item.isDefault) ?? {
      code: 'en',
      direction: 'ltr' as const,
      isDefault: true,
    };
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-gatevia-locale', language.code);
  requestHeaders.set('x-gatevia-direction', language.direction);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)'],
};
