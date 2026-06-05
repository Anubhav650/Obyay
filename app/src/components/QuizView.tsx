import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radii, fontSize, fontWeight, shadows, animation } from '../theme/tokens';
import type { QuizQuestion } from '../types/models';

interface QuizViewProps {
  quiz: QuizQuestion;
}

export function QuizView({ quiz }: QuizViewProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const shakeOffset = useSharedValue(0);

  if (!quiz) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No quiz generated for this technique.</Text>
      </View>
    );
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedIdx(idx);
    setIsAnswered(true);

    if (idx === quiz.correctIndex) {
      // Correct!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Incorrect!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Shake animation
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIdx(null);
    setIsAnswered(false);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Text style={styles.questionText}>{quiz.question}</Text>

      <View style={styles.optionsList}>
        {quiz.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrectOption = idx === quiz.correctIndex;
          
          let optionStyle: any = styles.optionButton;
          let textStyle: any = styles.optionText;

          if (isAnswered) {
            if (isCorrectOption) {
              optionStyle = [styles.optionButton, styles.correctOption];
              textStyle = [styles.optionText, styles.correctText];
            } else if (isSelected) {
              optionStyle = [styles.optionButton, styles.incorrectOption];
              textStyle = [styles.optionText, styles.incorrectText];
            } else {
              optionStyle = [styles.optionButton, styles.disabledOption];
              textStyle = [styles.optionText, styles.disabledText];
            }
          } else {
            optionStyle = isSelected ? [styles.optionButton, styles.selectedOption] : styles.optionButton;
          }

          return (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                optionStyle,
                pressed && !isAnswered && styles.optionPressed,
              ]}
              onPress={() => handleSelectOption(idx)}
              disabled={isAnswered}
            >
              <View style={styles.optionRow}>
                <View style={[
                  styles.badge,
                  isAnswered && isCorrectOption && styles.badgeCorrect,
                  isAnswered && isSelected && !isCorrectOption && styles.badgeIncorrect
                ]}>
                  <Text style={[
                    styles.badgeText,
                    isAnswered && (isCorrectOption || isSelected) && styles.badgeTextAnswered
                  ]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={textStyle}>{option}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Explanation Banner */}
      {isAnswered && (
        <Animated.View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>
            {selectedIdx === quiz.correctIndex ? '🎉 Correct!' : '❌ Incorrect'}
          </Text>
          <Text style={styles.explanationText}>{quiz.explanation}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Retry Quiz</Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    width: '100%',
  },
  questionText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  badgeIncorrect: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  badgeTextAnswered: {
    color: colors.bg,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  selectedOption: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.successDim,
  },
  correctText: {
    color: colors.success,
    fontWeight: fontWeight.semibold,
  },
  incorrectOption: {
    borderColor: colors.error,
    backgroundColor: colors.errorDim,
  },
  incorrectText: {
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textTertiary,
  },
  optionPressed: {
    transform: [{ scale: animation.buttonActiveScale }],
    borderColor: colors.accent,
  } as ViewStyle,
  explanationBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'flex-start',
  },
  explanationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  resetButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  buttonPressed: {
    transform: [{ scale: animation.buttonActiveScale }],
  } as ViewStyle,
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
});
