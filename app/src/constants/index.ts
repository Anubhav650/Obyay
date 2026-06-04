import type { GoalLevel } from '../types/models';

// ─── Onboarding Option Lists ─────────────────────────────────────────────────

export const ROLES = [
  'Product Manager',
  'Business/Management',
  'Designer/Creative',
  'Student',
  'Developer/Engineer',
  'Research/Academic',
  'Finance/Investment',
];

export const GOALS = [
  'Make better use of my time',
  'Build new skills',
  'Boost my career',
  'Understand complex topics',
  'Explore new topics',
  'Just for fun',
  'Remember important learning',
];

export const TOPICS = [
  'AI',
  'Business',
  'Psychology',
  'Science',
  'Philosophy',
  'Economics',
  'History',
  'Investing',
  'Design',
  'Self-Improvement',
  'Strategy',
  'Learning',
  'Longevity',
  'Decision Making',
  'Software Engineering',
];

export const PREFERENCES = [
  'Bite-sized lessons',
  'Visual explanations',
  'Practice exercises',
  'Clear learning path',
  'Regular review',
  'Real-world examples',
  'Hands-on projects',
  'Personalized difficulty',
];

// ─── Hobby Creation Options ──────────────────────────────────────────────────

export interface LevelOption {
  value: GoalLevel;
  icon: string;
  label: string;
  subtitle: string;
}

export const LEVELS: LevelOption[] = [
  { value: 'casual', icon: '🎮', label: 'Casual', subtitle: 'Just for fun' },
  { value: 'hobbyist', icon: '🎯', label: 'Hobbyist', subtitle: 'Get pretty good' },
  { value: 'serious', icon: '🏆', label: 'Serious', subtitle: 'Go deep' },
];

export const LOADING_MESSAGES = [
  'Asking the experts…',
  'Ordering techniques…',
  'Almost there…',
];
