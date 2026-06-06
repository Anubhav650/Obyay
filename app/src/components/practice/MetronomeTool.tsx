import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, spacing, radii, fontSize, fontWeight, shadows, lineHeight } from '../../theme/tokens';
import type { PracticeToolConfig } from '../../types/models';

export function MetronomeTool({ config }: { config?: PracticeToolConfig }) {
  const defaultBpm = config?.bpm || 80;
  const [bpm, setBpm] = useState(defaultBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Reanimated shared values for pendulum & beat flash
  const pendulumAngle = useSharedValue(0);
  const beatScale = useSharedValue(1);

  // Pendulum animation style
  const pendulumStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${pendulumAngle.value}deg` },
    ],
  }));

  // Visual pulse style
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatScale.value }],
    opacity: beatScale.value,
  }));

  // Metronome tick logic
  const tick = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Pulse animation
    beatScale.value = 1.3;
    beatScale.value = withTiming(1, { duration: 150 });

    setCurrentBeat((prev) => {
      const timeSig = config?.timeSignature || '4/4';
      const maxBeats = parseInt(timeSig.split('/')[0]) || 4;
      return prev < maxBeats ? prev + 1 : 1;
    });
  }, [config, beatScale]);

  // Handle Play / Stop
  const togglePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying((prev) => !prev);
  }, []);

  // Start / stop metronome timer loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      setCurrentBeat(1);

      // Start Reanimated pendulum swinging back & forth
      const swingDuration = intervalMs;
      pendulumAngle.value = -30;
      pendulumAngle.value = withRepeat(
        withSequence(
          withTiming(30, { duration: swingDuration, easing: Easing.inOut(Easing.quad) }),
          withTiming(-30, { duration: swingDuration, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinite loops
        true // Reverse
      );

      // Start javascript timer for haptic beats
      timerRef.current = setInterval(tick, intervalMs);
    } else {
      // Clean up metronome loop
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      cancelAnimation(pendulumAngle);
      pendulumAngle.value = withTiming(0, { duration: 200 });
      beatScale.value = 1;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, bpm, tick, pendulumAngle, beatScale]);

  // Tap Tempo estimation
  const handleTapTempo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = Date.now();
    const times = tapTimesRef.current;

    // Filter out taps older than 2.5 seconds
    const filtered = times.filter((t) => now - t < 2500);
    filtered.push(now);
    tapTimesRef.current = filtered;

    if (filtered.length >= 2) {
      let sum = 0;
      for (let i = 1; i < filtered.length; i++) {
        sum += filtered[i] - filtered[i - 1];
      }
      const avgInterval = sum / (filtered.length - 1);
      const estimatedBpm = Math.round(60000 / avgInterval);
      if (estimatedBpm >= 40 && estimatedBpm <= 240) {
        setBpm(estimatedBpm);
      }
    }
  }, []);

  const adjustBpm = useCallback((amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBpm((prev) => Math.max(40, Math.min(240, prev + amount)));
  }, []);

  const handleBpmMinus10 = useCallback(() => adjustBpm(-10), [adjustBpm]);
  const handleBpmMinus1 = useCallback(() => adjustBpm(-1), [adjustBpm]);
  const handleBpmPlus1 = useCallback(() => adjustBpm(1), [adjustBpm]);
  const handleBpmPlus10 = useCallback(() => adjustBpm(10), [adjustBpm]);

  const renderChord = useCallback((chord: string, index: number) => (
    <View key={index} style={styles.chordChip}>
      <Text style={styles.chordText}>{chord}</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {/* Pattern & Chords Guide */}
      {config?.chords && config.chords.length > 0 && (
        <View style={styles.chordSection}>
          <Text style={styles.guideTitle}>TARGET CHORDS</Text>
          <View style={styles.chordRow}>
            {config.chords.map(renderChord)}
          </View>
        </View>
      )}

      {config?.pattern && (
        <View style={styles.patternSection}>
          <Text style={styles.guideTitle}>STRUMMING / PICKING PATTERN</Text>
          <View style={styles.patternCard}>
            <Text style={styles.patternText}>{config.pattern}</Text>
          </View>
        </View>
      )}

      {/* Visual Metronome */}
      <View style={styles.metronomeLayout}>
        {/* Pendulum Area */}
        <View style={styles.pendulumFrame}>
          <Animated.View style={[styles.pendulumArm, pendulumStyle]}>
            <View style={styles.pendulumWeight} />
          </Animated.View>
          <View style={styles.pendulumPivot} />
        </View>

        {/* Pulse Beats Indicator */}
        <View style={styles.pulseArea}>
          <Animated.View style={[styles.pulseCircle, pulseStyle, isPlaying && styles.pulseActive]} />
          <Text style={styles.beatCounter}>
            {isPlaying ? `Beat ${currentBeat}` : 'Ready'}
          </Text>
        </View>

        {/* BPM Selector */}
        <View style={styles.controlsRow}>
          <Pressable style={styles.adjustBtn} onPress={handleBpmMinus10}>
            <Text style={styles.adjustBtnText}>-10</Text>
          </Pressable>
          <Pressable style={styles.adjustBtn} onPress={handleBpmMinus1}>
            <Text style={styles.adjustBtnText}>-1</Text>
          </Pressable>

          <View style={styles.bpmDisplayContainer}>
            <Text style={styles.bpmVal}>{bpm}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>

          <Pressable style={styles.adjustBtn} onPress={handleBpmPlus1}>
            <Text style={styles.adjustBtnText}>+1</Text>
          </Pressable>
          <Pressable style={styles.adjustBtn} onPress={handleBpmPlus10}>
            <Text style={styles.adjustBtnText}>+10</Text>
          </Pressable>
        </View>

        {/* Main Controls */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.mainBtn, isPlaying ? styles.stopBtn : styles.startBtn]}
            onPress={togglePlay}
          >
            <Text style={[styles.mainBtnText, isPlaying && styles.stopBtnText]}>
              {isPlaying ? 'Pause' : 'Start Beat'}
            </Text>
          </Pressable>

          <Pressable style={styles.tapBtn} onPress={handleTapTempo}>
            <Text style={styles.tapBtnText}>Tap Tempo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  chordSection: {
    marginBottom: spacing.lg,
  },
  guideTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  chordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chordChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chordText: {
    color: colors.beginner,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  patternSection: {
    marginBottom: spacing.xl,
  },
  patternCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  patternText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  metronomeLayout: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  pendulumFrame: {
    width: 200,
    height: 120,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.md,
  },
  pendulumArm: {
    width: 3,
    height: 100,
    backgroundColor: colors.border,
    transformOrigin: 'top center',
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  pendulumWeight: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.beginner,
    position: 'absolute',
    bottom: 0,
    ...shadows.card,
  },
  pendulumPivot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.textSecondary,
    top: 6,
    position: 'absolute',
  },
  pulseArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: 80,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: 'rgba(13, 138, 110, 0.06)',
  },
  pulseActive: {
    backgroundColor: colors.beginnerGlow,
    borderWidth: 1,
    borderColor: colors.beginner,
  },
  beatCounter: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  adjustBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  bpmDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  bpmVal: {
    color: colors.textPrimary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.heavy,
  },
  bpmLabel: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  mainBtn: {
    flex: 2,
    borderRadius: radii.pill,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  startBtn: {
    backgroundColor: colors.beginner,
  },
  stopBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  mainBtnText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  stopBtnText: {
    color: colors.textPrimary,
  },
  tapBtn: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 56,
  },
  tapBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
