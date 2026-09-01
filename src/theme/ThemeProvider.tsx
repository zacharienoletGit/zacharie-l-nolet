import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { FontScaleId, ThemeMode } from '../types/models';
import {
  darkColors,
  fontScaleValues,
  lightColors,
  type ColorScheme,
} from './tokens';
import { typeRamp } from './typography';

type ThemeValue = {
  colors: ColorScheme;
  isDark: boolean;
  scale: number;
  type: ReturnType<typeof typeRamp>;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({
  themeMode,
  fontScale,
  children,
}: {
  themeMode: ThemeMode;
  fontScale: FontScaleId;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const value = useMemo<ThemeValue>(() => {
    const isDark =
      themeMode === 'system' ? system === 'dark' : themeMode === 'dark';
    const scale = fontScaleValues[fontScale];
    return {
      colors: isDark ? darkColors : lightColors,
      isDark,
      scale,
      type: typeRamp(scale),
    };
  }, [themeMode, fontScale, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme hors ThemeProvider');
  }
  return ctx;
}
