export interface AppConfig {
  name: string;
  version: string;
  deploymentMode: 'standalone' | 'internal' | 'client';
  navigation: {
    desktop: 'sidebar' | 'dual-sidebar';
    mobile: 'bottom-nav' | 'drawer';
  };
  /** Optional modules. Core modules (dashboard, auth, settings, theme, notifications) are always on. */
  modules: {
    users: boolean;
    roles: boolean;
    audit: boolean;
    files: boolean;
    logs: boolean;
    jobs: boolean;
    health: boolean;
    featureFlags: boolean;
    apiKeys: boolean;
    webhooks: boolean;
    analytics: boolean;
    ai: boolean;
    knowledge: boolean;
    workflows: boolean;
    billing: boolean;
    settings: boolean;
    examples: boolean;
  };
  /** Floating quick-actions assistant (draggable button). Users can still turn it off themselves. */
  assistant: {
    enabled: boolean;
  };
  theme: {
    preset: string;
    density: 'compact' | 'comfortable' | 'spacious';
    motion: 'minimal' | 'standard' | 'expressive';
    mode: 'light' | 'dark' | 'system';
  };
  pwa: {
    enabled: boolean;
    scope: string;
    display: 'standalone' | 'minimal-ui' | 'fullscreen';
  };
}

export const defaultAppConfig: AppConfig = {
  name: 'Nexus Admin',
  version: '1.0.0',
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
    analytics: true,
    ai: true,
    knowledge: true,
    workflows: true,
    // Optional: turn off for products that do not bill customers.
    billing: true,
    settings: true,
    // Removable demo pages: set false or delete features/examples before shipping
    examples: true,
  },
  assistant: {
    enabled: true,
  },
  theme: {
    preset: 'modern-saas',
    density: 'comfortable',
    motion: 'standard',
    mode: 'system',
  },
  pwa: {
    enabled: true,
    scope: '/',
    display: 'standalone',
  },
};

/** Shallow-deep merge so projects only specify what they change. */
export function defineAppConfig(overrides: DeepPartial<AppConfig> = {}): AppConfig {
  return {
    ...defaultAppConfig,
    ...overrides,
    navigation: { ...defaultAppConfig.navigation, ...overrides.navigation },
    modules: { ...defaultAppConfig.modules, ...overrides.modules },
    assistant: { ...defaultAppConfig.assistant, ...overrides.assistant },
    theme: { ...defaultAppConfig.theme, ...overrides.theme },
    pwa: { ...defaultAppConfig.pwa, ...overrides.pwa },
  } as AppConfig;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
