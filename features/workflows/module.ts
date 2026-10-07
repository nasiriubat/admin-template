import { defineModule } from '@nexus/config';

export const workflowsModule = defineModule({
  id: 'workflows',
  title: 'Agent Workflows',
  icon: 'Workflow',
  navigation: [
    { id: 'workflows', label: 'Agent Workflows', href: '/workflows', icon: 'Workflow', group: 'ai', order: 0, permission: 'workflows.view' },
    { id: 'workflow-runs', label: 'Workflow Runs', href: '/workflows/runs', icon: 'Play', group: 'ai', order: 1, permission: 'workflows.view' },
  ],
  routes: [
    { path: '/workflows', title: 'Agent Workflows', permission: 'workflows.view' },
    { path: '/workflows/runs', title: 'Workflow Runs', permission: 'workflows.view' },
    { path: '/workflows/[id]', title: 'Workflow Builder', permission: 'workflows.view' },
  ],
  permissions: [
    { id: 'workflows.view', label: 'View workflows', description: 'See agent workflows, schedules and runs.' },
    { id: 'workflows.manage', label: 'Manage workflows', description: 'Create, edit, schedule, run and delete workflows.' },
  ],
  apiServices: ['workflows'],
});
