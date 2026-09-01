import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ColorScheme } from '../theme/tokens';
import { fonts } from '../theme/typography';

export function stackOptions(colors: ColorScheme): NativeStackNavigationOptions {
  return {
    headerShadowVisible: false,
    headerBackTitle: 'Retour',
    headerTintColor: colors.accent,
    headerStyle: { backgroundColor: colors.bg },
    headerTitleStyle: {
      fontFamily: fonts.serifDisplay,
      fontWeight: '600',
      color: colors.text,
    },
    contentStyle: { backgroundColor: colors.bg },
    animation: 'slide_from_right',
  };
}
