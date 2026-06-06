import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
  animation,
  lineHeight,
  getLevelColor,
  getLevelDimColor,
  getLevelGlowColor,
} from "../src/theme/tokens";
import { saveProfile } from "../src/store/hobbyStore";
import { useHobbies, getErrorMessage } from "../src/hooks/useHobbies";
import type { GoalLevel } from "../src/types/models";
import { LEVELS, LOADING_MESSAGES } from "../src/constants";
import { Ionicons } from "@expo/vector-icons";

const SUGGESTED_HOBBIES = [
  "Guitar",
  "Chess",
  "Watercolor",
  "Bouldering",
  "Sourdough Baking",
  "Running",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createHobby } = useHobbies();

  const [step, setStep] = useState(1); // 1 = Hobby, 2 = Level, 3 = Loading/Error
  const [hobbyName, setHobbyName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading status messages cycling
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setLoadingMsgIndex(0);
      intervalRef.current = setInterval(() => {
        setLoadingMsgIndex((prev) =>
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
        );
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  // Transition shared value
  const progressShared = useSharedValue(0.33);

  const handleNextFromHobby = useCallback(() => {
    if (!hobbyName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
    progressShared.value = withSpring(0.66, animation.spring);
  }, [hobbyName, progressShared]);

  const handleBackToHobby = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
    progressShared.value = withSpring(0.33, animation.spring);
  }, [progressShared]);

  const handleGenerateRoadmap = useCallback(
    async (level: GoalLevel) => {
      setSelectedLevel(level);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep(3);
      progressShared.value = withSpring(1.0, animation.spring);
      setIsLoading(true);
      setError(null);

      try {
        // Create profile first so check on home screen succeeds
        await saveProfile({
          roles: [],
          goals: [],
          interests: [hobbyName.trim()],
          learningPreferences: [],
        });

        // Fetch plan from Gemini and save
        const hobby = await createHobby(hobbyName.trim(), level);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsLoading(false);

        //pass isHobbyCreatedFromOnboarding flag to hobby screen so that it can trigger onboarding completion modal
        router.replace({
          pathname: `/hobby/${hobby.id}`,
          params: { isHobbyCreatedFromOnboarding: "true" },
        });
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(getErrorMessage(err));
        setIsLoading(false);
      }
    },
    [hobbyName, createHobby, progressShared, router]
  );

  const handleRetry = useCallback(() => {
    if (selectedLevel) {
      handleGenerateRoadmap(selectedLevel);
    }
  }, [selectedLevel, handleGenerateRoadmap]);

  const handleBackToStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
    progressShared.value = withSpring(0.33, animation.spring);
  }, [progressShared]);

  const handleSuggestionPress = useCallback((item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHobbyName(item);
  }, []);

  // Progress line style
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value * 100}%`,
  }));

  const renderSuggestionChip = useCallback(
    (item: string) => {
      const isSelected = hobbyName.toLowerCase() === item.toLowerCase();
      return (
        <SuggestionChip
          key={item}
          item={item}
          isSelected={isSelected}
          onPress={handleSuggestionPress}
        />
      );
    },
    [hobbyName, handleSuggestionPress]
  );

  const renderLevelCard = useCallback(
    (level: typeof LEVELS[number]) => (
      <LevelCard
        key={level.value}
        level={level}
        onPress={handleGenerateRoadmap}
      />
    ),
    [handleGenerateRoadmap]
  );

  const retryButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.continueButton,
      styles.retryButton,
      pressed && styles.buttonPressed,
    ],
    []
  );

  const headerStyle = useMemo(
    () => [styles.header, { paddingTop: Math.max(insets.top, spacing.base) }],
    [insets.top]
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: Math.max(insets.bottom, spacing.base) + spacing.xl },
    ],
    [insets.bottom]
  );

  const continueButtonTextStyle = useMemo(
    () => [styles.continueButtonText],
    []
  );

  // Render Hobby Input Step
  const renderHobbyStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>What do you want to learn?</Text>
      <Text style={styles.subtitle}>
        Enter any hobby, instrument, or skill. We'll generate a personalized
        active practice roadmap for you.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Acoustic Guitar, Chess, Sourdough..."
        placeholderTextColor={colors.textDisabled}
        value={hobbyName}
        onChangeText={setHobbyName}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={60}
      />

      <Text style={styles.sectionLabel}>Popular Topics</Text>
      <View style={styles.suggestionsContainer}>
        {SUGGESTED_HOBBIES.map(renderSuggestionChip)}
      </View>

      <View style={styles.pushBottom} />

      <ContinueButton
        onPress={handleNextFromHobby}
        disabled={!hobbyName.trim()}
        label="Continue"
      />
    </View>
  );

  // Render Proficiency Select Step
  const renderLevelStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.backRow}>
        <Pressable style={styles.backTextButton} onPress={handleBackToHobby}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>How good are you at {hobbyName}?</Text>
      <Text style={styles.subtitle}>
        Select your current level. We will calibrate your roadmap and techniques
        accordingly.
      </Text>

      <View style={styles.levelGrid}>
        {LEVELS.map(renderLevelCard)}
      </View>
    </View>
  );

  // Render Loading / Error Step
  const renderLoadingStep = () => (
    <View style={[styles.stepContent, styles.centerContent]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={colors.accent}
            size="large"
            style={styles.spinner}
          />
          <Text style={styles.loadingTitle}>Generating Roadmap</Text>
          <Text style={styles.loadingSubtitle}>
            {LOADING_MESSAGES[loadingMsgIndex]}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Plan Generation Failed</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={retryButtonStyle}
            onPress={handleRetry}
          >
            <Text style={continueButtonTextStyle}>Try Again</Text>
          </Pressable>

          <Pressable
            style={styles.backToStartButton}
            onPress={handleBackToStart}
          >
            <Text style={styles.backToStartText}>Change Hobby or Level</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Progress Track */}
      <View style={headerStyle}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderHobbyStep()}
        {step === 2 && renderLevelStep()}
        {step === 3 && renderLoadingStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface SuggestionChipProps {
  item: string;
  isSelected: boolean;
  onPress: (item: string) => void;
}

const SuggestionChip = React.memo(({ item, isSelected, onPress }: SuggestionChipProps) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  return (
    <Pressable
      style={[
        styles.suggestionChip,
        isSelected && styles.suggestionChipSelected,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.suggestionText,
          isSelected && styles.suggestionTextSelected,
        ]}
      >
        {item}
      </Text>
    </Pressable>
  );
});

interface LevelCardProps {
  level: {
    value: GoalLevel;
    label: string;
    icon: string;
  };
  onPress: (level: GoalLevel) => void;
}

const LevelCard = React.memo(({ level, onPress }: LevelCardProps) => {
  const color = getLevelColor(level.value);
  const dimColor = getLevelDimColor(level.value);

  const handlePress = useCallback(() => {
    onPress(level.value);
  }, [onPress, level.value]);

  const cardStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.levelCard,
      styles.levelCardColors,
      pressed && { borderColor: color, backgroundColor: dimColor },
    ],
    [color, dimColor]
  );

  const iconStyle = useMemo(() => [styles.levelIcon, { color }], [color]);
  const labelStyle = useMemo(() => [styles.levelLabel, { color }], [color]);

  const levelDescription = useMemo(() => {
    switch (level.value) {
      case "beginner":
        return "Starting from scratch. Teach me the core foundations.";
      case "intermediate":
        return "I know the basics. Help me level up my skills.";
      case "advanced":
        return "I am already decent. Help me master advanced techniques.";
      default:
        return "";
    }
  }, [level.value]);

  return (
    <Pressable
      style={cardStyle}
      onPress={handlePress}
    >
      <View style={styles.levelCardHeader}>
        <Ionicons
          name={level.icon as any}
          style={iconStyle}
        />
        <Text style={labelStyle}>
          {level.label}
        </Text>
      </View>
      <Text style={styles.levelSubtitle}>
        {levelDescription}
      </Text>
    </Pressable>
  );
});

interface ContinueButtonProps {
  onPress: () => void;
  disabled: boolean;
  label: string;
}

const ContinueButton = React.memo(({ onPress, disabled, label }: ContinueButtonProps) => {
  const getStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.continueButton,
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
    ],
    [disabled]
  );

  const textStyle = useMemo(
    () => [
      styles.continueButtonText,
      disabled && styles.buttonTextDisabled,
    ],
    [disabled]
  );

  return (
    <Pressable
      style={getStyle}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={textStyle}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  stepContent: {
    flex: 1,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: lineHeight.lg,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: lineHeight.base,
  },
  input: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 56,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  suggestionTextSelected: {
    color: colors.accent,
  },
  pushBottom: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.base,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    ...shadows.card,
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: colors.accentDark,
    transform: [{ scale: 0.95 }],
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  backRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  backTextButton: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  levelGrid: {
    gap: spacing.base,
  },
  levelCard: {
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    minHeight: 100,
  },
  levelCardColors: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  levelCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  levelIcon: {
    fontSize: 24,
  },
  levelLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  levelSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginBottom: spacing.xl,
  },
  loadingTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  loadingSubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: lineHeight.base,
    marginBottom: spacing.xl,
  },
  retryButton: {
    width: "100%",
    minWidth: 200,
  },
  backToStartButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backToStartText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
