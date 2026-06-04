import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radii, fontSize, fontWeight, shadows, animation } from '../src/theme/tokens';
import { saveProfile } from '../src/store/hobbyStore';
import { OnboardingStep } from '../src/components/OnboardingStep';
import { SelectionCard } from '../src/components/SelectionCard';
import { Bubble } from '../src/components/Bubble';
import { ROLES, GOALS, TOPICS, PREFERENCES } from '../src/constants';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // ─── State for user answers ────────────────────────────────────────────────
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState('');

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState('');

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');

  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState('');

  // ─── Transition Shared Value ───────────────────────────────────────────────
  const progressShared = useSharedValue(1 / totalSteps);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const nextStep = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      progressShared.value = withSpring((step + 1) / totalSteps, animation.spring);
    } else {
      // Finalize and save
      const finalRoles = [...selectedRoles];
      if (otherRole.trim()) finalRoles.push(otherRole.trim());

      const finalGoals = [...selectedGoals];
      if (otherGoal.trim()) finalGoals.push(otherGoal.trim());

      const finalTopics = [...selectedTopics];
      const finalPrefs = [...selectedPrefs];

      await saveProfile({
        roles: finalRoles,
        goals: finalGoals,
        interests: finalTopics,
        learningPreferences: finalPrefs,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }
  }, [step, selectedRoles, otherRole, selectedGoals, otherGoal, selectedTopics, selectedPrefs, router, progressShared]);

  const prevStep = useCallback(() => {
    if (step > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((prev) => prev - 1);
      progressShared.value = withSpring((step - 1) / totalSteps, animation.spring);
    }
  }, [step, progressShared]);

  // ─── Selection Helpers ─────────────────────────────────────────────────────

  const toggleSelection = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedTopics([...selectedTopics, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const addCustomPref = () => {
    if (customPref.trim() && !selectedPrefs.includes(customPref.trim())) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedPrefs([...selectedPrefs, customPref.trim()]);
      setCustomPref('');
    }
  };

  // ─── Styles & Animated Style for Progress Bar ──────────────────────────────
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value * 100}%`,
  }));

  // ─── Content Renderers ─────────────────────────────────────────────────────

  const renderWelcome = () => (
    <OnboardingStep key="welcome" scrollable={false}>
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.largeIcon}>⚡</Text>
        </View>
        <Text style={styles.title}>Personalized learning for you</Text>
        <Text style={styles.subtitle}>
          Just 5 short steps to build a learning journey designed for you!
        </Text>
      </View>
    </OnboardingStep>
  );

  const renderRoles = () => {
    return (
      <OnboardingStep
        key="roles"
        title="What types of work do you do?"
        subtitle="Select all that apply. We'll use examples that are relevant to your role when helpful."
      >
        <View style={styles.rolesList}>
          {ROLES.map((role) => (
            <SelectionCard
              key={role}
              label={role}
              isSelected={selectedRoles.includes(role)}
              onPress={() => toggleSelection(role, selectedRoles, setSelectedRoles)}
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Other (optional)"
            placeholderTextColor={colors.textDisabled}
            value={otherRole}
            onChangeText={setOtherRole}
            autoCapitalize="words"
          />
        </View>
      </OnboardingStep>
    );
  };

  const renderGoals = () => {
    return (
      <OnboardingStep
        key="goals"
        title="What do you want to achieve?"
        subtitle="Select all that apply."
      >
        <View style={styles.rolesList}>
          {GOALS.map((goal) => (
            <SelectionCard
              key={goal}
              label={goal}
              isSelected={selectedGoals.includes(goal)}
              onPress={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Other (optional)"
            placeholderTextColor={colors.textDisabled}
            value={otherGoal}
            onChangeText={setOtherGoal}
            autoCapitalize="sentences"
          />
        </View>
      </OnboardingStep>
    );
  };

  const renderTopics = () => {
    return (
      <OnboardingStep
        key="topics"
        title="What topics interest you?"
        subtitle="Don't worry, the choice won't limit your experience."
      >
        <View style={styles.bubbleGrid}>
          {TOPICS.map((topic) => (
            <Bubble
              key={topic}
              label={topic}
              isSelected={selectedTopics.includes(topic)}
              onPress={() => toggleSelection(topic, selectedTopics, setSelectedTopics)}
            />
          ))}
        </View>

        <View style={styles.customInputContainer}>
          <TextInput
            style={[styles.input, styles.customInput]}
            placeholder="Other topics (optional)"
            placeholderTextColor={colors.textDisabled}
            value={customTopic}
            onChangeText={setCustomTopic}
            onSubmitEditing={addCustomTopic}
          />
          <Pressable style={styles.addButton} onPress={addCustomTopic}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </OnboardingStep>
    );
  };

  const renderPreferences = () => {
    return (
      <OnboardingStep
        key="preferences"
        title="What matters to you when learning?"
        subtitle="Select all that apply."
      >
        <View style={styles.bubbleGrid}>
          {PREFERENCES.map((pref) => (
            <Bubble
              key={pref}
              label={pref}
              isSelected={selectedPrefs.includes(pref)}
              onPress={() => toggleSelection(pref, selectedPrefs, setSelectedPrefs)}
            />
          ))}
        </View>

        <View style={styles.customInputContainer}>
          <TextInput
            style={[styles.input, styles.customInput]}
            placeholder="Other (optional)"
            placeholderTextColor={colors.textDisabled}
            value={customPref}
            onChangeText={setCustomPref}
            onSubmitEditing={addCustomPref}
          />
          <Pressable style={styles.addButton} onPress={addCustomPref}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </OnboardingStep>
    );
  };

  const renderSummary = () => {
    return (
      <OnboardingStep key="summary">
        <View style={[styles.centerContent, { marginTop: spacing.xl }]}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
            <Text style={[styles.largeIcon, { color: colors.success }]}>🗳️</Text>
          </View>
          <Text style={styles.title}>Noted!</Text>
          <Text style={styles.subtitle}>We'll try to satisfy all your learning needs</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryHeading}>Obyay currently supports:</Text>
          <View style={styles.supportList}>
            <Text style={styles.supportItem}>🔹 Bite-sized lessons</Text>
            <Text style={styles.supportItem}>🔹 Practice exercises</Text>
            <Text style={styles.supportItem}>🔹 Visual explanations</Text>
            <Text style={styles.supportItem}>🔹 Real-world examples</Text>
          </View>

          <Text style={[styles.summaryHeading, { marginTop: spacing.xl }]}>Obyay also supports:</Text>
          <View style={styles.supportList}>
            <Text style={styles.supportItem}>🔹 Clear learning path</Text>
            <Text style={styles.supportItem}>🔹 Regular review</Text>
            <Text style={styles.supportItem}>🔹 Personalized difficulty</Text>
          </View>
        </View>
      </OnboardingStep>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header / Progress Indicator */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.base) }]}>
        {step > 1 ? (
          <Pressable style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      {/* Screen Steps */}
      <View style={styles.content}>
        {step === 1 && renderWelcome()}
        {step === 2 && renderRoles()}
        {step === 3 && renderGoals()}
        {step === 4 && renderTopics()}
        {step === 5 && renderPreferences()}
        {step === 6 && renderSummary()}
      </View>

      {/* Bottom Action Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.base) + spacing.sm },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          onPress={nextStep}
        >
          <Text style={styles.continueButtonText}>
            {step === totalSteps ? 'GET STARTED' : 'CONTINUE'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  backPlaceholder: {
    width: 40,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: radii.full,
    backgroundColor: colors.warningDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  largeIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
    paddingHorizontal: spacing.sm,
  },
  rolesList: {
    gap: spacing.base,
    paddingBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    minHeight: 56,
  },
  bubbleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  customInput: {
    flex: 1,
  },
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryHeading: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  supportList: {
    gap: spacing.sm,
  },
  supportItem: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: fontSize.base * 1.4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.glow,
  },
  continueButtonPressed: {
    backgroundColor: colors.accentDark,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
