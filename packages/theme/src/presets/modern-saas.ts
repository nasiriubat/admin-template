import { type ColorScale } from '../tokens/colors';
import { type FontFamily } from '../tokens/typography';
import { type ShapePreset } from '../tokens/radius';
import { type DensityMode } from '../tokens/density';
import { type MotionIntensity } from '../tokens/motion';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  fontFamily: FontFamily;
  radius: ShapePreset;
  density: DensityMode;
  motion: MotionIntensity;
  colors: {
    light: ColorScale;
    dark: ColorScale;
  };
}

export const modernSaasPreset: ThemePreset = {
  id: 'modern-saas',
  name: 'Modern SaaS',
  description: 'Soft surface contrast, indigo & teal accents, balanced density, and smooth micro-animations.',
  fontFamily: 'Geist',
  radius: 'medium',
  density: 'comfortable',
  motion: 'standard',
  colors: {
    light: {
      canvas: '#f8fafc',
      surface: '#ffffff',
      surfaceElevated: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      textMuted: '#566478',
      primary: '#564fde',
      primaryForeground: '#ffffff',
      secondary: '#0f172a',
      secondaryForeground: '#ffffff',
      accent: '#096b97',
      accentForeground: '#ffffff',
      success: '#0a7351',
      successForeground: '#ffffff',
      warning: '#8c5b06',
      warningForeground: '#ffffff',
      danger: '#b53434',
      dangerForeground: '#ffffff',
      info: '#2c61b8',
      infoForeground: '#ffffff',
    },
    dark: {
      canvas: '#0b0f19',
      surface: '#111827',
      surfaceElevated: '#1f2937',
      border: '#1e293b',
      text: '#f8fafc',
      textMuted: '#9eabbe',
      primary: '#9d99ff',
      primaryForeground: '#0b0f19',
      secondary: '#334155',
      secondaryForeground: '#ffffff',
      accent: '#38bdf8',
      accentForeground: '#0b0f19',
      success: '#34d399',
      successForeground: '#0b0f19',
      warning: '#fbbf24',
      warningForeground: '#0b0f19',
      danger: '#f97c7c',
      dangerForeground: '#0b0f19',
      info: '#63a7fa',
      infoForeground: '#0b0f19',
    },
  },
};
