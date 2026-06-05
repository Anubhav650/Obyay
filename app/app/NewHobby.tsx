import React, { useState, useCallback, useEffect, useRef } from "react";
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
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useHobbies, getErrorMessage } from "../src/hooks/useHobbies";
import type { GoalLevel, Hobby } from "../src/types/models";
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
} from "../src/theme/tokens";
import { LEVELS, LOADING_MESSAGES } from "../src/constants";
import { CURATED_HOBBIES } from "../src/constants/curatedHobbies";
import { CuratedHobbyCard } from "../src/components/CuratedHobbyCard";

const SUGGESTED_HOBBIES = [
  "Guitar",
  "Chess",
  "Ukulele",
  "Watercolor",
  "Bouldering",
  "Cooking",
  "Python",
  "Gardening",
];

export default function NewHobbyScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.dismiss();
          }}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel and close modal"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation, router]);
  const { createHobby, importCuratedHobby } = useHobbies();

  const [hobbyName, setHobbyName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levelValidationError, setLevelValidationError] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSubmit = hobbyName.trim().length > 0 && !isLoading;

  // Cycle loading messages
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

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    if (!selectedLevel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLevelValidationError(true);
      setError(
        "Please select how serious you are to build your learning path.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setLevelValidationError(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const hobby = await createHobby(hobbyName.trim(), selectedLevel);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismiss();
      router.push(`/hobby/${hobby.id}`);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }, [canSubmit, hobbyName, selectedLevel, createHobby, router]);

  const handleCuratedPress = useCallback(
    async (curated: Hobby) => {
      setIsLoading(true);
      setError(null);
      setLevelValidationError(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const hobby = await importCuratedHobby(curated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.dismiss();
        router.push(`/hobby/${hobby.id}`);
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("Failed to start curated hobby.");
        setIsLoading(false);
      }
    },
    [importCuratedHobby, router],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            onChangeText={(text) => {
              setHobbyName(text);
              setError(null);
            }}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            editable={!isLoading}
            maxLength={60}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsScroll}
            contentContainerStyle={styles.suggestionsContainer}
            keyboardShouldPersistTaps="handled"
          >
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
                    if (!isLoading) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setHobbyName(item);
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select suggested hobby: ${item}`}
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
          </ScrollView>
        </View>

        {/* Level Selector */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              levelValidationError && { color: colors.error },
            ]}
          >
            How serious are you?
          </Text>
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
                      borderColor: isSelected
                        ? color
                        : levelValidationError
                          ? colors.error
                          : colors.borderSubtle,
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
                    if (!isLoading) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedLevel(level.value);
                      setLevelValidationError(false);
                      setError(null);
                    }
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
          {levelValidationError && (
            <View style={styles.inlineErrorContainer}>
              <Text style={styles.inlineErrorText}>
                ⚠️ Please select a seriousness level above.
              </Text>
            </View>
          )}
        </View>

        {/* Curated Suggestions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Or start with a curated roadmap
          </Text>
          {CURATED_HOBBIES.map((curated) => (
            <CuratedHobbyCard
              key={curated.id}
              hobby={curated}
              onPress={() => {
                if (!isLoading) {
                  handleCuratedPress(curated);
                }
              }}
            />
          ))}
        </View>

        {/* Error Message */}
        {error && !levelValidationError && (
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
    marginBottom: spacing["2xl"],
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: fontSize["2xl"],
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
    flexDirection: "row",
    gap: spacing.md,
  },
  levelCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    minHeight: 120,
    justifyContent: "center",
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
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: colors.errorDim,
    borderRadius: radii.md,
    padding: spacing.base,
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: "center",
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
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  suggestionsScroll: {
    marginTop: spacing.sm,
  },
  suggestionsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.base,
    paddingVertical: spacing.xs,
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
  inlineErrorContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.errorDim,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
  },
  inlineErrorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
