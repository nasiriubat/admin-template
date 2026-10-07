import { defineModule } from '@nexus/config';

export const auditModule = defineModule({
  id: 'audit',
  title: 'Audit Log',
  icon: 'FileText',
  navigation: [
    { id: 'audit', label: 'Audit Log', href: '/audit', icon: 'FileText', group: 'administration', order: 2, permission: 'audit.view' },
  ],
  routes: [
    { path: '/audit', title: 'Audit Log', permission: 'audit.view' },
  ],
  permissions: [
    { id: 'audit.view', label: 'View audit log', description: 'See administrative activity.' },
  ],
  apiServices: ['audit'],
});
