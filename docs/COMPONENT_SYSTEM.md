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
