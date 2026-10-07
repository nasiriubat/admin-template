# Responsive and Mobile Specification

## Principle

Mobile is a first class interface, not a smaller desktop.

## Suggested breakpoints

Use framework breakpoints if convenient, but design around behavior rather than device names.

- small phone
- large phone
- tablet
- laptop
- desktop
- large desktop

## Desktop

Use:

- persistent sidebar
- top bar
- breadcrumb row
- content canvas

Sidebar can support:

- expanded
- collapsed
- pinned
- hover expand

## Tablet

- collapse sidebar when width becomes constrained
- retain top bar
- use drawer navigation as needed
- reduce multi column layouts
- stack charts when readability drops

## Mobile

### Small information architecture

Use fixed bottom navigation.

Recommended maximum: five primary items.

Typical items:

- Home
- Analytics
- Create
- AI or primary domain feature
- More

### Large information architecture

Use:

- top bar
- bottom navigation for primary destinations
- full screen or bottom sheet navigation for secondary destinations

Do not replicate a twenty item desktop sidebar inside a narrow slide over menu unless necessary.

## Mobile app patterns

Support:

- bottom sheets
- contextual floating action button
- swipe actions where appropriate
- pull to refresh where appropriate
- sticky bottom navigation
- safe area insets
- large touch targets
- full width form controls
- sticky save action when long forms require it

## Tables on mobile

Never rely on horizontal scroll as the only mobile strategy.

Transform rows into structured records when possible.

Example:

```
Nasir Uddin
nasir@example.com

Admin                         Active
Last login: Today, 20:42

More actions
```

Preserve the most important fields.

Allow an expanded details view for secondary fields.

## Filters on mobile

Use a bottom sheet or full screen filter view.

Show the active filter count in the trigger.

Example:

`Filters 3`

## Dialogs

Desktop: centered dialogs.

Mobile: use bottom sheets or full screen dialogs when content is complex.

## PWA requirements

- valid manifest
- installable icons
- theme color
- background color
- splash compatible assets
- offline application shell
- service worker where appropriate
- graceful offline messaging
- standalone display mode support
- safe area support

## Mobile quality checklist

- no tiny text
- no inaccessible hover only behavior
- no clipped dialogs
- no viewport overflow
- no fixed elements covering form controls
- no desktop table squeezed into narrow widths
- no hidden primary action
- bottom navigation never overlaps page content
