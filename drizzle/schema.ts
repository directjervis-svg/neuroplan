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


/**
 * Push Subscriptions - Web Push notification subscriptions
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Notification Preferences - user notification settings
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Push notification preferences
  pushEnabled: boolean("pushEnabled").default(true),
  taskReminders: boolean("taskReminders").default(true),
  streakWarnings: boolean("streakWarnings").default(true),
  achievementAlerts: boolean("achievementAlerts").default(true),
  dailySummary: boolean("dailySummary").default(false),
  
  // Email preferences
  emailEnabled: boolean("emailEnabled").default(true),
  weeklyReport: boolean("weeklyReport").default(true),
  weeklyReportDay: int("weeklyReportDay").default(1), // 0=Sunday, 1=Monday, etc.
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Weekly Reports - generated productivity reports
 */
export const weeklyReports = mysqlTable("weeklyReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  
  // Metrics
  tasksCompleted: int("tasksCompleted").default(0),
  projectsWorkedOn: int("projectsWorkedOn").default(0),
  totalFocusMinutes: int("totalFocusMinutes").default(0),
  ideasCaptured: int("ideasCaptured").default(0),
  xpEarned: int("xpEarned").default(0),
  
  // Coefficients breakdown
  actionTasksCompleted: int("actionTasksCompleted").default(0),
  retentionTasksCompleted: int("retentionTasksCompleted").default(0),
  maintenanceTasksCompleted: int("maintenanceTasksCompleted").default(0),
  productivityScore: int("productivityScore").default(0), // Weighted score
  
  // Streak info
  streakDays: int("streakDays").default(0),
  streakMaintained: boolean("streakMaintained").default(true),
  
  // AI-generated insights (JSON)
  insights: json("insights"),
  
  // Email tracking
  emailSent: boolean("emailSent").default(false),
  emailSentAt: timestamp("emailSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof weeklyReports.$inferInsert;


/**
 * Rewards - available rewards for point redemption
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  
  type: mysqlEnum("type", ["DISCOUNT", "PRODUCT", "FEATURE", "BADGE"]).notNull(),
  
  // Cost in points
  pointsCost: int("pointsCost").notNull(),
  
  // For discounts
  discountType: mysqlEnum("discountType", ["PERCENTAGE", "FIXED"]),
  discountValue: int("discountValue"), // Percentage or fixed amount in cents
  discountAppliesTo: mysqlEnum("discountAppliesTo", ["PRO", "TEAM", "ANY"]),
  
  // For products (TDAH Store)
  productSku: varchar("productSku", { length: 50 }),
  productImageUrl: varchar("productImageUrl", { length: 500 }),
  productPrice: int("productPrice"), // Original price in cents
  shippingIncluded: boolean("shippingIncluded").default(false),
  
  // Availability
  stock: int("stock"), // null = unlimited
  maxPerUser: int("maxPerUser").default(1),
  isActive: boolean("isActive").default(true),
  isPremiumOnly: boolean("isPremiumOnly").default(false),
  
  // Validity
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Reward Redemptions - user reward claims
 */
export const rewardRedemptions = mysqlTable("rewardRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  rewardId: int("rewardId").notNull(),
  
  pointsSpent: int("pointsSpent").notNull(),
  
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "COMPLETED", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"]).default("PENDING"),
  
  // For discounts - generated coupon code
  couponCode: varchar("couponCode", { length: 50 }),
  couponUsed: boolean("couponUsed").default(false),
  couponUsedAt: timestamp("couponUsedAt"),
  
  // For products - shipping info
  shippingName: varchar("shippingName", { length: 200 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingState: varchar("shippingState", { length: 50 }),
  shippingZip: varchar("shippingZip", { length: 20 }),
  shippingCountry: varchar("shippingCountry", { length: 50 }).default("BR"),
  trackingCode: varchar("trackingCode", { length: 100 }),
  
  // Notes
  notes: text("notes"),
  
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;

/**
 * Point Transactions - history of point gains and spending
 */
export const pointTransactions = mysqlTable("pointTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  amount: int("amount").notNull(), // Positive = earned, Negative = spent
  balanceAfter: int("balanceAfter").notNull(),
  
  type: mysqlEnum("type", ["EARNED", "SPENT", "BONUS", "REFUND", "EXPIRED", "ADJUSTMENT"]).notNull(),
  
  // Source of points
  sourceType: mysqlEnum("sourceType", ["PROJECT_COMPLETE", "TASK_COMPLETE", "STREAK_BONUS", "LEVEL_UP", "ACHIEVEMENT", "REDEMPTION", "ADMIN", "REFERRAL"]),
  sourceId: int("sourceId"),
  
  // For redemptions
  redemptionId: int("redemptionId"),
  
  description: varchar("description", { length: 200 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * TDAH Store Products - physical products catalog
 */
export const storeProducts = mysqlTable("storeProducts", {
  id: int("id").autoincrement().primaryKey(),
  
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  longDescription: text("longDescription"),
  
  category: mysqlEnum("category", ["PLANNER", "TIMER", "FIDGET", "ORGANIZER", "BOOK", "ACCESSORY", "KIT"]).default("ACCESSORY"),
  
  // Pricing
  priceInCents: int("priceInCents").notNull(),
  compareAtPriceInCents: int("compareAtPriceInCents"), // Original price for showing discount
  
  // Points option
  pointsPrice: int("pointsPrice"), // Can be purchased with points
  pointsOnly: boolean("pointsOnly").default(false), // Only available with points
  
  // Images
  imageUrl: varchar("imageUrl", { length: 500 }),
  images: json("images"), // Array of additional image URLs
  
  // Inventory
  stock: int("stock").default(0),
  lowStockThreshold: int("lowStockThreshold").default(5),
  trackInventory: boolean("trackInventory").default(true),
  
  // Shipping
  weight: int("weight"), // grams
  dimensions: json("dimensions"), // { length, width, height } in cm
  freeShipping: boolean("freeShipping").default(false),
  
  // Status
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  
  // SEO
  slug: varchar("slug", { length: 200 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;

/**
 * Store Orders - product purchases
 */
export const storeOrders = mysqlTable("storeOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  
  status: mysqlEnum("status", ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"]).default("PENDING"),
  
  // Payment
  paymentMethod: mysqlEnum("paymentMethod", ["STRIPE", "POINTS", "MIXED"]).default("STRIPE"),
  subtotalInCents: int("subtotalInCents").notNull(),
  shippingInCents: int("shippingInCents").default(0),
  discountInCents: int("discountInCents").default(0),
  totalInCents: int("totalInCents").notNull(),
  pointsUsed: int("pointsUsed").default(0),
  
  // Stripe
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  
  // Coupon
  couponCode: varchar("couponCode", { length: 50 }),
  
  // Shipping
  shippingName: varchar("shippingName", { length: 200 }),
  shippingEmail: varchar("shippingEmail", { length: 320 }),
  shippingPhone: varchar("shippingPhone", { length: 50 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingState: varchar("shippingState", { length: 50 }),
  shippingZip: varchar("shippingZip", { length: 20 }),
  shippingCountry: varchar("shippingCountry", { length: 50 }).default("BR"),
  trackingCode: varchar("trackingCode", { length: 100 }),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  
  // Notes
  customerNotes: text("customerNotes"),
  internalNotes: text("internalNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreOrder = typeof storeOrders.$inferSelect;
export type InsertStoreOrder = typeof storeOrders.$inferInsert;

/**
 * Store Order Items - products in an order
 */
export const storeOrderItems = mysqlTable("storeOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  
  productName: varchar("productName", { length: 200 }).notNull(),
  productSku: varchar("productSku", { length: 50 }).notNull(),
  
  quantity: int("quantity").notNull(),
  priceInCents: int("priceInCents").notNull(),
  totalInCents: int("totalInCents").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoreOrderItem = typeof storeOrderItems.$inferSelect;
export type InsertStoreOrderItem = typeof storeOrderItems.$inferInsert;
