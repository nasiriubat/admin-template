'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  type ColorMode,
  type ResolvedColorMode,
  type ThemeConfig,
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
  applyThemeToElement,
  sanitizeThemeConfig,
} from './theme-engine';
import { type ThemePreset, defaultPresets } from './presets';
import type { DensityMode } from './tokens/density';
import type { MotionIntensity } from './tokens/motion';
import type { ShapePreset } from './tokens/radius';
import type { FontFamily } from './tokens/typography';

export interface ThemeContextValue {
  config: ThemeConfig;
  preset: ThemePreset;
  mode: ColorMode;
  resolvedMode: ResolvedColorMode;
  density: DensityMode;
  motion: MotionIntensity;
  radius: ShapePreset;
  fontFamily: FontFamily;
  setPreset: (presetId: string) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  setDensity: (density: DensityMode) => void;
  setMotion: (motion: MotionIntensity) => void;
  setRadius: (radius: ShapePreset) => void;
  setFontFamily: (font: FontFamily) => void;
  availablePresets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultConfig = DEFAULT_THEME_CONFIG,
  customPresets = defaultPresets,
}: {
  children: React.ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
  customPresets?: Record<string, ThemePreset>;
}) {
  const initialConfig = useMemo(
    () => ({ ...DEFAULT_THEME_CONFIG, ...defaultConfig }),
    [defaultConfig],
  );

  const [config, setConfig] = useState<ThemeConfig>(initialConfig);
  const [hydrated, setHydrated] = useState(false);
  const [systemDark, setSystemDark] = useState(false);

  // Load persisted preferences once on the client. Until then the inline init script owns the
  // document attributes, so nothing is applied here (avoids a flash back to the defaults).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const clean = sanitizeThemeConfig(JSON.parse(stored), Object.keys(customPresets));
        setConfig((prev) => ({ ...prev, ...clean }));
      }
    } catch {
      // Storage unavailable or corrupt: keep defaults.
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);
    setHydrated(true);

    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedMode: ResolvedColorMode =
    config.mode === 'system' ? (systemDark ? 'dark' : 'light') : config.mode;

  const currentPreset = useMemo(
    () => customPresets[config.preset] || defaultPresets['modern-saas'],
    [config.preset, customPresets],
  );

  // Apply tokens whenever the effective configuration changes, then persist it.
  useEffect(() => {
    if (!hydrated) return;
    applyThemeToElement(document.documentElement, currentPreset, resolvedMode, config);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Storage full or restricted.
    }
  }, [hydrated, currentPreset, resolvedMode, config]);

  const updateConfig = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    setConfig(updater);
  }, []);

  const setPreset = useCallback((presetId: string) => {
    if (customPresets[presetId]) {
      updateConfig((prev) => ({
        ...prev,
        preset: presetId,
        radius: customPresets[presetId].radius,
        density: customPresets[presetId].density,
        motion: customPresets[presetId].motion,
        fontFamily: customPresets[presetId].fontFamily,
      }));
    }
  }, [customPresets, updateConfig]);

  const setMode = useCallback((mode: ColorMode) => {
    updateConfig((prev) => ({ ...prev, mode }));
  }, [updateConfig]);

  const toggleMode = useCallback(() => {
    updateConfig((prev) => {
      const currentEffective = prev.mode === 'system' ? (systemDark ? 'dark' : 'light') : prev.mode;
      const nextMode: ColorMode = currentEffective === 'dark' ? 'light' : 'dark';
      return { ...prev, mode: nextMode };
    });
  }, [systemDark, updateConfig]);

  const setDensity = useCallback((density: DensityMode) => {
    updateConfig((prev) => ({ ...prev, density }));
  }, [updateConfig]);

  const setMotion = useCallback((motion: MotionIntensity) => {
    updateConfig((prev) => ({ ...prev, motion }));
  }, [updateConfig]);

  const setRadius = useCallback((radius: ShapePreset) => {
    updateConfig((prev) => ({ ...prev, radius }));
  }, [updateConfig]);

  const setFontFamily = useCallback((fontFamily: FontFamily) => {
    updateConfig((prev) => ({ ...prev, fontFamily }));
  }, [updateConfig]);

  const value: ThemeContextValue = useMemo(
    () => ({
      config,
      preset: currentPreset,
      mode: config.mode,
      resolvedMode,
      density: config.density,
      motion: config.motion,
      radius: config.radius,
      fontFamily: config.fontFamily,
      setPreset,
      setMode,
      toggleMode,
      setDensity,
      setMotion,
      setRadius,
      setFontFamily,
      availablePresets: Object.values(customPresets),
    }),
    [
      config,
      currentPreset,
      resolvedMode,
      setPreset,
      setMode,
      toggleMode,
      setDensity,
      setMotion,
      setRadius,
      setFontFamily,
      customPresets,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
