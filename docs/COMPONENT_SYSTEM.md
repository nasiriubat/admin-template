# Component System

## Foundation

### Layout

- AppShell
- Sidebar
- TopBar
- Breadcrumbs
- ContentContainer
- PageHeader
- Section
- SplitLayout
- Stack
- Grid
- StickyActionBar

### Navigation

- NavItem
- NavGroup
- Tabs
- SegmentedControl
- Pagination
- Stepper
- CommandPalette
- MobileBottomNav
- MobileNavigationSheet

### Feedback

- Toast
- Alert
- Banner
- InlineMessage
- Progress
- Skeleton
- Spinner
- EmptyState
- ErrorState
- OfflineState

### Controls

- Button
- IconButton
- Toggle
- Checkbox
- Radio
- Select
- Combobox
- MultiSelect
- Slider
- DatePicker
- DateRangePicker
- TimePicker
- FileUpload
- ColorPicker
- SearchInput

### Surfaces

- Card
- MetricCard
- ChartCard
- ActionCard
- StatusCard
- ProfileCard
- MediaCard
- InteractiveCard
- Dialog
- Drawer
- Sheet
- Popover
- Tooltip
- DropdownMenu

### Data

- DataTable
- DataList
- DescriptionList
- Timeline
- ActivityFeed
- Stat
- Badge
- Avatar
- Tag
- CodeViewer
- JsonViewer
- MarkdownViewer

### Visualization

- LineChart
- AreaChart
- BarChart
- StackedBarChart
- DonutChart
- RadialProgress
- Sparkline
- Funnel
- Heatmap
- DistributionChart
- TimelineChart
- StatusMatrix

## Implemented

Status of the shared components in `packages/ui/src/components`. "Planned" means listed above but not built yet. Naming differences from the lists above are noted.

| Component | Status | Notes |
| --- | --- | --- |
| AppShell, Sidebar, TopBar, Breadcrumbs, MobileBottomNav, MobileNavSheet, CommandPalette | Implemented | `shell/` |
| PageHeader, PageContainer, Section, StickyActionBar | Implemented | `patterns/`, `forms/` |
| Tabs, SegmentedControl, Pagination | Implemented | `ui/` |
| Stepper | Implemented | `ui/stepper.tsx`, `aria-current="step"` |
| Toast, Alert, Skeleton, Spinner, EmptyState, ErrorState, UnauthorizedState | Implemented | |
| Banner | Implemented | Dismissible page banner |
| Progress | Implemented | Determinate, `role="progressbar"` |
| Button, IconButton, Checkbox, Switch (Toggle), Select (native), SearchInput, Input, Textarea | Implemented | |
| Combobox, MultiSelect | Implemented | cmdk + Radix Popover, tags, clear button |
| DatePicker, DateRangeInput | Implemented | Native date input wrappers (lite); validates from <= to |
| TagInput, Kbd | Implemented | |
| Radio, Slider, TimePicker, FileUpload, ColorPicker | Planned | |
| Card, MetricCard, ChartCard, Dialog, ConfirmDialog, Sheet (Drawer), Tooltip, DropdownMenu | Implemented | |
| ActionCard, StatusCard, ProfileCard, MediaCard, InteractiveCard, Popover (standalone) | Planned | |
| DataTable, FilterBar | Implemented | `data/` |
| DescriptionList | Implemented | `<dl>` grid |
| ActivityTimeline (alias ActivityFeed) | Implemented | `<ol>` with `<time>`; named `ActivityTimeline` because the marketing `Timeline` already exists |
| Badge, Avatar | Implemented | |
| CodeViewer, JsonViewer | Implemented | Copy button; collapsible keyboard-accessible tree |
| MarkdownViewer, DataList, Stat, Tag (display) | Planned | |
| TimeSeriesChart (line/area/bar), DonutChart, Sparkline | Implemented | `charts/` |
| RadialProgress, Funnel, Heatmap, DistributionChart, TimelineChart, StatusMatrix | Planned | |

Live examples of every implemented component: `/examples/components` (see `docs/EXAMPLES.md`).

## Page patterns

### Dashboard page

Metrics, charts, status cards, and activity.

### CRUD page

Page header plus one primary data surface containing search, filters, table, and pagination.

### Form page

One main form surface. Use sectioning when the form is long.

### Detail page

Summary header, metadata, activity, related resources, actions.

### Settings page

Left category navigation on desktop. Stacked sections or top selector on mobile.

## State requirements

Every major component must support relevant states:

- default
- hover
- focus
- active
- disabled
- loading
- empty
- error
- read only

## Component release quality

Each shared component should include:

- type safe props
- accessibility behavior
- responsive behavior
- dark mode
- documentation
- examples
- automated tests where appropriate

## Floating assistant

A draggable quick-actions button (like iOS AssistiveTouch) for the admin shell. It opens a grid of actions (search, dashboard, theme, module shortcuts, external links, scroll to top, keyboard shortcuts) and snaps to the left or right edge.

- **On/off:** `appConfig.assistant.enabled` (apps/admin/src/lib/app-config.ts) sets the deployment default. Each user can override it from the account menu ("Floating assistant") or Theme & Styling; the choice is stored in `localStorage` (`nexus_assistant`) together with its position.
- **Add actions:** pass `assistant={{ actions: [...] }}` to `AppShell` (see `apps/admin/src/components/admin-shell.tsx`).
- **Accessibility:** it is a real button with a popover menu (Escape closes, focus returns). Dragging is never required: the menu has "Move assistant" corner buttons. It sits above the mobile bottom navigation and respects reduced motion.
- **Hide:** set `assistant: { enabled: false }` in the app config to ship with it off.
