import React from 'react';
import {
  Pressable,
  StyleSheet,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { minTap } from '../theme/tokens';

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  testID?: string;
};

export function PressableScale({
  onPress,
  children,
  style,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        styles.base,
        style,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTap,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.4,
  },
});
