import React, { useEffect, useMemo } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PARTICLE_COUNT = 60;
const COLORS = [
  "#0d8a6e", // Teal Accent
  "#0a6e5c", // Hobyay Teal
  "#c9963a", // Amber
  "#2e5e52", // Teal Uplift
  "#34D399", // Warm green
  "#ddb97a", // Amber light
  "#1a4035", // Deep Teal
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

interface ConfettiParticleProps {
  particle: Particle;
  progress: SharedValue<number>;
}

const ConfettiParticle = ({ particle, progress }: ConfettiParticleProps) => {
  const style = useAnimatedStyle(() => {
    const val = progress.value;
    const y =
      particle.startY + val * (SCREEN_HEIGHT + 150) * particle.fallSpeed;
    const x =
      particle.startX + Math.sin(val * particle.swingFreq) * particle.swingAmp;
    const rotate = val * particle.rotationSpeed;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotate}deg` },
      ],
      opacity: val > 0.8 ? (1 - val) * 5 : 1, // fade out at the end
    };
  });

  const particleShape = useMemo(() => {
    const isStrip = Math.random() > 0.5;
    const isRound = Math.random() > 0.7;
    return {
      height: particle.size * (isStrip ? 1.5 : 1),
      borderRadius: isRound ? particle.size / 2 : 2,
    };
  }, [particle.size]);

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          backgroundColor: particle.color,
          width: particle.size,
          height: particleShape.height,
          borderRadius: particleShape.borderRadius,
        },
      ]}
    />
  );
};

export const Confetti = ({ active, onAnimationEnd }: ConfettiProps) => {
  const animationProgress = useSharedValue(0);

  const particles = useMemo(() => {
    if (!active) return [];
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
        },
      );
    }
  }, [active, onAnimationEnd]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          particle={p}
          progress={animationProgress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
