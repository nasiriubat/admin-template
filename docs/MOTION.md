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

## Landing primitives

Shared in `packages/ui/src/components/marketing/motion` and exported from `@nexus/ui`. Rules for all of them: colours come from tokens only (`tone` / `fill` props), decorative elements are `aria-hidden`, server HTML is the fully visible static layout (animation "arms" only after mount), and `prefers-reduced-motion` is read live via `usePrefersReducedMotion()`. Looping decoration uses CSS keyframes from the shared Tailwind preset (`animate-float`, `animate-marquee`, `animate-orb-a`, `animate-twinkle`, ...), all disabled with `motion-reduce:animate-none`. Anything that moves for more than 5 seconds next to content has a pause path (WCAG 2.2.2): `Carousel` and `Marquee` ship a visible pause/play button and pause on hover/focus; decorative loops expose `paused`.

| Component | Purpose | Reduced-motion behaviour |
| --- | --- | --- |
| `Reveal`, `RevealGroup` / `Stagger` | Fade/slide/scale/blur in on view; staggered children | Rendered in final state, no transition |
| `Float` | Looping floating wrapper (amplitude, duration, delay, rotate) | Static |
| `Parallax` | Scroll-linked y/scale | Plain static element |
| `ScrollProgress` | Fixed top reading-progress bar | Shown, without spring smoothing |
| `Marquee` | Infinite logo/text ticker, pause button, hover/focus pause | Static wrapped list, no duplicate, no button |
| `Carousel` | Accessible scroll-snap carousel, optional autoplay | Never autoplays; play button still offered; instant scrolling |
| `CountUp` | Number counts up on view; final value always in DOM | Final value shown immediately |
| `RotatingWords`, `Typewriter` | Cycling / typed words; full text in sr-only | First word / full text, static |
| `WaveDivider`, `CurvedSection` | Token-coloured SVG section edges | Static by design |
| `Blob` | Morphing organic SVG | Static shape |
| `Orbs`, `GradientMesh` | Animated blurred token gradient backgrounds | Static gradient |
| `GridBackground`, `DotPattern` | Static pattern backgrounds | Static by design |
| `Squiggle`, `Sparkles` | Hand-drawn underline (draws on view), twinkling stars | Fully drawn / static |
| `FloatingShapes` | Configurable floating circles, rings, triangles, plus, stars | Static |
| `SpotlightCard`, `GlowBorder` | Pointer-follow glow; rotating conic border | Glow hidden; border static |
| `TiltCard`, `MagneticButton` | 3D tilt / magnetic pull (mouse and pen only) | Plain wrappers |
| `PipelineDiagram`, `AnimatedPath` | Nodes and paths that draw on view with travelling dots; text alternative; list layout below `md` | Drawn immediately, no dots |
| `DeviceFrame` (`BrowserFrame`, `PhoneFrame`) | Token-driven browser/phone mockups | No motion |
| `StarRating`, `AvatarStack` | Testimonial helpers with text alternatives | No motion |
| `SectionNav` | Optional dot navigation highlighting the section in view | Colour/size change only, no transition |
