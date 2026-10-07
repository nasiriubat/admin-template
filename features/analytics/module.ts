import { defineModule } from '@nexus/config';

export const analyticsModule = defineModule({
  id: 'analytics',
  title: 'Analytics',
  icon: 'BarChart3',
  navigation: [
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'BarChart3', group: 'overview', order: 1, permission: 'analytics.view', mobilePrimary: true },
  ],
  routes: [
    { path: '/analytics', title: 'Analytics', permission: 'analytics.view' },
  ],
  permissions: [
    { id: 'analytics.view', label: 'View analytics', description: 'See traffic and engagement reports.' },
  ],
  apiServices: ['analytics'],
});
