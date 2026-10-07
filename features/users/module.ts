import { defineModule } from '@nexus/config';

export const usersModule = defineModule({
  id: 'users',
  title: 'Users',
  icon: 'Users',
  navigation: [
    { id: 'users', label: 'Users', href: '/users', icon: 'Users', group: 'administration', order: 0, permission: 'users.view', mobilePrimary: true },
  ],
  routes: [
    { path: '/users', title: 'Users', permission: 'users.view' },
    { path: '/users/[id]', title: 'User details', permission: 'users.view' },
  ],
  permissions: [
    { id: 'users.view', label: 'View users', description: 'See the user directory.' },
    { id: 'users.manage', label: 'Manage users', description: 'Invite, edit, suspend and delete users.' },
  ],
  apiServices: ['users'],
});
