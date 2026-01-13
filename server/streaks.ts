import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { userStreaks } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

const db = await getDb();

export const streaksRouter = router({
  // Obter streak atual do usuário
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    let streak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId),
    });

    // Se não existe, criar registro inicial
    if (!streak) {
      await db.insert(userStreaks).values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
      });
      
      streak = await db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
      });
    }

    return streak;
  }),

  // Atualizar streak (chamar quando usuário completa tarefa)
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    let streak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId),
    });

    if (!streak) {
      // Criar primeiro registro
      await db.insert(userStreaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(today),
        totalDaysActive: 1,
      });
      
      return { currentStreak: 1, longestStreak: 1, isNewRecord: true };
    }

    const lastActivity = streak.lastActivityDate 
      ? new Date(streak.lastActivityDate).toISOString().split('T')[0]
      : null;

    // Se já registrou atividade hoje, não fazer nada
    if (lastActivity === today) {
      return { 
        currentStreak: streak.currentStreak, 
        longestStreak: streak.longestStreak,
        isNewRecord: false 
      };
    }

    // Calcular diferença de dias
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newCurrentStreak: number;
    let newLongestStreak: number;
    let isNewRecord = false;

    if (lastActivity === yesterdayStr) {
      // Continuando streak
      newCurrentStreak = streak.currentStreak + 1;
    } else {
      // Streak quebrado, recomeçar
      newCurrentStreak = 1;
    }

    // Verificar se é novo recorde
    if (newCurrentStreak > streak.longestStreak) {
      newLongestStreak = newCurrentStreak;
      isNewRecord = true;
    } else {
      newLongestStreak = streak.longestStreak;
    }

    // Atualizar no banco
    await db.update(userStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: new Date(today),
        totalDaysActive: streak.totalDaysActive + 1,
      })
      .where(eq(userStreaks.userId, userId));

    return { 
      currentStreak: newCurrentStreak, 
      longestStreak: newLongestStreak,
      isNewRecord 
    };
  }),
});
