import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
} from "../../theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { PracticeToolConfig } from "../../types/models";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// Chess pieces characters mapping
const PIECE_SYMBOLS: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

export function InteractiveChessBoard({
  config,
}: {
  config?: PracticeToolConfig;
}) {
  const isChess = config?.boardType === "chess" || true;

  // Mode: 'coordinates' (Speed drill) or 'puzzle'
  const [mode, setMode] = useState<"coordinates" | "puzzle">("coordinates");

  // --- Coordinates Game State ---
  const [isPlayingCo, setIsPlayingCo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetSquare, setTargetSquare] = useState("");
  const [score, setScore] = useState(0);
  const [totalTries, setTotalTries] = useState(0);
  const [highlightSquare, setHighlightSquare] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<
    "success" | "error" | null
  >(null);

  // Timer loop for coordinates game
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlayingCo && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlayingCo(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    return () => clearInterval(timer);
  }, [isPlayingCo, timeLeft]);

  // Generate next coordinate target
  const nextTarget = useCallback(() => {
    const file = FILES[Math.floor(Math.random() * FILES.length)];
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    setTargetSquare(`${file}${rank}`);
  }, []);

  const startCoordinatesGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScore(0);
    setTotalTries(0);
    setTimeLeft(30);
    setIsPlayingCo(true);
    setHighlightSquare(null);
    nextTarget();
  };

  // --- Puzzle Board Setup ---
  // Parse setup string (e.g. "White: Ke1, Qf3; Black: Ke8, Pa7")
  const parsedPieces = useMemo(() => {
    const grid: Record<string, string> = {};
    if (!config?.setup) return grid;

    // A simple parser for "White: Ke1, Qf3; Black: Ke8, Pa7" or FEN-like layouts
    try {
      const parts = config.setup.split(";");
      parts.forEach((part) => {
        const isWhite = part.toLowerCase().includes("white");
        const colorPrefix = isWhite ? "w" : "b";
        const placementPart = part.substring(part.indexOf(":") + 1).trim();

        if (placementPart) {
          const assignments = placementPart.split(",");
          assignments.forEach((assign) => {
            const clean = assign.trim();
            if (clean.length >= 3) {
              const pieceChar = clean[0].toLowerCase();
              const coord = clean.substring(1).toLowerCase();
              grid[coord] = `${colorPrefix}${pieceChar}`;
            }
          });
        }
      });
    } catch (e) {
      console.warn("Failed to parse board setup:", config.setup);
    }
    return grid;
  }, [config?.setup]);

  // --- Puzzle State ---
  const [puzzleStep, setPuzzleStep] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const solution = config?.solution || [];

  const resetPuzzle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPuzzleStep(0);
    setPuzzleSolved(false);
    setHighlightSquare(null);
  };

  // --- Board Square Tap Handler ---
  const handleSquarePress = (file: string, rank: number) => {
    const square = `${file}${rank}`;

    if (mode === "coordinates") {
      if (!isPlayingCo) return;

      setTotalTries((prev) => prev + 1);
      setHighlightSquare(square);

      if (square === targetSquare) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setHighlightType("success");
        setScore((prev) => prev + 1);
        nextTarget();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setHighlightType("error");
      }

      // Fade out highlight quickly
      setTimeout(() => {
        setHighlightSquare(null);
        setHighlightType(null);
      }, 300);
    } else {
      // Puzzle mode
      if (puzzleSolved) return;

      const expectedSquare = solution[puzzleStep];
      setHighlightSquare(square);

      if (square === expectedSquare) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setHighlightType("success");

        if (puzzleStep + 1 < solution.length) {
          setPuzzleStep((prev) => prev + 1);
        } else {
          setPuzzleSolved(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setHighlightType("error");
      }

      // Fade out highlight
      setTimeout(() => {
        setHighlightSquare(null);
        setHighlightType(null);
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Mode Tabs */}
      <View style={styles.modeTabBar}>
        <Pressable
          style={[
            styles.modeTab,
            mode === "coordinates" && styles.activeModeTab,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMode("coordinates");
            setIsPlayingCo(false);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={
                mode === "coordinates"
                  ? colors.intermediate
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.modeTabText,
                mode === "coordinates" && styles.activeModeTabText,
              ]}
            >
              Coordinate Speed Drill
            </Text>
          </View>
        </Pressable>

        {config?.setup && (
          <Pressable
            style={[styles.modeTab, mode === "puzzle" && styles.activeModeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMode("puzzle");
              setIsPlayingCo(false);
              resetPuzzle();
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name="puzzle"
                size={14}
                color={
                  mode === "puzzle" ? colors.intermediate : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.modeTabText,
                  mode === "puzzle" && styles.activeModeTabText,
                ]}
              >
                Tactics Position
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Prompts Section */}
      <View style={styles.promptPanel}>
        {mode === "coordinates" ? (
          isPlayingCo ? (
            <View style={styles.coRow}>
              <View style={styles.targetBox}>
                <Text style={styles.targetLabel}>FIND SQUARE</Text>
                <Text style={styles.targetCoord}>
                  {targetSquare.toUpperCase()}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TIME LEFT</Text>
                <Text style={styles.statVal}>{timeLeft}s</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SCORE</Text>
                <Text style={styles.statVal}>
                  {score}/{totalTries}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.centerPrompt}>
              <Text style={styles.welcomeText}>
                Train board awareness & visualization speed!
              </Text>
              <Pressable style={styles.startBtn} onPress={startCoordinatesGame}>
                <Text style={styles.startBtnText}>Start 30s Speed Drill</Text>
              </Pressable>
              {totalTries > 0 && (
                <Text style={styles.resultsText}>
                  Last Score: {score} of {totalTries} correct (
                  {Math.round((score / totalTries) * 100)}%)
                </Text>
              )}
            </View>
          )
        ) : (
          <View style={styles.puzzlePromptPanel}>
            <Text style={styles.puzzlePromptText}>
              {config?.puzzlePrompt || "Find the best move."}
            </Text>
            {puzzleSolved ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="trophy" size={16} color={colors.success} />
                <Text style={styles.solvedText}>Correct! Puzzle Solved!</Text>
              </View>
            ) : (
              <View style={styles.puzzleProgressRow}>
                <Text style={styles.puzzleStepsText}>
                  Step {puzzleStep + 1} of {solution.length}
                </Text>
                <Pressable onPress={resetPuzzle}>
                  <Text style={styles.resetLink}>Reset</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Chess Board */}
      <View style={styles.boardContainer}>
        {/* Ranks vertical guide */}
        <View style={styles.ranksColumn}>
          {RANKS.map((rank) => (
            <Text key={rank} style={styles.guideChar}>
              {rank}
            </Text>
          ))}
        </View>

        <View style={styles.boardLayout}>
          <View style={styles.boardBorder}>
            {RANKS.map((rank, rankIndex) => (
              <View key={rank} style={styles.boardRow}>
                {FILES.map((file, fileIndex) => {
                  const square = `${file}${rank}`;
                  const isLight = (rankIndex + fileIndex) % 2 === 0;
                  const isTargeting = highlightSquare === square;

                  let squareBg: string = isLight ? "#f0ebe4" : "#d4cfc6";
                  if (isTargeting) {
                    squareBg =
                      highlightType === "success"
                        ? "rgba(13, 138, 110, 0.35)"
                        : "rgba(200, 32, 20, 0.30)";
                  }

                  // Piece on this square (in puzzle mode)
                  const pieceCode =
                    mode === "puzzle" ? parsedPieces[square] : null;
                  const pieceSymbol = pieceCode ? PIECE_SYMBOLS[pieceCode] : "";

                  return (
                    <Pressable
                      key={file}
                      style={[styles.square, { backgroundColor: squareBg }]}
                      onPress={() => handleSquarePress(file, rank)}
                    >
                      {pieceSymbol ? (
                        <Text
                          style={[
                            styles.piece,
                            {
                              color: pieceCode?.startsWith("w")
                                ? colors.white
                                : colors.black,
                            },
                          ]}
                        >
                          {pieceSymbol}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Files horizontal guide */}
          <View style={styles.filesRow}>
            {FILES.map((file) => (
              <Text key={file} style={styles.guideCharHorizontal}>
                {file.toUpperCase()}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  modeTabBar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.md,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    minHeight: 40,
  },
  activeModeTab: {
    backgroundColor: colors.surface,
  },
  modeTabText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  activeModeTabText: {
    color: colors.intermediate,
  },
  promptPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 100,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  coRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  targetBox: {
    alignItems: "center",
  },
  targetLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: fontWeight.bold,
  },
  targetCoord: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.heavy,
    color: colors.intermediate,
    marginTop: spacing.xs,
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: fontWeight.bold,
  },
  statVal: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  centerPrompt: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  startBtnText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  resultsText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  puzzlePromptPanel: {
    alignItems: "center",
  },
  puzzlePromptText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  solvedText: {
    color: colors.success,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  puzzleProgressRow: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
  },
  puzzleStepsText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resetLink: {
    color: colors.intermediate,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  boardContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginVertical: spacing.sm,
  },
  ranksColumn: {
    justifyContent: "space-between",
    paddingVertical: 12,
    marginRight: spacing.sm,
    height: 280,
  },
  guideChar: {
    color: colors.textDisabled,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    height: 32,
    lineHeight: 32,
    textAlign: "center",
  },
  boardLayout: {
    alignItems: "center",
  },
  boardBorder: {
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
    overflow: "hidden",
    width: 280,
    height: 280,
  },
  boardRow: {
    flexDirection: "row",
    height: 35,
  },
  square: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  piece: {
    fontSize: 28,
    lineHeight: 28,
    textAlign: "center",
  },
  filesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
    marginTop: spacing.xs,
    paddingHorizontal: 8,
  },
  guideCharHorizontal: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
