import type { GoalLevel } from "../types/models";

// ─── Hobby Creation Options ──────────────────────────────────────────────────

export interface LevelOption {
  value: GoalLevel;
  icon: string;
  label: string;
  subtitle: string;
}

export const LEVELS: LevelOption[] = [
  {
    value: "beginner",
    icon: "leaf",
    label: "Beginner",
    subtitle: "Start from scratch",
  },
  {
    value: "intermediate",
    icon: "trending-up",
    label: "Medium",
    subtitle: "Build on what I know",
  },
  {
    value: "advanced",
    icon: "flame",
    label: "Advanced",
    subtitle: "Master high-level skills",
  },
];

export const LOADING_MESSAGES = [
  "Asking the experts…",
  "Ordering techniques…",
  "Almost there…",
];
