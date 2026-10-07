import { defineModule } from '@nexus/config';

export const filesModule = defineModule({
  id: 'files',
  title: 'Files',
  icon: 'FolderOpen',
  navigation: [
    { id: 'files', label: 'Files', href: '/files', icon: 'FolderOpen', group: 'operations', order: 3, permission: 'files.view' },
  ],
  routes: [
    { path: '/files', title: 'Files', permission: 'files.view' },
  ],
  permissions: [
    { id: 'files.view', label: 'View files', description: 'Browse uploaded files.' },
    { id: 'files.manage', label: 'Manage files', description: 'Upload and delete files.' },
  ],
  apiServices: ['files'],
});
