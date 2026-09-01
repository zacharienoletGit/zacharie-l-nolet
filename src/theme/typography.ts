import { Platform, TextStyle } from 'react-native';

/**
 * iOS : New York pour le titre (journal), Georgia en repli, SF pour le chrome.
 * On évite Inter / System-only partout — c’est le look « template IA ».
 */
/** Georgia est sur iOS depuis toujours — journal, pas « San Francisco partout ». */
const serif = Platform.select({
  ios: 'Georgia',
  default: 'serif',
});

const serifDisplay = Platform.select({
  ios: 'Georgia',
  default: 'serif',
});

const ui = Platform.select({
  ios: undefined,
  default: 'sans-serif',
});

export const fonts = {
  serif,
  serifDisplay,
  ui,
};

export function typeRamp(scale: number): Record<string, TextStyle> {
  const s = (n: number) => Math.round(n * scale);

  return {
    kicker: {
      fontFamily: ui,
      fontSize: s(11),
      letterSpacing: 1.6,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    display: {
      fontFamily: serifDisplay,
      fontSize: s(32),
      lineHeight: s(38),
      fontWeight: '700',
    },
    title: {
      fontFamily: serifDisplay,
      fontSize: s(22),
      lineHeight: s(28),
      fontWeight: '700',
    },
    titleSm: {
      fontFamily: serifDisplay,
      fontSize: s(18),
      lineHeight: s(24),
      fontWeight: '600',
    },
    dek: {
      fontFamily: serif,
      fontSize: s(16),
      lineHeight: s(23),
      fontWeight: '400',
    },
    body: {
      fontFamily: serif,
      fontSize: s(18),
      lineHeight: s(28),
      fontWeight: '400',
    },
    ui: {
      fontFamily: ui,
      fontSize: s(15),
      lineHeight: s(20),
      fontWeight: '500',
    },
    caption: {
      fontFamily: ui,
      fontSize: s(13),
      lineHeight: s(18),
      fontWeight: '400',
    },
  };
}
