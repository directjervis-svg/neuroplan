import { eq, and, desc, sql, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  tasks, 
  quickIdeas, 
  dailyLogs, 
  focusCycles,
  InsertProject,
  InsertTask,
  InsertQuickIdea,
  InsertDailyLog,
  InsertFocusCycle
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(
  userId: number,
  preferences: {
    focusDuration?: number;
    reducedMotion?: boolean;
    timerType?: "PROGRESSIVE" | "COUNTDOWN";
    taskBlockEnabled?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(preferences).where(eq(users.id, userId));
  return { success: true };
}

export async function updateUserSubscription(
  userId: number,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlan?: "FREE" | "PRO" | "TEAM";
    subscriptionStatus?: "ACTIVE" | "INACTIVE" | "CANCELED" | "PAST_DUE";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
  return { success: true };
}

export async function saveUserConsent(
  userId: number,
  consentVersion: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    consentGiven: true,
    consentTimestamp: new Date(),
    consentVersion: consentVersion,
  }).where(eq(users.id, userId));
  
  return { success: true };
}

// ============================================
// PROJECT FUNCTIONS
// ============================================

export async function getProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createProject(data: {
  userId: number;
  title: string;
  briefing?: string;
  category?: "PERSONAL" | "PROFESSIONAL" | "ACADEMIC";
  cycleDuration?: "DAYS_3" | "DAYS_7" | "DAYS_14";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    userId: data.userId,
    title: data.title,
    briefing: data.briefing,
    category: data.category || "PERSONAL",
    cycleDuration: data.cycleDuration || "DAYS_3",
    status: "PLANNING",
  });

  return { id: Number(result[0].insertId), ...data };
}

export async function updateProject(
  projectId: number,
  userId: number,
  data: Partial<InsertProject>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  return { success: true };
}

// ============================================
// TASK FUNCTIONS
// ============================================

export async function getTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      titleVerb: tasks.titleVerb,
      description: tasks.description,
      type: tasks.type,
      dayNumber: tasks.dayNumber,
      position: tasks.position,
      effortScore: tasks.effortScore,
      impactScore: tasks.impactScore,
      completedAt: tasks.completedAt,
      proofUrl: tasks.proofUrl,
      skipReason: tasks.skipReason,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .orderBy(tasks.dayNumber, tasks.position);
}

export async function getTasksByProjectId(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Verify project belongs to user
  const project = await getProjectById(projectId, userId);
  if (!project) return [];

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.dayNumber, tasks.position);
}

export async function getTodayTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get active projects and their current day tasks
  const activeProjects = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.status, "ACTIVE")));

  if (activeProjects.length === 0) return [];

  const projectIds = activeProjects.map(p => p.id);
  
  // For simplicity, get day 1 tasks or tasks based on project start date
  const allTasks = await db
    .select()
    .from(tasks)
    .where(sql`${tasks.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(tasks.position);

  // Filter to get today's tasks (real logic based on project start date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks: (typeof tasks.$inferSelect)[] = [];

  for (const project of activeProjects) {
    if (!project.startDate) continue;

    // Calculate the difference in days between today and the project start date
    const diffTime = Math.abs(today.getTime() - project.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Determine the current day number in the cycle (1, 2, or 3 for a 3-day cycle)
    // The cycle starts on day 0, so we add 1 to the remainder
    const cycleDay = (diffDays % 3) + 1;

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, project.id), eq(tasks.dayNumber, cycleDay)))
      .orderBy(tasks.position);

    todayTasks.push(...projectTasks);
  }

  return todayTasks;
}

export async function createTask(
  data: {
    projectId: number;
    title: string;
    titleVerb?: string;
    description?: string;
    type?: "ACTION" | "RETENTION" | "MAINTENANCE";
    dayNumber: number;
    position: number;
    effortScore?: number;
    impactScore?: number;
  },
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify project belongs to user
  const project = await getProjectById(data.projectId, userId);
  if (!project) throw new Error("Project not found");

  const result = await db.insert(tasks).values({
    projectId: data.projectId,
    title: data.title,
    titleVerb: data.titleVerb,
    description: data.description,
    type: data.type || "ACTION",
    dayNumber: data.dayNumber,
    position: data.position,
    effortScore: data.effortScore || 5,
    impactScore: data.impactScore || 5,
  });

  return { id: Number(result[0].insertId), ...data };
}

export async function updateTask(
  taskId: number,
  userId: number,
  data: Partial<{
    title: string;
    description: string;
    effortScore: number;
    impactScore: number;
    skipReason: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get task and verify ownership through project
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) throw new Error("Task not found");

  const project = await getProjectById(taskResult[0].projectId, userId);
  if (!project) throw new Error("Unauthorized");

  await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, taskId));

  return { success: true };
}

export async function completeTask(taskId: number, userId: number, proofUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get task and verify ownership
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) throw new Error("Task not found");

  const project = await getProjectById(taskResult[0].projectId, userId);
  if (!project) throw new Error("Unauthorized");

  await db
    .update(tasks)
    .set({ completedAt: new Date(), proofUrl, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  return { success: true };
}

// ============================================
// QUICK IDEAS FUNCTIONS
// ============================================

export async function getQuickIdeas(userId: number, projectId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (projectId) {
    return db
      .select()
      .from(quickIdeas)
      .where(and(eq(quickIdeas.userId, userId), eq(quickIdeas.projectId, projectId)))
      .orderBy(desc(quickIdeas.createdAt));
  }

  return db
    .select()
    .from(quickIdeas)
    .where(eq(quickIdeas.userId, userId))
    .orderBy(desc(quickIdeas.createdAt));
}

export async function createQuickIdea(data: {
  userId: number;
  content: string;
  projectId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quickIdeas).values({
    userId: data.userId,
    content: data.content,
    projectId: data.projectId,
  });

  return { id: Number(result[0].insertId), ...data };
}

// ============================================
// DAILY LOGS FUNCTIONS
// ============================================

export async function getDailyLogs(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Verify project belongs to user
  const project = await getProjectById(projectId, userId);
  if (!project) return [];

  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.projectId, projectId))
    .orderBy(desc(dailyLogs.dayNumber));
}

export async function createDailyLog(data: {
  projectId: number;
  userId: number;
  dayNumber: number;
  whereILeft: string;
  nextSteps?: string;
  blockers?: string;
  mood?: "GREAT" | "GOOD" | "NEUTRAL" | "STRUGGLING" | "DIFFICULT";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(dailyLogs).values(data);

  return { id: Number(result[0].insertId), ...data };
}

// ============================================
// FOCUS CYCLES FUNCTIONS
// ============================================

export async function getFocusCycles(userId: number, taskId?: number, projectId?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(focusCycles).where(eq(focusCycles.userId, userId));

  if (taskId) {
    query = db
      .select()
      .from(focusCycles)
      .where(and(eq(focusCycles.userId, userId), eq(focusCycles.taskId, taskId)));
  } else if (projectId) {
    query = db
      .select()
      .from(focusCycles)
      .where(and(eq(focusCycles.userId, userId), eq(focusCycles.projectId, projectId)));
  }

  return query.orderBy(desc(focusCycles.startTime));
}

export async function createFocusCycle(data: {
  userId: number;
  taskId?: number;
  projectId?: number;
  timerType: "PROGRESSIVE" | "COUNTDOWN";
  targetSeconds?: number;
  startTime: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(focusCycles).values({
    userId: data.userId,
    taskId: data.taskId,
    projectId: data.projectId,
    timerType: data.timerType,
    targetSeconds: data.targetSeconds,
    startTime: data.startTime,
  });

  return { id: Number(result[0].insertId), ...data };
}

export async function updateFocusCycle(
  cycleId: number,
  userId: number,
  data: {
    endTime?: Date;
    totalFocusSeconds?: number;
    pauseCount?: number;
    completed?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(focusCycles)
    .set(data)
    .where(and(eq(focusCycles.id, cycleId), eq(focusCycles.userId, userId)));

  return { success: true };
}

// ============================================
// STATS FUNCTIONS
// ============================================

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) {
    return {
      activeProjects: 0,
      todayTasks: 0,
      focusMinutes: 0,
      completedTasks: 0,
    };
  }

  // Count active projects
  const activeProjectsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.status, "ACTIVE")));

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count today's focus minutes
  const focusResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${focusCycles.totalFocusSeconds}), 0)` })
    .from(focusCycles)
    .where(and(eq(focusCycles.userId, userId), gte(focusCycles.startTime, today)));

  // Get today's tasks count
  const todayTasks = await getTodayTasks(userId);

  return {
    activeProjects: activeProjectsResult[0]?.count || 0,
    todayTasks: todayTasks.length,
    focusMinutes: Math.round((focusResult[0]?.total || 0) / 60),
    completedTasks: todayTasks.filter(t => t.completedAt).length,
  };
}
