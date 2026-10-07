import { NextResponse, type NextRequest } from 'next/server';

/** Cookie that signals "has a session". Must match SESSION_COOKIE in @nexus/auth / your backend. */
const SESSION_COOKIE = process.env.NEXUS_SESSION_COOKIE || 'nexus_session';
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/offline'];
const isDev = process.env.NODE_ENV !== 'production';

function buildCsp(nonce: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const connect = ["'self'", apiBase, ...(process.env.CSP_CONNECT_SRC?.split(/\s+/) ?? []), isDev ? 'ws:' : '']
    .filter(Boolean)
    .join(' ');
  return [
    "default-src 'self'",
    // 'strict-dynamic' lets nonce-approved scripts load their chunks; no 'unsafe-inline' for scripts.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Style attributes (Radix positioning, charts) cannot carry nonces, so styles allow inline.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Fast, server-side redirect for signed-out visitors. This is a UX optimisation only:
  // the backend must still authorise every API request.
  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  // Deliberately no "signed in -> leave /login" redirect: a stale cookie with no valid server
  // session would otherwise bounce between / and /login forever.

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Skip API routes, framework assets and static files.
    { source: '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|robots.txt).*)' },
  ],
};
