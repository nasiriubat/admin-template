# Deployment

## Environment

See `.env.example`. Public variables are compiled into the bundle at build time.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend origin. Empty = built-in demo API |
| `NEXT_PUBLIC_DEMO_MODE` | `true` forces demo mode. **Must be `false` in production** |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DEFAULT_THEME` | Branding defaults |
| `NEXUS_SESSION_COOKIE` | Server-only name of the session cookie checked by the middleware |
| `CSP_CONNECT_SRC` | Extra origins allowed by the Content-Security-Policy |

## Docker

```bash
docker build -t nexus-admin .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com nexus-admin
```

`NEXT_PUBLIC_*` values are inlined at build time, so pass them as build args or build per environment. The image uses Next.js `standalone` output, runs as a non-root user and exposes `GET /api/health` for health checks.

## Security headers

Set by `apps/admin/next.config.mjs` and `apps/admin/src/middleware.ts`:

- `Content-Security-Policy` with a per-request nonce and `strict-dynamic` (no `unsafe-inline` for scripts)
- `Strict-Transport-Security` (production), `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`
- `X-Powered-By` removed

Terminate TLS in front of the container and keep the backend on the same site as the admin (or configure CORS with credentials) so the HttpOnly session cookie works.

## CI

`.github/workflows/ci.yml` runs typecheck, lint, unit tests, build and dependency audit, then Playwright on desktop and mobile viewports.
