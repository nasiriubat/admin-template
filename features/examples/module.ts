import { defineModule } from '@nexus/config';

/**
 * Removable demo pages. Disable with `AppConfig.modules.examples = false`, or delete this folder
 * (plus its import in features/index.ts and register-mocks.ts, and apps/admin/src/app/(admin)/examples).
 * See docs/EXAMPLES.md.
 */
export const examplesModule = defineModule({
  id: 'examples',
  title: 'Examples',
  icon: 'Layers',
  navigation: [
    {
      id: 'examples',
      label: 'Examples',
      href: '/examples/components',
      icon: 'Layers',
      group: 'system',
      order: 90,
      badge: { text: 'Example', variant: 'neutral' },
    },
  ],
  routes: [
    { path: '/examples/components', title: 'Component gallery' },
    { path: '/examples/wizard', title: 'Wizard form' },
    { path: '/examples/detail', title: 'Detail page' },
    { path: '/examples/crud', title: 'CRUD scaffold' },
    { path: '/examples/settings-layout', title: 'Settings layout' },
  ],
  permissions: [],
  apiServices: ['examples'],
});
