import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Liveness probe for load balancers and the Docker HEALTHCHECK. Exposes no internals. */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
