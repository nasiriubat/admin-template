# Security Guidance

## Secrets

Never expose stored secrets back to the browser after save.

Display masked values and metadata only.

## Roles and permissions

Never rely on frontend permission checks for enforcement.

The backend must enforce authorization.

## Audit

Record sensitive administrative actions.

Recommended fields:

- actor
- action
- resource type
- resource id
- old value where appropriate
- new value where appropriate
- timestamp
- IP
- user agent

## Session management

Support:

- active session list
- revoke session
- logout all sessions
- login history

## Destructive actions

Require explicit confirmation.

For very destructive actions, require typed confirmation.

## Client distribution

Do not ship:

- API keys
- demo credentials with real privileges
- internal endpoints
- private URLs
- customer data

## Implementation notes (Nexus Admin reference app)

- **Content-Security-Policy** uses a per-request nonce (middleware) with `strict-dynamic`; other hardening headers live in `next.config.mjs`.
- **Auth** is behind the `AuthAdapter` interface. The HTTP adapter uses HttpOnly cookie sessions and sends `X-Requested-With` so the backend can enforce CSRF protection. The demo adapter is clearly labelled, only active in demo mode, and shows a "Demo data" badge.
- **Route protection** in the middleware only redirects based on cookie presence; the UI hides what a user cannot use, but the backend must enforce authorization.
- **Open redirects** are blocked: the `next` parameter on `/login` only accepts same-origin paths (`safeRedirectPath`).
- **CSV export** neutralises spreadsheet formula injection (`=`, `+`, `-`, `@` prefixes).
- **Secrets** (API keys, webhook signing secrets) are shown once at creation; lists only show a prefix and the last four characters.
- **Service worker** never caches HTML, API responses or user data (see PWA.md).
- **Theme storage** is validated before use so tampered `localStorage` cannot crash the app.
- **Password reset** responses are identical for known and unknown addresses (no account enumeration).
- **Demo mode fails closed:** in production builds it is active only with an explicit `NEXT_PUBLIC_DEMO_MODE=true`. The Dockerfile defaults it to `false`.
- **CSRF with cookie auth:** every non-GET request from the shared API client and the auth adapter carries `X-Requested-With: XMLHttpRequest`, which forces a CORS preflight. Your backend must reject state-changing requests without it, enforce an `Origin` allowlist and prefer `SameSite=Lax`/`Strict` cookies.
- **Session end clears data:** the admin shell clears the TanStack Query cache whenever the session ends (sign-out, expiry, any 401).
- **Uploads:** the client-side checks (extension allow-list without SVG, size) are UX only. The backend must validate content (magic bytes), re-encode or sanitise images, and serve files from a separate cookieless origin with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.
- **Webhook URLs:** the client-side filter blocks private/loopback/link-local ranges (IPv6 uses an allow-list of global unicast space). The server must re-resolve DNS and pin the resolved IP at delivery time; hostnames such as `127.0.0.1.nip.io` cannot be caught in the browser.
- **Notification links** from the API are only followed when they are same-origin relative paths.
