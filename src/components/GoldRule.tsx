import React from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '../theme/tokens';
import { useAppTheme } from '../theme/ThemeProvider';

export function GoldRule({ inset = 0 }: { inset?: number }) {
  const { isDark } = useAppTheme();
  return (
    <View
      style={[
        styles.rule,
        {
          marginHorizontal: inset,
          backgroundColor: isDark ? palette.goldBright : palette.gold,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rule: {
    height: StyleSheet.hairlineWidth * 3,
    opacity: 0.85,
  },
});
