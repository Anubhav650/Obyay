import React, { memo, useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { TechniqueStatus } from '../types/models';
import { colors, spacing, fontSize, fontWeight } from '../theme/tokens';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  status: TechniqueStatus;
}

function SwipeableRowComponent({
  children,
  onSwipeRight,
  onSwipeLeft,
  status,
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const hapticFired = useRef<'left' | 'right' | null>(null);

  const close = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderLeftActions = useCallback(() => {
    if (status !== 'pending') return null;
    return (
      <View style={[styles.actionContainer, styles.leftAction]}>
        <Text style={styles.actionIcon}>✓</Text>
        <Text style={styles.actionLabel}>Master</Text>
      </View>
    );
  }, [status]);

  const renderRightActions = useCallback(() => {
    if (status !== 'pending') return null;
    return (
      <View style={[styles.actionContainer, styles.rightAction]}>
        <Text style={styles.actionLabel}>Skip</Text>
        <Text style={styles.actionIcon}>✕</Text>
      </View>
    );
  }, [status]);

  const handleSwipeableOpen = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left' && onSwipeRight) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSwipeRight();
      } else if (direction === 'right' && onSwipeLeft) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSwipeLeft();
      }
      close();
    },
    [onSwipeRight, onSwipeLeft, close]
  );

  if (status !== 'pending') {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      leftThreshold={80}
      rightThreshold={80}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  leftAction: {
    backgroundColor: colors.successDim,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightAction: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionIcon: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});

export const SwipeableRow = memo(SwipeableRowComponent);
