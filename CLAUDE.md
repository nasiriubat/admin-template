# CLAUDE.md

You are building **Nexus Admin**, a reusable product grade admin dashboard and marketing UI framework.

## Objective

Build a polished admin framework that can be reused across independent applications. The system must look intentional and consistent. Do not invent a different design language from page to page.

## Required stack

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Lucide
- GSAP and ScrollTrigger only for advanced marketing page animation

Do not replace core libraries without a strong technical reason.

## Non negotiable UX rules

1. Desktop uses a persistent sidebar.
2. Top bar contains global search, notifications, theme controls, profile, and account actions.
3. Breadcrumb appears below the top bar.
4. Mobile should feel like a real mobile app, not a compressed desktop dashboard.
5. Use bottom navigation on mobile when the app has five or fewer primary destinations.
6. Use a drawer or full screen menu when the mobile information architecture is larger.
7. Never squeeze wide desktop tables into small mobile widths. Transform rows into mobile records or cards.
8. Page canvas and content surfaces must be visually distinct.
9. Avoid random floating form controls on gray backgrounds.
10. Avoid excessive nested cards.
11. Every page must support loading, loaded, empty, error, and unauthorized states.
12. Every destructive action must have an explicit confirmation pattern.
13. All interfaces must work in light mode and dark mode.
14. Support `prefers-reduced-motion`.
15. Follow WCAG compatible focus, contrast, keyboard, touch target, and semantic rules.

## Surface rules

Use tokens for:

- canvas
- surface
- elevated surface
- border
- text
- muted text
- primary
- secondary
- accent
- success
- warning
- danger
- info

Do not hard code random colors inside feature modules.

## Component reuse rule

Before creating a new component, check whether a shared component already exists.

Shared components live in `packages/ui` or the equivalent shared component package.

Do not create project specific copies of buttons, cards, data tables, dialog boxes, filters, toasts, form inputs, chart wrappers, or empty states.

## Animation rule

Admin motion should be fast, subtle, and informative.

Marketing page motion can be expressive and cinematic.

Do not animate every table row or every text label. Motion should explain state, hierarchy, or progression.

## Data table rule

All reusable data tables should support the feature matrix in `docs/TABLES_AND_FILTERS.md`.

## Form rule

All forms should use shared form primitives and schema validation. See `docs/FORMS.md`.

## Module rule

All feature areas should be implemented as modules with:

- navigation metadata
- routes
- permissions
- API services
- feature flags where needed
- optional settings

See `docs/MODULE_SYSTEM.md`.

## Commercial quality rule

The product may be distributed commercially. Therefore:

- no broken demo pages
- no placeholder lorem ipsum in release builds
- no unlicensed assets
- no hard coded secrets
- no proprietary fonts bundled without redistribution rights
- no dependency whose license conflicts with the intended distribution
- all settings must have sane defaults
- all example pages must be removable or clearly marked
- update documentation whenever a behavior changes

## Completion definition

A feature is not complete until it has:

- desktop layout
- tablet layout
- mobile layout
- light theme
- dark theme
- loading state
- empty state
- error state
- keyboard access
- responsive behavior
- documentation
- test coverage appropriate to the feature
