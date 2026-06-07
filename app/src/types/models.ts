export type GoalLevel = "beginner" | "intermediate" | "advanced";
export type TechniqueStatus = "pending" | "mastered" | "skipped";
export type HobbyCategory =
  | "music"
  | "strategy"
  | "arts"
  | "fitness"
  | "culinary"
  | "general";

export interface Resource {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSec: number;
  url: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PracticeToolConfig {
  bpm?: number;
  timeSignature?: string;
  pattern?: string;
  chords?: string[];
  boardType?: string;
  setup?: string;
  puzzlePrompt?: string;
  solution?: string[];
  gridSize?: string;
  subjectStyle?: string;
  aspectRatio?: string;
  referenceImagePrompt?: string;
  timerSeconds?: number;
  intervals?: Array<{ name: string; duration: number }>;
  cycles?: number;
  instruction?: string;
  steps?: Array<{ name: string; duration: number; sensoryCheck: string }>;
  targetTemperature?: string;
  focusTime?: number;
  milestones?: string[];
  reflectionQuestions?: string[];
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  order: number;
  searchQuery: string;
  status: TechniqueStatus;
  statusUpdatedAt: string | null;
  resources: Resource[] | null; // null = not fetched, [] = fetched but empty
  quiz?: QuizQuestion;
  flashcards?: Flashcard[];
  practiceTool?: PracticeToolConfig;
}

export interface Hobby {
  id: string;
  name: string;
  level: GoalLevel;
  category: HobbyCategory;
  summary: string;
  techniques: Technique[];
  createdAt: string;
}

export interface Progress {
  total: number;
  mastered: number;
  skipped: number;
  remaining: number;
  percent: number; // mastered / (total - skipped), 0 if all skipped
}

export interface UserProfile {
  roles: string[];
  goals: string[];
  interests: string[];
  learningPreferences: string[];
}
