import { defineModule } from '@nexus/config';

export const dashboardModule = defineModule({
  id: 'dashboard',
  title: 'Dashboard',
  icon: 'LayoutDashboard',
  core: true,
  navigation: [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'LayoutDashboard', group: 'overview', order: 0, permission: 'dashboard.view', mobilePrimary: true },
  ],
  routes: [
    { path: '/', title: 'Dashboard', permission: 'dashboard.view' },
  ],
  permissions: [
    { id: 'dashboard.view', label: 'View dashboard', description: 'See the overview dashboard.' },
  ],
  apiServices: ['dashboard'],
});
