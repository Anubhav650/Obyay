import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Technique } from '../types/models';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
} from '../theme/tokens';

interface TechniqueRowProps {
  technique: Technique;
  onPress: () => void;
}

function TechniqueRowComponent({ technique, onPress }: TechniqueRowProps) {
  const isMastered = technique.status === 'mastered';
  const isSkipped = technique.status === 'skipped';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isMastered && styles.masteredRow,
        isSkipped && styles.skippedRow,
        pressed && styles.pressedRow,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${technique.name}, ${technique.status}`}
    >
      <View style={styles.orderContainer}>
        <Text
          style={[
            styles.order,
            isSkipped && styles.skippedText,
          ]}
        >
          {technique.order}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            isSkipped && styles.skippedName,
            isMastered && styles.masteredName,
          ]}
          numberOfLines={1}
        >
          {technique.name}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        {isMastered && <Text style={styles.statusIcon}>✓</Text>}
        {isSkipped && <Text style={styles.skippedIcon}>—</Text>}
        {technique.status === 'pending' && (
          <View style={styles.pendingDot} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    minHeight: 56,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  masteredRow: {
    backgroundColor: colors.successDim,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  skippedRow: {
    opacity: 0.5,
  },
  pressedRow: {
    backgroundColor: colors.surfacePressed,
  },
  orderContainer: {
    width: 28,
    marginRight: spacing.md,
  },
  order: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
  },
  skippedText: {
    color: colors.textDisabled,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  masteredName: {
    color: colors.success,
  },
  skippedName: {
    textDecorationLine: 'line-through',
    color: colors.textDisabled,
  },
  statusContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: fontSize.lg,
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
  skippedIcon: {
    fontSize: fontSize.lg,
    color: colors.textDisabled,
    fontWeight: fontWeight.bold,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
});

export const TechniqueRow = memo(TechniqueRowComponent);
