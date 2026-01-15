/**
 * Analytics & Metrics Router
 * Tracks key business metrics: NPS, D7, D30, Cohort Analysis
 */

import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { users, tasks, projects, focusCycles } from "../drizzle/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";

export const analyticsRouter = router({
  /**
   * Get user engagement metrics
   * D1, D7, D30 retention
   */
  getUserEngagement: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    const now = new Date();

    // Calculate days since signup
    const signupDate = ctx.user.createdAt;
    const daysSinceSignup = Math.floor(
      (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get activity data
    const projectsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, userId));

    const tasksCompleted = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, sql`(SELECT id FROM projects WHERE userId = ${userId})`),
          sql`completed_at IS NOT NULL`
        )
      );

    const focusMinutes = await db
      .select({ total: sql<number>`SUM(total_focus_seconds) / 60` })
      .from(focusCycles)
      .where(
        eq(
          focusCycles.taskId,
          sql`(SELECT id FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE user_id = ${userId}))`
        )
      );

    return {
      daysSinceSignup,
      projectsCreated: projectsCount[0]?.count || 0,
      tasksCompleted: tasksCompleted[0]?.count || 0,
      focusMinutes: Math.round(focusMinutes[0]?.total || 0),
      isActiveD1: daysSinceSignup >= 1 && (projectsCount[0]?.count || 0) > 0,
      isActiveD7: daysSinceSignup >= 7 && (tasksCompleted[0]?.count || 0) > 0,
      isActiveD30: daysSinceSignup >= 30 && (focusMinutes[0]?.total || 0) > 60,
    };
  }),

  /**
   * Submit NPS (Net Promoter Score) feedback
   * Scale: 0-10
   */
  submitNPS: protectedProcedure
    .input(
      z.object({
        score: z.number().min(0).max(10),
        feedback: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();

      // TODO: Create nps_responses table
      // For now, log to console
      console.log(`[NPS] User ${userId} scored ${input.score}`, input.feedback);

      // Calculate NPS category
      const category =
        input.score >= 9
          ? "promoter"
          : input.score >= 7
          ? "passive"
          : "detractor";

      return {
        success: true,
        category,
        message: "Obrigado pelo seu feedback!",
      };
    }),

  /**
   * Get admin dashboard metrics
   * Only accessible by admin users
   */
  getAdminMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const db = await getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // New users (last 30 days)
    const newUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    // Active users (last 7 days)
    const activeUsers = await db
      .select({ count: sql<number>`count(DISTINCT user_id)` })
      .from(projects)
      .where(gte(projects.createdAt, sevenDaysAgo));

    // Paying users
    const payingUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.subscriptionPlan, "PRO"));

    // MRR (Monthly Recurring Revenue)
    const mrr = (payingUsers[0]?.count || 0) * 29.9;

    // Conversion rate
    const conversionRate =
      totalUsers[0]?.count > 0
        ? ((payingUsers[0]?.count || 0) / totalUsers[0].count) * 100
        : 0;

    return {
      totalUsers: totalUsers[0]?.count || 0,
      newUsers: newUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      payingUsers: payingUsers[0]?.count || 0,
      mrr: Math.round(mrr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }),

  /**
   * Get cohort analysis
   * Track retention by signup week
   */
  getCohortAnalysis: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const db = await getDb();

    // TODO: Implement proper cohort analysis
    // This requires more complex SQL queries
    // For MVP, return placeholder

    return {
      cohorts: [
        {
          week: "2026-W03",
          signups: 10,
          d1: 8,
          d7: 6,
          d30: 4,
        },
      ],
    };
  }),
});
