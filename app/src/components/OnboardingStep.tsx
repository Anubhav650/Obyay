import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, lineHeight, letterSpacing } from '../theme/tokens';

interface OnboardingStepProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function OnboardingStep({
  title,
  subtitle,
  children,
  scrollable = true,
}: OnboardingStepProps) {
  const Container = scrollable ? ScrollView : View;
  const containerStyle = scrollable ? styles.scroll : styles.nonScroll;

  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={styles.cardContainer}
    >
      <Container
        style={containerStyle}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {title && <Text style={styles.questionTitle}>{title}</Text>}
        {subtitle && <Text style={styles.questionSubtitle}>{subtitle}</Text>}
        {children}
      </Container>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  nonScroll: {
    flex: 1,
  },
  questionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.obyayTeal,
    marginBottom: spacing.sm,
    letterSpacing: letterSpacing.tight,
  },
  questionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: fontSize.sm * 1.4,
  },
});
