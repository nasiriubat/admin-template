import { defineModule } from '@nexus/config';

export const billingModule = defineModule({
  id: 'billing',
  title: 'Billing',
  icon: 'CreditCard',
  navigation: [
    { id: 'billing', label: 'Billing', href: '/billing', icon: 'CreditCard', group: 'system', order: 3, permission: 'billing.view' },
  ],
  routes: [
    { path: '/billing', title: 'Billing', permission: 'billing.view' },
  ],
  permissions: [
    { id: 'billing.view', label: 'View billing', description: 'See plan, usage and invoices.' },
    { id: 'billing.manage', label: 'Manage billing', description: 'Change plan and payment method.' },
  ],
  apiServices: ['billing'],
});
