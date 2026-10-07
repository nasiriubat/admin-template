# Design System

## Design direction

Nexus Admin should feel premium, technical, modern, calm, and deliberate.

Avoid the two common extremes:

- sterile enterprise software with no visual personality
- overdesigned AI interfaces with gradients, glass, glow, and motion everywhere

The default should sit between modern SaaS and professional product software.

## Visual hierarchy

Use three primary levels:

1. Canvas
2. Surface
3. Elevated surface

The canvas may use a subtle gray or tinted background.

Main data, forms, tables, and charts should usually sit on a clear surface.

Menus, floating dialogs, tooltips, and popovers use elevated surfaces.

## Design tokens

### Color tokens

- `color.canvas`
- `color.surface`
- `color.surfaceElevated`
- `color.border`
- `color.text`
- `color.textMuted`
- `color.primary`
- `color.secondary`
- `color.accent`
- `color.success`
- `color.warning`
- `color.danger`
- `color.info`

Each theme must define light and dark values.

### Spacing scale

Use a fixed scale:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64

Avoid one off spacing values unless necessary.

### Radius scale

- `radius.sm`
- `radius.md`
- `radius.lg`
- `radius.xl`

Default product style should be moderately rounded, not pill shaped everywhere.

### Elevation

- border only
- subtle shadow
- medium shadow
- strong floating shadow

Use strong shadows only for floating UI.

## Typography

Recommended supported fonts:

- Geist
- Inter
- Manrope
- IBM Plex Sans

Do not bundle commercial fonts without redistribution rights.

Typography roles:

- display
- h1
- h2
- h3
- section label
- body
- small
- caption
- code

## Density modes

### Comfortable

Default for most users.

### Compact

Optimized for dense operational interfaces.

### Spacious

Suitable for visually focused or executive dashboards.

## Design personality presets

### Professional

- low saturation
- restrained motion
- neutral surfaces
- strong clarity

### Modern SaaS

- soft surface contrast
- subtle gradient accents
- moderate motion
- balanced density

### AI Futuristic

- dark friendly
- expressive accent color
- controlled glow
- animated visualizations
- subtle grid and gradient effects

### Apple Inspired

Primarily for marketing pages.

- whitespace
- typography driven hierarchy
- large visuals
- scroll based reveals
- controlled depth

### Data Dense

- compact spacing
- smaller controls
- higher information density
- reduced decoration

## Design consistency rule

Project themes may change colors, typefaces, radius, motion intensity, and density.

They must not change fundamental interaction rules, accessibility expectations, or component anatomy.
