import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
  lineHeight,
} from "../../theme/tokens";
import type { PracticeToolConfig } from "../../types/models";

type PhaseType = "prepare" | "work" | "rest";

interface IntervalStage {
  name: string;
  duration: number;
}

export const WorkoutTimer = ({ config }: { config?: PracticeToolConfig }) => {
  const defaultIntervals: IntervalStage[] = useMemo(
    () =>
      config?.intervals || [
        { name: "Prepare", duration: 10 },
        { name: "Work", duration: 40 },
        { name: "Recover", duration: 20 },
      ],
    [config?.intervals],
  );

  const maxCycles = config?.cycles || 4;
  const instruction =
    config?.instruction ||
    "Focus on correct posture and slow, deliberate movements.";

  // Workout state machine: 'idle' | 'running' | 'paused' | 'finished'
  const [workoutState, setWorkoutState] = useState<
    "idle" | "running" | "paused" | "finished"
  >("idle");

  // Active training state
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentIntervalIdx, setCurrentIntervalIdx] = useState(0); // 0 = prep, 1 = work, 2 = rest
  const [timeLeft, setTimeLeft] = useState(defaultIntervals[0].duration);

  const secondsTotal = defaultIntervals[currentIntervalIdx]?.duration || 10;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stage transition management
  const advanceStage = useCallback(() => {
    const nextIdx = currentIntervalIdx + 1;

    if (nextIdx < defaultIntervals.length) {
      // Advance to next interval in the current round
      setCurrentIntervalIdx(nextIdx);
      setTimeLeft(defaultIntervals[nextIdx].duration);
    } else {
      // Completed all intervals in this round. Go to next round!
      const nextCycle = currentCycle + 1;
      if (nextCycle <= maxCycles) {
        setCurrentCycle(nextCycle);
        setCurrentIntervalIdx(0);
        setTimeLeft(defaultIntervals[0].duration);
      } else {
        // Workout complete!
        setWorkoutState("finished");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [currentIntervalIdx, currentCycle, defaultIntervals, maxCycles]);

  // Interval timer tick controller
  useEffect(() => {
    if (workoutState === "running") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // End of current phase. Advance to next stage!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            advanceStage();
            return 0;
          }

          // Warning ticks at 3, 2, 1 seconds
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workoutState, currentIntervalIdx, currentCycle, advanceStage]);

  const startWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentCycle(1);
    setCurrentIntervalIdx(0);
    setTimeLeft(defaultIntervals[0].duration);
    setWorkoutState("running");
  }, [defaultIntervals]);

  const togglePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorkoutState((prev) => (prev === "running" ? "paused" : "running"));
  }, []);

  const stopWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorkoutState("idle");
  }, []);

  const phaseName = useMemo(() => {
    return defaultIntervals[currentIntervalIdx]?.name || "Prepare";
  }, [currentIntervalIdx, defaultIntervals]);

  const phaseColor = useMemo(() => {
    const name = phaseName.toLowerCase();
    if (name.includes("prep")) return colors.intermediate; // Amber
    if (name.includes("work") || name.includes("active")) return colors.success; // Green
    return colors.advanced; // Violet / Rest
  }, [phaseName]);

  const phaseDimColor = useMemo(() => {
    const name = phaseName.toLowerCase();
    if (name.includes("prep")) return colors.intermediateDim;
    if (name.includes("work") || name.includes("active"))
      return colors.successDim;
    return colors.advancedDim;
  }, [phaseName]);

  const ringStyle = useMemo(
    () => [
      styles.countdownRing,
      {
        borderColor: phaseColor,
        backgroundColor: phaseDimColor,
      },
    ],
    [phaseColor, phaseDimColor],
  );

  const timeLabelStyle = useMemo(
    () => [styles.timeLabel, { color: phaseColor }],
    [phaseColor],
  );

  const renderBreakdownRow = useCallback(
    (stage: IntervalStage, idx: number) => (
      <View key={idx} style={styles.breakdownRow}>
        <Text style={styles.breakdownName}>🔹 {stage.name}</Text>
        <Text style={styles.breakdownDur}>{stage.duration}s</Text>
      </View>
    ),
    [],
  );

  const activeTimerActionButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.timerActionBtn,
      workoutState === "running" ? styles.pauseBtn : styles.resumeBtn,
      pressed && styles.stopBtn, // simple fallback overlay
    ],
    [workoutState],
  );

  const activeTimerActionButtonTextStyle = useMemo(
    () => [
      styles.timerActionText,
      workoutState === "running" && styles.pauseBtnText,
    ],
    [workoutState],
  );

  return (
    <View style={styles.container}>
      {/* Workout State Views */}
      {workoutState === "idle" ? (
        <View style={styles.idlePanel}>
          <Text style={styles.idleHeading}>Ready to Practice?</Text>
          <Text style={styles.idleSubheading}>
            Perform this drill for {maxCycles} rounds. Follow the cues below.
          </Text>

          {/* Form Check Cue */}
          <View style={styles.cueBox}>
            <Text style={styles.cueTitle}>FORM CHECK CUE</Text>
            <Text style={styles.cueText}>"{instruction}"</Text>
          </View>

          {/* Setup breakdown list */}
          <View style={styles.intervalsBreakdown}>
            {defaultIntervals.map(renderBreakdownRow)}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownName}>🔄 Total Rounds</Text>
              <Text style={styles.breakdownDur}>{maxCycles} Cycles</Text>
            </View>
          </View>

          <Pressable style={styles.startBtn} onPress={startWorkout}>
            <Text style={styles.startBtnText}>Start Routine</Text>
          </Pressable>
        </View>
      ) : workoutState === "finished" ? (
        <View style={styles.finishedPanel}>
          <Text style={styles.finishedEmoji}>🏆</Text>
          <Text style={styles.finishedTitle}>Routine Completed!</Text>
          <Text style={styles.finishedSubtitle}>
            Great job! You executed all {maxCycles} cycles of this drill focus.
            Your muscle memory is growing.
          </Text>
          <Pressable style={styles.startBtn} onPress={startWorkout}>
            <Text style={styles.startBtnText}>Practice Again</Text>
          </Pressable>
          <Pressable style={styles.resetBtn} onPress={stopWorkout}>
            <Text style={styles.resetBtnText}>Back to Summary</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.timerPanel}>
          {/* Cycle / Round counter */}
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleBadgeText}>
              ROUND {currentCycle} OF {maxCycles}
            </Text>
          </View>

          {/* Animated/Colored countdown wheel */}
          <View style={ringStyle}>
            <Text style={timeLabelStyle}>{phaseName.toUpperCase()}</Text>
            <Text style={styles.timeVal}>{timeLeft}</Text>
            <Text style={styles.timeTotal}>/ {secondsTotal}s</Text>
          </View>

          {/* Form instruction cue */}
          <View style={styles.activeCueBox}>
            <Text style={styles.activeCueText}>"{instruction}"</Text>
          </View>

          {/* Running control row */}
          <View style={styles.controlsRow}>
            <Pressable
              style={activeTimerActionButtonStyle}
              onPress={togglePause}
            >
              <Text style={activeTimerActionButtonTextStyle}>
                {workoutState === "running" ? "Pause" : "Resume"}
              </Text>
            </Pressable>

            <Pressable style={styles.stopBtn} onPress={stopWorkout}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  idlePanel: {
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  idleHeading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  idleSubheading: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  cueBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  cueTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  cueText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: lineHeight.base,
  },
  intervalsBreakdown: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  breakdownDur: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  startBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    ...shadows.card,
  },
  startBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  finishedPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.glow,
  },
  finishedEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  finishedTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  finishedSubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: lineHeight.base,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  resetBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  resetBtnText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  timerPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.glow,
  },
  cycleBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  cycleBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  countdownRing: {
    width: 180,
    height: 180,
    borderRadius: radii.full,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  timeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  timeVal: {
    fontSize: 56,
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    lineHeight: 60,
  },
  timeTotal: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    fontWeight: fontWeight.bold,
  },
  activeCueBox: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  activeCueText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: lineHeight.sm,
  },
  controlsRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  timerActionBtn: {
    flex: 2,
    borderRadius: radii.pill,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  resumeBtn: {
    backgroundColor: colors.success,
  },
  timerActionText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  pauseBtnText: {
    color: colors.textPrimary,
  },
  stopBtn: {
    flex: 1,
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.pill,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtnText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
