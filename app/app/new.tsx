import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHobbies, getErrorMessage } from '../src/hooks/useHobbies';
import type { GoalLevel } from '../src/types/models';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  lineHeight,
  getLevelColor,
  getLevelDimColor,
  getLevelGlowColor,
} from '../src/theme/tokens';

const LEVELS: { value: GoalLevel; icon: string; label: string; subtitle: string }[] = [
  { value: 'casual', icon: '🎮', label: 'Casual', subtitle: 'Just for fun' },
  { value: 'hobbyist', icon: '🎯', label: 'Hobbyist', subtitle: 'Get pretty good' },
  { value: 'serious', icon: '🏆', label: 'Serious', subtitle: 'Go deep' },
];

const LOADING_MESSAGES = [
  'Asking the experts…',
  'Ordering techniques…',
  'Almost there…',
];

export default function NewHobbyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createHobby } = useHobbies();

  const [hobbyName, setHobbyName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSubmit = hobbyName.trim().length > 0 && selectedLevel !== null && !isLoading;

  // Cycle loading messages
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

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !selectedLevel) return;

    setIsLoading(true);
    setError(null);

    try {
      const hobby = await createHobby(hobbyName.trim(), selectedLevel);
      router.replace(`/hobby/${hobby.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }, [canSubmit, hobbyName, selectedLevel, createHobby, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hobby Name Input */}
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="What do you want to learn?"
            placeholderTextColor={colors.textDisabled}
            value={hobbyName}
            onChangeText={setHobbyName}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            editable={!isLoading}
            maxLength={60}
          />
        </View>

        {/* Level Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How serious are you?</Text>
          <View style={styles.levelGrid}>
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.value;
              const color = getLevelColor(level.value);
              const dimColor = getLevelDimColor(level.value);
              const glowColor = getLevelGlowColor(level.value);

              return (
                <Pressable
                  key={level.value}
                  style={[
                    styles.levelCard,
                    {
                      backgroundColor: isSelected ? dimColor : colors.surface,
                      borderColor: isSelected ? color : colors.borderSubtle,
                    },
                    isSelected && {
                      shadowColor: color,
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 6,
                    },
                  ]}
                  onPress={() => {
                    if (!isLoading) setSelectedLevel(level.value);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${level.label}: ${level.subtitle}`}
                >
                  <Text style={styles.levelIcon}>{level.icon}</Text>
                  <Text
                    style={[
                      styles.levelLabel,
                      { color: isSelected ? color : colors.textPrimary },
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={handleSubmit}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.base) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Generate Plan"
        >
          {isLoading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.submitText}>
                {LOADING_MESSAGES[loadingMsgIndex]}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Generate Plan</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 64,
  },
  levelGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  levelCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    minHeight: 120,
    justifyContent: 'center',
  },
  levelIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  levelSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.errorDim,
    borderRadius: radii.md,
    padding: spacing.base,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    lineHeight: lineHeight.sm,
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  submitPressed: {
    backgroundColor: colors.accentDark,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
