# Examples module

`features/examples` ships removable demo pages that show how the shared components and page patterns fit together. They are **not** product features. Every example page shows a dismissible banner: "Example page - remove features/examples before shipping".

| Route | Shows | Source |
| --- | --- | --- |
| `/examples/components` | Every shared component and its states (buttons, inputs incl. error/disabled/read-only, combobox, tag input, dialogs, sheet, toasts, tabs, stepper, timeline, description list, code/JSON viewers, alerts, badges, skeletons, empty/error/unauthorized states, metric cards, charts) | `components-gallery-page.tsx`, `gallery-*.tsx` |
| `/examples/wizard` | Multi-step form: `Stepper`, one `useZodForm` per step, review step, unsaved-changes warning, success state | `wizard-page.tsx`, `wizard-schemas.ts` |
| `/examples/detail` | Detail page: summary header, `DescriptionList`, `Tabs`, activity timeline, related `DataTable` | `detail-page.tsx` |
| `/examples/crud` | Copy-me CRUD scaffold for a "Projects" resource: `DataTable`, create/edit dialog, `ConfirmDialog`, service and hooks | `projects.ts`, `projects-crud-page.tsx` |
| `/examples/settings-layout` | Settings pattern: section nav (Select on mobile), `FormSection`, `StickyActionBar`, danger zone | `settings-layout-page.tsx` |

Mock data lives in `features/examples/mock.ts` and is registered through `features/_shared/register-mocks.ts`. It only runs in demo mode.

## Using the CRUD scaffold

1. Copy `projects.ts` and `projects-crud-page.tsx` into `features/<your-resource>/` and rename `Project`.
2. Replace the type and the Zod schema, then point the service at your endpoints (see `docs/API_CONTRACT.md`).
3. Add a `module.ts` (navigation, routes, permissions) and register it in `features/index.ts`.
4. Add a route under `apps/admin/src/app/(admin)/<resource>/page.tsx`.
5. Gate write actions with `useCan('<module>.manage')`.

Real features should split `projects.ts` into `types.ts`, `schemas.ts`, `service.ts` and `hooks.ts`, as `features/users` does.

## Removing the examples before shipping

Pick one:

- **Disable**: set `modules.examples` to `false` in `packages/config/src/app-config.ts` (or your override). The navigation entry and routes disappear.
- **Delete** (recommended for release builds):
  1. Delete `features/examples/`.
  2. Remove `examplesModule` and its import from `features/index.ts`.
  3. Remove `import '../examples/mock';` from `features/_shared/register-mocks.ts`.
  4. Delete `apps/admin/src/app/(admin)/examples/`.
  5. Remove the `examples` key from `AppConfig.modules` and `defaultAppConfig`.

The shared components the examples use (`Stepper`, `ActivityTimeline`, `DescriptionList`, `CodeViewer`, `JsonViewer`, `Combobox`, `MultiSelect`, `DatePicker`, `DateRangeInput`, `Progress`, `Kbd`, `Banner`, `TagInput`) live in `packages/ui` and stay.
