import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GoalLevel } from '../types/models';
import { getLevelColor, getLevelDimColor, fontSize, fontWeight, radii, spacing } from '../theme/tokens';

interface LevelBadgeProps {
  level: GoalLevel;
}

function LevelBadgeComponent({ level }: LevelBadgeProps) {
  const color = getLevelColor(level);
  const bgColor = getLevelDimColor(level);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color }]}>
        {level.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
});

export const LevelBadge = memo(LevelBadgeComponent);
