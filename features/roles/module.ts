import { defineModule } from '@nexus/config';

export const rolesModule = defineModule({
  id: 'roles',
  title: 'Roles & Permissions',
  icon: 'ShieldCheck',
  navigation: [
    { id: 'roles', label: 'Roles & Permissions', href: '/roles', icon: 'ShieldCheck', group: 'administration', order: 1, permission: 'roles.view' },
  ],
  routes: [
    { path: '/roles', title: 'Roles & Permissions', permission: 'roles.view' },
  ],
  permissions: [
    { id: 'roles.view', label: 'View roles', description: 'See roles and their permissions.' },
    { id: 'roles.manage', label: 'Manage roles', description: 'Create roles and change permissions.' },
  ],
  apiServices: ['roles', 'permissions'],
});
