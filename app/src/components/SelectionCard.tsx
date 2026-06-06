import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, fontSize, fontWeight } from "../theme/tokens";
import { Ionicons } from "@expo/vector-icons";

interface SelectionCardProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: string;
}

export function SelectionCard({
  label,
  isSelected,
  onPress,
  icon,
}: SelectionCardProps) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {label}
      </Text>
      {icon ? (
        <Ionicons
          name={icon as any}
          size={20}
          color={isSelected ? colors.accent : colors.textSecondary}
        />
      ) : (
        isSelected && (
          <Ionicons name="checkmark" size={18} color={colors.accentLight} />
        )
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 56,
  },
  cardSelected: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
  },
  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  checkIcon: {
    fontSize: fontSize.base,
    color: colors.accentLight,
    fontWeight: fontWeight.bold,
  },
  icon: {
    fontSize: fontSize.lg,
  },
});
