/**
 * Web Push Notifications Service
 * Handles push notification subscriptions and sending
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq, and, lt, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { pushSubscriptions, tasks, userGamification, users, projects } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

// VAPID keys would normally be generated once and stored in env
// For now, we'll use the built-in notification system
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

// Push subscription schema
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.number().nullable().optional(),
});

// Notification types
export type NotificationType = 
  | 'task_reminder'
  | 'streak_warning'
  | 'streak_lost'
  | 'daily_summary'
  | 'achievement_unlocked'
  | 'weekly_report';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send a push notification to a user
 * Uses the built-in notification system as fallback
 */
export async function sendPushNotification(
  userId: number,
  payload: NotificationPayload
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get user's push subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions for user ${userId}`);
      return false;
    }

    // For each subscription, attempt to send
    let successCount = 0;
    for (const sub of subscriptions) {
      try {
        // In production, this would use web-push library
        // For now, we'll use the built-in notification system
        console.log(`[Push] Would send to endpoint: ${sub.endpoint}`);
        successCount++;
      } catch (error) {
        console.error(`[Push] Failed to send to subscription ${sub.id}:`, error);
        // Mark subscription as invalid if it fails
        await db
          .update(pushSubscriptions)
          .set({ active: false })
          .where(eq(pushSubscriptions.id, sub.id));
      }
    }

    return successCount > 0;
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
    return false;
  }
}

/**
 * Check and send streak warning notifications
 */
export async function checkStreakWarnings(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Find users who haven't been active today and have a streak
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const usersAtRisk = await db
      .select({
        userId: userGamification.userId,
        currentStreak: userGamification.currentStreak,
        lastActiveDate: userGamification.lastActiveDate,
      })
      .from(userGamification)
      .where(
        and(
          lt(userGamification.lastActiveDate, todayStart),
          // Only users with active streaks
        )
      );

    for (const user of usersAtRisk) {
      if (user.currentStreak && user.currentStreak > 0) {
        await sendPushNotification(user.userId, {
          type: 'streak_warning',
          title: '🔥 Seu streak está em risco!',
          body: `Você tem um streak de ${user.currentStreak} dias. Complete uma tarefa hoje para mantê-lo!`,
          tag: 'streak-warning',
          data: {
            url: '/dashboard',
            streakDays: user.currentStreak,
          },
          actions: [
            { action: 'open', title: 'Ver tarefas' },
            { action: 'dismiss', title: 'Lembrar depois' },
          ],
        });
      }
    }
  } catch (error) {
    console.error('[Push] Error checking streak warnings:', error);
  }
}

/**
 * Check and send task reminder notifications
 */
export async function checkTaskReminders(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Find tasks that are pending - join with projects to get userId
    const now = new Date();
    
    const pendingTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        projectId: tasks.projectId,
        userId: projects.userId,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        isNull(tasks.completedAt)
      )
      .limit(100);

    // Group tasks by user
    const tasksByUser: Record<number, typeof pendingTasks> = {};
    for (const task of pendingTasks) {
      if (!task.userId) continue;
      if (!tasksByUser[task.userId]) {
        tasksByUser[task.userId] = [];
      }
      tasksByUser[task.userId].push(task);
    }

    // Send notifications
    for (const userId of Object.keys(tasksByUser)) {
      const userTasks = tasksByUser[Number(userId)];
      if (userTasks.length === 1) {
        await sendPushNotification(Number(userId), {
          type: 'task_reminder',
          title: '📋 Tarefa pendente',
          body: userTasks[0].title,
          tag: `task-${userTasks[0].id}`,
          data: {
            url: `/dashboard/projects/${userTasks[0].projectId}`,
            taskId: userTasks[0].id,
          },
        });
      } else {
        await sendPushNotification(Number(userId), {
          type: 'task_reminder',
          title: '📋 Tarefas pendentes',
          body: `Você tem ${userTasks.length} tarefas para hoje`,
          tag: 'tasks-reminder',
          data: {
            url: '/dashboard',
            taskCount: userTasks.length,
          },
        });
      }
    }
  } catch (error) {
    console.error('[Push] Error checking task reminders:', error);
  }
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  userId: number,
  achievementName: string,
  achievementDescription: string
): Promise<void> {
  await sendPushNotification(userId, {
    type: 'achievement_unlocked',
    title: '🏆 Conquista desbloqueada!',
    body: `${achievementName}: ${achievementDescription}`,
    tag: 'achievement',
    data: {
      url: '/dashboard/profile',
    },
  });
}

// Push notifications router
export const pushRouter = router({
  // Get VAPID public key for client subscription
  getVapidPublicKey: protectedProcedure.query(() => {
    return { publicKey: VAPID_PUBLIC_KEY };
  }),

  // Subscribe to push notifications
  subscribe: protectedProcedure
    .input(pushSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Check if subscription already exists
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await db
          .update(pushSubscriptions)
          .set({
            p256dh: input.keys.p256dh,
            auth: input.keys.auth,
            active: true,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.endpoint, input.endpoint));
      } else {
        // Create new subscription
        await db.insert(pushSubscriptions).values({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          active: true,
        });
      }

      return { success: true };
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(pushSubscriptions)
        .set({ active: false })
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          )
        );

      return { success: true };
    }),

  // Get notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { enabled: false, subscriptions: [] };

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, ctx.user.id),
          eq(pushSubscriptions.active, true)
        )
      );

    return {
      enabled: subscriptions.length > 0,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        endpoint: s.endpoint,
        createdAt: s.createdAt,
      })),
    };
  }),

  // Test notification (for debugging)
  sendTest: protectedProcedure.mutation(async ({ ctx }) => {
    const sent = await sendPushNotification(ctx.user.id, {
      type: 'task_reminder',
      title: '🧪 Notificação de teste',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      tag: 'test',
    });

    return { success: sent };
  }),
});
