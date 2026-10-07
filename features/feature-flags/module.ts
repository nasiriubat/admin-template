import { defineModule } from '@nexus/config';

export const featureFlagsModule = defineModule({
  id: 'featureFlags',
  title: 'Feature Flags',
  icon: 'Flag',
  navigation: [
    { id: 'featureFlags', label: 'Feature Flags', href: '/feature-flags', icon: 'Flag', group: 'operations', order: 4, permission: 'featureFlags.view' },
  ],
  routes: [
    { path: '/feature-flags', title: 'Feature Flags', permission: 'featureFlags.view' },
  ],
  permissions: [
    { id: 'featureFlags.view', label: 'View feature flags', description: 'See flags and rollouts.' },
    { id: 'featureFlags.manage', label: 'Manage feature flags', description: 'Create, toggle and delete flags.' },
  ],
  apiServices: ['feature-flags'],
});
