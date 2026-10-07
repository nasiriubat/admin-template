export const appConfig = {
  name: 'Nexus Demo',
  deploymentMode: 'standalone',

  navigation: {
    desktop: 'sidebar',
    mobile: 'bottom-nav',
  },

  modules: {
    users: true,
    roles: true,
    audit: true,
    files: true,
    logs: true,
    jobs: true,
    health: true,
    featureFlags: true,
    apiKeys: true,
    webhooks: true,
    ai: true,
    knowledge: true,
    billing: false,
  },

  theme: {
    preset: 'modern-saas',
    density: 'comfortable',
    motion: 'standard',
    mode: 'system',
  },
};
