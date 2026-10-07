# Commercialization Plan

Nexus Admin should be prepared for three distribution models.

## 1. Internal reusable kit

Use privately across your own applications.

Benefits:

- fastest iteration
- no public support burden
- no licensing complexity

## 2. Open source framework

Possible strategy:

- core admin shell as open source
- premium templates or modules sold separately
- paid support
- paid implementation services

This can create visibility and community adoption.

## 3. Commercial product

Possible channels:

- CodeCanyon
- direct ZIP delivery
- Gumroad or Lemon Squeezy style storefront
- agency licensing
- custom client delivery

## Recommended commercial package contents

- production source code
- installation guide
- configuration guide
- API integration guide
- theme guide
- component guide
- changelog
- demo data
- screenshots
- release notes
- dependency license inventory
- support policy

## CodeCanyon readiness

Before submission:

- remove all internal company references
- remove secrets
- provide a clean install path
- include demo credentials only for demo environment
- provide documentation
- verify all third party licenses
- include clear feature list
- include responsive screenshots
- include mobile screenshots
- include dark mode screenshots
- include video walkthrough if possible
- provide changelog
- test fresh installation from a clean machine

## Direct client ZIP readiness

Provide:

- source code
- `.env.example`
- deployment guide
- customization guide
- license terms
- version number
- changelog
- support contact process

## Positioning

Do not market it only as "an admin template".

Better positioning:

"A reusable application control interface for SaaS, AI, internal tools, and client products, with responsive mobile behavior, white labeling, advanced tables, charts, forms, motion, and landing pages."

## Third-party license review (production dependencies)

Run `pnpm licenses list --prod` before each release. Current state:

- Almost everything is MIT, ISC, BSD or Apache-2.0 (permissive, redistribution allowed with notices).
- **GSAP** (`gsap`, used only by the marketing scroll scenes) ships under the GSAP "Standard no charge" license. It permits commercial use, but it is not an OSI license and it forbids using GSAP inside a product that competes with Webflow-style visual animation builders. Review https://gsap.com/standard-license before redistributing the marketing templates, or remove `StickyShowcase` / `ExplodedView` scroll animation (they degrade to static layouts without it).
- **caniuse-lite** (CC-BY-4.0) is a build-time browser-data dependency of the toolchain and is not shipped in the runtime bundle.
- No proprietary fonts are bundled. The font stack falls back to system fonts; Geist, Inter, Manrope and IBM Plex Sans are referenced by name only and must be self-hosted by the project with their own (OFL) licenses if desired.
- Icons are `lucide-react` (ISC). The app icons in `apps/*/public/icons` are generated placeholders: replace them with your own artwork.
