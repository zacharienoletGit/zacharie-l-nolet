import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { minTap } from '../theme/tokens';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Chercher un titre, une rubrique…',
}: Props) {
  const { colors, type } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.chipBg, borderColor: colors.rule },
      ]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Recherche"
        allowFontScaling
        style={[type.ui, styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: minTap,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 10,
  },
});
