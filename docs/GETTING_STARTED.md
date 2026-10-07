# Getting Started

## 1. Configure the product

`apps/admin/src/lib/app-config.ts` is the single per-project file. Rename the product, pick the default theme preset and switch optional modules on or off:

```ts
export const appConfig = defineAppConfig({
  name: 'Acme Console',
  theme: { preset: 'professional', mode: 'system' },
  modules: { billing: true, webhooks: false },
});
```

Disabled modules disappear from navigation, the command palette and the mobile menu, and their routes show a "module is turned off" state.

## 2. Connect a backend

Set `NEXT_PUBLIC_API_BASE_URL`. Every feature calls the shared `api` client (`features/_shared/api.ts`), which expects the envelope and endpoint families in [API_CONTRACT.md](API_CONTRACT.md). Authentication uses `createHttpAuthAdapter` (HttpOnly cookie session: `GET /auth/session`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/forgot-password`). To use bearer tokens or another provider, implement the `AuthAdapter` interface in `packages/auth` and export it from `apps/admin/src/lib/auth-adapter.ts`.

Server-side the cookie name is read from `NEXUS_SESSION_COOKIE` (default `nexus_session`); the edge middleware redirects visitors without that cookie to `/login`. This is a convenience only. Your API must authorise every request.

## 3. Add a module

Create `features/<name>/` with:

| File | Purpose |
| --- | --- |
| `module.ts` | `defineModule({ id, navigation, routes, permissions, ... })` |
| `types.ts`, `schemas.ts` | Domain types and Zod validation |
| `service.ts`, `hooks.ts` | API calls and TanStack Query hooks |
| `mock.ts` | Demo-mode routes (registered in `_shared/register-mocks.ts`) |
| `<name>-page.tsx` | The page, built from `@nexus/ui` primitives |

Then add it to `features/index.ts`, create `apps/admin/src/app/(admin)/<route>/page.tsx` that renders the page, and add the module id to `AppConfig.modules` if it is optional. Use `features/users` as the reference: it demonstrates server-side tables, filters, bulk actions, validated forms and destructive confirmation.

Every page must handle five states: loading, loaded, empty, error and unauthorized. `QueryBoundary` and `DataTable` implement them for you.

## 4. Theme it

Use the Theme & Styling page for presets, mode, density, motion and corner shape, or add a preset in `packages/theme/src/presets`. All colours are tokens (`bg-surface`, `text-text-muted`, `bg-primary`, ...). Feature code must never contain raw colour values. `pnpm test` enforces WCAG AA contrast for every preset in light and dark.

## 5. Marketing site

`apps/marketing` ships three complete templates (SaaS at `/`, AI product at `/ai`, Enterprise at `/enterprise`). Copy lives in `src/content/*`; layout sections come from `@nexus/ui` (`Hero`, `FeatureGrid`, `BentoGrid`, `Pricing`, `Faq`, `StickyShowcase`, `ExplodedView`, ...). GSAP is loaded only for the two scroll scenes and only on wide screens without a reduced-motion preference.
