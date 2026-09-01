import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  name: 'edition' | 'rubriques' | 'classeur' | 'cabinet';
  color: string;
  focused: boolean;
};

/** Pictogrammes géométriques — pas d’emoji, pas de set générique. */
export function TabGlyph({ name, color, focused }: Props) {
  const w = focused ? 2 : 1.2;

  if (name === 'edition') {
    return (
      <View style={styles.box}>
        <View style={[styles.line, { backgroundColor: color, height: w + 1 }]} />
        <View style={[styles.line, { backgroundColor: color, width: 16, height: w }]} />
        <View style={[styles.line, { backgroundColor: color, width: 12, height: w }]} />
      </View>
    );
  }

  if (name === 'rubriques') {
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.cell,
              { borderColor: color, borderWidth: w, opacity: i === 0 || focused ? 1 : 0.7 },
            ]}
          />
        ))}
      </View>
    );
  }

  if (name === 'classeur') {
    return (
      <View style={[styles.book, { borderColor: color, borderWidth: w }]}>
        <View style={[styles.spine, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.lamp}>
      <View style={[styles.shade, { borderColor: color, borderWidth: w }]} />
      <View style={[styles.stem, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  line: {
    width: 22,
  },
  grid: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  cell: {
    width: 7,
    height: 7,
  },
  book: {
    width: 16,
    height: 18,
    paddingLeft: 4,
    justifyContent: 'center',
  },
  spine: {
    width: 1.5,
    height: 14,
  },
  lamp: {
    width: 20,
    height: 18,
    alignItems: 'center',
  },
  shade: {
    width: 18,
    height: 8,
    borderBottomWidth: 0,
  },
  stem: {
    width: 1.5,
    height: 8,
    marginTop: 1,
  },
});
