import { modernSaasPreset, type ThemePreset } from './modern-saas';
import { professionalPreset } from './professional';
import { aiFuturisticPreset } from './ai-futuristic';
import { dataDensePreset } from './data-dense';
import { appleInspiredPreset } from './apple-inspired';

export type { ThemePreset };
export {
  modernSaasPreset,
  professionalPreset,
  aiFuturisticPreset,
  dataDensePreset,
  appleInspiredPreset,
};

export const defaultPresets: Record<string, ThemePreset> = {
  'modern-saas': modernSaasPreset,
  professional: professionalPreset,
  'ai-futuristic': aiFuturisticPreset,
  'data-dense': dataDensePreset,
  'apple-inspired': appleInspiredPreset,
};

export const presetList: ThemePreset[] = [
  modernSaasPreset,
  professionalPreset,
  aiFuturisticPreset,
  dataDensePreset,
  appleInspiredPreset,
];
