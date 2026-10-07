import { defineModule } from '@nexus/config';

export const logsModule = defineModule({
  id: 'logs',
  title: 'Logs',
  icon: 'Terminal',
  navigation: [
    { id: 'logs', label: 'Logs', href: '/logs', icon: 'Terminal', group: 'operations', order: 1, permission: 'logs.view' },
  ],
  routes: [
    { path: '/logs', title: 'Logs', permission: 'logs.view' },
  ],
  permissions: [
    { id: 'logs.view', label: 'View logs', description: 'Search application logs.' },
  ],
  apiServices: ['logs'],
});
