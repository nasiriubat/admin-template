# Release Checklist

## Product

- version updated
- changelog updated
- all demo pages work
- no placeholder content
- no internal secrets
- no internal hostnames

## UX

- desktop checked
- tablet checked
- mobile checked
- light mode checked
- dark mode checked
- loading states checked
- empty states checked
- error states checked

## Commercial

- dependency licenses reviewed
- redistribution rights reviewed
- screenshots updated
- documentation updated
- installation tested from clean environment
- customer package contains only intended files

## Security

- secrets absent
- default credentials removed or documented safely
- dangerous dev tools disabled in production

## Packaging

- source ZIP created
- documentation included
- version number visible
- changelog included

## Automated gates (all must pass)

- `pnpm verify` (typecheck, lint, unit tests, build)
- `pnpm test:e2e` (every admin and marketing route in light and dark, desktop and mobile, with axe WCAG 2.2 AA checks)
- `pnpm licenses list --prod` reviewed (see COMMERCIALIZATION.md)

## Before packaging

- `NEXT_PUBLIC_DEMO_MODE` is `false` in every deployed environment
- Remove or disable `features/examples` (set `modules.examples: false`)
- Replace `branding/logo.svg` and run `pnpm icons`; update legal templates (`/privacy`, `/terms`) with counsel
- `pnpm screenshots` for marketplace images, then `pnpm package:release`
