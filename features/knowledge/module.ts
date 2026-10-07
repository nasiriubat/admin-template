import { defineModule } from '@nexus/config';

export const knowledgeModule = defineModule({
  id: 'knowledge',
  title: 'Knowledge Base',
  icon: 'BookOpen',
  navigation: [
    { id: 'knowledge-documents', label: 'Documents', href: '/knowledge/documents', icon: 'FileText', group: 'ai', order: 4, permission: 'knowledge.view' },
    { id: 'knowledge-sources', label: 'Sources', href: '/knowledge/sources', icon: 'Database', group: 'ai', order: 5, permission: 'knowledge.view' },
  ],
  routes: [
    { path: '/knowledge/documents', title: 'Knowledge Documents', permission: 'knowledge.view' },
    { path: '/knowledge/sources', title: 'Knowledge Sources', permission: 'knowledge.view' },
  ],
  permissions: [
    { id: 'knowledge.view', label: 'View knowledge base', description: 'See documents and sources.' },
    { id: 'knowledge.manage', label: 'Manage knowledge base', description: 'Add sources, upload and re-index documents.' },
  ],
  apiServices: ['knowledge'],
});
