import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme/tokens';

interface SkeletonProps {
  rows?: number;
}

function SkeletonRow({ width }: { width: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      pulse.value,
      [0, 1],
      [colors.surfaceElevated, colors.surface]
    ),
  }));

  return (
    <Animated.View style={[styles.row, animatedStyle, { width: width as any }]} />
  );
}

function SkeletonComponent({ rows = 5 }: SkeletonProps) {
  const widths = ['90%', '75%', '85%', '70%', '80%', '65%', '88%'];

  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} width={widths[i % widths.length]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  row: {
    height: 56,
    borderRadius: radii.card,
    marginBottom: spacing.sm,
  },
});

export const Skeleton = memo(SkeletonComponent);
