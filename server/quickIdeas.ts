import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { getDb } from './db';
import { quickIdeas } from '../drizzle/schema';
import { InsertQuickIdea } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

// Schema para validação de input
const createIdeaSchema = z.object({
  content: z.string().min(1, 'A ideia não pode estar vazia').max(500, 'A ideia não pode exceder 500 caracteres'),
});

export const quickIdeasRouter = router({

  // Procedure para criar uma nova Quick Idea
  createIdea: protectedProcedure
    .input(createIdeaSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const newIdea: InsertQuickIdea = {
        userId: ctx.user.id,
        content: input.content,
      };

      const result = await db.insert(quickIdeas).values(newIdea);
      return { id: Number(result[0].insertId), ...newIdea };
    }),

  // Procedure para listar todas as Quick Ideas do usuário
  getIdeas: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const ideas = await db
        .select()
        .from(quickIdeas)
        .where(eq(quickIdeas.userId, ctx.user.id))
        .orderBy(desc(quickIdeas.createdAt));

      return ideas;
    }),

  // Procedure para marcar uma Quick Idea como convertida em tarefa
  convertToTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db
        .update(quickIdeas)
        .set({ convertedToTask: true, updatedAt: new Date() })
        .where(eq(quickIdeas.id, input.id));

      return { success: true };
    }),
});
