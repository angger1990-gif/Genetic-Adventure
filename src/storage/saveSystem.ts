import { PlayerStats, QuestionCategory } from '../types/game';

const SAVE_KEY = 'geneticAdventureSave_3d';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: '',
  schoolClass: 'Kelas IX-A',
  avatar: 'researcher_m',
  hp: 3,
  maxHp: 3,
  xp: 0,
  level: 1,
  coins: 50,
  energy: 5,
  combo: 0,
  highestCombo: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  hintsUsed: 0,
  items: {
    geneScanner: 3,
    lifeCell: 2,
    geneticShield: 1,
    timeFreeze: 2,
    punnettScanner: 2,
  },
  activeShield: false,
  crystals: [],
  unlockedLevels: [1],
  completedLevels: [],
  levelStars: {},
  levelScores: {},
  practicumCompleted: {},
  levelQuizCompleted: {},
  levelPunnettCompleted: {},
  levelChestOpened: {},
  levelMachinesCompleted: {
    segregasi: false,
    asortasi: false,
  },
  categoryCorrect: {
    genetics_terms: 0,
    genotype_phenotype: 0,
    monohybrid: 0,
    mendel_1: 0,
    dihybrid: 0,
    mendel_2: 0,
    analysis: 0,
  },
  categoryTotal: {
    genetics_terms: 0,
    genotype_phenotype: 0,
    monohybrid: 0,
    mendel_1: 0,
    dihybrid: 0,
    mendel_2: 0,
    analysis: 0,
  },
  achievements: [],
};

export class SaveSystem {
  static load(): PlayerStats {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('geneticAdventureSave');
      if (!raw) return { ...INITIAL_PLAYER_STATS };
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_PLAYER_STATS,
        ...parsed,
        items: { ...INITIAL_PLAYER_STATS.items, ...(parsed.items || {}) },
        practicumCompleted: { ...INITIAL_PLAYER_STATS.practicumCompleted, ...(parsed.practicumCompleted || {}) },
        levelQuizCompleted: { ...(parsed.levelQuizCompleted || {}) },
        levelPunnettCompleted: { ...(parsed.levelPunnettCompleted || {}) },
        levelChestOpened: { ...(parsed.levelChestOpened || {}) },
        levelMachinesCompleted: {
          segregasi: false,
          asortasi: false,
          ...(parsed.levelMachinesCompleted || {}),
        },
        categoryCorrect: { ...INITIAL_PLAYER_STATS.categoryCorrect, ...(parsed.categoryCorrect || {}) },
        categoryTotal: { ...INITIAL_PLAYER_STATS.categoryTotal, ...(parsed.categoryTotal || {}) },
      };
    } catch {
      return { ...INITIAL_PLAYER_STATS };
    }
  }

  static save(stats: PlayerStats): boolean {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  static hasSaveData(): boolean {
    return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem('geneticAdventureSave'));
  }

  static reset(): PlayerStats {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem('geneticAdventureSave');
    } catch (e) {
      console.error('Failed to reset data:', e);
    }
    return { ...INITIAL_PLAYER_STATS };
  }

  static calculateLearningScore(stats: PlayerStats): number {
    const weights: Record<QuestionCategory, number> = {
      genetics_terms: 0.1,
      genotype_phenotype: 0.1,
      monohybrid: 0.15,
      mendel_1: 0.15,
      dihybrid: 0.2,
      mendel_2: 0.15,
      analysis: 0.15,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const [cat, weight] of Object.entries(weights) as [QuestionCategory, number][]) {
      const total = stats.categoryTotal[cat] || 0;
      const correct = stats.categoryCorrect[cat] || 0;
      if (total > 0) {
        const ratio = correct / total;
        totalWeightedScore += ratio * weight * 100;
        totalWeight += weight;
      }
    }

    return totalWeight === 0 ? 0 : Math.round(totalWeightedScore / totalWeight);
  }

  static calculateLevelStars(accuracyPercent: number, hintsCount: number): number {
    if (accuracyPercent >= 90 && hintsCount === 0) return 3;
    if (accuracyPercent >= 75) return 2;
    return 1;
  }
}
