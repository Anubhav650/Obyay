import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
  animation,
} from "../theme/tokens";
import type { Flashcard } from "../types/models";

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

export function FlashcardView({ flashcards }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFlipped = useSharedValue(0); // 0 = front, 1 = back
  const [cardSide, setCardSide] = useState<"front" | "back">("front");

  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No flashcards generated for this technique.
        </Text>
      </View>
    );
  }

  const activeCard = flashcards[currentIndex];

  const triggerFlipHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const _setCardSide = (targetValue: number) => {
    setCardSide(targetValue === 0 ? "front" : "back");
  };

  const handleFlip = () => {
    triggerFlipHaptic();
    const targetValue = isFlipped.value === 0 ? 1 : 0;
    isFlipped.value = withTiming(targetValue, { duration: 400 }, () => {});
    _setCardSide(targetValue);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // If flipped, flip back first, then change index
    if (isFlipped.value === 1) {
      isFlipped.value = withTiming(0, { duration: 250 }, () => {
        scheduleOnRN(() => {
          setCardSide("front");
          setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        });
      });
    } else {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateYValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
    const opacityValue = interpolate(isFlipped.value, [0, 0.5, 1], [1, 0, 0]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateYValue}deg` }],
      opacity: opacityValue,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateYValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
    const opacityValue = interpolate(isFlipped.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateYValue}deg` }],
      opacity: opacityValue,
    };
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFlip} style={styles.cardContainer}>
        {/* Front Face */}
        <Animated.View
          style={[styles.card, styles.frontCard, frontAnimatedStyle]}
        >
          <Text style={styles.sideLabel}>QUESTION</Text>
          <Text style={styles.text}>{activeCard.front}</Text>
          <Text style={styles.hint}>Tap card to reveal answer</Text>
        </Animated.View>

        {/* Back Face */}
        <Animated.View
          style={[styles.card, styles.backCard, backAnimatedStyle]}
        >
          <Text style={styles.sideLabelBack}>ANSWER</Text>
          <Text style={styles.textBack}>{activeCard.back}</Text>
          <Text style={styles.hint}>Tap card to see question</Text>
        </Animated.View>
      </Pressable>

      {/* Pagination Controls */}
      <View style={styles.controls}>
        <Text style={styles.indexLabel}>
          Card {currentIndex + 1} of {flashcards.length}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next Card ➔</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    alignItems: "center",
    width: "100%",
  },
  cardContainer: {
    width: "100%",
    height: 220,
    position: "relative",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.card,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backfaceVisibility: "hidden",
  },
  frontCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
  },
  backCard: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
  },
  sideLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    position: "absolute",
    top: spacing.md,
  },
  sideLabelBack: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    position: "absolute",
    top: spacing.md,
  },
  text: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: spacing.sm,
  },
  textBack: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    position: "absolute",
    bottom: spacing.md,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.xs,
  },
  indexLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  nextButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  nextButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  buttonPressed: {
    transform: [{ scale: animation.buttonActiveScale }],
  } as ViewStyle,
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
});
