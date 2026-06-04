import React, { memo, useCallback } from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, animation, spacing } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onPress: () => void;
}

function FABComponent({ onPress }: FABProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, animation.springSnappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.springSnappy);
  }, []);

  return (
    <AnimatedPressable
      style={[
        styles.fab,
        animatedStyle,
        {
          bottom: Math.max(insets.bottom, spacing.base) + spacing.base,
          right: spacing.lg,
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Add new hobby"
    >
      <Text style={styles.icon}>+</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  icon: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -1,
  },
});

export const FAB = memo(FABComponent);
