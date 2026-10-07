import { defineModule } from '@nexus/config';

export const apiKeysModule = defineModule({
  id: 'apiKeys',
  title: 'API Keys',
  icon: 'KeyRound',
  navigation: [
    { id: 'apiKeys', label: 'API Keys', href: '/api-keys', icon: 'KeyRound', group: 'developers', order: 0, permission: 'apiKeys.view' },
  ],
  routes: [
    { path: '/api-keys', title: 'API Keys', permission: 'apiKeys.view' },
  ],
  permissions: [
    { id: 'apiKeys.view', label: 'View API keys', description: 'See key metadata (never the secret).' },
    { id: 'apiKeys.manage', label: 'Manage API keys', description: 'Create and revoke API keys.' },
  ],
  apiServices: ['api-keys'],
});
