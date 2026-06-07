import React, { memo, useCallback } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import type { Resource } from "../types/models";
import { colors, spacing, radii, fontSize, fontWeight } from "../theme/tokens";

interface VideoCardProps {
  resource: Resource;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function VideoCardComponent({ resource }: VideoCardProps) {
  const handlePress = useCallback(() => {
    Linking.openURL(resource.url);
  }, [resource.url]);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`Watch ${resource.title} by ${resource.channelTitle}`}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: resource.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationChip}>
          <Text style={styles.durationText}>
            {formatDuration(resource.durationSec)}
          </Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {resource.title}
      </Text>
      <Text style={styles.channel} numberOfLines={1}>
        {resource.channelTitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    width: 160,
    height: 120,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: colors.surfaceElevated,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationChip: {
    position: "absolute",
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm / 2,
  },
  durationText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  channel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});

export const VideoCard = memo(VideoCardComponent);
