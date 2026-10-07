# Landing Page System

## Principle

Marketing pages share brand tokens with the admin but may use more expressive layout and motion.

## Reusable sections

- Hero
- Logo cloud
- Product demo
- Feature grid
- Bento grid
- Stats
- Integrations
- Architecture
- Workflow
- Comparison
- Testimonials
- Pricing
- FAQ
- CTA
- Footer

## Advanced sections

### Scroll Story

Text progresses while a visual scene changes.

### Product Exploded View

A product or system visually separates into layers and later reconnects.

Use for:

- AI pipelines
- system architecture
- application layers
- integrations
- product modules

### Sticky Feature Showcase

Feature copy changes while the product screenshot or visual remains pinned.

### Zoom Story

Zoom from product overview into a specific module, then back out.

## Template set

V1 should ship three complete landing pages:

1. SaaS
2. AI Product
3. Enterprise or Research Platform

## Performance rule

Do not trade usability for animation.

- lazy load heavy media
- avoid excessive JavaScript
- use SVG where possible
- optimize videos and images
- disable expensive effects on constrained devices when appropriate

## Implementation (apps/marketing)

Pages (all static, with canonical + Open Graph metadata and sitemap entries):

| Route | Purpose |
| --- | --- |
| `/` , `/ai`, `/enterprise` | The three landing templates (SaaS, AI product, Enterprise/research) |
| `/pricing` | Monthly/yearly toggle, plan cards, feature comparison matrix (accordions on mobile), FAQ |
| `/features` | Feature rows, integrations grid, trust band |
| `/about`, `/customers` | Story, timeline, team grid, case studies |
| `/contact` | Validated form with honeypot and client rate limit; POSTs to `NEXT_PUBLIC_CONTACT_ENDPOINT` or opens `mailto:` |
| `/changelog`, `/blog`, `/blog/[slug]`, `/docs`, `/docs/[slug]` | Content pages driven by `src/content/*` (blog posts include Article JSON-LD) |
| `/privacy`, `/terms` | Legal **templates**: have counsel review before publishing |

Copy lives in `apps/marketing/src/content/`, navigation in `src/lib/nav.ts`, and every section in `@nexus/ui` (`packages/ui/src/components/marketing`).
Branding assets are generated from `branding/logo.svg` with `pnpm icons`. Set `NEXT_PUBLIC_SCROLL_ANIMATION=off` to disable GSAP
(see `docs/COMMERCIALIZATION.md` for its license).

## Template varieties and motion

Five complete landing templates share one design system and can be switched live with the floating **Templates** button (or browsed at `/templates`; hide the button in production with `NEXT_PUBLIC_TEMPLATE_SWITCHER=off`).

| Template | Route | Personality | Signature elements |
| --- | --- | --- | --- |
| Aurora | `/` | Soft SaaS | Gradient mesh, floating UI cards, wave dividers, bento with spotlight/tilt, testimonial carousel |
| Neon | `/ai` | Dark AI/dev tools | Grid + orbs, live agent chat demo, animated pipeline diagram, code card, glow borders |
| Editorial | `/enterprise` | Calm enterprise | Curved sections, parallax lineage illustration, case-study carousel, section nav |
| Playful | `/playful` | Warm consumer | Morphing blobs, stickers, floating shapes, tilt cards, phone mock, pause-animations toggle |
| Product | `/product` | Keynote-style launch | Scroll-driven device mockup, zoom story, phone carousel, sticky showcase |

All motion comes from the primitives in `packages/ui/src/components/marketing/motion` (see `docs/MOTION.md`): reveal, float, parallax, marquee, carousel, count-up, rotating words, waves/curves, blobs, floating shapes, tilt/spotlight cards, pipeline diagrams and device frames. Rules: content never depends on animation to appear, `prefers-reduced-motion` renders everything static, moving content has a pause control, decorative SVG is `aria-hidden`.

Marketing pages import from `@nexus/ui/marketing` (a lean entry without admin-only code) to keep pages small. To add a template: create `apps/marketing/src/templates/<name>/`, a route, and one entry in `src/lib/templates.ts`.
