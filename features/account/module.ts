import { defineModule } from '@nexus/config';

export const accountModule = defineModule({
  id: 'account',
  title: 'Account',
  icon: 'User',
  core: true,
  navigation: [

  ],
  routes: [
    { path: '/profile', title: 'Profile' },
  ],
  permissions: [

  ],
  apiServices: ['auth'],
});
