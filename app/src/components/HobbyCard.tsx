import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Hobby } from '../types/models';
import { getProgress } from '../store/hobbyStore';
import { ProgressRing } from './ProgressRing';
import { LevelBadge } from './LevelBadge';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
  animation,
} from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HobbyCardProps {
  hobby: Hobby;
  onPress: (hobby: Hobby) => void;
  onLongPress: (hobby: Hobby) => void;
}

function HobbyCardComponent({ hobby, onPress, onLongPress }: HobbyCardProps) {
  const scale = useSharedValue(1);
  const progress = getProgress(hobby);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onPress(hobby);
  }, [onPress, hobby]);

  const handleLongPress = useCallback(() => {
    onLongPress(hobby);
  }, [onLongPress, hobby]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, animation.springSnappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.springSnappy);
  }, []);

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${hobby.name}, ${progress.mastered} of ${progress.total} mastered`}
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.name} numberOfLines={1}>
            {hobby.name}
          </Text>
          <View style={styles.meta}>
            <LevelBadge level={hobby.level} />
            <Text style={styles.progressText}>
              {progress.mastered}/{progress.total} mastered
            </Text>
          </View>
        </View>
        <ProgressRing progress={progress} size={40} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    minHeight: 80,
  },
  textSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.regular,
  },
});

export const HobbyCard = memo(HobbyCardComponent);
