import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 60;
const COLORS = [
  '#2DD4BF', // casual teal
  '#F59E0B', // hobbyist amber
  '#8B5CF6', // serious violet
  '#34D399', // success green
  '#6366F1', // indigo
  '#EC4899', // pink
  '#3B82F6', // blue
];

interface ConfettiProps {
  active: boolean;
  onAnimationEnd?: () => void;
}

interface Particle {
  id: number;
  color: string;
  size: number;
  startX: number;
  startY: number;
  swingFreq: number;
  swingAmp: number;
  rotationSpeed: number;
  fallSpeed: number;
}

export function Confetti({ active, onAnimationEnd }: ConfettiProps) {
  const animationProgress = useSharedValue(0);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const size = Math.random() * 8 + 6; // size between 6 and 14
      return {
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        startX: Math.random() * SCREEN_WIDTH,
        startY: -Math.random() * 100 - 20, // start above screen
        swingFreq: Math.random() * 6 + 3, // frequency of sway
        swingAmp: Math.random() * 40 + 10, // amplitude of sway
        rotationSpeed: (Math.random() - 0.5) * 720, // rotation degrees
        fallSpeed: Math.random() * 0.3 + 0.8, // relative fall speed modifier
      };
    });
  }, [active]);

  useEffect(() => {
    if (active) {
      animationProgress.value = 0;
      animationProgress.value = withTiming(
        1,
        {
          duration: 3000,
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished && onAnimationEnd) {
            runOnJS(onAnimationEnd)();
          }
        }
      );
    }
  }, [active, onAnimationEnd]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const style = useAnimatedStyle(() => {
          const progress = animationProgress.value;
          const y = p.startY + progress * (SCREEN_HEIGHT + 150) * p.fallSpeed;
          const x = p.startX + Math.sin(progress * p.swingFreq) * p.swingAmp;
          const rotate = progress * p.rotationSpeed;

          return {
            transform: [
              { translateX: x },
              { translateY: y },
              { rotate: `${rotate}deg` },
            ],
            opacity: progress > 0.8 ? (1 - progress) * 5 : 1, // fade out at the end
          };
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              style,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size * (Math.random() > 0.5 ? 1.5 : 1), // some strips, some squares
                borderRadius: Math.random() > 0.7 ? p.size / 2 : 2, // round or rectangle
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
