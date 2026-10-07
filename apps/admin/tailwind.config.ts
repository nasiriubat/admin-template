import type { Config } from 'tailwindcss';
import nexusPreset from '../../packages/theme/tailwind-preset';

const config: Config = {
  presets: [nexusPreset as Config],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../features/**/*.{ts,tsx}',
    // Never scan dependencies (features/node_modules is a symlink farm and makes builds crawl).
    '!../../features/node_modules/**',
  ],
};

export default config;
