import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { palette } from '../theme/tokens';

const portrait = require('../../assets/brand/portrait.png');

export function BrandMark({ size = 72 }: { size?: number }) {
  const ring = 3;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Marque Ludovic Zacharie Nolet Gilbert"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: ring,
        },
      ]}>
      <Image source={portrait} style={[styles.image, { borderRadius: (size - ring * 2) / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1,
    borderColor: palette.gold,
    backgroundColor: palette.midnight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
