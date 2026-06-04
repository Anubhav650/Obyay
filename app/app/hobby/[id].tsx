import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import type { Hobby, Technique, TechniqueStatus } from '../../src/types/models';
import { loadHobby, getProgress } from '../../src/store/hobbyStore';
import { useHobbies } from '../../src/hooks/useHobbies';
import { useTechniqueResources } from '../../src/hooks/useTechniqueResources';
import { ProgressRing } from '../../src/components/ProgressRing';
import { LevelBadge } from '../../src/components/LevelBadge';
import { TechniqueRow } from '../../src/components/TechniqueRow';
import { SwipeableRow } from '../../src/components/SwipeableRow';
import { VideoCard } from '../../src/components/VideoCard';
import { Skeleton } from '../../src/components/Skeleton';
import { Confetti } from '../../src/components/Confetti';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  lineHeight,
} from '../../src/theme/tokens';

// ─── Technique Sheet Content ─────────────────────────────────────────────────

function TechniqueSheetContent({
  technique,
  hobbyId,
  onUpdateStatus,
  onClose,
}: {
  technique: Technique;
  hobbyId: string;
  onUpdateStatus: (status: TechniqueStatus) => void;
  onClose: () => void;
}) {
  const { resources, loading, error } = useTechniqueResources(
    hobbyId,
    technique
  );
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetScrollView
      style={sheetStyles.scroll}
      contentContainerStyle={[
        sheetStyles.scrollContent,
        { paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={sheetStyles.headerRow}>
        <Text style={sheetStyles.name}>{technique.name}</Text>
        <Pressable
          style={sheetStyles.closeButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        >
          <Text style={sheetStyles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Why It Matters */}
      <View style={sheetStyles.section}>
        <Text style={sheetStyles.sectionLabel}>WHY IT MATTERS</Text>
        <Text style={sheetStyles.bodyText}>{technique.whyItMatters}</Text>
      </View>

      {/* Description */}
      <View style={sheetStyles.section}>
        <Text style={sheetStyles.sectionLabel}>DESCRIPTION</Text>
        <Text style={sheetStyles.bodyText}>{technique.description}</Text>
      </View>

      {/* Videos */}
      <View style={sheetStyles.section}>
        <Text style={sheetStyles.sectionLabel}>YOUTUBE VIDEOS</Text>
        {loading ? (
          <View style={sheetStyles.videoSkeleton}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={sheetStyles.videoSkeletonCard} />
            ))}
          </View>
        ) : error ? (
          <Text style={sheetStyles.errorText}>{error}</Text>
        ) : resources && resources.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sheetStyles.videosContainer}
          >
            {resources.map((resource) => (
              <VideoCard key={resource.videoId} resource={resource} />
            ))}
          </ScrollView>
        ) : (
          <View style={sheetStyles.noVideos}>
            <Text style={sheetStyles.noVideosText}>No videos found</Text>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    technique.searchQuery
                  )}`
                )
              }
            >
              <Text style={sheetStyles.searchLink}>Search YouTube manually →</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Status Buttons */}
      <View style={sheetStyles.actions}>
        {technique.status === 'pending' && (
          <>
            <Pressable
              style={({ pressed }) => [
                sheetStyles.actionButton,
                sheetStyles.masterButton,
                pressed && sheetStyles.actionPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUpdateStatus('mastered');
              }}
            >
              <Text style={sheetStyles.masterButtonText}>✓ Mark Mastered</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                sheetStyles.actionButton,
                sheetStyles.skipButton,
                pressed && sheetStyles.actionPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onUpdateStatus('skipped');
              }}
            >
              <Text style={sheetStyles.skipButtonText}>Skip This</Text>
            </Pressable>
          </>
        )}
        {(technique.status === 'mastered' || technique.status === 'skipped') && (
          <Pressable
            style={({ pressed }) => [
              sheetStyles.actionButton,
              sheetStyles.undoButton,
              pressed && sheetStyles.actionPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpdateStatus('pending');
            }}
          >
            <Text style={sheetStyles.undoButtonText}>↩ Undo</Text>
          </Pressable>
        )}
      </View>
    </BottomSheetScrollView>
  );
}

const sheetStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.base,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: lineHeight.base,
  },
  videoSkeleton: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  videoSkeletonCard: {
    width: 160,
    height: 150,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
  },
  videosContainer: {
    paddingRight: spacing.base,
  },
  noVideos: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noVideosText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  searchLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  actionPressed: {
    opacity: 0.8,
  },
  masterButton: {
    backgroundColor: colors.successDim,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  masterButtonText: {
    color: colors.success,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  skipButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  undoButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  undoButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { updateTechniqueStatus } = useHobbies();

  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  // Load hobby
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      const loaded = await loadHobby(id);
      setHobby(loaded);
      setLoading(false);

      if (loaded) {
        navigation.setOptions({ title: loaded.name });
      }
    })();
  }, [id, navigation]);

  const progress = useMemo(
    () => (hobby ? getProgress(hobby) : { total: 0, mastered: 0, skipped: 0, remaining: 0, percent: 0 }),
    [hobby]
  );

  const handleTechniquePress = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleStatusChange = useCallback(
    async (techniqueId: string, status: TechniqueStatus) => {
      if (!id) return;
      const prevPercent = progress.percent;
      const updated = await updateTechniqueStatus(id, techniqueId, status);
      if (updated) {
        setHobby(updated);
        const nextProgress = getProgress(updated);
        if (nextProgress.percent === 100 && prevPercent < 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowConfetti(true);
        }
        // Update the selected technique if it's the one that changed
        const updatedTechnique = updated.techniques.find((t) => t.id === techniqueId);
        if (updatedTechnique && selectedTechnique?.id === techniqueId) {
          setSelectedTechnique(updatedTechnique);
        }
      }
    },
    [id, updateTechniqueStatus, selectedTechnique, progress.percent]
  );

  const handleSheetStatusChange = useCallback(
    (status: TechniqueStatus) => {
      if (!selectedTechnique) return;
      handleStatusChange(selectedTechnique.id, status);
    },
    [selectedTechnique, handleStatusChange]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  const renderTechniqueItem = useCallback(
    ({ item }: { item: Technique }) => (
      <SwipeableRow
        status={item.status}
        onSwipeRight={() => handleStatusChange(item.id, 'mastered')}
        onSwipeLeft={() => handleStatusChange(item.id, 'skipped')}
      >
        <TechniqueRow
          technique={item}
          onPress={() => handleTechniquePress(item)}
        />
      </SwipeableRow>
    ),
    [handleStatusChange, handleTechniquePress]
  );

  const keyExtractor = useCallback((item: Technique) => item.id, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Skeleton rows={7} />
      </View>
    );
  }

  if (!hobby) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Hobby not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hobby.techniques}
        renderItem={renderTechniqueItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.hobbyName}>{hobby.name}</Text>
                <LevelBadge level={hobby.level} />
              </View>
              <ProgressRing progress={progress} size={64} />
            </View>
            <Text style={styles.summary}>{hobby.summary}</Text>
            <Text style={styles.progressLabel}>
              {progress.mastered} of {progress.total} mastered
              {progress.skipped > 0 && ` · ${progress.skipped} skipped`}
            </Text>
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>
                ← swipe to skip · swipe to master →
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Technique Detail Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedTechnique && hobby && (
            <TechniqueSheetContent
              technique={selectedTechnique}
              hobbyId={hobby.id}
              onUpdateStatus={handleSheetStatusChange}
              onClose={() => bottomSheetRef.current?.close()}
            />
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* Confetti Animation Overlay */}
      <Confetti active={showConfetti} onAnimationEnd={() => setShowConfetti(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.base,
  },
  hobbyName: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: lineHeight.base,
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
  swipeHint: {
    marginTop: spacing.base,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  swipeHintText: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  list: {
    paddingTop: spacing.xs,
  },
  sheetBackground: {
    backgroundColor: colors.surface,
  },
  sheetHandle: {
    backgroundColor: colors.sheetHandle,
    width: 40,
  },
  sheetContent: {
    flex: 1,
  },
});
