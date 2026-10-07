import { defineModule } from '@nexus/config';

export const notificationsModule = defineModule({
  id: 'notifications',
  title: 'Notifications',
  icon: 'Bell',
  core: true,
  navigation: [
    { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'Bell', group: 'system', order: 2, permission: 'notifications.view' },
  ],
  routes: [
    { path: '/notifications', title: 'Notifications', permission: 'notifications.view' },
  ],
  permissions: [
    { id: 'notifications.view', label: 'View notifications', description: 'See your notifications.' },
  ],
  apiServices: ['notifications'],
});
