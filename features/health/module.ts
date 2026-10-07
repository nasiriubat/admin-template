import { defineModule } from '@nexus/config';

export const healthModule = defineModule({
  id: 'health',
  title: 'System Health',
  icon: 'Activity',
  navigation: [
    { id: 'health', label: 'System Health', href: '/health', icon: 'Activity', group: 'operations', order: 0, permission: 'health.view', mobilePrimary: true },
  ],
  routes: [
    { path: '/health', title: 'System Health', permission: 'health.view' },
  ],
  permissions: [
    { id: 'health.view', label: 'View system health', description: 'See service status and incidents.' },
  ],
  apiServices: ['health'],
});
