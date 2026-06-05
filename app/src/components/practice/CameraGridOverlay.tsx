import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
  lineHeight,
} from "../../theme/tokens";
import type { PracticeToolConfig } from "../../types/models";

export function CameraGridOverlay({ config }: { config?: PracticeToolConfig }) {
  const [permission, requestPermission] = useCameraPermissions();
  const gridSize = config?.gridSize || "3x3";
  const columns = parseInt(gridSize.split("x")[0]) || 3;
  const rows = parseInt(gridSize.split("x")[1]) || 3;

  // Grid Style State
  const [opacity, setOpacity] = useState(0.5); // 0.1 to 1.0
  const [lineColor, setLineColor] = useState<"grey" | "teal" | "red">("grey");

  // Gesture Sketch Timer State
  const defaultSeconds = config?.timerSeconds || 120;
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sketchCount, setSketchCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer Tick Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished!
            setIsTimerRunning(false);
            setSketchCount((c) => c + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (timerRef.current) clearInterval(timerRef.current);
            return defaultSeconds;
          }
          if (prev <= 4) {
            // Count down ticks
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, defaultSeconds]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning(false);
    setTimeLeft(defaultSeconds);
  };

  const getLineHex = () => {
    switch (lineColor) {
      case "teal":
        return colors.beginner;
      case "red":
        return colors.error;
      case "grey":
      default:
        return colors.grey;
    }
  };

  return (
    <View style={styles.container}>
      {/* Subject Prompt */}
      {config?.referenceImagePrompt && (
        <View style={styles.promptSection}>
          <Text style={styles.guideTitle}>SKETCH REFERENCE PROMPT</Text>
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>
              "{config.referenceImagePrompt}"
            </Text>
            {config.subjectStyle && (
              <Text style={styles.styleBadge}>
                Style: {config.subjectStyle}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Grid Guide / Canvas Box */}
      <View style={styles.canvasFrame}>
        {!permission ? (
          <View style={styles.canvasBackground}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.canvasBackground}>
            <Text style={styles.canvasPlaceholderEmoji}>📷</Text>
            <Text style={[styles.canvasPlaceholderText, { marginBottom: spacing.sm }]}>
              Obyay needs camera permission to align proportions
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.permissionBtn,
                pressed && styles.permissionBtnPressed,
              ]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionBtnText}>Enable Camera</Text>
            </Pressable>
          </View>
        ) : (
          <CameraView style={StyleSheet.absoluteFill} facing="back" />
        )}

        {/* Overlay Grid */}
        <View style={[StyleSheet.absoluteFill, styles.gridOverlay]}>
          {/* Vertical Grid Lines */}
          {Array.from({ length: columns - 1 }).map((_, colIdx) => (
            <View
              key={`col-${colIdx}`}
              style={[
                styles.gridLineVertical,
                {
                  left: `${((colIdx + 1) / columns) * 100}%`,
                  borderColor: getLineHex(),
                  opacity: opacity,
                },
              ]}
            />
          ))}

          {/* Horizontal Grid Lines */}
          {Array.from({ length: rows - 1 }).map((_, rowIdx) => (
            <View
              key={`row-${rowIdx}`}
              style={[
                styles.gridLineHorizontal,
                {
                  top: `${((rowIdx + 1) / rows) * 100}%`,
                  borderColor: getLineHex(),
                  opacity: opacity,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Grid Adjustments */}
      <View style={styles.adjustSection}>
        <Text style={styles.guideTitle}>GRID SETTINGS</Text>
        <View style={styles.settingsRow}>
          <View style={styles.sliderControl}>
            <Text style={styles.controlLabel}>Opacity</Text>
            <View style={styles.opacityToggles}>
              {[0.2, 0.5, 0.8].map((op) => (
                <Pressable
                  key={op}
                  style={[styles.opBtn, opacity === op && styles.activeOpBtn]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOpacity(op);
                  }}
                >
                  <Text
                    style={[
                      styles.opBtnText,
                      opacity === op && styles.activeOpBtnText,
                    ]}
                  >
                    {op * 100}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.colorControl}>
            <Text style={styles.controlLabel}>Color</Text>
            <View style={styles.colorPalette}>
              {(["grey", "teal", "red"] as const).map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor:
                        color === "grey"
                          ? colors.grey
                          : color === "teal"
                            ? colors.beginner
                            : colors.error,
                      borderColor:
                        lineColor === color ? colors.accent : "transparent",
                      borderWidth: lineColor === color ? 2 : 0,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLineColor(color);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Interval Sketch Timer */}
      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerVal}>
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </Text>
            <Text style={styles.timerLabel}>SKETCH TIMER</Text>
          </View>

          <View style={styles.statsDisplay}>
            <Text style={styles.timerVal}>{sketchCount}</Text>
            <Text style={styles.timerLabel}>COMPLETED</Text>
          </View>
        </View>

        <View style={styles.timerControls}>
          <Pressable
            style={[
              styles.timerBtn,
              isTimerRunning ? styles.stopBtn : styles.startBtn,
            ]}
            onPress={toggleTimer}
          >
            <Text
              style={[
                styles.timerBtnText,
                isTimerRunning && styles.stopBtnText,
              ]}
            >
              {isTimerRunning ? "Pause" : "Start Timer"}
            </Text>
          </Pressable>

          <Pressable style={styles.resetBtn} onPress={resetTimer}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  promptSection: {
    marginBottom: spacing.md,
  },
  guideTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  promptCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    lineHeight: lineHeight.base,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  styleBadge: {
    color: colors.beginner,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    textTransform: "uppercase",
  },
  canvasFrame: {
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  canvasBackground: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  canvasPlaceholderEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  canvasPlaceholderText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: "center",
    lineHeight: lineHeight.sm,
  },
  gridOverlay: {
    pointerEvents: "none",
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    width: 0,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    height: 0,
  },
  adjustSection: {
    marginBottom: spacing.lg,
  },
  settingsRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  sliderControl: {
    flex: 1,
  },
  colorControl: {
    width: 110,
  },
  controlLabel: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  opacityToggles: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 3,
    gap: 3,
  },
  opBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    minHeight: 32,
  },
  activeOpBtn: {
    backgroundColor: colors.surface,
  },
  opBtnText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  activeOpBtnText: {
    color: colors.beginner,
  },
  colorPalette: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 6,
    height: 38,
  },
  colorOption: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
  },
  timerSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  timerRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  timerDisplay: {
    flex: 2,
    alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  statsDisplay: {
    flex: 1,
    alignItems: "center",
  },
  timerVal: {
    color: colors.textPrimary,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.heavy,
  },
  timerLabel: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  timerControls: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timerBtn: {
    flex: 2,
    borderRadius: radii.pill,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: colors.beginner,
  },
  stopBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  timerBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  stopBtnText: {
    color: colors.textPrimary,
  },
  resetBtn: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  permissionBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  permissionBtnPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: colors.accentDark,
  },
  permissionBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
