import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { useSettings } from '../store/SettingsContext';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { settings, ready } = useSettings();
  const { colors, isDark } = useAppTheme();

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.accent,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.rule,
      notification: colors.accent,
    },
    fonts: {
      regular: { fontFamily: fonts.ui, fontWeight: '400' as const },
      medium: { fontFamily: fonts.ui, fontWeight: '500' as const },
      bold: { fontFamily: fonts.serifDisplay, fontWeight: '700' as const },
      heavy: { fontFamily: fonts.serifDisplay, fontWeight: '800' as const },
    },
  };

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {settings.onboardingDone ? (
          <Root.Screen name="Main" component={TabNavigator} />
        ) : (
          <Root.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
