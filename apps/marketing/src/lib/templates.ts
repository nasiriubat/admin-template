/** The landing page templates shipped with the marketing app. Add an entry to make a new one switchable. */
export interface TemplateInfo {
  id: string;
  name: string;
  path: string;
  tagline: string;
  /** Best for... shown in the gallery. */
  bestFor: string;
  /** Preview swatches rendered by TemplatePreview (token names, not colours). */
  tones: [string, string, string];
}

export const templates: TemplateInfo[] = [
  { id: 'aurora', name: 'Aurora', path: '/', tagline: 'Soft gradients, floating UI cards, wave dividers', bestFor: 'SaaS products and startups', tones: ['primary', 'accent', 'surface'] },
  { id: 'neon', name: 'Neon', path: '/ai', tagline: 'Dark grid, glowing orbs, live pipeline diagram', bestFor: 'AI and developer tools', tones: ['primary', 'info', 'secondary'] },
  { id: 'editorial', name: 'Editorial', path: '/enterprise', tagline: 'Calm, curved sections, case-study carousel', bestFor: 'Enterprise and research platforms', tones: ['info', 'success', 'canvas'] },
  { id: 'playful', name: 'Playful', path: '/playful', tagline: 'Blobs, stickers, bouncy motion, tilt cards', bestFor: 'Consumer apps and communities', tones: ['warning', 'danger', 'accent'] },
  { id: 'product', name: 'Product', path: '/product', tagline: 'Device mockups with scroll-driven screens', bestFor: 'Product-led launches', tones: ['secondary', 'primary', 'surface'] },
];

export const templateByPath = (pathname: string) => templates.find((t) => t.path === pathname);
