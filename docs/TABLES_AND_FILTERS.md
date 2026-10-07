# Tables and Filters

## Data table baseline

The shared DataTable should support:

- client and server data modes
- sorting
- search
- field filters
- date range filters
- pagination
- row selection
- bulk actions
- column visibility
- column ordering
- optional column resizing
- sticky header
- density modes
- expandable rows
- row actions
- empty state
- loading skeleton
- error state
- export
- optional import
- responsive mobile transformation

## Filter system

### Quick filters

Examples:

- role
- status
- date
- owner

### Advanced filters

Support a structured filter builder.

Example:

```
Status is Active
AND
Created date is after 2026-09-01
AND
Role is one of Admin, Editor
```

### Saved views

V2 feature.

Save:

- filter state
- sort state
- visible columns
- density
- pagination size

## Mobile behavior

Filters open in a bottom sheet or full screen panel.

Rows convert to mobile records when practical.

Horizontal scroll should only be used when the data structure truly requires it.
