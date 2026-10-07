# Agent Workflows

The `workflows` module (`features/workflows`) lets people build AI agent workflows on a drag-and-drop canvas, schedule them, test them and review every run. It follows the standard module layout (`types`, `schemas`, `mock`, `service`, `hooks`, pages) and uses the shared components only.

Permissions: `workflows.view` (see workflows, schedules and runs) and `workflows.manage` (create, edit, schedule, run, delete). Without `workflows.manage` the builder opens read-only.

Routes: `/workflows` (list), `/workflows/[id]` (builder), `/workflows/runs` (runs).

## Concepts

- **Workflow**: a named graph plus a schedule, a status (`draft`, `active`, `paused`) and a version history. Every save creates a version; restoring creates a new one.
- **Graph**: nodes and directed edges. Edges leaving a Condition carry a `sourceHandle` of `true` or `false`.
- **Trigger**: the single start node. Its `triggerType` is `manual`, `schedule`, `webhook` or `event`. The schedule, webhook endpoint and event choice are edited in the **Trigger & schedule** tab.
- **Run**: one execution. Statuses: `queued`, `running`, `succeeded`, `failed`, `cancelled`, `awaiting-approval`. A run holds one step per executed node with status, duration, tokens, input, output and a log line.
- **Test run**: a simulation of the unsaved graph. The demo backend never calls a model, URL or recipient; a real backend decides how test runs behave (see below).

## Node types

| Kind | Purpose | Key config |
| --- | --- | --- |
| `trigger` | Starts the workflow. Exactly one, no inputs. | `triggerType`, `eventName` |
| `llm` | Prompt a model from AI -> Models. | `modelId`, `promptTemplate` (with `{{variables}}`), `temperature` 0-2, `maxTokens` |
| `retrieval` | Fetch passages from a knowledge source. | `source`, `topK` 1-50, `query` |
| `http` | Call an external API. | `method`, `url` (https only), `headers` (values write-only), `body` |
| `transform` | Reshape data with an expression. Stored text only. | `expression`, `outputVariable` |
| `condition` | Branch on a true/false expression. Handles `true` and `false`. | `expression` |
| `loop` | Repeat connected steps per item. The only node allowed in a cycle. | `collection`, `itemVariable`, `maxIterations` |
| `approval` | Pause until a person decides. | `assignee`, `timeoutMinutes`, `onTimeout` |
| `notify` | Email, Slack or webhook. | `channel`, `target`, `message` |
| `output` | Final result. No outgoing edges. | `name`, `format` |

Per-kind validation lives in `schemas.ts` (`configSchemas`) and the inspector forms are generated from `field-specs.ts`.

## Validation rules

`validateGraph` (`graph.ts`) returns errors (block activation and test runs) and warnings (advisory):

- Errors: no trigger or more than one; incoming edge on a trigger; outgoing edge on an output; a cycle that does not pass through a Loop; any node whose config fails its schema (for example a non-https URL or no model selected); dangling edges.
- Warnings: no Output node; nodes unreachable from the trigger; dead ends; a Condition missing its true or false branch.

`canConnect` enforces the same rules while connecting, on the canvas and in the Outline, and explains why a connection was refused.

## Builder usage and keyboard access

- **Add nodes**: drag from the palette, or focus a palette button and press Enter (adds at the canvas centre). On phones the palette is a bottom sheet.
- **Connect**: drag between handles, or use the **Outline** tab: each node has a "Connect ... to" select (plus a True/False branch select for conditions) and a remove button per connection.
- **Select / move / delete**: Tab to a node, Enter selects it, arrow keys move selected nodes (Shift for larger steps), Delete asks for confirmation. Ctrl or Command with click, or Shift-drag, selects several nodes.
- **Undo / redo**: Ctrl+Z, Ctrl+Shift+Z (or Ctrl+Y). Ctrl+S saves.
- **Other**: minimap, zoom controls, snap to grid, auto layout (`autoLayout` in `graph.ts`), fit view, version history, export and import.
- **Colours**: React Flow's stylesheet is imported and its CSS variables are mapped to design tokens in `builder-canvas.tsx`, so both themes work.

## Schedules

`cron.ts` is dependency free. It parses five-field cron (`* , - /`, month and weekday names, 7 as Sunday), validates, describes ("Every weekday at 09:00") and computes `nextRuns(cron, timeZone, count)`.

- Day-of-month and day-of-week follow Vixie cron: when both are restricted, either may match.
- Time zones use `Intl`. A wall time skipped by a spring-forward change is skipped that day; an ambiguous time during a fall-back change fires once, at the first occurrence.
- Presets: every 15 minutes, hourly, daily, weekdays, weekly, monthly, or a custom expression.
- Policies: concurrency (`skip`, `queue`, `allow`), retries 0-10 with `none`, `linear` or `exponential` backoff, pause, and catch up missed runs. Executing the schedule is the backend's job; the UI stores and previews it.
- **Webhook trigger**: shows the endpoint URL and a masked signing secret. Rotating asks for confirmation and shows the new secret exactly once.
- **Event trigger**: choose from `EVENT_CATALOGUE` in `types.ts`. Replace it with your product's event list.

## JSON format

Export and import use `format: "nexus.workflow"`, `version: 1`:

```json
{
  "format": "nexus.workflow",
  "version": 1,
  "name": "Docs Q&A",
  "description": "",
  "graph": {
    "nodes": [{ "id": "trigger", "type": "trigger", "label": "Start", "position": { "x": 0, "y": 0 }, "config": { "triggerType": "manual", "eventName": "" } }],
    "edges": [{ "id": "e1", "source": "trigger", "target": "out", "sourceHandle": null }]
  },
  "schedule": { "cron": "0 9 * * 1-5", "timezone": "UTC", "concurrency": "skip", "retryAttempts": 2, "backoff": "exponential", "paused": false, "catchUp": false }
}
```

`importWorkflow` (`workflow-io.ts`) rejects files over 512 KB, invalid JSON, unknown node types, duplicate node ids, edges that point at missing nodes, more than 200 nodes and invalid schedules. Exports blank HTTP header values; secrets must be re-entered after import. Importing replaces the canvas and can be undone; nothing is saved until Save.

## Wiring a real backend

Replace `mock.ts` by pointing the API client at your server (the mock is only loaded in demo mode). Implement, using the envelope and list conventions in `docs/API_CONTRACT.md`:

| Endpoint | Purpose |
| --- | --- |
| `GET /workflows` | Paged list of summaries (no graph). Supports `search`, `sort`, `filter[status]`, `filter[trigger]`. Include `nextRunAt`, `lastRunStatus`, `lastRunAt`, `nodeCount`. |
| `POST /workflows` | Body `{ name, description, template }`. Returns the new summary. |
| `GET /workflows/:id` | Full workflow: graph, schedule, webhook info, versions. |
| `PUT /workflows/:id` | Body `{ name, description, graph, schedule, note? }`. Creates a version. |
| `DELETE /workflows/:id` | Deletes it and its runs. |
| `POST /workflows/:id/status` | Body `{ status }`. Reject `active` when the graph has validation errors. |
| `POST /workflows/:id/duplicate`, `/run`, `/test`, `/restore` | Duplicate, run now, test run (body `{ graph }`), restore (body `{ version }`). |
| `POST /workflows/:id/webhook/rotate` | Returns `{ secret, secretLast4 }`; the secret is returned once. |
| `GET /workflows/runs`, `GET /workflows/runs/stats` | Paged runs with steps; stats `{ runs24h, successRate, avgDurationMs, tokens24h }`. |
| `POST /workflows/runs/:id/retry`, `/cancel`, `/approve`, `/reject` | Run actions. Return 409 for invalid state changes. |

Register `/workflows/runs` routes before `/workflows/:id` if your router matches in order. The builder also reads `GET /ai/models` (enabled chat models); if it fails it falls back to a short built-in list.

## Security notes

- **Never evaluate user code in the browser.** Transform and Condition expressions are stored text. Evaluate them only on the server, in a sandbox with no network or file access and strict time and memory limits. Do not use `eval`, `new Function` or a template engine that can run code.
- **Secrets are write-only.** HTTP header values and webhook secrets are never returned: responses carry a mask (`SECRET_MASK`) and a last-four hint. A save that echoes the mask must keep the stored value. Exports blank header values.
- **https only.** The UI and schema reject non-https tool and webhook URLs, but that is not a security boundary. The server must re-validate and block SSRF: resolve DNS and reject loopback, link-local, private and metadata addresses (including after redirects), restrict ports, and set timeouts and response size limits.
- **Treat `{{variables}}` as untrusted input** when building prompts or requests; escape per destination.
- **Authorization**: enforce `workflows.view` and `workflows.manage` on every endpoint. Approvals should also check that the caller is the assignee.
- **Webhooks**: verify the signature and a timestamp on inbound calls; rotate secrets on suspected leaks.
- Test runs in production should execute with side effects disabled (or against sandbox credentials) and must never contact real recipients unless you explicitly design for it.

## Testing

Unit tests cover cron parsing and next runs (including DST), graph validation, auto layout, simulation and import/export. Component tests cover the builder (palette add, outline connect, validation, read-only, delete confirmation), the list page, the runs page and the schedule editor.
