import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import type { PracticeToolConfig } from "../../types/models";

export const FocusPracticeTool = ({
  config,
  onCompletePractice,
}: {
  config?: PracticeToolConfig;
  onCompletePractice?: () => void;
}) => {
  const focusTimeSeconds = config?.focusTime || 600; // default 10 minutes
  const milestones = useMemo(
    () =>
      config?.milestones || [
        "Isolate the core sub-skill and practice it slowly.",
        "Identify mistakes and repeat to build correct muscle memory.",
        "Gradually increase speed once form is flawless.",
      ],
    [config?.milestones],
  );

  const reflectionQuestions = config?.reflectionQuestions || [
    "What was the trickiest part of this session?",
    "What adjustments will you make next time?",
  ];

  // Timer State
  const [timeLeft, setTimeLeft] = useState(focusTimeSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Milestones State
  const [checkedMilestones, setCheckedMilestones] = useState<
    Record<number, boolean>
  >({});

  // Reflection State
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText1, setReflectionText1] = useState("");
  const [reflectionText2, setReflectionText2] = useState("");

  // Reset timer on config change
  useEffect(() => {
    setTimeLeft(focusTimeSeconds);
    setIsTimerRunning(false);
    setCheckedMilestones({});
    setShowReflection(false);
    setReflectionText1("");
    setReflectionText2("");
  }, [focusTimeSeconds]);

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowReflection(true); // Unlock reflection immediately
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

  const resetTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning(false);
    setTimeLeft(focusTimeSeconds);
  }, [focusTimeSeconds]);

  const handleMilestonePress = useCallback((idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedMilestones((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }, []);

  const handleSubmitReflection = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    if (onCompletePractice) {
      onCompletePractice();
    }
  }, [onCompletePractice]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleReflectionText1Change = useCallback((text: string) => {
    setReflectionText1(text);
  }, []);

  const handleReflectionText2Change = useCallback((text: string) => {
    setReflectionText2(text);
  }, []);

  const handleSkipToReflection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReflection(true);
  }, []);

  const handleBackToTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowReflection(false);
  }, []);

  const renderMilestone = useCallback(
    (item: string, idx: number) => (
      <MilestoneRow
        key={idx}
        idx={idx}
        item={item}
        isChecked={!!checkedMilestones[idx]}
        onPress={handleMilestonePress}
      />
    ),
    [checkedMilestones, handleMilestonePress],
  );

  const timerButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.timerBtn,
      isTimerRunning ? styles.pauseBtn : styles.startBtn,
      pressed && styles.btnPressed,
    ],
    [isTimerRunning],
  );

  const timerButtonTextStyle = useMemo(
    () => [styles.timerBtnText, isTimerRunning && styles.pauseBtnText],
    [isTimerRunning],
  );

  const submitButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.submitBtn,
      pressed && styles.btnPressed,
    ],
    [],
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {!showReflection ? (
        <View style={styles.practiceCard}>
          <Text style={styles.cardHeading}>DELIBERATE PRACTICE SESSION</Text>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerVal}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerSubtitle}>REMAINING FOCUS TIME</Text>
            <View style={styles.timerBtnRow}>
              <Pressable style={timerButtonStyle} onPress={toggleTimer}>
                <Text style={timerButtonTextStyle}>
                  {isTimerRunning ? "Pause" : "Start Focus"}
                </Text>
              </Pressable>
              <Pressable style={styles.resetBtn} onPress={resetTimer}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </Pressable>
            </View>
          </View>

          {/* Milestones Checklists */}
          <View style={styles.milestonesSection}>
            <Text style={styles.sectionTitle}>PRACTICE MILESTONES</Text>
            {milestones.map(renderMilestone)}
          </View>

          {/* Quick unlock to skip timer for testing or fast logging */}
          <Pressable
            style={styles.reflectionUnlockLink}
            onPress={handleSkipToReflection}
          >
            <Text style={styles.reflectionUnlockText}>
              Skip directly to Reflection & Log →
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.practiceCard}>
          <View style={styles.reflectionHeader}>
            <Ionicons name="document-text" size={20} color={colors.success} />
            <Text
              style={[
                styles.cardHeading,
                styles.marginBottom0,
                { color: colors.success },
              ]}
            >
              LOG PRACTICE REFLECTION
            </Text>
          </View>
          <Text style={styles.reflectionIntro}>
            Reflecting on your errors is the fastest way to master a skill.
            Answer these brief cues:
          </Text>

          {/* Reflection Question 1 */}
          <View style={styles.reflectionField}>
            <Text style={styles.reflectionLabel}>
              {reflectionQuestions[0] || "What was difficult?"}
            </Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Type your notes here..."
              placeholderTextColor={colors.textDisabled}
              value={reflectionText1}
              onChangeText={handleReflectionText1Change}
              multiline
              blurOnSubmit
            />
          </View>

          {/* Reflection Question 2 */}
          <View style={styles.reflectionField}>
            <Text style={styles.reflectionLabel}>
              {reflectionQuestions[1] || "What is your adjustment?"}
            </Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Type your notes here..."
              placeholderTextColor={colors.textDisabled}
              value={reflectionText2}
              onChangeText={handleReflectionText2Change}
              multiline
              blurOnSubmit
            />
          </View>

          <Pressable style={submitButtonStyle} onPress={handleSubmitReflection}>
            <Text style={styles.submitBtnText}>
              Complete & Save Practice Log
            </Text>
          </Pressable>

          <Pressable style={styles.backBtn} onPress={handleBackToTimer}>
            <Text style={styles.backBtnText}>Back to Timer</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

interface MilestoneRowProps {
  idx: number;
  item: string;
  isChecked: boolean;
  onPress: (idx: number) => void;
}

const MilestoneRow = React.memo(
  ({ idx, item, isChecked, onPress }: MilestoneRowProps) => {
    const handlePress = useCallback(() => {
      onPress(idx);
    }, [idx, onPress]);

    const rowStyle = useMemo(
      () => [styles.milestoneRow, isChecked && styles.milestoneRowChecked],
      [isChecked],
    );

    const checkboxStyle = useMemo(
      () => [styles.checkbox, isChecked && styles.checkboxChecked],
      [isChecked],
    );

    const textStyle = useMemo(
      () => [styles.milestoneText, isChecked && styles.milestoneTextChecked],
      [isChecked],
    );

    return (
      <Pressable style={rowStyle} onPress={handlePress}>
        <View style={checkboxStyle}>
          {isChecked && (
            <Ionicons name="checkmark" size={12} color={colors.white} />
          )}
        </View>
        <Text style={textStyle}>{item}</Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  practiceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  cardHeading: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  marginBottom0: {
    marginBottom: 0,
  },
  timerContainer: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  timerVal: {
    color: colors.textPrimary,
    fontSize: 44,
    fontWeight: fontWeight.heavy,
  },
  timerSubtitle: {
    color: colors.textDisabled,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  timerBtnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  timerBtn: {
    flex: 2,
    borderRadius: radii.pill,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: colors.accent,
  },
  pauseBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  timerBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  pauseBtnText: {
    color: colors.textPrimary,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  milestonesSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  milestoneRowChecked: {
    borderColor: colors.success,
    backgroundColor: colors.successDim,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 12,
    lineHeight: 14,
  },
  milestoneText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    flex: 1,
  },
  milestoneTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  reflectionUnlockLink: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
  },
  reflectionUnlockText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  reflectionIntro: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.base,
    marginBottom: spacing.lg,
  },
  reflectionField: {
    marginBottom: spacing.lg,
  },
  reflectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reflectionInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
    marginTop: spacing.md,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  backBtn: {
    alignSelf: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  backBtnText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
