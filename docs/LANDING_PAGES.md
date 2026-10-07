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
