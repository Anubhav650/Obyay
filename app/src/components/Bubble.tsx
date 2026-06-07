import React, { useMemo } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
} from "../theme/tokens";

interface BubbleProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const Bubble = ({ label, isSelected, onPress }: BubbleProps) => {
  const accessibilityState = useMemo(
    () => ({ checked: isSelected }),
    [isSelected],
  );

  return (
    <Pressable
      style={[styles.bubble, isSelected && styles.bubbleSelected]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={accessibilityState}
    >
      <Text
        style={[styles.bubbleText, isSelected && styles.bubbleTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  bubbleSelected: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
    ...shadows.glow,
  },
  bubbleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  bubbleTextSelected: {
    color: colors.tealAccent,
    fontWeight: fontWeight.bold,
  },
});
