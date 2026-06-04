export type GoalLevel = 'casual' | 'hobbyist' | 'serious';
export type TechniqueStatus = 'pending' | 'mastered' | 'skipped';

export interface Resource {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSec: number;
  url: string;
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
}

export interface Hobby {
  id: string;
  name: string;
  level: GoalLevel;
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
