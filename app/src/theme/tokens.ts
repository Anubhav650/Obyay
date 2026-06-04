import { GoalLevel } from '../types/models';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bg: '#0A0A0F',
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  surfacePressed: '#252535',

  // Borders
  border: '#2A2A3A',
  borderSubtle: '#1F1F2F',
  borderFocus: '#6366F1',

  // Text
  textPrimary: '#F5F5F7',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textDisabled: '#4B5563',

  // Accent
  accent: '#6366F1',
  accentLight: '#818CF8',
  accentDark: '#4F46E5',
  accentGlow: 'rgba(99, 102, 241, 0.25)',

  // Semantic
  success: '#34D399',
  successDim: 'rgba(52, 211, 153, 0.15)',
  warning: '#FBBF24',
  warningDim: 'rgba(251, 191, 36, 0.15)',
  error: '#F87171',
  errorDim: 'rgba(248, 113, 113, 0.15)',

  // Levels
  casual: '#2DD4BF',
  casualDim: 'rgba(45, 212, 191, 0.15)',
  casualGlow: 'rgba(45, 212, 191, 0.25)',
  hobbyist: '#F59E0B',
  hobbyistDim: 'rgba(245, 158, 11, 0.15)',
  hobbyistGlow: 'rgba(245, 158, 11, 0.25)',
  serious: '#8B5CF6',
  seriousDim: 'rgba(139, 92, 246, 0.15)',
  seriousGlow: 'rgba(139, 92, 246, 0.25)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  sheetHandle: '#3A3A4A',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Level Color Mapping ─────────────────────────────────────────────────────

export function getLevelColor(level: GoalLevel): string {
  switch (level) {
    case 'casual':
      return colors.casual;
    case 'hobbyist':
      return colors.hobbyist;
    case 'serious':
      return colors.serious;
  }
}

export function getLevelDimColor(level: GoalLevel): string {
  switch (level) {
    case 'casual':
      return colors.casualDim;
    case 'hobbyist':
      return colors.hobbyistDim;
    case 'serious':
      return colors.seriousDim;
  }
}

export function getLevelGlowColor(level: GoalLevel): string {
  switch (level) {
    case 'casual':
      return colors.casualGlow;
    case 'hobbyist':
      return colors.hobbyistGlow;
    case 'serious':
      return colors.seriousGlow;
  }
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const lineHeight = {
  xs: 14,
  sm: 18,
  base: 22,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

// ─── Shadows (Dark Mode – subtle glow effects) ──────────────────────────────

export const shadows = {
  sm: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
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
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;
