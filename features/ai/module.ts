import { defineModule } from '@nexus/config';

export const aiModule = defineModule({
  id: 'ai',
  title: 'AI',
  icon: 'Sparkles',
  navigation: [
    { id: 'ai-providers', label: 'Providers', href: '/ai/providers', icon: 'Server', group: 'ai', order: 0, permission: 'ai.view' },
    { id: 'ai-models', label: 'Models', href: '/ai/models', icon: 'Cpu', group: 'ai', order: 1, permission: 'ai.view' },
    { id: 'ai-prompts', label: 'Prompts', href: '/ai/prompts', icon: 'Terminal', group: 'ai', order: 2, permission: 'ai.view' },
    { id: 'ai-usage', label: 'Usage', href: '/ai/usage', icon: 'BarChart3', group: 'ai', order: 3, permission: 'ai.view' },
  ],
  routes: [
    { path: '/ai/providers', title: 'AI Providers', permission: 'ai.view' },
    { path: '/ai/models', title: 'AI Models', permission: 'ai.view' },
    { path: '/ai/prompts', title: 'Prompts', permission: 'ai.view' },
    { path: '/ai/usage', title: 'AI Usage', permission: 'ai.view' },
  ],
  permissions: [
    { id: 'ai.view', label: 'View AI settings', description: 'See providers, models, prompts and usage.' },
    { id: 'ai.manage', label: 'Manage AI settings', description: 'Configure providers, models and prompts.' },
  ],
  apiServices: ['ai/providers', 'ai/models', 'ai/prompts', 'ai/usage'],
});
