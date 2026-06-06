import React, { memo, useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import type { TechniqueStatus } from "../types/models";
import { colors, spacing, fontSize, fontWeight, radii } from "../theme/tokens";

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

  const close = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderLeftActions = useCallback(() => {
    if (status !== "pending") return null;
    return (
      <View style={[styles.actionContainer, styles.leftAction]}>
        <FontAwesome6
          name="check-circle"
          size={20}
          color={colors.textPrimary}
          style={{ marginBottom: 2, marginLeft: 4 }}
        />
        <Text style={styles.actionLabel}>Master</Text>
      </View>
    );
  }, [status]);

  const renderRightActions = useCallback(() => {
    if (status !== "pending") return null;
    return (
      <View style={[styles.actionContainer, styles.rightAction]}>
        <Ionicons
          name="close"
          size={24}
          color={colors.textPrimary}
          style={{ marginBottom: 2, marginLeft: 4 }}
        />
        <Text style={styles.actionLabel}>Skip</Text>
      </View>
    );
  }, [status]);

  const handleSwipeableOpen = useCallback(
    (direction: "left" | "right") => {
      if (direction === "left" && onSwipeRight) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSwipeRight();
      } else if (direction === "right" && onSwipeLeft) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSwipeLeft();
      }
      close();
    },
    [onSwipeRight, onSwipeLeft, close],
  );

  return (
    <View style={styles.rowContainer}>
      {status === "pending" ? (
        <View style={styles.swipeableWrapper}>
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
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  swipeableWrapper: {
    borderRadius: radii.md,
    overflow: "hidden",
  },
  actionContainer: {
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.base,
  },
  leftAction: {
    backgroundColor: colors.successDim,
    alignItems: "flex-start",
  },
  rightAction: {
    backgroundColor: "rgba(107, 114, 128, 0.15)",
    alignItems: "flex-end",
  },
  actionIcon: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
    marginLeft: 4,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});

export const SwipeableRow = memo(SwipeableRowComponent);
