import type { ContentBlock, DocsNavGroup } from '@nexus/ui/marketing';

export interface DocPage {
  slug: string;
  group: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
}

export const docPages: DocPage[] = [
  {
    slug: 'getting-started',
    group: 'Basics',
    title: 'Getting started',
    description: 'Install dependencies, run the apps and make your first configuration change.',
    blocks: [
      { type: 'p', text: 'Nexus is a monorepo with an admin application, a marketing website and shared packages. You need Node.js 20 or newer and pnpm.' },
      { type: 'h2', text: 'Install and run' },
      { type: 'code', language: 'bash', code: 'pnpm install\npnpm dev' },
      { type: 'p', text: 'The admin runs on port 3100 and the marketing site on port 3200 by default.' },
      { type: 'h2', text: 'Configure your product' },
      { type: 'p', text: 'Open `packages/config/src/app-config.ts` to set the product name, theme preset and enabled modules. Every setting has a sensible default, so you can change them one at a time.' },
      { type: 'callout', tone: 'info', title: 'No restart needed for content', text: 'Marketing content lives in `apps/marketing/src/content` and updates instantly in development.' },
      { type: 'h2', text: 'Next steps' },
      { type: 'ul', items: ['Enable or disable modules in the configuration.', 'Choose a theme preset and adjust tokens.', 'Point the API client at your backend.'] },
    ],
  },
  {
    slug: 'theming',
    group: 'Basics',
    title: 'Theming',
    description: 'Change presets, colour tokens, density and corner radius for light and dark mode.',
    blocks: [
      { type: 'p', text: 'All colours are semantic tokens such as `canvas`, `surface`, `primary` and `danger`. Features use the token names through Tailwind classes and never hard code colour values.' },
      { type: 'h2', text: 'Presets' },
      { type: 'p', text: 'Five presets ship by default. Each defines a light and a dark value for every token and is checked against minimum contrast ratios.' },
      { type: 'h2', text: 'Customising a token' },
      { type: 'code', language: 'ts', code: "export const brandPreset = {\n  id: 'brand',\n  light: { primary: '37 99 235' },\n  dark: { primary: '96 165 250' },\n};" },
      { type: 'h2', text: 'Reduced motion' },
      { type: 'p', text: 'Motion respects `prefers-reduced-motion`. Marketing animations fall back to static layouts, and admin transitions shorten to simple fades.' },
    ],
  },
  {
    slug: 'modules',
    group: 'Building',
    title: 'Modules',
    description: 'Add a feature area with navigation, routes, permissions and services.',
    blocks: [
      { type: 'p', text: 'A module is a self-contained feature area. It declares its navigation entry, routes, required permissions and API services in one place.' },
      { type: 'h2', text: 'Anatomy of a module' },
      { type: 'ul', items: ['Navigation metadata: label, icon and position.', 'Routes and the pages they render.', 'Permissions required to see or use it.', 'API services and optional settings.'] },
      { type: 'h2', text: 'Enabling and disabling' },
      { type: 'p', text: 'Set the module flag to `false` in the app configuration. Its navigation entry and routes disappear, and users are never shown a link they cannot use.' },
      { type: 'callout', tone: 'warning', title: 'Permissions are checked twice', text: 'Hiding navigation is not security. Always enforce permissions in your API as well.' },
      { type: 'h2', text: 'States every page needs' },
      { type: 'p', text: 'Each page handles loading, loaded, empty, error and unauthorized states. Shared state components keep the wording and layout consistent.' },
    ],
  },
];

export const docsNav: DocsNavGroup[] = ['Basics', 'Building'].map((group) => ({
  title: group,
  items: docPages.filter((d) => d.group === group).map((d) => ({ title: d.title, href: `/docs/${d.slug}` })),
}));
