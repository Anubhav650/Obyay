import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import Ionicons from "@expo/vector-icons/build/Ionicons";

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

const NewHobbyScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleCancelPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismiss();
  }, [router]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleCancelPress}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel and close modal"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleCancelPress]);

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
      setError("Please select your current level to build your learning path.");
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

  const handleHobbyNameChange = useCallback((text: string) => {
    setHobbyName(text);
    setError(null);
  }, []);

  const handleSuggestionPress = useCallback((item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHobbyName(item);
  }, []);

  const handleLevelSelect = useCallback((levelValue: GoalLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLevel(levelValue);
    setLevelValidationError(false);
    setError(null);
  }, []);

  const handleCuratedCardPress = useCallback(
    (curated: Hobby) => {
      handleCuratedPress(curated);
    },
    [handleCuratedPress],
  );

  const renderSuggestionChip = useCallback(
    (item: string) => {
      const isSelected = hobbyName.toLowerCase() === item.toLowerCase();
      return (
        <SuggestionChip
          key={item}
          item={item}
          isSelected={isSelected}
          onPress={handleSuggestionPress}
          disabled={isLoading}
        />
      );
    },
    [hobbyName, handleSuggestionPress, isLoading],
  );

  const renderLevelCard = useCallback(
    (level: (typeof LEVELS)[number]) => {
      const isSelected = selectedLevel === level.value;
      return (
        <LevelCard
          key={level.value}
          level={level}
          isSelected={isSelected}
          levelValidationError={levelValidationError}
          isLoading={isLoading}
          onPress={handleLevelSelect}
        />
      );
    },
    [selectedLevel, levelValidationError, isLoading, handleLevelSelect],
  );

  const renderCuratedHobby = useCallback(
    (curated: Hobby) => (
      <CuratedHobbyCard
        key={curated.id}
        hobby={curated}
        onPress={handleCuratedCardPress}
      />
    ),
    [handleCuratedCardPress],
  );

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }],
    [insets.bottom],
  );

  const sectionLabelStyle = useMemo(
    () => [
      styles.sectionLabel,
      levelValidationError && styles.errorTextColored,
    ],
    [levelValidationError],
  );

  const footerStyle = useMemo(
    () => [
      styles.footer,
      { paddingBottom: Math.max(insets.bottom, spacing.base) },
    ],
    [insets.bottom],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
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
            onChangeText={handleHobbyNameChange}
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
            {SUGGESTED_HOBBIES.map(renderSuggestionChip)}
          </ScrollView>
        </View>

        {/* Level Selector */}
        <View style={styles.section}>
          <Text style={sectionLabelStyle}>What is your current level?</Text>
          <View style={styles.levelGrid}>{LEVELS.map(renderLevelCard)}</View>
          {levelValidationError && (
            <View style={styles.inlineErrorContainer}>
              <Text style={styles.inlineErrorText}>
                ⚠️ Please select your level above.
              </Text>
            </View>
          )}
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

        {/* Curated Suggestions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Or start with a curated roadmap
          </Text>
          {CURATED_HOBBIES.map(renderCuratedHobby)}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={footerStyle}>
        <SubmitButton
          onPress={handleSubmit}
          disabled={!canSubmit}
          isLoading={isLoading}
          loadingMsgIndex={loadingMsgIndex}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

interface SuggestionChipProps {
  item: string;
  isSelected: boolean;
  onPress: (item: string) => void;
  disabled?: boolean;
}

const SuggestionChip = React.memo(
  ({ item, isSelected, onPress, disabled }: SuggestionChipProps) => {
    const handlePress = useCallback(() => {
      if (!disabled) {
        onPress(item);
      }
    }, [onPress, item, disabled]);

    return (
      <Pressable
        style={[
          styles.suggestionChip,
          isSelected && styles.suggestionChipSelected,
        ]}
        onPress={handlePress}
        disabled={disabled}
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
  },
);

interface LevelCardProps {
  level: (typeof LEVELS)[number];
  isSelected: boolean;
  levelValidationError: boolean;
  isLoading: boolean;
  onPress: (levelValue: GoalLevel) => void;
}

const getLevelCardShadow = (color: string) => ({
  shadowColor: color,
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 } as const,
  elevation: Platform.OS === "android" ? 0 : 6,
});

const LevelCard = React.memo(
  ({
    level,
    isSelected,
    levelValidationError,
    isLoading,
    onPress,
  }: LevelCardProps) => {
    const color = getLevelColor(level.value);
    const dimColor = getLevelDimColor(level.value);

    const handlePress = useCallback(() => {
      if (!isLoading) {
        onPress(level.value);
      }
    }, [isLoading, onPress, level.value]);

    const cardStyle = useMemo(
      () => [
        styles.levelCard,
        {
          backgroundColor: isSelected ? dimColor : colors.surface,
          borderColor: isSelected
            ? color
            : levelValidationError
              ? colors.error
              : colors.borderSubtle,
        },
        isSelected && getLevelCardShadow(color),
      ],
      [isSelected, dimColor, color, levelValidationError],
    );

    const accessibilityState = useMemo(
      () => ({ selected: isSelected }),
      [isSelected],
    );
    const iconStyle = useMemo(() => [styles.levelIcon, { color }], [color]);
    const labelStyle = useMemo(
      () => [
        styles.levelLabel,
        { color: isSelected ? color : colors.textPrimary },
      ],
      [isSelected, color],
    );

    return (
      <Pressable
        style={cardStyle}
        onPress={handlePress}
        accessibilityRole="radio"
        accessibilityState={accessibilityState}
        accessibilityLabel={`${level.label}: ${level.subtitle}`}
      >
        <Ionicons name={level.icon as any} style={iconStyle} />
        <Text style={labelStyle}>{level.label}</Text>
        <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
      </Pressable>
    );
  },
);

interface SubmitButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  loadingMsgIndex: number;
}

const SubmitButton = React.memo(
  ({ onPress, disabled, isLoading, loadingMsgIndex }: SubmitButtonProps) => {
    const getStyle = useCallback(
      ({ pressed }: { pressed: boolean }) => [
        styles.submitButton,
        disabled && !isLoading && styles.submitDisabled,
        pressed && !disabled && styles.submitPressed,
      ],
      [disabled, isLoading],
    );

    const textStyle = useMemo(
      () => [styles.submitText, disabled && styles.submitTextDisabled],
      [disabled],
    );

    return (
      <Pressable
        style={getStyle}
        onPress={onPress}
        disabled={disabled}
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
          <Text style={textStyle}>Generate Plan</Text>
        )}
      </Pressable>
    );
  },
);

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
  errorTextColored: {
    color: colors.error,
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
    borderRadius: radii.card,
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
    marginBottom: spacing.xl,
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
    borderRadius: radii.pill,
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
    transform: [{ scale: 0.95 }],
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  submitTextDisabled: {
    color: colors.textTertiary,
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
    color: colors.accentDark,
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
    borderColor: "rgba(200, 32, 20, 0.2)",
  },
  inlineErrorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

export default NewHobbyScreen;
