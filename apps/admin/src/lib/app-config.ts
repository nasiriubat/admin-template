import { defineAppConfig, getRuntimeConfig } from '@nexus/config';

const runtime = getRuntimeConfig();

/**
 * Per-project configuration. This is the file to edit when reusing Nexus Admin in a new
 * application: rename it, switch optional modules on or off and pick the default theme.
 * Everything not listed keeps the framework default (see packages/config/src/app-config.ts).
 */
export const appConfig = defineAppConfig({
  name: runtime.appName,
  theme: { preset: runtime.defaultTheme },
  modules: {
    // billing: true,
  },
});
