import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject,
  getTasks,
  getTasksByProjectId,
  getTodayTasks,
  createTask,
  updateTask,
  completeTask,
  getQuickIdeas,
  createQuickIdea,
  getDailyLogs,
  createDailyLog,
  getFocusCycles,
  createFocusCycle,
  updateFocusCycle,
  getUserStats,
  updateUserPreferences
} from "./db";
import { processBriefing, decomposeTasks, getSocraticResponse } from "./ai";
import { gamificationRouter } from "./gamification";
import { exportRouter } from "./export";
import { notificationsRouter } from "./notifications";
import { pushRouter } from "./pushNotifications";
import { weeklyReportsRouter } from "./weeklyReports";
import { googleCalendarRouter } from "./googleCalendar";
import { rewardsRouter } from "./rewards";
import { createCheckoutSession, createPortalSession, getOrCreateCustomer } from "./stripe/stripe";
import { NEUROPLAN_PRODUCTS } from "./stripe/products";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Projects Router
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjects(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getProjectById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        briefing: z.string().optional(),
        category: z.enum(["PERSONAL", "PROFESSIONAL", "ACADEMIC"]).optional(),
        cycleDuration: z.enum(["DAYS_3", "DAYS_7", "DAYS_14"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createProject({
          userId: ctx.user.id,
          title: input.title,
          briefing: input.briefing,
          category: input.category || "PERSONAL",
          cycleDuration: input.cycleDuration || "DAYS_3",
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        briefing: z.string().optional(),
        briefingProcessed: z.string().optional(),
        category: z.enum(["PERSONAL", "PROFESSIONAL", "ACADEMIC"]).optional(),
        cycleDuration: z.enum(["DAYS_3", "DAYS_7", "DAYS_14"]).optional(),
        deliverableA: z.string().optional(),
        deliverableB: z.string().optional(),
        deliverableC: z.string().optional(),
        status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return updateProject(id, ctx.user.id, data);
      }),
  }),

  // Tasks Router
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTasks(ctx.user.id);
    }),
    
    getByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getTasksByProjectId(input.projectId, ctx.user.id);
      }),
    
    getToday: protectedProcedure.query(async ({ ctx }) => {
      return getTodayTasks(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(500),
        titleVerb: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["ACTION", "RETENTION", "MAINTENANCE"]).optional(),
        dayNumber: z.number(),
        position: z.number(),
        effortScore: z.number().min(1).max(10).optional(),
        impactScore: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createTask(input, ctx.user.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().optional(),
        effortScore: z.number().min(1).max(10).optional(),
        impactScore: z.number().min(1).max(10).optional(),
        skipReason: z.string().max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return updateTask(id, ctx.user.id, data);
      }),
    
    complete: protectedProcedure
      .input(z.object({
        id: z.number(),
        proofUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return completeTask(input.id, ctx.user.id, input.proofUrl);
      }),
  }),

  // Quick Ideas Router
  ideas: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getQuickIdeas(ctx.user.id, input?.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        content: z.string().min(1),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createQuickIdea({
          userId: ctx.user.id,
          content: input.content,
          projectId: input.projectId,
        });
      }),
  }),

  // Daily Logs Router
  dailyLogs: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getDailyLogs(input.projectId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        dayNumber: z.number(),
        whereILeft: z.string().min(1),
        nextSteps: z.string().optional(),
        blockers: z.string().optional(),
        mood: z.enum(["GREAT", "GOOD", "NEUTRAL", "STRUGGLING", "DIFFICULT"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createDailyLog({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  // Focus Cycles Router
  focus: router({
    list: protectedProcedure
      .input(z.object({ 
        taskId: z.number().optional(),
        projectId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getFocusCycles(ctx.user.id, input?.taskId, input?.projectId);
      }),
    
    start: protectedProcedure
      .input(z.object({
        taskId: z.number().optional(),
        projectId: z.number().optional(),
        timerType: z.enum(["PROGRESSIVE", "COUNTDOWN"]).optional(),
        targetSeconds: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createFocusCycle({
          userId: ctx.user.id,
          taskId: input.taskId,
          projectId: input.projectId,
          timerType: input.timerType || "PROGRESSIVE",
          targetSeconds: input.targetSeconds,
          startTime: new Date(),
        });
      }),
    
    end: protectedProcedure
      .input(z.object({
        id: z.number(),
        totalFocusSeconds: z.number(),
        pauseCount: z.number().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return updateFocusCycle(id, ctx.user.id, {
          ...data,
          endTime: new Date(),
        });
      }),
  }),

  // Stats Router
  stats: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      return getUserStats(ctx.user.id);
    }),
  }),

  // User Preferences Router
  preferences: router({
    update: protectedProcedure
      .input(z.object({
        focusDuration: z.number().min(5).max(120).optional(),
        reducedMotion: z.boolean().optional(),
        timerType: z.enum(["PROGRESSIVE", "COUNTDOWN"]).optional(),
        taskBlockEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return updateUserPreferences(ctx.user.id, input);
      }),
  }),

  // Subscription Router
  subscription: router({
    getPlans: publicProcedure.query(() => {
      return Object.values(NEUROPLAN_PRODUCTS);
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        planId: z.enum(["PRO", "TEAM"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const plan = NEUROPLAN_PRODUCTS[input.planId];
        if (!plan.stripePriceId) {
          throw new Error("Este plano ainda não está disponível para assinatura.");
        }

        const origin = ctx.req.headers.origin || "http://localhost:3000";
        
        return createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || undefined,
          priceId: plan.stripePriceId,
          successUrl: `${origin}/dashboard?checkout=success`,
          cancelUrl: `${origin}/pricing?checkout=canceled`,
        });
      }),

    getPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new Error("Nenhuma assinatura encontrada.");
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";
      
      return createPortalSession({
        customerId: ctx.user.stripeCustomerId,
        returnUrl: `${origin}/dashboard`,
      });
    }),

    getCurrentPlan: protectedProcedure.query(({ ctx }) => {
      return {
        plan: ctx.user.subscriptionPlan || "FREE",
        status: ctx.user.subscriptionStatus || "ACTIVE",
        hasStripeSubscription: !!ctx.user.stripeSubscriptionId,
      };
    }),
  }),

  // Gamification Router
  gamification: gamificationRouter,

  // Export Router
  export: exportRouter,

  // Notifications Router
  notifications: notificationsRouter,

  // Push Notifications Router
  push: pushRouter,

  // Weekly Reports Router
  weeklyReports: weeklyReportsRouter,

  // Google Calendar Router
  calendar: googleCalendarRouter,

  // Rewards and TDAH Store Router
  rewards: rewardsRouter,

  // AI Router
  ai: router({
    processBriefing: protectedProcedure
      .input(z.object({
        briefing: z.string().min(10).max(5000),
      }))
      .mutation(async ({ input }) => {
        return processBriefing(input.briefing);
      }),

    generateTasks: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        briefing: z.string().min(10).max(5000),
        cycleDuration: z.enum(["DAYS_3", "DAYS_7", "DAYS_14"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // First process the briefing
        const processedBriefing = await processBriefing(input.briefing);
        
        // Then decompose into tasks
        const decomposed = await decomposeTasks(
          input.briefing,
          processedBriefing,
          input.cycleDuration
        );

        // Update project with processed briefing
        await updateProject(input.projectId, ctx.user.id, {
          briefingProcessed: JSON.stringify(processedBriefing),
          category: processedBriefing.category,
          deliverableA: processedBriefing.deliverableA,
          deliverableB: processedBriefing.deliverableB,
          deliverableC: processedBriefing.deliverableC,
        });

        // Create tasks in database
        for (const task of decomposed.tasks) {
          await createTask({
            projectId: input.projectId,
            title: task.title,
            titleVerb: task.titleVerb,
            description: task.description,
            type: task.type,
            dayNumber: task.dayNumber,
            position: task.position,
            effortScore: task.effortScore,
            impactScore: task.impactScore,
          }, ctx.user.id);
        }

        return {
          processedBriefing,
          tasksCreated: decomposed.tasks.length,
          totalEstimatedHours: decomposed.totalEstimatedHours,
          riskFactors: decomposed.riskFactors,
        };
      }),

    coach: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        context: z.string().max(2000),
        message: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input }) => {
        const response = await getSocraticResponse(input.context, input.message);
        return { response };
      }),
  }),
});

export type AppRouter = typeof appRouter;
