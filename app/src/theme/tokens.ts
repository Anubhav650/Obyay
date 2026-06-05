import { GoalLevel } from "../types/models";

// ─── Colors ──────────────────────────────────────────────────────────────────
// DESIGN-obyay.md warm teal light theme

export const colors = {
  // Primary Teal System (4-tier)
  obyayTeal: "#0a6e5c", // Brand heading, section titles
  tealAccent: "#0d8a6e", // Primary CTA fill, FAB fill
  deepTeal: "#1a4035", // Feature bands, bottom nav, dark surfaces
  tealUplift: "#2e5e52", // Decorative accents, dark-gradient moments
  tealLight: "#c8e6df", // Form valid-state tints, light utility surfaces

  // Surface & Background (warm sand palette)
  bg: "#f5f2ec", // Neutral Warm — primary screen canvas
  surface: "#ffffff", // White — card & modal surface
  surfaceElevated: "#eeeae5", // Parchment — section separators, soft washes
  surfacePressed: "#e8e4dd", // Pressed state for cards
  neutralCool: "#f7f7f7", // Dropdown, filter chip backgrounds

  // Borders
  border: "#d6dbde", // Default border
  borderSubtle: "#e7e7e7", // Hairline separators
  borderFocus: "#0d8a6e", // Focus ring — Teal Accent

  // Text on light surfaces
  textPrimary: "rgba(0, 0, 0, 0.87)", // Text Black — headings & body
  textSecondary: "rgba(0, 0, 0, 0.58)", // Text Black Soft — metadata
  textTertiary: "rgba(0, 0, 0, 0.38)", // Captions, placeholders
  textDisabled: "rgba(0, 0, 0, 0.26)", // Disabled text

  // Text on dark (Deep Teal) surfaces
  textOnDark: "#ffffff", // Primary on dark
  textOnDarkSoft: "rgba(255, 255, 255, 0.70)", // Secondary on dark

  // Achievement-only accent (NEVER general purpose)
  amber: "#c9963a",
  amberLight: "#ddb97a",
  amberLightest: "#faf5ea",
  achievementTeal: "#2e4a43", // Muted slate-teal for achievement text

  // Accent (maps to Teal Accent for general use)
  accent: "#0d8a6e",
  accentLight: "#0d9e7e",
  accentDark: "#0a6e5c",
  accentGlow: "rgba(13, 138, 110, 0.15)",

  // Semantic
  success: "#0d8a6e", // Teal for success in this warm palette
  successDim: "rgba(13, 138, 110, 0.10)",
  warning: "#fbbc05",
  warningDim: "rgba(251, 188, 5, 0.10)",
  error: "#c82014",
  errorDim: "rgba(200, 32, 20, 0.05)",

  // Levels
  beginner: "#0d8a6e", // Teal Accent for beginners
  beginnerDim: "rgba(13, 138, 110, 0.10)",
  beginnerGlow: "rgba(13, 138, 110, 0.20)",
  intermediate: "#c9963a", // Amber for intermediate
  intermediateDim: "rgba(201, 150, 58, 0.10)",
  intermediateGlow: "rgba(201, 150, 58, 0.20)",
  advanced: "#8B5CF6", // Violet for advanced
  advancedDim: "rgba(139, 92, 246, 0.10)",
  advancedGlow: "rgba(139, 92, 246, 0.20)",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.4)",
  sheetHandle: "#d6dbde",

  // Misc
  white: "#ffffff",
  black: "#000000",
  grey: "#4a4a4a",
  transparent: "transparent",
} as const;

// ─── Level Color Mapping ─────────────────────────────────────────────────────

export function getLevelColor(level: GoalLevel): string {
  switch (level) {
    case "beginner":
      return colors.beginner;
    case "intermediate":
      return colors.intermediate;
    case "advanced":
      return colors.advanced;
  }
}

export function getLevelDimColor(level: GoalLevel): string {
  switch (level) {
    case "beginner":
      return colors.beginnerDim;
    case "intermediate":
      return colors.intermediateDim;
    case "advanced":
      return colors.advancedDim;
  }
}

export function getLevelGlowColor(level: GoalLevel): string {
  switch (level) {
    case "beginner":
      return colors.beginnerGlow;
    case "intermediate":
      return colors.intermediateGlow;
    case "advanced":
      return colors.advancedGlow;
  }
}

// ─── Spacing ─────────────────────────────────────────────────────────────────
// DESIGN-obyay.md rem-based scale (1rem = 10px → native px)

export const spacing = {
  xs: 4, // --space-1  0.4rem
  sm: 8, // --space-2  0.8rem
  md: 12, // between space-2 and space-3
  base: 16, // --space-3  1.6rem — universal rhythm
  lg: 20, // between space-3 and space-4
  xl: 24, // --space-4  2.4rem
  "2xl": 32, // --space-5  3.2rem
  "3xl": 40, // --space-6  4.0rem
  "4xl": 48, // --space-7  4.8rem
  "5xl": 56, // --space-8  5.6rem — FAB height
  "6xl": 64, // --space-9  6.4rem
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────

export const radii = {
  sm: 4, // Notes field, small inputs
  md: 8, // Minor elements
  card: 14, // Cards, modals, hobby tiles — signature radius
  lg: 14, // Alias for card (backward compat)
  pill: 50, // ALL buttons — full-pill radius (universal)
  xl: 24, // Large containers
  full: 9999, // Circular (FAB, avatars)
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
// DESIGN-obyay.md hierarchy — Manrope typeface

export const fontFamily = {
  primary: "Manrope", // Universal body/heading
  serif: "Lora", // Achievement milestone headlines only
  script: "Kalam", // Onboarding hobby-name labels only
  fallback: "System", // System default fallback
} as const;

export const fontSize = {
  micro: 13, // Caption micro-copy, streak counters
  xs: 11, // Tightest labels
  sm: 14, // Button label, metadata, form labels
  base: 16, // Default body copy (1.6rem)
  lg: 19, // Body Large — hero intro copy
  xl: 24, // H1/H2 — primary headings
  "2xl": 28, // Hero Large
  "3xl": 36, // Jumbo — secondary hero
  "4xl": 45, // Display — largest milestone/hero
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
};

export const letterSpacing = {
  tight: -0.16, // Universal Manrope tracking
  normal: -0.01, // Default — tight, characteristic (≈ -0.01em)
  loose: 0.5, // Emphasized caps (≈ 0.1em at 14px)
  looser: 1.0, // Uppercase labels, extreme emphasis
} as const;

export const lineHeight = {
  compact: 1.2, // Display/buttons
  xs: 14,
  sm: 18,
  base: 24, // Body (1.5 × 16px)
  lg: 33, // Body Large (1.75 × 19px)
  xl: 36, // H1/H2 (36px)
  "2xl": 34,
  "3xl": 43,
} as const;

// ─── Shadows (Light mode — whisper-soft layered) ─────────────────────────────
// DESIGN-obyay.md: stacks 2-3 low-alpha shadows, never single heavy drop

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 1,
    elevation: 2,
  },
  topBar: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fabBase: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 6,
  },
  fabAmbient: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  // Aliases for backward compatibility
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.14,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 1,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
  glow: {
    shadowColor: "#0d8a6e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ─── Hit Slop ────────────────────────────────────────────────────────────────

export const hitSlop = {
  sm: { top: 8, right: 8, bottom: 8, left: 8 },
  md: { top: 12, right: 12, bottom: 12, left: 12 },
  lg: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

// ─── Animation ───────────────────────────────────────────────────────────────

export const animation = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springSnappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  springOvershoot: {
    // cubic-bezier(0.32, 2.32, 0.61, 0.27) equivalent
    damping: 8,
    stiffness: 200,
    mass: 0.6,
  },
  duration: {
    fast: 150,
    normal: 200, // Button transitions: 0.2s ease
    accordion: 300, // Expander/accordion: 300ms
    slow: 500,
    imageFadeIn: 300, // Image opacity: 0.3s ease-in
  },
  // Signature micro-interaction
  buttonActiveScale: 0.95,
} as const;
