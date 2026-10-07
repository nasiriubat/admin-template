import { defineModule } from '@nexus/config';

export const settingsModule = defineModule({
  id: 'settings',
  title: 'Settings',
  icon: 'Settings',
  navigation: [
    { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings', group: 'system', order: 0, permission: 'settings.view' },
  ],
  routes: [
    { path: '/settings', title: 'Settings', permission: 'settings.view' },
  ],
  permissions: [
    { id: 'settings.view', label: 'View settings', description: 'See workspace settings.' },
    { id: 'settings.manage', label: 'Manage settings', description: 'Change workspace settings.' },
  ],
  apiServices: ['settings'],
});
