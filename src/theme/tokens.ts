/**
 * Palette « cabinet de lecture » : bleu d’encre + or de filet.
 * L’or n’est jamais un fond de bouton plein écran — trop « luxe générique ».
 */

export const palette = {
  midnight: '#0B1A28',
  navy: '#12263A',
  slate: '#1C3A52',
  fog: '#8AA0B5',
  gold: '#C4A35A',
  goldBright: '#E0C378',
  paper: '#F3EDE0',
  paperDeep: '#E7DCC8',
  ink: '#14202C',
  white: '#FBF7EE',
  danger: '#8C2F2F',
  ruleLight: 'rgba(18, 38, 58, 0.18)',
  ruleDark: 'rgba(224, 195, 120, 0.28)',
};

export type ColorScheme = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  accent: string;
  rule: string;
  tabBar: string;
  danger: string;
  inverseText: string;
  chipBg: string;
  overlay: string;
};

export const lightColors: ColorScheme = {
  bg: palette.paper,
  surface: palette.white,
  surfaceRaised: palette.paperDeep,
  text: palette.midnight,
  textMuted: '#3D5366',
  accent: '#8A6D2A',
  rule: palette.ruleLight,
  tabBar: '#EFE6D4',
  danger: palette.danger,
  inverseText: palette.paper,
  chipBg: 'rgba(18, 38, 58, 0.06)',
  overlay: 'rgba(11, 26, 40, 0.55)',
};

export const darkColors: ColorScheme = {
  bg: palette.midnight,
  surface: palette.navy,
  surfaceRaised: palette.slate,
  text: palette.paper,
  textMuted: palette.fog,
  accent: palette.goldBright,
  rule: palette.ruleDark,
  tabBar: '#0E2030',
  danger: '#E08A8A',
  inverseText: palette.midnight,
  chipBg: 'rgba(243, 237, 224, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.62)',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

export const minTap = 44;

export const fontScaleValues = {
  regular: 1,
  large: 1.15,
  xlarge: 1.3,
} as const;
