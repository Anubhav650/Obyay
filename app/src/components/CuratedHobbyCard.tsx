import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Hobby } from '../types/models';
import { LevelBadge } from './LevelBadge';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  lineHeight,
  animation,
} from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CuratedHobbyCardProps {
  hobby: Hobby;
  onPress: (hobby: Hobby) => void;
}

function CuratedHobbyCardComponent({ hobby, onPress }: CuratedHobbyCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onPress(hobby);
  }, [onPress, hobby]);

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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Curated roadmap: ${hobby.name}, ${hobby.level}. ${hobby.summary}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{hobby.name}</Text>
          <LevelBadge level={hobby.level} />
        </View>

        <Text style={styles.summary} numberOfLines={3}>
          {hobby.summary}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.actionText}>Instant Start →</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
});

export const CuratedHobbyCard = memo(CuratedHobbyCardComponent);
