# Contributing

## Setup

```bash
pnpm install
pnpm dev            # admin on :3000 (demo mode, no backend needed)
pnpm verify         # typecheck + lint + unit tests + build
pnpm test:e2e       # Playwright (desktop + mobile, includes axe accessibility checks)
```

Node 20.9+ and pnpm 12 (see `packageManager`). pnpm blocks dependency build scripts by default; allow-list entries live in `pnpm-workspace.yaml`.

## Rules of the house

Read [CLAUDE.md](CLAUDE.md): it is the contract for UX, surfaces, components, motion, forms, tables, modules and the definition of done. In short:

- Reuse `packages/ui`. Never create project-specific buttons, cards, tables, dialogs, inputs or toasts.
- Colours come from tokens (`bg-surface`, `text-text-muted`, ...). No hex values or palette classes in feature code. `pnpm test` enforces AA contrast per preset.
- Every page handles loading, loaded, empty, error and unauthorized states (`QueryBoundary`, `DataTable`).
- Destructive actions use `ConfirmDialog`; irreversible ones use typed confirmation.
- Forms use `useZodForm` with a Zod schema. Backend stays authoritative.
- A feature is done when it has desktop, tablet and mobile layouts, light and dark themes, keyboard access, docs and tests.

## Adding a module

Follow [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) and copy `features/examples/` (the commented CRUD scaffold) or `features/users`.

## Pull requests

1. Branch from `main`, keep PRs focused.
2. `pnpm verify` and `pnpm test:e2e` must pass (CI runs both).
3. Update docs and `templates/CHANGELOG.md` for behaviour changes.
4. Security-sensitive changes (auth, headers, uploads, secrets): describe the threat you considered.
