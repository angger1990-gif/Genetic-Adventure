export type CognitiveLevel = 'C2' | 'C3' | 'C4' | 'C5';

export type QuestionCategory =
  | 'genetics_terms'
  | 'genotype_phenotype'
  | 'monohybrid'
  | 'mendel_1'
  | 'dihybrid'
  | 'mendel_2'
  | 'analysis';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'drag_drop'
  | 'sorting'
  | 'analysis_challenge'
  | 'punnett_puzzle';

export interface Question {
  id: string;
  level: number;
  cognitiveLevel: CognitiveLevel;
  category: QuestionCategory;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string | string[] | Record<string, string>;
  explanation: string;
  hint: string;
  xp: number;
  difficulty: number;
  sortingItems?: string[];
  dragDropPairs?: { item: string; match: string }[];
  punnettData?: { parent1: string; parent2: string; traitName: string };
}

export interface PlayerItems {
  geneScanner: number;
  lifeCell: number;
  geneticShield: number;
  timeFreeze: number;
  punnettScanner: number;
}

export interface PlayerStats {
  name: string;
  schoolClass: string;
  avatar: 'researcher_m' | 'researcher_f';
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  coins: number;
  energy: number;
  combo: number;
  highestCombo: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  hintsUsed: number;
  items: PlayerItems;
  activeShield: boolean;
  crystals: number[];
  unlockedLevels: number[];
  completedLevels: number[];
  levelStars: Record<number, number>;
  levelScores: Record<number, number>;
  practicumCompleted: Record<number, boolean>;
  levelQuizCompleted: Record<number, number>;
  levelPunnettCompleted: Record<number, boolean>;
  levelChestOpened: Record<number, boolean>;
  levelMachinesCompleted: {
    segregasi: boolean;
    asortasi: boolean;
  };
  categoryCorrect: Record<QuestionCategory, number>;
  categoryTotal: Record<QuestionCategory, number>;
  achievements: string[];
}

export interface LevelInfo {
  id: number;
  name: string;
  subtitle: string;
  theme: string;
  enemyName: string;
  enemyHp: number;
  bossName: string;
  bossHp: number;
  bossTheme: string;
  description: string;
  learningFocus: string;
  achievementId: string;
  crystalId: number;
  floorColor: number;
  accentColor: number;
  fogColor: number;
}

export interface BossInfo {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  avatarEmoji: string;
  rewardXp: number;
  rewardCoins: number;
  crystalReward: number;
}

export interface AchievementItem {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
}

export interface ShopItem {
  key: keyof PlayerItems;
  name: string;
  description: string;
  cost: number;
  iconName: string;
  usableDirectly: boolean;
}

export interface InteractableStation3D {
  id: string;
  x: number;
  z: number;
  type: 'practicum' | 'terminal_a' | 'terminal_b' | 'punnett' | 'chest' | 'boss_portal' | 'machine1' | 'machine2';
  title: string;
  iconSymbol: string;
  unlocked: boolean;
}
