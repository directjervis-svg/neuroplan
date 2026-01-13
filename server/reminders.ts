import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { userReminders } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const db = await getDb();

const reminderTypeEnum = z.enum([
  "daily_start",
  "task_pending", 
  "cycle_end",
  "weekly_summary"
]);

const frequencyEnum = z.enum(["daily", "weekdays", "weekends", "custom"]);

export const remindersRouter = router({
  // Obter todos os lembretes do usuário
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const reminders = await db.query.userReminders.findMany({
      where: eq(userReminders.userId, userId),
    });

    // Se não existem lembretes, criar os padrões (todos desligados)
    if (reminders.length === 0) {
      const defaultReminders = [
        { userId, reminderType: "daily_start" as const, time: "09:00:00", enabled: false },
        { userId, reminderType: "task_pending" as const, time: "14:00:00", enabled: false },
        { userId, reminderType: "cycle_end" as const, time: "18:00:00", enabled: false },
        { userId, reminderType: "weekly_summary" as const, time: "10:00:00", enabled: false },
      ];

      await db.insert(userReminders).values(defaultReminders);
      
      return await db.query.userReminders.findMany({
        where: eq(userReminders.userId, userId),
      });
    }

    return reminders;
  }),

  // Atualizar um lembrete específico
  update: protectedProcedure
    .input(z.object({
      reminderType: reminderTypeEnum,
      time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Formato: HH:MM:SS"),
      frequency: frequencyEnum.optional(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db.update(userReminders)
        .set({
          time: input.time,
          frequency: input.frequency,
          enabled: input.enabled,
        })
        .where(
          and(
            eq(userReminders.userId, userId),
            eq(userReminders.reminderType, input.reminderType)
          )
        );

      return { success: true };
    }),

  // Toggle rápido de lembrete
  toggle: protectedProcedure
    .input(z.object({
      reminderType: reminderTypeEnum,
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const reminder = await db.query.userReminders.findFirst({
        where: and(
          eq(userReminders.userId, userId),
          eq(userReminders.reminderType, input.reminderType)
        ),
      });

      if (reminder) {
        await db.update(userReminders)
          .set({ enabled: !reminder.enabled })
          .where(eq(userReminders.id, reminder.id));
        
        return { enabled: !reminder.enabled };
      }

      return { enabled: false };
    }),
});
