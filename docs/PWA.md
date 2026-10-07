# PWA Specification

## V1

- web app manifest
- installable icons
- standalone display
- theme color
- application name
- offline fallback
- service worker where appropriate

## Optional later features

- push notifications
- background sync
- offline draft storage

## Installation UX

Do not aggressively prompt installation on first visit.

Offer installation after the user demonstrates meaningful engagement or from an explicit menu action.

## Implementation (apps/admin)

- `public/manifest.webmanifest`: standalone display, scope `/`, separate `any` and `maskable` icons, app shortcuts.
- `public/sw.js` is intentionally conservative because the app is authenticated:
  - precaches only `/offline`, its static assets and the app icons
  - navigations are network-first and fall back to `/offline`
  - `/_next/static` and `/icons` are cache-first (content-hashed)
  - HTML, API calls and cross-origin requests are never cached or intercepted
  - bump `VERSION` in `sw.js` to invalidate caches
- The service worker registers in production builds only.
- The install banner appears only after three visits and can be dismissed permanently. Installation is always available from the account menu when the browser supports it.
