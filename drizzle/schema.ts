import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with neuroadaptive preferences for ADHD users.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Neuroadaptive Preferences (Barkley-aligned)
  focusDuration: int("focusDuration").default(25), // Pomodoro minutes
  reducedMotion: boolean("reducedMotion").default(false), // Accessibility
  timerType: mysqlEnum("timerType", ["PROGRESSIVE", "COUNTDOWN"]).default("PROGRESSIVE"),
  taskBlockEnabled: boolean("taskBlockEnabled").default(false), // Proof requirement
  
  // Subscription
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["FREE", "PRO", "TEAM"]).default("FREE"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["ACTIVE", "INACTIVE", "CANCELED", "PAST_DUE"]).default("ACTIVE"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  // LGPD Consent
  consentGiven: boolean("consentGiven").default(false),
  consentTimestamp: timestamp("consentTimestamp"),
  consentVersion: varchar("consentVersion", { length: 16 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - core entity for task decomposition
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  briefing: text("briefing"), // Raw user input
  briefingProcessed: text("briefingProcessed"), // AI-reformulated
  
  category: mysqlEnum("category", ["PERSONAL", "PROFESSIONAL", "ACADEMIC"]).default("PERSONAL"),
  cycleDuration: mysqlEnum("cycleDuration", ["DAYS_3", "DAYS_7", "DAYS_14"]).default("DAYS_3"),
  
  // Anti-perfectionism deliverables A-B-C
  deliverableA: text("deliverableA"), // Minimum acceptable
  deliverableB: text("deliverableB"), // Ideal
  deliverableC: text("deliverableC"), // Exceptional
  
  startDate: timestamp("startDate").defaultNow(),
  estimatedEndDate: timestamp("estimatedEndDate"),
  completedAt: timestamp("completedAt"),
  
  status: mysqlEnum("status", ["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tasks table - decomposed actions from projects
 * Follows Barkley's principles: max 3 ACTION tasks per day + 1 priming
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  title: varchar("title", { length: 500 }).notNull(),
  titleVerb: varchar("titleVerb", { length: 100 }), // Converted to actionable verb
  description: text("description"),
  
  type: mysqlEnum("type", ["ACTION", "RETENTION", "MAINTENANCE"]).default("ACTION"),
  dayNumber: int("dayNumber").notNull(), // D0, D1, D2, D3...
  position: int("position").notNull(), // 1, 2, 3 or 4 (next day priming)
  
  // Effort/Impact matrix (visual)
  effortScore: int("effortScore").default(5), // 1-10
  impactScore: int("impactScore").default(5), // 1-10
  
  completedAt: timestamp("completedAt"),
  proofUrl: varchar("proofUrl", { length: 500 }), // Proof if blocking enabled
  skipReason: varchar("skipReason", { length: 100 }), // Justification for changes (max 100)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Focus Cycles - timer sessions tracking
 */
export const focusCycles = mysqlTable("focusCycles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId"),
  projectId: int("projectId"),
  
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  
  pauseCount: int("pauseCount").default(0),
  totalFocusSeconds: int("totalFocusSeconds").default(0),
  targetSeconds: int("targetSeconds"), // If countdown mode
  
  timerType: mysqlEnum("timerType", ["PROGRESSIVE", "COUNTDOWN"]).default("PROGRESSIVE"),
  completed: boolean("completed").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FocusCycle = typeof focusCycles.$inferSelect;
export type InsertFocusCycle = typeof focusCycles.$inferInsert;

/**
 * Daily Logs - "Where I left off" externalization
 * Critical for ADHD working memory compensation
 */
export const dailyLogs = mysqlTable("dailyLogs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  
  dayNumber: int("dayNumber").notNull(),
  whereILeft: text("whereILeft").notNull(), // Memory externalization
  nextSteps: text("nextSteps"), // What to do next
  blockers: text("blockers"), // Any impediments
  mood: mysqlEnum("mood", ["GREAT", "GOOD", "NEUTRAL", "STRUGGLING", "DIFFICULT"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

/**
 * Quick Ideas - non-linear thought capture
 * Supports ADHD tendency for tangential thinking
 */
export const quickIdeas = mysqlTable("quickIdeas", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  userId: int("userId").notNull(),
  
  content: text("content").notNull(),
  convertedToTask: boolean("convertedToTask").default(false),
  convertedTaskId: int("convertedTaskId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuickIdea = typeof quickIdeas.$inferSelect;
export type InsertQuickIdea = typeof quickIdeas.$inferInsert;

/**
 * Subscriptions - payment tracking
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  
  status: mysqlEnum("status", ["ACTIVE", "CANCELED", "PAST_DUE", "TRIALING", "INCOMPLETE"]).default("ACTIVE"),
  tier: mysqlEnum("tier", ["FREE", "PRO", "BUSINESS"]).default("FREE"),
  
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * AI Usage Tracking - token budgeting per user
 */
export const aiUsage = mysqlTable("aiUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  tokensUsed: int("tokensUsed").default(0),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;


/**
 * User Gamification Stats - tracks XP, level, streaks
 * Compensates dopamine deficit through micro-rewards
 */
export const userGamification = mysqlTable("userGamification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // XP and Level System
  totalXp: int("totalXp").default(0),
  currentLevel: int("currentLevel").default(1),
  xpToNextLevel: int("xpToNextLevel").default(100),
  
  // Streak System
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  lastActiveDate: timestamp("lastActiveDate"),
  
  // Statistics
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  totalProjectsCompleted: int("totalProjectsCompleted").default(0),
  totalFocusMinutes: int("totalFocusMinutes").default(0),
  totalIdeasCaptured: int("totalIdeasCaptured").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserGamification = typeof userGamification.$inferSelect;
export type InsertUserGamification = typeof userGamification.$inferInsert;

/**
 * Badge Definitions - available achievements
 */
export const badgeDefinitions = mysqlTable("badgeDefinitions", {
  id: int("id").autoincrement().primaryKey(),
  
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(), // Lucide icon name
  color: varchar("color", { length: 20 }).default("#22C55E"),
  
  // Unlock criteria
  category: mysqlEnum("category", ["STREAK", "TASKS", "PROJECTS", "FOCUS", "IDEAS", "SPECIAL"]).default("TASKS"),
  threshold: int("threshold").default(1), // Number required to unlock
  xpReward: int("xpReward").default(50),
  
  // Rarity
  rarity: mysqlEnum("rarity", ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]).default("COMMON"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;
export type InsertBadgeDefinition = typeof badgeDefinitions.$inferInsert;

/**
 * User Badges - earned achievements
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  notified: boolean("notified").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * XP Transactions - history of XP gains
 */
export const xpTransactions = mysqlTable("xpTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["TASK", "PROJECT", "FOCUS", "IDEA", "BADGE", "STREAK", "BONUS"]).default("TASK"),
  sourceId: int("sourceId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = typeof xpTransactions.$inferInsert;

/**
 * Onboarding Progress - tracks user journey steps
 */
export const onboardingProgress = mysqlTable("onboardingProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Onboarding steps completed
  welcomeViewed: boolean("welcomeViewed").default(false),
  profileSetup: boolean("profileSetup").default(false),
  firstProjectCreated: boolean("firstProjectCreated").default(false),
  firstTaskCompleted: boolean("firstTaskCompleted").default(false),
  firstFocusSession: boolean("firstFocusSession").default(false),
  firstIdeaCaptured: boolean("firstIdeaCaptured").default(false),
  tourCompleted: boolean("tourCompleted").default(false),
  
  // Current step
  currentStep: int("currentStep").default(0),
  totalSteps: int("totalSteps").default(7),
  
  completedAt: timestamp("completedAt"),
  skippedAt: timestamp("skippedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

/**
 * Project Templates - pre-built project structures
 */
export const projectTemplates = mysqlTable("projectTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("FileText"),
  color: varchar("color", { length: 20 }).default("#22C55E"),
  
  category: mysqlEnum("category", ["PERSONAL", "PROFESSIONAL", "ACADEMIC", "CONTENT", "SOFTWARE", "HEALTH"]).default("PERSONAL"),
  
  // Template structure
  defaultBriefing: text("defaultBriefing"),
  defaultDeliverableA: text("defaultDeliverableA"),
  defaultDeliverableB: text("defaultDeliverableB"),
  defaultDeliverableC: text("defaultDeliverableC"),
  defaultCycleDuration: mysqlEnum("defaultCycleDuration", ["DAYS_3", "DAYS_7", "DAYS_14"]).default("DAYS_3"),
  
  // Pre-defined tasks (JSON array)
  defaultTasks: json("defaultTasks"),
  
  // Usage tracking
  usageCount: int("usageCount").default(0),
  
  isActive: boolean("isActive").default(true),
  isPremium: boolean("isPremium").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;
