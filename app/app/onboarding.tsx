import React, { useState, useCallback, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
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
} from '../src/theme/tokens';
import { saveProfile } from '../src/store/hobbyStore';
import { useHobbies, getErrorMessage } from '../src/hooks/useHobbies';
import type { GoalLevel } from '../src/types/models';
import { LEVELS, LOADING_MESSAGES } from '../src/constants';

const SUGGESTED_HOBBIES = [
  'Guitar',
  'Chess',
  'Watercolor',
  'Bouldering',
  'Sourdough Baking',
  'Running',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createHobby } = useHobbies();

  const [step, setStep] = useState(1); // 1 = Hobby, 2 = Level, 3 = Loading/Error
  const [hobbyName, setHobbyName] = useState('');
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
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
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

  const handleNextFromHobby = () => {
    if (!hobbyName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
    progressShared.value = withSpring(0.66, animation.spring);
  };

  const handleBackToHobby = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
    progressShared.value = withSpring(0.33, animation.spring);
  };

  const handleGenerateRoadmap = async (level: GoalLevel) => {
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

      // Redirect directly to the roadmap details!
      router.replace(`/hobby/${hobby.id}`);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (selectedLevel) {
      handleGenerateRoadmap(selectedLevel);
    }
  };

  // Progress line style
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value * 100}%`,
  }));

  // Render Hobby Input Step
  const renderHobbyStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>What do you want to learn?</Text>
      <Text style={styles.subtitle}>
        Enter any hobby, instrument, or skill. We'll generate a personalized active practice roadmap for you.
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
        {SUGGESTED_HOBBIES.map((item) => {
          const isSelected = hobbyName.toLowerCase() === item.toLowerCase();
          return (
            <Pressable
              key={item}
              style={[
                styles.suggestionChip,
                isSelected && styles.suggestionChipSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHobbyName(item);
              }}
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
        })}
      </View>

      <View style={styles.pushBottom} />

      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          !hobbyName.trim() && styles.buttonDisabled,
          pressed && hobbyName.trim() && styles.buttonPressed,
        ]}
        onPress={handleNextFromHobby}
        disabled={!hobbyName.trim()}
      >
        <Text style={[styles.continueButtonText, !hobbyName.trim() && styles.buttonTextDisabled]}>
          Continue
        </Text>
      </Pressable>
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
        Select your current level. We will calibrate your roadmap and techniques accordingly.
      </Text>

      <View style={styles.levelGrid}>
        {LEVELS.map((level) => {
          const color = getLevelColor(level.value);
          const dimColor = getLevelDimColor(level.value);

          return (
            <Pressable
              key={level.value}
              style={({ pressed }) => [
                styles.levelCard,
                {
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.surface,
                },
                pressed && { borderColor: color, backgroundColor: dimColor },
              ]}
              onPress={() => handleGenerateRoadmap(level.value)}
            >
              <View style={styles.levelCardHeader}>
                <Text style={styles.levelIcon}>{level.icon}</Text>
                <Text style={[styles.levelLabel, { color }]}>{level.label}</Text>
              </View>
              <Text style={styles.levelSubtitle}>
                {level.value === 'beginner' && 'Starting from scratch. Teach me the core foundations.'}
                {level.value === 'intermediate' && 'I know the basics. Help me level up my skills.'}
                {level.value === 'advanced' && 'I am already decent. Help me master advanced techniques.'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // Render Loading / Error Step
  const renderLoadingStep = () => (
    <View style={[styles.stepContent, styles.centerContent]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" style={styles.spinner} />
          <Text style={styles.loadingTitle}>Generating Roadmap</Text>
          <Text style={styles.loadingSubtitle}>{LOADING_MESSAGES[loadingMsgIndex]}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Plan Generation Failed</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRetry}
          >
            <Text style={styles.continueButtonText}>Try Again</Text>
          </Pressable>

          <Pressable
            style={styles.backToStartButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(1);
              progressShared.value = withSpring(0.33, animation.spring);
            }}
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Progress Track */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.base) }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.base) + spacing.xl },
        ]}
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
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
    fontSize: fontSize['2xl'],
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
    fontSize: fontSize.lg,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
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
  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: lineHeight.base,
    marginBottom: spacing.xl,
  },
  retryButton: {
    width: '100%',
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
