import type { Config } from 'tailwindcss';
import nexusPreset from '../../packages/theme/tailwind-preset';

const config: Config = {
  presets: [nexusPreset as Config],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
