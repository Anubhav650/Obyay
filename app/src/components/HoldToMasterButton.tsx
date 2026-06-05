import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radii, fontSize, fontWeight, animation } from '../theme/tokens';

interface HoldToMasterButtonProps {
  onComplete: () => void;
}

interface Spark {
  id: number;
  angle: number;
  speed: number;
  size: number;
}

const PARTICLE_COUNT = 16;

function SparkView({
  spark,
  progress,
  active,
}: {
  spark: Spark;
  progress: SharedValue<number>;
  active: SharedValue<boolean>;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const isAct = active.value;

    const translateX = Math.cos(spark.angle) * spark.speed * p;
    const translateY = Math.sin(spark.angle) * spark.speed * p;

    // Scale starts small, peaks, and fades out near the end
    const scale = p > 0.8 ? (1 - p) * 5 : p / 0.8;
    const opacity = p > 0.8 ? (1 - p) * 5 : 1;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale: isAct ? scale : 0 },
      ],
      opacity: isAct ? opacity : 0,
    };
  });

  return (
    <Animated.View
      style={[
        styles.spark,
        style,
        {
          width: spark.size,
          height: spark.size,
          borderRadius: spark.size / 2,
          backgroundColor: colors.success,
        },
      ]}
    />
  );
}

export function HoldToMasterButton({ onComplete }: HoldToMasterButtonProps) {
  const progress = useSharedValue(0);
  const isPressing = useSharedValue(false);

  const sparks = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (i * (2 * Math.PI)) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.15;
      const speed = Math.random() * 90 + 50; // distance they fly
      const size = Math.random() * 6 + 4; // size of dot
      return { id: i, angle, speed, size };
    });
  }, []);

  const triggerHapticTick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerSuccessHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Trigger haptic ticks on the JS thread when progress crosses intervals
  useAnimatedReaction(
    () => Math.floor(progress.value * 10),
    (curr, prev) => {
      if (curr !== prev && curr > 0 && curr < 10) {
        runOnJS(triggerHapticTick)();
      }
    }
  );

  const success = useSharedValue(false);

  const gesture = Gesture.LongPress()
    .minDuration(200)
    .onBegin(() => {
      success.value = false;
      isPressing.value = true;
      progress.value = 0;
    })
    .onStart(() => {
      progress.value = withTiming(
        1,
        {
          duration: 1300,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            isPressing.value = false;
            success.value = true;
            runOnJS(triggerSuccessHaptic)();
            runOnJS(onComplete)();
          }
        }
      );
    })
    .onFinalize(() => {
      isPressing.value = false;
      if (!success.value) {
        progress.value = withTiming(0, { duration: 300 });
      }
    });

  const buttonStyle = useAnimatedStyle(() => {
    const baseScale = isPressing.value ? animation.buttonActiveScale : 1;
    const progressScaleReduction = progress.value * 0.03;
    const scale = baseScale - progressScaleReduction;

    return {
      transform: [{ scale }],
      borderColor: isPressing.value ? colors.tealAccent : colors.accentGlow,
      backgroundColor: isPressing.value ? colors.accentGlow : colors.successDim,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      opacity: isPressing.value ? 0.35 : 0,
    };
  });

  return (
    <View style={styles.container}>
      {/* Background sparks */}
      <View style={styles.sparksContainer} pointerEvents="none">
        {sparks.map((spark) => (
          <SparkView
            key={spark.id}
            spark={spark}
            progress={progress}
            active={isPressing}
          />
        ))}
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.button, buttonStyle]}>
          {/* Progress bar fill */}
          <Animated.View style={[styles.progressBar, progressBarStyle]} />

          <Text style={styles.text}>✓ Hold to Master</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  button: {
    width: '100%',
    borderRadius: radii.pill,
    height: 56,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.tealAccent,
  },
  text: {
    color: colors.tealAccent,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    zIndex: 2,
  },
  sparksContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  spark: {
    position: 'absolute',
  },
});
