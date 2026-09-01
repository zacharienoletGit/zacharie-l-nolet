import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { GoldRule } from './GoldRule';

export function EmptyPress({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const { colors, type } = useAppTheme();
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Text style={[type.title, { color: colors.text }]}>{title}</Text>
      <GoldRule />
      <Text style={[type.dek, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 28,
    gap: 12,
  },
});
