import React, { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";
import type { Progress } from "../types/models";
import { colors, fontSize, fontWeight, animation } from "../theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: Progress;
  size?: number;
}

function ProgressRingComponent({ progress, size = 48 }: ProgressRingProps) {
  const strokeWidth = Math.max(3, size * 0.08);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress.percent / 100, {
      damping: animation.spring.damping,
      stiffness: animation.spring.stiffness,
      mass: animation.spring.mass,
    });
  }, [progress.percent]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  const textSize = size < 56 ? fontSize.xs : fontSize.base;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Animated.Text style={[styles.label, { fontSize: textSize }]}>
          {progress.percent}%
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
});

export const ProgressRing = memo(ProgressRingComponent);
