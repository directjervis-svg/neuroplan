import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, tasks, projects, userGamification } from "../drizzle/schema";
import { eq, and, gte, lte, isNull, sql } from "drizzle-orm";

/**
 * Notification Types for NeuroPlan
 * - TASK_REMINDER: Lembrete de tarefas do dia
 * - STREAK_WARNING: Alerta de quebra de streak iminente
 * - STREAK_BROKEN: Notificação de streak quebrado
 * - STREAK_MILESTONE: Celebração de milestone de streak
 * - DAILY_SUMMARY: Resumo diário de produtividade
 * - FOCUS_SUGGESTION: Sugestão de sessão de foco
 */

export interface NotificationPayload {
  type: 'TASK_REMINDER' | 'STREAK_WARNING' | 'STREAK_BROKEN' | 'STREAK_MILESTONE' | 'DAILY_SUMMARY' | 'FOCUS_SUGGESTION';
  title: string;
  content: string;
  userId: number;
  metadata?: Record<string, unknown>;
}

/**
 * Send notification to user via the built-in notification system
 */
export async function sendUserNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Use the built-in notifyOwner for now (can be extended for user-specific notifications)
    const result = await notifyOwner({
      title: payload.title,
      content: payload.content,
    });
    return result;
  } catch (error) {
    console.error("[Notifications] Failed to send notification:", error);
    return false;
  }
}

/**
 * Check and send streak-related notifications
 */
export async function checkStreakNotifications(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get user stats
    const stats = await db
      .select()
      .from(userGamification)
      .where(eq(userGamification.userId, userId))
      .limit(1);

    if (!stats.length) return;

    const userStat = stats[0];
    const lastActivity = userStat.lastActiveDate;
    const currentStreak = userStat.currentStreak || 0;

    if (!lastActivity) return;

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const hoursSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    // Warning: 18+ hours without activity and has a streak
    if (hoursSinceActivity >= 18 && hoursSinceActivity < 24 && currentStreak >= 3) {
      await sendUserNotification({
        type: 'STREAK_WARNING',
        title: '🔥 Seu streak está em risco!',
        content: `Você tem um streak de ${currentStreak} dias! Complete uma tarefa hoje para mantê-lo.`,
        userId,
        metadata: { currentStreak, hoursSinceActivity },
      });
    }

    // Milestone celebrations
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(currentStreak)) {
      await sendUserNotification({
        type: 'STREAK_MILESTONE',
        title: `🎉 Parabéns! ${currentStreak} dias de streak!`,
        content: `Você manteve seu foco por ${currentStreak} dias consecutivos. Continue assim!`,
        userId,
        metadata: { currentStreak },
      });
    }
  } catch (error) {
    console.error("[Notifications] Error checking streak:", error);
  }
}

/**
 * Get pending tasks for today and send reminder
 */
export async function sendDailyTaskReminder(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get incomplete tasks
    const pendingTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        projectTitle: projects.title,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          isNull(tasks.completedAt)
        )
      )
      .limit(5);

    if (pendingTasks.length > 0) {
      const taskList = pendingTasks
        .map(t => `• ${t.title}`)
        .join('\n');

      await sendUserNotification({
        type: 'TASK_REMINDER',
        title: `📋 Você tem ${pendingTasks.length} tarefa(s) pendente(s)`,
        content: `Tarefas para hoje:\n${taskList}\n\nVamos executar?`,
        userId,
        metadata: { taskCount: pendingTasks.length },
      });
    }
  } catch (error) {
    console.error("[Notifications] Error sending task reminder:", error);
  }
}

/**
 * Notifications Router
 */
export const notificationsRouter = router({
  // Get notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // For now, return default preferences
    // Can be extended to store in database
    return {
      taskReminders: true,
      streakAlerts: true,
      dailySummary: true,
      focusSuggestions: true,
      emailNotifications: false,
    };
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      taskReminders: z.boolean().optional(),
      streakAlerts: z.boolean().optional(),
      dailySummary: z.boolean().optional(),
      focusSuggestions: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Store preferences (can be extended to database)
      return { success: true, preferences: input };
    }),

  // Manually trigger streak check (for testing)
  checkStreak: protectedProcedure.mutation(async ({ ctx }) => {
    await checkStreakNotifications(ctx.user.id);
    return { success: true };
  }),

  // Get notification history (placeholder)
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Placeholder - can be extended with actual notification storage
      return {
        notifications: [],
        hasMore: false,
      };
    }),

  // Send test notification
  sendTest: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await sendUserNotification({
      type: 'FOCUS_SUGGESTION',
      title: '🧠 Hora de focar!',
      content: 'Que tal uma sessão de foco de 25 minutos? Seu cérebro agradece!',
      userId: ctx.user.id,
    });
    return { success: result };
  }),
});
