import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  WEEKDAY_LABELS_MON,
  isSunday,
  monthGrid,
  monthTitle,
} from '../lib/dates';
import { useAppTheme } from '../theme/ThemeProvider';
import { minTap } from '../theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  year: number;
  month: number;
  selected: string;
  marked: Set<string>;
  today: string;
  onSelect: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthGrid({
  year,
  month,
  selected,
  marked,
  today,
  onSelect,
  onPrev,
  onNext,
}: Props) {
  const { colors, type } = useAppTheme();
  const cells = monthGrid(year, month);

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <PressableScale
          onPress={onPrev}
          accessibilityLabel="Mois précédent"
          style={[styles.navBtn, { borderColor: colors.rule }]}>
          <Text style={[type.ui, { color: colors.text }]}>‹</Text>
        </PressableScale>
        <Text style={[type.titleSm, { color: colors.text }]}>
          {monthTitle(year, month)}
        </Text>
        <PressableScale
          onPress={onNext}
          accessibilityLabel="Mois suivant"
          style={[styles.navBtn, { borderColor: colors.rule }]}>
          <Text style={[type.ui, { color: colors.text }]}>›</Text>
        </PressableScale>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS_MON.map((label, i) => (
          <Text
            key={`${label}-${i}`}
            style={[
              type.kicker,
              styles.dow,
              { color: i === 6 ? colors.accent : colors.textMuted },
            ]}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map(cell => {
          const isSelected = cell.date === selected;
          const isToday = cell.date === today;
          const hasNotes = marked.has(cell.date);
          const sunday = isSunday(cell.date);
          return (
            <PressableScale
              key={cell.date}
              onPress={() => onSelect(cell.date)}
              accessibilityLabel={`${cell.date}${hasNotes ? ', notes' : ''}${sunday ? ', dimanche' : ''}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.cell,
                {
                  borderColor: isSelected
                    ? colors.accent
                    : sunday
                      ? colors.rule
                      : 'transparent',
                  backgroundColor: isSelected ? colors.chipBg : 'transparent',
                  opacity: cell.inMonth ? 1 : 0.35,
                },
              ]}>
              <Text
                style={[
                  type.ui,
                  {
                    color: isToday ? colors.accent : colors.text,
                    fontWeight: isToday ? '700' : '500',
                  },
                ]}>
                {Number(cell.date.slice(-2))}
              </Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: hasNotes ? colors.accent : 'transparent',
                  },
                ]}
              />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    borderWidth: 1,
    minWidth: minTap,
    alignItems: 'center',
  },
  weekRow: { flexDirection: 'row' },
  dow: { width: `${100 / 7}%`, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    minHeight: minTap,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 4,
  },
  dot: { width: 4, height: 4, marginTop: 2, borderRadius: 2 },
});
