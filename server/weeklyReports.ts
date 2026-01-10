/**
 * Weekly Reports Service
 * Generates and sends weekly productivity reports via email
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  users, 
  tasks, 
  projects, 
  focusCycles, 
  quickIdeas, 
  userGamification,
  xpTransactions,
  weeklyReports,
  notificationPreferences
} from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// Task type coefficients for productivity scoring
const TASK_COEFFICIENTS = {
  ACTION: 1.0,
  RETENTION: 0.7,
  MAINTENANCE: 0.5,
};

interface WeeklyMetrics {
  tasksCompleted: number;
  projectsWorkedOn: number;
  totalFocusMinutes: number;
  ideasCaptured: number;
  xpEarned: number;
  actionTasksCompleted: number;
  retentionTasksCompleted: number;
  maintenanceTasksCompleted: number;
  productivityScore: number;
  streakDays: number;
  streakMaintained: boolean;
}

interface WeeklyInsight {
  type: 'achievement' | 'improvement' | 'tip' | 'warning';
  title: string;
  description: string;
  metric?: string;
}

/**
 * Calculate weekly metrics for a user
 */
export async function calculateWeeklyMetrics(
  userId: number,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      tasksCompleted: 0,
      projectsWorkedOn: 0,
      totalFocusMinutes: 0,
      ideasCaptured: 0,
      xpEarned: 0,
      actionTasksCompleted: 0,
      retentionTasksCompleted: 0,
      maintenanceTasksCompleted: 0,
      productivityScore: 0,
      streakDays: 0,
      streakMaintained: true,
    };
  }

  // Get completed tasks by type
  const completedTasks = await db
    .select({
      type: tasks.type,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        gte(tasks.completedAt, weekStart),
        lte(tasks.completedAt, weekEnd)
      )
    )
    .groupBy(tasks.type);

  const taskCounts = {
    ACTION: 0,
    RETENTION: 0,
    MAINTENANCE: 0,
  };

  for (const row of completedTasks) {
    if (row.type && row.type in taskCounts) {
      taskCounts[row.type as keyof typeof taskCounts] = Number(row.count);
    }
  }

  const totalTasks = taskCounts.ACTION + taskCounts.RETENTION + taskCounts.MAINTENANCE;

  // Calculate productivity score using coefficients
  const productivityScore = Math.round(
    (taskCounts.ACTION * TASK_COEFFICIENTS.ACTION +
      taskCounts.RETENTION * TASK_COEFFICIENTS.RETENTION +
      taskCounts.MAINTENANCE * TASK_COEFFICIENTS.MAINTENANCE) * 10
  );

  // Get projects worked on
  const projectsResult = await db
    .select({
      count: sql<number>`count(distinct ${projects.id})`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        gte(tasks.completedAt, weekStart),
        lte(tasks.completedAt, weekEnd)
      )
    );

  const projectsWorkedOn = Number(projectsResult[0]?.count || 0);

  // Get focus time
  const focusResult = await db
    .select({
      totalSeconds: sql<number>`sum(${focusCycles.totalFocusSeconds})`,
    })
    .from(focusCycles)
    .where(
      and(
        eq(focusCycles.userId, userId),
        gte(focusCycles.startTime, weekStart),
        lte(focusCycles.startTime, weekEnd)
      )
    );

  const totalFocusMinutes = Math.round(Number(focusResult[0]?.totalSeconds || 0) / 60);

  // Get ideas captured
  const ideasResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(quickIdeas)
    .where(
      and(
        eq(quickIdeas.userId, userId),
        gte(quickIdeas.createdAt, weekStart),
        lte(quickIdeas.createdAt, weekEnd)
      )
    );

  const ideasCaptured = Number(ideasResult[0]?.count || 0);

  // Get XP earned
  const xpResult = await db
    .select({
      total: sql<number>`sum(${xpTransactions.amount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, weekStart),
        lte(xpTransactions.createdAt, weekEnd)
      )
    );

  const xpEarned = Number(xpResult[0]?.total || 0);

  // Get streak info
  const gamificationResult = await db
    .select()
    .from(userGamification)
    .where(eq(userGamification.userId, userId))
    .limit(1);

  const gamification = gamificationResult[0];
  const streakDays = gamification?.currentStreak || 0;
  const streakMaintained = streakDays > 0;

  return {
    tasksCompleted: totalTasks,
    projectsWorkedOn,
    totalFocusMinutes,
    ideasCaptured,
    xpEarned,
    actionTasksCompleted: taskCounts.ACTION,
    retentionTasksCompleted: taskCounts.RETENTION,
    maintenanceTasksCompleted: taskCounts.MAINTENANCE,
    productivityScore,
    streakDays,
    streakMaintained,
  };
}

/**
 * Generate AI insights based on metrics
 */
export async function generateWeeklyInsights(
  metrics: WeeklyMetrics,
  previousMetrics?: WeeklyMetrics
): Promise<WeeklyInsight[]> {
  const insights: WeeklyInsight[] = [];

  // Achievement insights
  if (metrics.tasksCompleted >= 10) {
    insights.push({
      type: 'achievement',
      title: 'Semana produtiva!',
      description: `Você completou ${metrics.tasksCompleted} tarefas esta semana. Continue assim!`,
      metric: `${metrics.tasksCompleted} tarefas`,
    });
  }

  if (metrics.streakDays >= 7) {
    insights.push({
      type: 'achievement',
      title: 'Streak de uma semana!',
      description: `Você manteve seu streak por ${metrics.streakDays} dias consecutivos. Excelente consistência!`,
      metric: `${metrics.streakDays} dias`,
    });
  }

  // Improvement insights
  if (previousMetrics) {
    if (metrics.tasksCompleted > previousMetrics.tasksCompleted) {
      const increase = metrics.tasksCompleted - previousMetrics.tasksCompleted;
      insights.push({
        type: 'improvement',
        title: 'Progresso nas tarefas',
        description: `Você completou ${increase} tarefas a mais que na semana passada.`,
        metric: `+${increase}`,
      });
    }

    if (metrics.totalFocusMinutes > previousMetrics.totalFocusMinutes) {
      const increase = metrics.totalFocusMinutes - previousMetrics.totalFocusMinutes;
      insights.push({
        type: 'improvement',
        title: 'Mais tempo focado',
        description: `Você focou ${increase} minutos a mais que na semana passada.`,
        metric: `+${increase} min`,
      });
    }
  }

  // Tips based on metrics
  if (metrics.actionTasksCompleted < metrics.maintenanceTasksCompleted) {
    insights.push({
      type: 'tip',
      title: 'Foque em tarefas de ação',
      description: 'Tarefas de AÇÃO têm maior impacto no seu progresso. Tente priorizar pelo menos 3 por dia.',
    });
  }

  if (metrics.totalFocusMinutes < 120) {
    insights.push({
      type: 'tip',
      title: 'Aumente seu tempo de foco',
      description: 'Tente usar o timer de foco por pelo menos 30 minutos por dia para melhorar sua produtividade.',
    });
  }

  if (metrics.ideasCaptured === 0) {
    insights.push({
      type: 'tip',
      title: 'Capture suas ideias',
      description: 'Use o Quick Ideas para capturar pensamentos durante o dia. Isso ajuda a manter o foco nas tarefas atuais.',
    });
  }

  // Warnings
  if (!metrics.streakMaintained && previousMetrics?.streakMaintained) {
    insights.push({
      type: 'warning',
      title: 'Streak perdido',
      description: 'Seu streak foi interrompido esta semana. Comece um novo hoje!',
    });
  }

  if (metrics.productivityScore < 10 && metrics.tasksCompleted > 0) {
    insights.push({
      type: 'warning',
      title: 'Baixo score de produtividade',
      description: 'Seu score está baixo porque você completou mais tarefas de manutenção. Priorize tarefas de AÇÃO.',
    });
  }

  return insights;
}

/**
 * Generate and store weekly report
 */
export async function generateWeeklyReport(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  // Calculate week boundaries (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() - daysToMonday);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  // Get current week metrics
  const metrics = await calculateWeeklyMetrics(userId, weekStart, weekEnd);

  // Get previous week metrics for comparison
  const prevWeekEnd = new Date(weekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
  prevWeekEnd.setHours(23, 59, 59, 999);
  
  const prevWeekStart = new Date(prevWeekEnd);
  prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
  prevWeekStart.setHours(0, 0, 0, 0);

  const previousMetrics = await calculateWeeklyMetrics(userId, prevWeekStart, prevWeekEnd);

  // Generate insights
  const insights = await generateWeeklyInsights(metrics, previousMetrics);

  // Store report
  const result = await db.insert(weeklyReports).values({
    userId,
    weekStart,
    weekEnd,
    tasksCompleted: metrics.tasksCompleted,
    projectsWorkedOn: metrics.projectsWorkedOn,
    totalFocusMinutes: metrics.totalFocusMinutes,
    ideasCaptured: metrics.ideasCaptured,
    xpEarned: metrics.xpEarned,
    actionTasksCompleted: metrics.actionTasksCompleted,
    retentionTasksCompleted: metrics.retentionTasksCompleted,
    maintenanceTasksCompleted: metrics.maintenanceTasksCompleted,
    productivityScore: metrics.productivityScore,
    streakDays: metrics.streakDays,
    streakMaintained: metrics.streakMaintained,
    insights: JSON.stringify(insights),
  });

  // Get the inserted ID from the result
  const insertedResult = result as unknown as { insertId?: number };
  return insertedResult.insertId ? Number(insertedResult.insertId) : null;
}

/**
 * Send weekly report email using the notification system
 */
export async function sendWeeklyReportEmail(userId: number, reportId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get report
    const reportResult = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, reportId))
      .limit(1);

    const report = reportResult[0];
    if (!report) return false;

    // Get user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];
    if (!user || !user.email) return false;

    // Parse insights
    const insights = report.insights ? JSON.parse(report.insights as string) : [];

    // Format email content
    const emailContent = `
📊 Relatório Semanal NeuroExecução

Olá ${user.name || 'Usuário'}!

Aqui está seu resumo de produtividade da semana:

📋 TAREFAS
• Total completadas: ${report.tasksCompleted}
• Tarefas de Ação: ${report.actionTasksCompleted}
• Tarefas de Retenção: ${report.retentionTasksCompleted}
• Tarefas de Manutenção: ${report.maintenanceTasksCompleted}

⏱️ FOCO
• Tempo total: ${report.totalFocusMinutes} minutos
• Projetos trabalhados: ${report.projectsWorkedOn}

🔥 STREAK
• Dias consecutivos: ${report.streakDays}
• Status: ${report.streakMaintained ? 'Mantido ✓' : 'Interrompido'}

⭐ XP GANHO: ${report.xpEarned}
📈 SCORE DE PRODUTIVIDADE: ${report.productivityScore}

${insights.length > 0 ? `
💡 INSIGHTS
${insights.map((i: WeeklyInsight) => `• ${i.title}: ${i.description}`).join('\n')}
` : ''}

Continue assim! Cada pequeno passo conta.

--
NeuroExecução - Seu Parceiro de Execução
    `.trim();

    // Use the notification system to send
    await notifyOwner({
      title: `📊 Relatório Semanal - ${user.name || user.email}`,
      content: emailContent,
    });

    // Mark as sent
    await db
      .update(weeklyReports)
      .set({
        emailSent: true,
        emailSentAt: new Date(),
      })
      .where(eq(weeklyReports.id, reportId));

    return true;
  } catch (error) {
    console.error('[WeeklyReport] Error sending email:', error);
    return false;
  }
}

// Weekly Reports Router
export const weeklyReportsRouter = router({
  // Get user's weekly reports
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(52).default(12) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const reports = await db
        .select()
        .from(weeklyReports)
        .where(eq(weeklyReports.userId, ctx.user.id))
        .orderBy(desc(weeklyReports.weekStart))
        .limit(input?.limit || 12);

      return reports.map(r => ({
        ...r,
        insights: r.insights ? JSON.parse(r.insights as string) : [],
      }));
    }),

  // Get latest report
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const reports = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.userId, ctx.user.id))
      .orderBy(desc(weeklyReports.weekStart))
      .limit(1);

    if (reports.length === 0) return null;

    return {
      ...reports[0],
      insights: reports[0].insights ? JSON.parse(reports[0].insights as string) : [],
    };
  }),

  // Generate report for current week
  generate: protectedProcedure.mutation(async ({ ctx }) => {
    const reportId = await generateWeeklyReport(ctx.user.id);
    if (!reportId) {
      throw new Error('Não foi possível gerar o relatório');
    }
    return { reportId };
  }),

  // Get notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { weeklyReport: true, weeklyReportDay: 1 };

    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id))
      .limit(1);

    if (prefs.length === 0) {
      return { weeklyReport: true, weeklyReportDay: 1 };
    }

    return {
      weeklyReport: prefs[0].weeklyReport,
      weeklyReportDay: prefs[0].weeklyReportDay,
    };
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      weeklyReport: z.boolean().optional(),
      weeklyReportDay: z.number().min(0).max(6).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(notificationPreferences).values({
          userId: ctx.user.id,
          weeklyReport: input.weeklyReport ?? true,
          weeklyReportDay: input.weeklyReportDay ?? 1,
        });
      } else {
        await db
          .update(notificationPreferences)
          .set({
            weeklyReport: input.weeklyReport,
            weeklyReportDay: input.weeklyReportDay,
          })
          .where(eq(notificationPreferences.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Preview current week metrics
  previewMetrics: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const metrics = await calculateWeeklyMetrics(ctx.user.id, weekStart, now);
    const insights = await generateWeeklyInsights(metrics);

    return { metrics, insights };
  }),
});
