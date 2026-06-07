import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  Alert,
  Platform,
  ActionSheetIOS,
  StyleSheet,
  ScrollView,
  Text,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useHobbies } from "../src/hooks/useHobbies";
import { isOnboardingCompleted } from "../src/store/hobbyStore";
import { HobbyCard } from "../src/components/HobbyCard";
import { CuratedHobbyCard } from "../src/components/CuratedHobbyCard";
import { FAB } from "../src/components/FAB";
import { Skeleton } from "../src/components/Skeleton";
import type { Hobby } from "../src/types/models";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  letterSpacing,
} from "../src/theme/tokens";
import { CURATED_HOBBIES } from "../src/constants/curatedHobbies";

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hobbies, loading, deleteHobby, importCuratedHobby, refreshHobbies } =
    useHobbies();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useFocusEffect(
    useCallback(() => {
      refreshHobbies();
    }, [refreshHobbies]),
  );

  useEffect(() => {
    (async () => {
      const completed = await isOnboardingCompleted();
      if (!completed) {
        router.replace("/onboarding");
      } else {
        setCheckingProfile(false);
      }
    })();
  }, [router]);

  const handleAddPress = useCallback(() => {
    router.push("/NewHobby");
  }, [router]);

  const handleHobbyPress = useCallback(
    (hobby: Hobby) => {
      router.push(`/hobby/${hobby.id}`);
    },
    [router],
  );

  const handleCuratedPress = useCallback(
    async (curatedHobby: Hobby) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const imported = await importCuratedHobby(curatedHobby);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(`/hobby/${imported.id}`);
      } catch (err) {
        Alert.alert("Error", "Failed to start curated hobby");
      }
    },
    [importCuratedHobby, router],
  );

  const handleHobbyLongPress = useCallback(
    (hobby: Hobby) => {
      const doDelete = () => {
        Alert.alert(
          "Delete Hobby",
          `Are you sure you want to delete "${hobby.name}"? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteHobby(hobby.id),
            },
          ],
        );
      };

      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Delete Hobby"],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
            title: hobby.name,
          },
          (index) => {
            if (index === 1) doDelete();
          },
        );
      } else {
        doDelete();
      }
    },
    [deleteHobby],
  );

  const renderItem = useCallback(
    ({ item }: { item: Hobby }) => (
      <HobbyCard
        hobby={item}
        onPress={handleHobbyPress}
        onLongPress={handleHobbyLongPress}
      />
    ),
    [handleHobbyPress, handleHobbyLongPress],
  );

  const renderCuratedHobby = useCallback(
    (curated: Hobby) => (
      <CuratedHobbyCard
        key={curated.id}
        hobby={curated}
        onPress={handleCuratedPress}
      />
    ),
    [handleCuratedPress],
  );

  const keyExtractor = useCallback((item: Hobby) => item.id, []);

  const emptyScrollContentStyle = useMemo(
    () => [styles.emptyScrollContent, { paddingBottom: insets.bottom + 100 }],
    [insets.bottom],
  );

  const listStyle = useMemo(
    () => [styles.list, { paddingBottom: insets.bottom + 80 }],
    [insets.bottom],
  );

  if (loading || checkingProfile) {
    return (
      <View style={styles.container}>
        <Skeleton rows={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hobbies.length === 0 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={emptyScrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyHeader}>
            <Text style={styles.emptyEmoji}>🚀</Text>
            <Text style={styles.emptyTitle}>Start your journey</Text>
            <Text style={styles.emptySubtitle}>
              Select a pre-built roadmap below for instant learning, or tap the
              + button to build a custom hobby plan!
            </Text>
          </View>
          <View style={styles.curatedSection}>
            <Text style={styles.curatedTitle}>Curated Roadmaps</Text>
            {CURATED_HOBBIES.map(renderCuratedHobby)}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={hobbies}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={listStyle}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
      <FAB onPress={handleAddPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingTop: spacing.base,
  },
  scroll: {
    flex: 1,
  },
  emptyScrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing["4xl"],
    alignItems: "stretch",
  },
  emptyHeader: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
    paddingHorizontal: spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: letterSpacing.tight,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  curatedSection: {
    marginTop: spacing.base,
  },
  curatedTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.accentDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
