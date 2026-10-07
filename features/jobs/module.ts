import { defineModule } from '@nexus/config';

export const jobsModule = defineModule({
  id: 'jobs',
  title: 'Jobs & Queues',
  icon: 'Cpu',
  navigation: [
    { id: 'jobs', label: 'Jobs & Queues', href: '/jobs', icon: 'Cpu', group: 'operations', order: 2, permission: 'jobs.view' },
  ],
  routes: [
    { path: '/jobs', title: 'Jobs & Queues', permission: 'jobs.view' },
  ],
  permissions: [
    { id: 'jobs.view', label: 'View jobs', description: 'See background jobs and queues.' },
    { id: 'jobs.manage', label: 'Manage jobs', description: 'Retry and cancel jobs.' },
  ],
  apiServices: ['jobs'],
});
