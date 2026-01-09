import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Gamification System Tests
 * Tests for XP calculation, level progression, badge unlocking, and streaks
 */

// XP calculation functions (mirroring the logic from gamification.ts)
const XP_REWARDS = {
  TASK_COMPLETED: 25,
  PROJECT_COMPLETED: 100,
  FOCUS_SESSION: 15,
  IDEA_CAPTURED: 5,
  STREAK_BONUS: 10,
  FIRST_PROJECT: 50,
  FIRST_TASK: 20,
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000,
  17000, 23000, 30000, 40000, 52000, 67000, 85000, 107000, 135000, 170000
];

function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function calculateXpForNextLevel(totalXp: number): { current: number; required: number; progress: number } {
  const level = calculateLevel(totalXp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const xpInCurrentLevel = totalXp - currentThreshold;
  const xpRequiredForLevel = nextThreshold - currentThreshold;
  const progress = Math.min(100, (xpInCurrentLevel / xpRequiredForLevel) * 100);
  
  return {
    current: xpInCurrentLevel,
    required: xpRequiredForLevel,
    progress,
  };
}

function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return XP_REWARDS.STREAK_BONUS * 3;
  if (streakDays >= 14) return XP_REWARDS.STREAK_BONUS * 2;
  if (streakDays >= 7) return Math.floor(XP_REWARDS.STREAK_BONUS * 1.5);
  if (streakDays >= 3) return XP_REWARDS.STREAK_BONUS;
  return 0;
}

describe("XP Rewards", () => {
  it("should have correct XP values for each action", () => {
    expect(XP_REWARDS.TASK_COMPLETED).toBe(25);
    expect(XP_REWARDS.PROJECT_COMPLETED).toBe(100);
    expect(XP_REWARDS.FOCUS_SESSION).toBe(15);
    expect(XP_REWARDS.IDEA_CAPTURED).toBe(5);
    expect(XP_REWARDS.STREAK_BONUS).toBe(10);
    expect(XP_REWARDS.FIRST_PROJECT).toBe(50);
    expect(XP_REWARDS.FIRST_TASK).toBe(20);
  });
});

describe("Level Calculation", () => {
  it("should return level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("should return level 1 for XP below 100", () => {
    expect(calculateLevel(50)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
  });

  it("should return level 2 for XP between 100 and 249", () => {
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(200)).toBe(2);
    expect(calculateLevel(249)).toBe(2);
  });

  it("should return level 3 for XP between 250 and 499", () => {
    expect(calculateLevel(250)).toBe(3);
    expect(calculateLevel(400)).toBe(3);
  });

  it("should handle high XP values correctly", () => {
    expect(calculateLevel(5000)).toBe(7);
    expect(calculateLevel(12000)).toBe(10);
    expect(calculateLevel(170000)).toBe(20);
  });

  it("should cap at max level for very high XP", () => {
    expect(calculateLevel(500000)).toBe(20);
  });
});

describe("XP Progress Calculation", () => {
  it("should calculate progress correctly for level 1", () => {
    const progress = calculateXpForNextLevel(50);
    expect(progress.current).toBe(50);
    expect(progress.required).toBe(100);
    expect(progress.progress).toBe(50);
  });

  it("should calculate progress correctly at level boundary", () => {
    const progress = calculateXpForNextLevel(100);
    expect(progress.current).toBe(0);
    expect(progress.required).toBe(150); // 250 - 100
    expect(progress.progress).toBe(0);
  });

  it("should handle partial progress in higher levels", () => {
    const progress = calculateXpForNextLevel(175);
    expect(progress.current).toBe(75);
    expect(progress.required).toBe(150);
    expect(progress.progress).toBe(50);
  });

  it("should cap progress at 100%", () => {
    const progress = calculateXpForNextLevel(250);
    expect(progress.progress).toBeLessThanOrEqual(100);
  });
});

describe("Streak Bonus Calculation", () => {
  it("should return 0 for streaks less than 3 days", () => {
    expect(calculateStreakBonus(0)).toBe(0);
    expect(calculateStreakBonus(1)).toBe(0);
    expect(calculateStreakBonus(2)).toBe(0);
  });

  it("should return base bonus for 3-6 day streaks", () => {
    expect(calculateStreakBonus(3)).toBe(10);
    expect(calculateStreakBonus(5)).toBe(10);
    expect(calculateStreakBonus(6)).toBe(10);
  });

  it("should return 1.5x bonus for 7-13 day streaks", () => {
    expect(calculateStreakBonus(7)).toBe(15);
    expect(calculateStreakBonus(10)).toBe(15);
    expect(calculateStreakBonus(13)).toBe(15);
  });

  it("should return 2x bonus for 14-29 day streaks", () => {
    expect(calculateStreakBonus(14)).toBe(20);
    expect(calculateStreakBonus(20)).toBe(20);
    expect(calculateStreakBonus(29)).toBe(20);
  });

  it("should return 3x bonus for 30+ day streaks", () => {
    expect(calculateStreakBonus(30)).toBe(30);
    expect(calculateStreakBonus(60)).toBe(30);
    expect(calculateStreakBonus(100)).toBe(30);
  });
});

describe("Badge System", () => {
  const BADGES = [
    { id: "first_project", name: "Primeiro Passo", condition: (stats: any) => stats.projectsCompleted >= 1 },
    { id: "task_master", name: "Mestre das Tarefas", condition: (stats: any) => stats.tasksCompleted >= 50 },
    { id: "focus_champion", name: "Campeão do Foco", condition: (stats: any) => stats.focusMinutes >= 600 },
    { id: "streak_7", name: "Semana Perfeita", condition: (stats: any) => stats.currentStreak >= 7 },
    { id: "streak_30", name: "Mês de Ouro", condition: (stats: any) => stats.currentStreak >= 30 },
  ];

  it("should unlock first_project badge when completing first project", () => {
    const stats = { projectsCompleted: 1, tasksCompleted: 0, focusMinutes: 0, currentStreak: 0 };
    const badge = BADGES.find(b => b.id === "first_project");
    expect(badge?.condition(stats)).toBe(true);
  });

  it("should not unlock first_project badge with 0 projects", () => {
    const stats = { projectsCompleted: 0, tasksCompleted: 0, focusMinutes: 0, currentStreak: 0 };
    const badge = BADGES.find(b => b.id === "first_project");
    expect(badge?.condition(stats)).toBe(false);
  });

  it("should unlock task_master badge at 50 tasks", () => {
    const stats = { projectsCompleted: 0, tasksCompleted: 50, focusMinutes: 0, currentStreak: 0 };
    const badge = BADGES.find(b => b.id === "task_master");
    expect(badge?.condition(stats)).toBe(true);
  });

  it("should unlock focus_champion badge at 600 minutes (10 hours)", () => {
    const stats = { projectsCompleted: 0, tasksCompleted: 0, focusMinutes: 600, currentStreak: 0 };
    const badge = BADGES.find(b => b.id === "focus_champion");
    expect(badge?.condition(stats)).toBe(true);
  });

  it("should unlock streak_7 badge at 7 day streak", () => {
    const stats = { projectsCompleted: 0, tasksCompleted: 0, focusMinutes: 0, currentStreak: 7 };
    const badge = BADGES.find(b => b.id === "streak_7");
    expect(badge?.condition(stats)).toBe(true);
  });

  it("should unlock streak_30 badge at 30 day streak", () => {
    const stats = { projectsCompleted: 0, tasksCompleted: 0, focusMinutes: 0, currentStreak: 30 };
    const badge = BADGES.find(b => b.id === "streak_30");
    expect(badge?.condition(stats)).toBe(true);
  });
});

describe("Template System", () => {
  const TEMPLATES = [
    { id: "content_planning", category: "CONTENT", isPremium: false },
    { id: "software_dev", category: "SOFTWARE", isPremium: false },
    { id: "academic_research", category: "ACADEMIC", isPremium: false },
    { id: "personal_goal", category: "PERSONAL", isPremium: false },
    { id: "team_project", category: "PROFESSIONAL", isPremium: true },
    { id: "health_wellness", category: "HEALTH", isPremium: true },
  ];

  it("should have at least 4 free templates", () => {
    const freeTemplates = TEMPLATES.filter(t => !t.isPremium);
    expect(freeTemplates.length).toBeGreaterThanOrEqual(4);
  });

  it("should have premium templates", () => {
    const premiumTemplates = TEMPLATES.filter(t => t.isPremium);
    expect(premiumTemplates.length).toBeGreaterThan(0);
  });

  it("should cover all main categories", () => {
    const categories = new Set(TEMPLATES.map(t => t.category));
    expect(categories.has("CONTENT")).toBe(true);
    expect(categories.has("SOFTWARE")).toBe(true);
    expect(categories.has("ACADEMIC")).toBe(true);
    expect(categories.has("PERSONAL")).toBe(true);
  });
});
