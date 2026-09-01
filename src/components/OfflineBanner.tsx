import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

export function OfflineBanner({ visible }: { visible: boolean }) {
  const { colors, type } = useAppTheme();
  if (!visible) {
    return null;
  }
  return (
    <View
      style={[styles.banner, { backgroundColor: colors.surfaceRaised }]}
      accessibilityLiveRegion="polite">
      <Text style={[type.caption, { color: colors.text }]}>
        Hors-ligne — le classeur reste local. L’édition affichée est la dernière chargée.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
