import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
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
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import type { PracticeToolConfig } from "../../types/models";

interface CulinaryStep {
  name: string;
  duration: number; // in seconds
  sensoryCheck: string;
}

export const CulinaryTimer = ({ config }: { config?: PracticeToolConfig }) => {
  const steps: CulinaryStep[] = useMemo(
    () =>
      config?.steps || [
        {
          name: "Autolyse",
          duration: 1800,
          sensoryCheck:
            "Flour is fully hydrated, no dry pockets remain. Gluten is starting to relax.",
        },
        {
          name: "Bulk Fermentation",
          duration: 7200,
          sensoryCheck:
            "Dough has risen by 50%, shows bubbles on the surface, and feels light/aerated.",
        },
        {
          name: "Baking",
          duration: 2400,
          sensoryCheck:
            "Crust is dark mahogany brown, bread sounds hollow when tapped on the bottom.",
        },
      ],
    [config?.steps],
  );

  const targetTemp = config?.targetTemperature;

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0]?.duration || 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checklistChecked, setChecklistChecked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer on step change
  useEffect(() => {
    setTimeLeft(steps[activeStepIdx]?.duration || 60);
    setIsTimerRunning(false);
    setChecklistChecked(false);
  }, [activeStepIdx, steps]);

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
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
  }, [isTimerRunning]);

  const toggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning((prev) => !prev);
  }, []);

  const handleCheckboxToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklistChecked((prev) => !prev);
  }, []);

  const nextStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeStepIdx + 1 < steps.length) {
      setActiveStepIdx((prev) => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setActiveStepIdx(0);
    }
  }, [activeStepIdx, steps]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const currentStep = steps[activeStepIdx];

  const handleTimelinePress = useCallback((idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveStepIdx(idx);
  }, []);

  const renderTimelineNode = useCallback(
    (step: CulinaryStep, idx: number) => (
      <TimelineNode
        key={idx}
        idx={idx}
        name={step.name}
        isActive={idx === activeStepIdx}
        isDone={idx < activeStepIdx}
        onPress={handleTimelinePress}
      />
    ),
    [activeStepIdx, handleTimelinePress],
  );

  const playPauseButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.playPauseBtn,
      isTimerRunning ? styles.pauseColor : styles.playColor,
      pressed && styles.btnPressed,
    ],
    [isTimerRunning],
  );

  const playPauseTextStyle = useMemo(
    () => [styles.playPauseText, isTimerRunning && styles.pauseText],
    [isTimerRunning],
  );

  const nextStepButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.nextStepBtn,
      !checklistChecked && styles.nextDisabled,
      pressed && checklistChecked && styles.btnPressed,
    ],
    [checklistChecked],
  );

  const nextStepButtonTextStyle = useMemo(
    () => [
      styles.nextStepBtnText,
      !checklistChecked && styles.nextBtnTextDisabled,
    ],
    [checklistChecked],
  );

  const nextStepIconName = useMemo(
    () =>
      activeStepIdx + 1 < steps.length
        ? ("arrow-forward" as const)
        : ("trophy" as const),
    [activeStepIdx, steps.length],
  );

  return (
    <View style={styles.container}>
      {/* Target Temperature Badge */}
      {targetTemp && (
        <View style={styles.tempBadge}>
          <Text style={styles.tempBadgeLabel}>TARGET TEMPERATURE</Text>
          <View style={styles.tempRowLayout}>
            <Ionicons name="flame" size={18} color={colors.intermediate} />
            <Text style={styles.tempBadgeVal}>{targetTemp}</Text>
          </View>
        </View>
      )}

      {/* Steps List Overview */}
      <View style={styles.stepsTimeline}>
        <Text style={styles.guideTitle}>PRACTICE STEPS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScroll}
        >
          {steps.map(renderTimelineNode)}
        </ScrollView>
      </View>

      {/* Active Step Panel */}
      {currentStep && (
        <View style={styles.activeStepCard}>
          <Text style={styles.stepTitle}>{currentStep.name}</Text>

          {/* Active Timer Display */}
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Pressable style={playPauseButtonStyle} onPress={toggleTimer}>
              <Text style={playPauseTextStyle}>
                {isTimerRunning ? "Pause" : "Start Timer"}
              </Text>
            </Pressable>
          </View>

          {/* Sensory Checklist Checkbox */}
          <View style={styles.sensoryBox}>
            <View style={styles.sensoryRowLayout}>
              <Ionicons name="eye" size={14} color={colors.intermediate} />
              <Text style={styles.sensoryTitle}>
                SENSORY CHECKLIST (FIRST PRINCIPLES)
              </Text>
            </View>
            <Text style={styles.sensoryDescription}>
              Don't just wait for the timer. Inspect your prep physically and
              verify:
            </Text>
            <Pressable
              style={[
                styles.checkboxRow,
                checklistChecked && styles.checkboxRowChecked,
              ]}
              onPress={handleCheckboxToggle}
            >
              <View
                style={[
                  styles.checkbox,
                  checklistChecked && styles.checkboxChecked,
                ]}
              >
                {checklistChecked && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text
                style={[
                  styles.checkboxText,
                  checklistChecked && styles.checkboxTextChecked,
                ]}
              >
                {currentStep.sensoryCheck}
              </Text>
            </Pressable>
          </View>

          {/* Action Footer */}
          <Pressable
            style={nextStepButtonStyle}
            onPress={nextStep}
            disabled={!checklistChecked}
          >
            <View style={styles.rowLayout}>
              <Text style={nextStepButtonTextStyle}>
                {activeStepIdx + 1 < steps.length
                  ? "Next Step"
                  : "Complete Routine"}
              </Text>
              <Ionicons
                name={nextStepIconName}
                size={18}
                color={colors.white}
              />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

interface TimelineNodeProps {
  idx: number;
  name: string;
  isActive: boolean;
  isDone: boolean;
  onPress: (idx: number) => void;
}

const TimelineNode = React.memo(
  ({ idx, name, isActive, isDone, onPress }: TimelineNodeProps) => {
    const handlePress = useCallback(() => {
      onPress(idx);
    }, [idx, onPress]);

    const nodeStyle = useMemo(
      () => [
        styles.timelineNode,
        isActive && styles.activeNode,
        isDone && styles.doneNode,
      ],
      [isActive, isDone],
    );

    const textStyle = useMemo(
      () => [
        styles.nodeText,
        isActive && styles.activeNodeText,
        isDone && styles.doneNodeText,
      ],
      [isActive, isDone],
    );

    return (
      <Pressable style={nodeStyle} onPress={handlePress}>
        <Text style={textStyle}>
          {isDone ? (
            <FontAwesome6
              name="check-circle"
              size={12}
              color={colors.success}
            />
          ) : (
            `${idx + 1}.`
          )}{" "}
          {name}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  tempRowLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.xs,
  },
  sensoryRowLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.xs,
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tempBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.card,
  },
  tempBadgeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  tempBadgeVal: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.intermediate,
    marginTop: spacing.xs,
  },
  stepsTimeline: {
    marginBottom: spacing.lg,
  },
  guideTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  timelineScroll: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  timelineNode: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  activeNode: {
    backgroundColor: colors.intermediateDim,
    borderColor: colors.intermediate,
  },
  doneNode: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  nodeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  activeNodeText: {
    color: colors.intermediate,
  },
  doneNodeText: {
    color: colors.success,
  },
  activeStepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timerText: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: fontWeight.heavy,
    marginBottom: spacing.md,
  },
  playPauseBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  playColor: {
    backgroundColor: colors.accent,
  },
  pauseColor: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  playPauseText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  pauseText: {
    color: colors.textPrimary,
  },
  btnPressed: {
    opacity: 0.8,
  },
  sensoryBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  sensoryTitle: {
    fontSize: fontSize.xs,
    color: colors.intermediate,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  sensoryDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  checkboxRowChecked: {
    borderColor: colors.success,
    backgroundColor: colors.successDim,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 14,
    lineHeight: 16,
  },
  checkboxText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    flex: 1,
  },
  checkboxTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  nextStepBtn: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.card,
  },
  nextDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
  nextStepBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  nextBtnTextDisabled: {
    color: colors.textTertiary,
  },
});
