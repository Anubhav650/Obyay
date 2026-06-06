import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import type { Hobby, Technique, TechniqueStatus } from "../../src/types/models";
import { loadHobby, getProgress } from "../../src/store/hobbyStore";
import { useHobbies } from "../../src/hooks/useHobbies";
import { useTechniqueResources } from "../../src/hooks/useTechniqueResources";
import { ProgressRing } from "../../src/components/ProgressRing";
import { LevelBadge } from "../../src/components/LevelBadge";
import { TechniqueRow } from "../../src/components/TechniqueRow";
import { SwipeableRow } from "../../src/components/SwipeableRow";
import { VideoCard } from "../../src/components/VideoCard";
import { Skeleton } from "../../src/components/Skeleton";
import { Confetti } from "../../src/components/Confetti";
import { HoldToMasterButton } from "../../src/components/HoldToMasterButton";
import { FlashcardView } from "../../src/components/FlashcardView";
import { QuizView } from "../../src/components/QuizView";
import { MetronomeTool } from "../../src/components/practice/MetronomeTool";
import { InteractiveChessBoard } from "../../src/components/practice/InteractiveChessBoard";
import { CameraGridOverlay } from "../../src/components/practice/CameraGridOverlay";
import { WorkoutTimer } from "../../src/components/practice/WorkoutTimer";
import { CulinaryTimer } from "../../src/components/practice/CulinaryTimer";
import { FocusPracticeTool } from "../../src/components/practice/FocusPracticeTool";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
  letterSpacing,
} from "../../src/theme/tokens";

// ─── Technique Sheet Content ─────────────────────────────────────────────────

const SKELETONS = [1, 2, 3];

function TechniqueSheetContent({
  technique,
  hobby,
  onUpdateStatus,
  onClose,
}: {
  technique: Technique;
  hobby: Hobby;
  onUpdateStatus: (status: TechniqueStatus) => void;
  onClose: () => void;
}) {
  const { resources, loading, error } = useTechniqueResources(
    hobby.id,
    technique,
  );
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<
    "lesson" | "practice" | "cards" | "quiz"
  >("lesson");

  useEffect(() => {
    setActiveTab("lesson");
  }, []);

  const hasCards = !!technique.flashcards && technique.flashcards.length > 0;
  const hasQuiz = !!technique.quiz;

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const handleTabPress = useCallback((tabId: typeof activeTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleCompletePractice = useCallback(() => {
    onUpdateStatus("mastered");
  }, [onUpdateStatus]);

  const handleManualSearch = useCallback(() => {
    Linking.openURL(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        technique.searchQuery
      )}`
    );
  }, [technique.searchQuery]);

  const handleSkipPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateStatus("skipped");
  }, [onUpdateStatus]);

  const handleUndoPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateStatus("pending");
  }, [onUpdateStatus]);

  const skipButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      sheetStyles.actionButton,
      sheetStyles.skipButton,
      pressed && sheetStyles.actionPressed,
    ],
    []
  );

  const undoButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      sheetStyles.actionButton,
      sheetStyles.undoButton,
      pressed && sheetStyles.actionPressed,
    ],
    []
  );

  const renderSkeletonCard = useCallback((i: number) => (
    <View key={i} style={sheetStyles.videoSkeletonCard} />
  ), []);

  const renderVideoCard = useCallback(
    (resource: any) => (
      <VideoCard key={resource.videoId} resource={resource} />
    ),
    []
  );

  const scrollContentStyle = useMemo(
    () => [sheetStyles.scrollContent, { paddingBottom: insets.bottom + 40 }],
    [insets.bottom]
  );

  return (
    <ScrollView
      style={sheetStyles.scroll}
      contentContainerStyle={scrollContentStyle}
      showsVerticalScrollIndicator={false}
    >
      <View style={sheetStyles.headerRow}>
        <Text style={sheetStyles.name}>{technique.name}</Text>
        <Pressable
          style={sheetStyles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        >
          <Text style={sheetStyles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Tab Filter Bar */}
      <View style={sheetStyles.tabBar}>
        <TabButton
          id="lesson"
          label="📚 Lesson"
          activeTab={activeTab}
          onPress={handleTabPress}
        />
        {technique.practiceTool && (
          <TabButton
            id="practice"
            label="⚡️ Practice"
            activeTab={activeTab}
            onPress={handleTabPress}
          />
        )}
        {hasCards && (
          <TabButton
            id="cards"
            label="🎴 Cards"
            activeTab={activeTab}
            onPress={handleTabPress}
          />
        )}
        {hasQuiz && (
          <TabButton
            id="quiz"
            label="❓ Quiz"
            activeTab={activeTab}
            onPress={handleTabPress}
          />
        )}
      </View>

      {/* Render selected format content */}
      {activeTab === "practice" && technique.practiceTool && (
        <View style={sheetStyles.practiceWrapper}>
          {hobby.category === "music" && (
            <MetronomeTool config={technique.practiceTool} />
          )}
          {hobby.category === "strategy" && (
            <InteractiveChessBoard config={technique.practiceTool} />
          )}
          {hobby.category === "arts" && (
            <CameraGridOverlay config={technique.practiceTool} />
          )}
          {hobby.category === "fitness" && (
            <WorkoutTimer config={technique.practiceTool} />
          )}
          {hobby.category === "culinary" && (
            <CulinaryTimer config={technique.practiceTool} />
          )}
          {hobby.category === "general" && (
            <FocusPracticeTool
              config={technique.practiceTool}
              onCompletePractice={handleCompletePractice}
            />
          )}
        </View>
      )}

      {activeTab === "lesson" && (
        <>
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
                {SKELETONS.map(renderSkeletonCard)}
              </View>
            ) : error ? (
              <Text style={sheetStyles.errorText}>{error}</Text>
            ) : resources && resources.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={sheetStyles.videosContainer}
              >
                {resources.map(renderVideoCard)}
              </ScrollView>
            ) : (
              <View style={sheetStyles.noVideos}>
                <Text style={sheetStyles.noVideosText}>No videos found</Text>
                <Pressable onPress={handleManualSearch}>
                  <Text style={sheetStyles.searchLink}>
                    Search YouTube manually →
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === "cards" && technique.flashcards && (
        <FlashcardView flashcards={technique.flashcards} />
      )}

      {activeTab === "quiz" && technique.quiz && (
        <QuizView quiz={technique.quiz} />
      )}

      {/* Status Buttons */}
      <View style={sheetStyles.actions}>
        {technique.status === "pending" && (
          <>
            <HoldToMasterButton onComplete={handleCompletePractice} />
            <Pressable
              style={skipButtonStyle}
              onPress={handleSkipPress}
            >
              <Text style={sheetStyles.skipButtonText}>Skip This</Text>
            </Pressable>
          </>
        )}
        {(technique.status === "mastered" ||
          technique.status === "skipped") && (
          <Pressable
            style={undoButtonStyle}
            onPress={handleUndoPress}
          >
            <Text style={sheetStyles.undoButtonText}>↩ Undo</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const sheetStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  practiceWrapper: {
    marginBottom: spacing.xl,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.lg,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    minHeight: 40,
  },
  activeTabButton: {
    backgroundColor: colors.surface,
    ...shadows.glow,
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  activeTabButtonText: {
    color: colors.accent,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: fontSize["2xl"],
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: "bold",
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
    flexDirection: "row",
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
    alignItems: "center",
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
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.base,
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  masterButton: {
    backgroundColor: colors.successDim,
    borderWidth: 1,
    borderColor: "rgba(13, 138, 110, 0.3)",
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

interface TabButtonProps {
  id: "lesson" | "practice" | "cards" | "quiz";
  label: string;
  activeTab: string;
  onPress: (id: "lesson" | "practice" | "cards" | "quiz") => void;
}

const TabButton = React.memo(({ id, label, activeTab, onPress }: TabButtonProps) => {
  const isActive = activeTab === id;
  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  const buttonStyle = useMemo(() => [
    sheetStyles.tabButton,
    isActive && sheetStyles.activeTabButton
  ], [isActive]);

  const textStyle = useMemo(() => [
    sheetStyles.tabButtonText,
    isActive && sheetStyles.activeTabButtonText
  ], [isActive]);

  return (
    <Pressable
      style={buttonStyle}
      onPress={handlePress}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
});

export default function HobbyDetailScreen() {
  const {
    hobbyId,
    isHobbyCreatedFromOnboarding: isHobbyCreatedFromOnboardingParam,
  } = useLocalSearchParams<{
    hobbyId: string;
    isHobbyCreatedFromOnboarding?: string;
  }>();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateTechniqueStatus } = useHobbies();

  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(
    null,
  );
  const [showConfetti, setShowConfetti] = useState(false);

  const handleBackHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/");
  }, [router]);

  // Load hobby
  useEffect(() => {
    if (!hobbyId) return;

    (async () => {
      setLoading(true);
      const loaded = await loadHobby(hobbyId);
      const isHobbyCreatedFromOnboarding =
        isHobbyCreatedFromOnboardingParam === "true";
      setHobby(loaded);
      setLoading(false);

      if (loaded && isHobbyCreatedFromOnboarding) {
        navigation.setOptions({
          title: "Home",
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={handleBackHome}
            >
              <Ionicons name="chevron-back" size={28} color={colors.accent} />
            </Pressable>
          ),
        });
      }
    })();
  }, [hobbyId, navigation, router, isHobbyCreatedFromOnboardingParam, handleBackHome]);

  const progress = useMemo(
    () =>
      hobby
        ? getProgress(hobby)
        : { total: 0, mastered: 0, skipped: 0, remaining: 0, percent: 0 },
    [hobby],
  );

  const handleTechniquePress = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedTechnique(null);
  }, []);

  const handleStatusChange = useCallback(
    async (techniqueId: string, status: TechniqueStatus) => {
      if (!hobbyId) return;
      const prevPercent = progress.percent;
      const updated = await updateTechniqueStatus(hobbyId, techniqueId, status);
      if (updated) {
        setHobby(updated);
        const nextProgress = getProgress(updated);
        if (nextProgress.percent === 100 && prevPercent < 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowConfetti(true);
        }
        // Update the selected technique if it's the one that changed
        const updatedTechnique = updated.techniques.find(
          (t) => t.id === techniqueId,
        );
        if (updatedTechnique && selectedTechnique?.id === techniqueId) {
          setSelectedTechnique(updatedTechnique);
        }
      }
    },
    [hobbyId, updateTechniqueStatus, selectedTechnique, progress.percent],
  );

  const handleSheetStatusChange = useCallback(
    (status: TechniqueStatus) => {
      if (!selectedTechnique) return;
      handleStatusChange(selectedTechnique.id, status);
    },
    [selectedTechnique, handleStatusChange],
  );

  const handleSwipeRight = useCallback(
    (id: string) => {
      handleStatusChange(id, "mastered");
    },
    [handleStatusChange]
  );

  const handleSwipeLeft = useCallback(
    (id: string) => {
      handleStatusChange(id, "skipped");
    },
    [handleStatusChange]
  );

  const renderTechniqueItem = useCallback(
    ({ item }: { item: Technique }) => (
      <SwipeableRow
        techniqueId={item.id}
        status={item.status}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
      >
        <TechniqueRow
          technique={item}
          onPress={handleTechniquePress}
        />
      </SwipeableRow>
    ),
    [handleSwipeRight, handleSwipeLeft, handleTechniquePress],
  );

  const keyExtractor = useCallback((item: Technique) => item.id, []);

  const listContentStyle = useMemo(
    () => [
      styles.list,
      { paddingBottom: insets.bottom + spacing.xl },
    ],
    [insets.bottom]
  );

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
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
      />

      {/* Technique Detail Modal */}
      <Modal
        visible={selectedTechnique !== null}
        presentationStyle={
          Platform.OS === "web" ? "overFullScreen" : "pageSheet"
        }
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        onRequestClose={handleCloseSheet}
      >
        <View
          style={
            Platform.OS === "web"
              ? styles.webModalBackdrop
              : styles.mobileModalBackdrop
          }
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleCloseSheet}
          />

          <View
            style={
              Platform.OS === "web"
                ? styles.webModalContent
                : styles.mobileModalContent
            }
          >
            {Platform.OS !== "web" && <View style={styles.modalHandle} />}
            {selectedTechnique && hobby && (
              <TechniqueSheetContent
                technique={selectedTechnique}
                hobby={hobby}
                onUpdateStatus={handleSheetStatusChange}
                onClose={handleCloseSheet}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Confetti Animation Overlay */}
      <Confetti
        active={showConfetti}
        onAnimationEnd={() => setShowConfetti(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.base,
  },
  hobbyName: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: letterSpacing.tight,
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
    textAlign: "center",
    fontWeight: fontWeight.medium,
  },
  list: {
    paddingTop: spacing.xs,
  },
  mobileModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  mobileModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flex: 1,
    overflow: "hidden",
    ...shadows.glow,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.sheetHandle,
    alignSelf: "center",
    marginVertical: spacing.md,
  },
  webModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  webModalContent: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
    ...shadows.glow,
  },
  backButton: {
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
});
