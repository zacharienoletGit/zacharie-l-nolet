import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatEditionDate } from '../lib/dates';
import { useAppTheme } from '../theme/ThemeProvider';
import { BrandMark } from './BrandMark';
import { GoldRule } from './GoldRule';

type Props = {
  date: string;
  eyebrow?: string;
  title?: string;
  compact?: boolean;
};

export function Masthead({
  date,
  eyebrow = 'Cahier de lecture',
  title = 'Ludovic Zacharie Nolet Gilbert',
  compact = false,
}: Props) {
  const { colors, type } = useAppTheme();

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.top}>
        <BrandMark size={compact ? 44 : 64} />
        <View style={styles.copy}>
          <Text style={[type.kicker, { color: colors.accent }]}>{eyebrow}</Text>
          <Text style={[compact ? type.title : type.display, { color: colors.text }]}>
            {title}
          </Text>
        </View>
      </View>
      <GoldRule />
      <Text style={[type.caption, styles.date, { color: colors.textMuted }]}>
        {formatEditionDate(date)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    paddingBottom: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  date: {
    letterSpacing: 0.4,
  },
});
