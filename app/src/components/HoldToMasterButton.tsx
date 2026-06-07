import React, { useCallback } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import FontAwesome6 from "@expo/vector-icons/FontAwesome5";
import {
  colors,
  radii,
  fontSize,
  fontWeight,
  animation,
} from "../theme/tokens";

interface HoldToMasterButtonProps {
  onComplete: () => void;
}

export const HoldToMasterButton = ({ onComplete }: HoldToMasterButtonProps) => {
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSpring(1, animation.spring);
    onComplete();
  }, [onComplete]);

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.95, animation.spring);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring);
  }, []);

  return (
    <Animated.View style={[styles.button, buttonStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={styles.contentRow}>
          <FontAwesome6 name="check-circle" size={20} color={colors.success} />
          <Text style={styles.text}>Master</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: radii.pill,
    height: 56,
    backgroundColor: colors.successDim,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: colors.success,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
