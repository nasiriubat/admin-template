# Motion System

## Admin motion

Admin motion should communicate state and hierarchy.

Use Framer Motion for:

- page entrance
- drawers
- sheets
- tabs
- expanding content
- menu transitions
- toast entrance
- metric reveal
- small chart entrance

## Marketing motion

Use GSAP and ScrollTrigger for:

- scroll storytelling
- layered product breakdown
- SVG path animation
- architecture assembly and disassembly
- pinned scroll scenes
- parallax
- zoom in and zoom out sequences

Use Three.js only when two dimensional techniques cannot achieve the intended result efficiently.

## Motion tokens

Recommended conceptual tokens:

- fast: 150ms
- normal: 250ms
- slow: 500ms
- page: 450ms

Use named easing curves rather than arbitrary values.

## Motion intensity

Theme option:

- Minimal
- Standard
- Expressive

## Accessibility

Respect `prefers-reduced-motion`.

In reduced motion mode:

- remove large translation
- remove parallax
- remove scroll pinning where it harms usability
- keep essential state transitions brief
