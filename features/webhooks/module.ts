import { defineModule } from '@nexus/config';

export const webhooksModule = defineModule({
  id: 'webhooks',
  title: 'Webhooks',
  icon: 'Webhook',
  navigation: [
    { id: 'webhooks', label: 'Webhooks', href: '/webhooks', icon: 'Webhook', group: 'developers', order: 1, permission: 'webhooks.view' },
  ],
  routes: [
    { path: '/webhooks', title: 'Webhooks', permission: 'webhooks.view' },
  ],
  permissions: [
    { id: 'webhooks.view', label: 'View webhooks', description: 'See endpoints and deliveries.' },
    { id: 'webhooks.manage', label: 'Manage webhooks', description: 'Create, test and delete endpoints.' },
  ],
  apiServices: ['webhooks'],
});
