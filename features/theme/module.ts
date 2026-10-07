import { defineModule } from '@nexus/config';

export const themeModule = defineModule({
  id: 'theme',
  title: 'Theme & Styling',
  icon: 'Palette',
  core: true,
  navigation: [
    { id: 'theme', label: 'Theme & Styling', href: '/theme-editor', icon: 'Palette', group: 'system', order: 1 },
  ],
  routes: [
    { path: '/theme-editor', title: 'Theme & Styling' },
  ],
  permissions: [

  ],
  apiServices: [],
});
